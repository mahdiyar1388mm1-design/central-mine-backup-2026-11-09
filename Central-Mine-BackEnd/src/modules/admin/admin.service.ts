import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { AdminState } from './entities/admin-state.entity';
import { AdminRecord } from './entities/admin-record.entity';
import { AdminSale } from './entities/admin-sale.entity';
import { Product } from '../products/entities/product.entity';
import { CreateAdminSaleDto, UpdateAdminSaleDto } from './dto/admin-sale.dto';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Erc1156Position, PositionStatus } from '../wallet/entities/erc1156-position.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { SystemSettings } from '../wallet/entities/system-settings.entity';

const STATE_ID = 'primary';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminState)
    private readonly states: Repository<AdminState>,
    @InjectRepository(AdminRecord)
    private readonly records: Repository<AdminRecord>,
    @InjectRepository(AdminSale)
    private readonly sales: Repository<AdminSale>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Wallet)
    private readonly wallets: Repository<Wallet>,
    @InjectRepository(Erc1156Position)
    private readonly positions: Repository<Erc1156Position>,
    @InjectRepository(WalletTransaction)
    private readonly transactions: Repository<WalletTransaction>,
    @InjectRepository(SystemSettings)
    private readonly settings: Repository<SystemSettings>,
  ) {}

  /**
   * Dashboard sourced strictly from the financial/protocol tables. Values are
   * strings to preserve PostgreSQL numeric precision at the API boundary.
   */
  async getOverview() {
    const [users, positionCount, transactionCount, wallets, positions, transactions, protocol] = await Promise.all([
      this.users.count({ where: { isActive: true } }),
      this.positions.count(),
      this.transactions.count(),
      this.wallets.find(),
      this.positions.find(),
      this.transactions.find(),
      this.settings.findOne({ where: { id: 1 } }),
    ]);
    const total = (values: Array<string | number | undefined>, scale: number) =>
      values.reduce((sum, value) => sum.plus(value || 0), new Decimal(0)).toFixed(scale);
    const treasury = wallets.find((wallet) => wallet.isSystemTreasury);
    const activePositions = positions.filter((position) => position.status === PositionStatus.ACTIVE);
    const successfulTransactions = transactions.filter((transaction) => transaction.status === 'SUCCESS');

    return {
      generatedAt: new Date().toISOString(),
      users,
      wallets: wallets.length,
      treasury: {
        baseLth: new Decimal(treasury?.baseLth || 0).toFixed(12),
        stakedLth: new Decimal(treasury?.stakedLth || 0).toFixed(12),
        withdrawableIrr: new Decimal(treasury?.withdrawableIrr || 0).toFixed(0),
      },
      network: {
        baseLth: total(wallets.filter((wallet) => !wallet.isSystemTreasury).map((wallet) => wallet.baseLth), 12),
        stakedLth: total(wallets.filter((wallet) => !wallet.isSystemTreasury).map((wallet) => wallet.stakedLth), 12),
        withdrawableIrr: total(wallets.filter((wallet) => !wallet.isSystemTreasury).map((wallet) => wallet.withdrawableIrr), 0),
      },
      positions: {
        total: positionCount,
        active: activePositions.length,
        activeAmountLth: total(activePositions.map((position) => position.amountLth), 12),
        accruedStakeLth: total(activePositions.map((position) => position.accruedStakeLth), 12),
      },
      transactions: {
        total: transactionCount,
        successful: successfulTransactions.length,
        feeLth: total(successfulTransactions.map((transaction) => transaction.feeLth), 12),
        feeIrr: total(successfulTransactions.map((transaction) => transaction.feeIrr), 0),
      },
      protocol: protocol ? {
        lthBaseRateIrr: protocol.lthBaseRateIrr,
        dailyRewardRate: protocol.dailyRewardRate,
        transactionFeePercent: protocol.transactionFeePercent,
        baseRewardRatio: protocol.baseRewardRatio,
        stakingRewardRatio: protocol.stakingRewardRatio,
        stakingLockupDays: protocol.stakingLockupDays,
        updatedAt: protocol.updatedAt,
      } : null,
    };
  }

  async getProtocol() {
    const protocol = await this.settings.findOne({ where: { id: 1 } });
    return { protocol, immutableByAdminApi: ['lthBaseRateIrr', 'dailyRewardRate', 'baseRewardRatio', 'stakingRewardRatio', 'transactionFeePercent', 'stakingLockupDays'] };
  }

  async getTreasuryReport() {
    const overview = await this.getOverview();
    const records = await this.listRecords();
    return {
      generatedAt: overview.generatedAt,
      balances: { treasury: overview.treasury, network: overview.network },
      fees: overview.transactions,
      manualRecords: records.filter((record) => ['treasury', 'stake-return', 'base-return', 'fee', 'buyback', 'journal'].includes(record.type)),
    };
  }

  async listProtocolTransactions(limit = 100) {
    const take = Math.min(Math.max(Number(limit) || 100, 1), 200);
    const rows = await this.transactions.find({ relations: { wallet: true }, order: { createdAt: 'DESC' }, take });
    return rows.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      status: transaction.status,
      amountLth: transaction.amountLth,
      amountIrr: transaction.amountIrr,
      feeLth: transaction.feeLth,
      feeIrr: transaction.feeIrr,
      referenceTokenId: transaction.referenceTokenId,
      targetCardNumber: transaction.targetCardNumber,
      walletId: transaction.wallet?.id,
      cardNumber: transaction.wallet?.cardNumber,
      isTreasury: transaction.wallet?.isSystemTreasury ?? false,
      createdAt: transaction.createdAt,
    }));
  }

  async listProtocolPositions(status?: PositionStatus) {
    const rows = await this.positions.find({
      where: status ? { status } : {},
      relations: { wallet: true },
      order: { unlockAt: 'ASC' },
      take: 200,
    });
    return rows.map((position) => ({
      ...position,
      wallet: position.wallet ? { id: position.wallet.id, cardNumber: position.wallet.cardNumber, isSystemTreasury: position.wallet.isSystemTreasury } : undefined,
    }));
  }

  async getState(): Promise<AdminState> {
    let record = await this.states.findOne({ where: { id: STATE_ID } });
    if (!record) {
      record = this.states.create({ id: STATE_ID, state: {} });
      record = await this.states.save(record);
    }
    return record;
  }

  async replaceState(state: Record<string, unknown>): Promise<AdminState> {
    const record = this.states.create({ id: STATE_ID, state });
    return this.states.save(record);
  }

  listRecords(type?: string) {
    return this.records.find({ where: type ? { type: type as any } : {}, order: { createdAt: 'DESC' } });
  }

  createRecord(type: AdminRecord['type'], data: Record<string, unknown>, createdBy?: string) {
    return this.records.save(this.records.create({ type, data, createdBy }));
  }

  async updateRecord(id: string, data: Record<string, unknown>) {
    await this.records.update({ id }, { data });
    return this.records.findOneByOrFail({ id });
  }

  async deleteRecord(id: string) {
    await this.records.delete({ id });
    return { deleted: true, id };
  }

  createSale(dto: CreateAdminSaleDto) {
    return this.sales.save(this.sales.create({
      ...dto,
      brand: dto.brand || 'بدون برند',
      costIrr: dto.costIrr || '0',
      status: dto.status || 'paid',
      serviceable: dto.serviceable ?? true,
      sent: dto.sent ?? false,
      paid: dto.paid ?? false,
      soldAt: dto.soldAt ? new Date(dto.soldAt) : new Date(),
    }));
  }

  listSales() {
    return this.sales.find({ order: { soldAt: 'DESC' } });
  }

  async updateSale(id: string, dto: UpdateAdminSaleDto) {
    await this.sales.update({ id }, dto);
    return this.sales.findOneByOrFail({ id });
  }

  async deleteSale(id: string) {
    await this.sales.delete({ id });
    return { deleted: true, id };
  }

  async productReport() {
    const products = await this.products.find({ where: { isDeleted: false }, relations: { skus: true } });
    const sales = await this.sales.find();
    const activeSales = sales.filter((s) => s.status !== 'cancelled');
    const rows = products.map((p) => {
      const productSales = activeSales.filter((s) => s.productId === p.id);
      const units = productSales.reduce((n, s) => n + s.quantity, 0);
      const revenue = productSales.reduce((n, s) => n + Number(s.revenueIrr), 0);
      const cost = productSales.reduce((n, s) => n + Number(s.costIrr), 0);
      const catalogCost = (p.skus || []).reduce((n, s) => n + Number(s.purchasePrice || 0), 0);
      return { id: p.id, name: p.name, brand: p.brand || 'بدون برند', units, revenueIrr: revenue, costIrr: cost || units * catalogCost, profitIrr: revenue - (cost || units * catalogCost) };
    });
    const brands = [...new Set(rows.map((r) => r.brand))].map((brand) => {
      const group = rows.filter((r) => r.brand === brand);
      return { brand, units: group.reduce((n, r) => n + r.units, 0), revenueIrr: group.reduce((n, r) => n + r.revenueIrr, 0), costIrr: group.reduce((n, r) => n + r.costIrr, 0), profitIrr: group.reduce((n, r) => n + r.profitIrr, 0) };
    });
    return { products: rows, brands, generatedAt: new Date().toISOString() };
  }
}
