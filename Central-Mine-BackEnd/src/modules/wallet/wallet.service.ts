import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import Decimal from 'decimal.js';

import { Wallet } from './entities/wallet.entity';
import { Erc1156Position, PositionStatus } from './entities/erc1156-position.entity';
import { WalletTransaction, TransactionType } from './entities/wallet-transaction.entity';
import { SystemSettings } from './entities/system-settings.entity';
import { LthEngineService } from './services/lth-engine.service';

import { BuyPackageDto } from './dto/buy-package.dto';
import { TransferDto } from './dto/transfer.dto';
import { SellPositionDto } from './dto/sell-position.dto';
import { WithdrawIrrDto } from './dto/withdraw-irr.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Erc1156Position)
    private readonly positionRepo: Repository<Erc1156Position>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepo: Repository<WalletTransaction>,
    @InjectRepository(SystemSettings)
    private readonly settingsRepo: Repository<SystemSettings>,
    private readonly lthEngine: LthEngineService,
    private readonly dataSource: DataSource,
  ) {}

  private generateCardNumber(): string {
    const prefix = '6376';
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    return `${prefix}${randomDigits}`;
  }

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });

    if (!wallet) {
      let isUnique = false;
      let cardNumber = '';

      while (!isUnique) {
        cardNumber = this.generateCardNumber();
        const exists = await this.walletRepo.findOne({ where: { cardNumber } });
        if (!exists) isUnique = true;
      }

      wallet = this.walletRepo.create({
        userId,
        cardNumber,
        baseLth: '0.000000000000',
        stakedLth: '0.000000000000',
        withdrawableIrr: '0',
        balanceTmn: '0.0000',
        isSystemTreasury: false,
      });

      await this.walletRepo.save(wallet);
    }

    return wallet;
  }

  async getOrCreateTreasuryWallet(): Promise<Wallet> {
    let treasury = await this.walletRepo.findOne({ where: { isSystemTreasury: true } });
    if (!treasury) {
      treasury = this.walletRepo.create({
        userId: '00000000-0000-0000-0000-000000000000',
        cardNumber: '6376000000000000',
        baseLth: '0.000000000000',
        stakedLth: '0.000000000000',
        withdrawableIrr: '0',
        balanceTmn: '0.0000',
        isSystemTreasury: true,
      });
      await this.walletRepo.save(treasury);
    }
    return treasury;
  }

  private async getSystemSettings(): Promise<SystemSettings> {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({
        lthBaseRateIrr: '4840000000',
        dailyRewardRate: '0.0034',
        baseRewardRatio: '30.00',
        stakingRewardRatio: '70.00',
        transactionFeePercent: '1.00',
        stakingLockupDays: 3285,
      });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async getCardSummary(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const settings = await this.getSystemSettings();
    const baseRate = new Decimal(settings.lthBaseRateIrr);

    const baseLth = new Decimal(wallet.baseLth || '0');
    const stakedLth = new Decimal(wallet.stakedLth || '0');
    const totalLth = baseLth.plus(stakedLth);

    const conversion = this.lthEngine.lthToIrr(totalLth.toString(), baseRate);

    return {
      walletId: wallet.id,
      cardNumber: wallet.cardNumber.replace(/(\d{4})/g, '$1 ').trim(),
      rawCardNumber: wallet.cardNumber,
      baseVolumeLth: baseLth.toFixed(8),
      stakedLth: stakedLth.toFixed(8),
      withdrawableIrr: Number(wallet.withdrawableIrr || '0').toLocaleString('fa-IR'),
      rawWithdrawableIrr: wallet.withdrawableIrr || '0',
      totalLth: totalLth.toFixed(8),
      totalIrr: Number(conversion.irrValue).toLocaleString('fa-IR'),
      amountTmn: Number(wallet.balanceTmn || '0').toFixed(2),
      amountToman: Number(conversion.tomanValue).toLocaleString('fa-IR'),
    };
  }

  async getUserPositions(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return this.positionRepo.find({
      where: { wallet: { id: wallet.id }, status: PositionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserTransactions(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return this.transactionRepo.find({
      where: { wallet: { id: wallet.id } },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async buyPackage(userId: string, dto: BuyPackageDto) {
    // تضمین وجود کیف‌پول کاربر پیش از قفل ترنزاکشن
    await this.getOrCreateWallet(userId);
    let rawIrr: Decimal;
    if (dto.irrAmount) {
      rawIrr = new Decimal(dto.irrAmount);
    } else if (dto.tomanAmount) {
      rawIrr = new Decimal(dto.tomanAmount).times(10);
    } else {
      throw new BadRequestException('مبلغ ریال یا تومان الزامی است.');
    }

    if (rawIrr.lessThanOrEqualTo(0)) {
      throw new BadRequestException('مبلغ خرید نامعتبر است.');
    }

    const settings = await this.getSystemSettings();
    const baseRate = new Decimal(settings.lthBaseRateIrr);
    const feePercent = new Decimal(settings.transactionFeePercent).dividedBy(100);

    const feeIrr = rawIrr.times(feePercent);
    const netIrr = rawIrr.minus(feeIrr);

    const lthConversion = this.lthEngine.irrToLth(netIrr.toString(), baseRate);
    const lthAmount = new Decimal(lthConversion.dbValue);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userWallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      const treasuryWallet = await this.getOrCreateTreasuryWallet();

      userWallet.baseLth = new Decimal(userWallet.baseLth).plus(lthAmount).toFixed(12);
      await queryRunner.manager.save(userWallet);

      treasuryWallet.withdrawableIrr = new Decimal(treasuryWallet.withdrawableIrr).plus(feeIrr).toFixed(0);
      await queryRunner.manager.save(treasuryWallet);

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const dateTag = `${day}.${month}.${year}`;

      const motherId = `erc1156povnftmotherid${dateTag}`;
      const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const tokenId = `${motherId}_${uniqueSuffix}`;

      const unlockAt = new Date(now.getTime() + settings.stakingLockupDays * 24 * 60 * 60 * 1000);

      const position = queryRunner.manager.create(Erc1156Position, {
        tokenId,
        motherId,
        originDate: now,
        amountLth: lthAmount.toFixed(12),
        accruedStakeLth: '0.000000000000',
        unlockAt,
        status: PositionStatus.ACTIVE,
        wallet: userWallet,
      });
      await queryRunner.manager.save(position);

      const tx = queryRunner.manager.create(WalletTransaction, {
        type: TransactionType.DEPOSIT,
        amountLth: lthAmount.toFixed(12),
        amountIrr: rawIrr.toFixed(0),
        feeLth: '0',
        feeIrr: feeIrr.toFixed(0),
        referenceTokenId: tokenId,
        status: 'SUCCESS',
        wallet: userWallet,
      });
      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();

      return {
        success: true,
        tokenId,
        motherId,
        boughtLth: lthConversion.displayValue,
        exactLth: lthConversion.dbValue,
        netIrr: netIrr.toFixed(0),
        feeIrr: feeIrr.toFixed(0),
        unlockAt,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByCardNumber(cardNumber: string): Promise<Wallet> {
    const cleanCard = cardNumber.replace(/\s+/g, '');
    const wallet = await this.walletRepo.findOne({ where: { cardNumber: cleanCard } });
    if (!wallet) {
      throw new NotFoundException('شماره کارت مقصد یافت نشد.');
    }
    return wallet;
  }

  async transferP2P(senderUserId: string, dto: TransferDto) {
    const sendAmount = new Decimal(dto.amountLth);
    if (sendAmount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('مبلغ ارسالی باید عددی مثبت باشد.');
    }

    const cleanTargetCard = dto.targetCardNumber.replace(/\s+/g, '');
    const settings = await this.getSystemSettings();
    const feeRate = new Decimal(settings.transactionFeePercent).dividedBy(100);
    const baseRate = new Decimal(settings.lthBaseRateIrr);

    const feeLth = sendAmount.times(feeRate);
    const netLth = sendAmount.minus(feeLth);
    const amountIrr = sendAmount.times(baseRate).toFixed(0);
    const feeIrr = feeLth.times(baseRate).toFixed(0);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const senderPre = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { userId: senderUserId },
      });

      const receiverPre = await queryRunner.manager.findOne(Wallet, {
        where: { cardNumber: cleanTargetCard },
      });

      if (!receiverPre) {
        throw new NotFoundException('شماره کارت مقصد معتبر نیست.');
      }

      if (receiverPre.id === senderPre.id) {
        throw new BadRequestException('امکان انتقال به کارت خودتان وجود ندارد.');
      }

      // قفل ترتیبی کیف‌پول‌ها بر اساس ID جهت جلوگیری از وقوع قطعی بن‌بست (Deadlock)
      const firstId = senderPre.id < receiverPre.id ? senderPre.id : receiverPre.id;
      const secondId = senderPre.id < receiverPre.id ? receiverPre.id : senderPre.id;

      await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: firstId },
        lock: { mode: 'pessimistic_write' },
      });

      await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: secondId },
        lock: { mode: 'pessimistic_write' },
      });

      const senderWallet = await queryRunner.manager.findOneOrFail(Wallet, { where: { id: senderPre.id } });
      const receiverWallet = await queryRunner.manager.findOneOrFail(Wallet, { where: { id: receiverPre.id } });

      const senderBalance = new Decimal(senderWallet.baseLth);
      if (senderBalance.lessThan(sendAmount)) {
        throw new BadRequestException('موجودی LTH نقدشونده شما برای این انتقال کافی نیست.');
      }

      let treasuryWallet = await queryRunner.manager.findOne(Wallet, {
        where: { isSystemTreasury: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!treasuryWallet) {
        treasuryWallet = queryRunner.manager.create(Wallet, {
          userId: '00000000-0000-0000-0000-000000000000',
          cardNumber: '6376000000000000',
          baseLth: '0.000000000000',
          stakedLth: '0.000000000000',
          withdrawableIrr: '0',
          balanceTmn: '0.0000',
          isSystemTreasury: true,
        });
        await queryRunner.manager.save(treasuryWallet);
      }

      senderWallet.baseLth = senderBalance.minus(sendAmount).toFixed(12);
      await queryRunner.manager.save(senderWallet);

      receiverWallet.baseLth = new Decimal(receiverWallet.baseLth).plus(netLth).toFixed(12);
      await queryRunner.manager.save(receiverWallet);

      treasuryWallet.baseLth = new Decimal(treasuryWallet.baseLth).plus(feeLth).toFixed(12);
      await queryRunner.manager.save(treasuryWallet);

      // همگام‌سازی پوزیشن‌های فرستنده (کسر زنجیره‌ای FIFO)
      const senderPositions = await queryRunner.manager.find(Erc1156Position, {
        where: { wallet: { id: senderWallet.id }, status: PositionStatus.ACTIVE },
        order: { originDate: 'ASC' },
      });

      let remainingToDeduct = new Decimal(sendAmount);
      for (const pos of senderPositions) {
        if (remainingToDeduct.isZero()) break;
        const posAmount = new Decimal(pos.amountLth);
        if (posAmount.greaterThan(remainingToDeduct)) {
          pos.amountLth = posAmount.minus(remainingToDeduct).toFixed(12);
          remainingToDeduct = new Decimal(0);
          await queryRunner.manager.save(pos);
        } else {
          remainingToDeduct = remainingToDeduct.minus(posAmount);
          pos.amountLth = '0.000000000000';
          pos.status = PositionStatus.TRANSFERRED_TO_TREASURY;
          await queryRunner.manager.save(pos);
        }
      }

      // صدور پوزیشن فعال برای گیرنده جهت امکان فروش و نقدشوندگی
      const now = new Date();
      const p2pTokenId = `erc1156_p2p_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const unlockAt = new Date(now.getTime() + settings.stakingLockupDays * 24 * 60 * 60 * 1000);

      const receiverPosition = queryRunner.manager.create(Erc1156Position, {
        tokenId: p2pTokenId,
        motherId: 'erc1156_p2p_transfer',
        originDate: now,
        amountLth: netLth.toFixed(12),
        accruedStakeLth: '0.000000000000',
        unlockAt,
        status: PositionStatus.ACTIVE,
        wallet: receiverWallet,
      });
      await queryRunner.manager.save(receiverPosition);

      const txOut = queryRunner.manager.create(WalletTransaction, {
        type: TransactionType.P2P_OUT,
        amountLth: sendAmount.toFixed(12),
        amountIrr,
        feeLth: feeLth.toFixed(12),
        feeIrr,
        targetCardNumber: cleanTargetCard,
        status: 'SUCCESS',
        wallet: senderWallet,
      });
      await queryRunner.manager.save(txOut);

      const txIn = queryRunner.manager.create(WalletTransaction, {
        type: TransactionType.P2P_IN,
        amountLth: netLth.toFixed(12),
        amountIrr,
        feeLth: '0',
        feeIrr: '0',
        targetCardNumber: senderWallet.cardNumber,
        referenceTokenId: p2pTokenId,
        status: 'SUCCESS',
        wallet: receiverWallet,
      });
      await queryRunner.manager.save(txIn);

      await queryRunner.commitTransaction();

      return {
        success: true,
        sentTotalLth: sendAmount.toFixed(8),
        feeLth: feeLth.toFixed(8),
        receivedNetLth: netLth.toFixed(8),
        targetCard: cleanTargetCard,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async distributeDailyYield() {
    // قفل زمانی ضدتکرار (Idempotency): جلوگیری قطعی از توزیع مجدد سود در یک روز
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyRun = await this.transactionRepo
      .createQueryBuilder('tx')
      .where('tx.type = :type', { type: TransactionType.STAKING_REWARD })
      .andWhere('tx.createdAt >= :todayStart', { todayStart })
      .getOne();

    if (alreadyRun) {
      return {
        processedCount: 0,
        message: 'سود روز جاری قبلاً محاسبه و واریز شده است.',
        alreadyDistributed: true,
      };
    }

    const settings = await this.getSystemSettings();
    const yieldRate = new Decimal(settings.dailyRewardRate);
    const baseRatio = Number(settings.baseRewardRatio);
    const stakeRatio = Number(settings.stakingRewardRatio);

    const activeWallets = await this.walletRepo
      .createQueryBuilder("wallet")
      .where("wallet.isSystemTreasury = false")
      .andWhere("wallet.baseLth > 0")
      .getMany();

    const results = [];

    for (const wallet of activeWallets) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const lockedWallet = await queryRunner.manager.findOneOrFail(Wallet, {
          where: { id: wallet.id },
          lock: { mode: "pessimistic_write" },
        });

        const yieldCalc = this.lthEngine.calculateDailyYield(
          lockedWallet.baseLth,
          baseRatio,
          stakeRatio,
          yieldRate,
          settings.lthBaseRateIrr,
        );

        lockedWallet.baseLth = new Decimal(lockedWallet.baseLth)
          .plus(new Decimal(yieldCalc.negativeRewardLth))
          .toFixed(12);

        lockedWallet.stakedLth = new Decimal(lockedWallet.stakedLth)
          .plus(new Decimal(yieldCalc.stakedRewardLth))
          .toFixed(12);

        await queryRunner.manager.save(lockedWallet);

        const activePositions = await queryRunner.manager.find(Erc1156Position, {
          where: { wallet: { id: lockedWallet.id }, status: PositionStatus.ACTIVE },
        });

        if (activePositions.length > 0) {
          const totalPosAmount = activePositions.reduce(
            (sum, p) => sum.plus(new Decimal(p.amountLth)),
            new Decimal(0),
          );

          if (totalPosAmount.isPositive() && !totalPosAmount.isZero()) {
            let allocatedNegative = new Decimal(0);
            let allocatedStake = new Decimal(0);

            for (let i = 0; i < activePositions.length; i++) {
              const pos = activePositions[i];
              const isLast = i === activePositions.length - 1;
              const posWeight = new Decimal(pos.amountLth).dividedBy(totalPosAmount);

              const posNeg = isLast
                ? new Decimal(yieldCalc.negativeRewardLth).minus(allocatedNegative)
                : new Decimal(yieldCalc.negativeRewardLth).times(posWeight).toDecimalPlaces(12, Decimal.ROUND_DOWN);

              const posStake = isLast
                ? new Decimal(yieldCalc.stakedRewardLth).minus(allocatedStake)
                : new Decimal(yieldCalc.stakedRewardLth).times(posWeight).toDecimalPlaces(12, Decimal.ROUND_DOWN);

              allocatedNegative = allocatedNegative.plus(posNeg);
              allocatedStake = allocatedStake.plus(posStake);

              pos.amountLth = new Decimal(pos.amountLth).plus(posNeg).toFixed(12);
              pos.accruedStakeLth = new Decimal(pos.accruedStakeLth).plus(posStake).toFixed(12);
              await queryRunner.manager.save(pos);
            }
          }
        }

        const tx = queryRunner.manager.create(WalletTransaction, {
          type: TransactionType.STAKING_REWARD,
          amountLth: yieldCalc.totalRewardLth,
          amountIrr: yieldCalc.totalRewardIrr,
          feeLth: "0",
          feeIrr: "0",
          status: "SUCCESS",
          wallet: lockedWallet,
        });
        await queryRunner.manager.save(tx);

        await queryRunner.commitTransaction();

        results.push({
          walletId: lockedWallet.id,
          cardNumber: lockedWallet.cardNumber,
          addedBaseLth: yieldCalc.negativeRewardLth,
          addedStakedLth: yieldCalc.stakedRewardLth,
          totalRewardLth: yieldCalc.totalRewardLth,
        });
      } catch (err) {
        await queryRunner.rollbackTransaction();
        results.push({
          walletId: wallet.id,
          status: "FAILED",
          error: err.message,
        });
      } finally {
        await queryRunner.release();
      }
    }

    return {
      processedCount: results.length,
      details: results,
    };
  }

  async sellPosition(userId: string, dto: SellPositionDto) {
    const rawAmount = (dto && (dto.sellAmountLth ?? (dto as any).amount)) ?? null;
    if (!dto || !dto.tokenId) {
      throw new BadRequestException("شناسه پوزیشن الزامی است.");
    }
    if (rawAmount === null || rawAmount === undefined || rawAmount === "") {
      throw new BadRequestException("مقدار فروش الزامی است.");
    }
    let sellAmount: Decimal;
    try {
      sellAmount = new Decimal(rawAmount);
    } catch {
      throw new BadRequestException("مقدار فروش باید عددی معتبر باشد.");
    }
    if (sellAmount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("مبلغ فروش باید عددی مثبت باشد.");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userWallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { userId },
        lock: { mode: "pessimistic_write" },
      });

      const position = await queryRunner.manager.findOne(Erc1156Position, {
        where: {
          tokenId: dto.tokenId,
          wallet: { id: userWallet.id },
          status: PositionStatus.ACTIVE,
        },
        lock: { mode: "pessimistic_write" },
      });

      if (!position) {
        throw new NotFoundException("پوزیشن اجماع فعال با این شناسه برای شما یافت نشد.");
      }

      if (sellAmount.greaterThan(new Decimal(position.amountLth))) {
        throw new BadRequestException("مبلغ درخواستی بیشتر از حجم نقدشونده این پوزیشن است.");
      }

      if (sellAmount.greaterThan(new Decimal(userWallet.baseLth))) {
        throw new BadRequestException("موجودی نقدشونده کیف‌پول شما کافی نیست.");
      }

      const settings = await this.getSystemSettings();
      const feePercentDecimal = new Decimal(settings.transactionFeePercent).dividedBy(100);

      const liquidation = this.lthEngine.calculatePositionLiquidation(
        position.amountLth,
        position.accruedStakeLth,
        sellAmount.toString(),
        settings.lthBaseRateIrr,
        feePercentDecimal.toString(),
      );

      let treasuryWallet = await queryRunner.manager.findOne(Wallet, {
        where: { isSystemTreasury: true },
        lock: { mode: "pessimistic_write" },
      });

      if (!treasuryWallet) {
        treasuryWallet = queryRunner.manager.create(Wallet, {
          userId: "00000000-0000-0000-0000-000000000000",
          cardNumber: "6376000000000000",
          baseLth: "0.000000000000",
          stakedLth: "0.000000000000",
          withdrawableIrr: "0",
          balanceTmn: "0.0000",
          isSystemTreasury: true,
        });
        await queryRunner.manager.save(treasuryWallet);
      }

      userWallet.baseLth = new Decimal(userWallet.baseLth).minus(liquidation.soldLth).toFixed(12);
      userWallet.stakedLth = new Decimal(userWallet.stakedLth).minus(liquidation.deductedStakeLth).toFixed(12);
      userWallet.withdrawableIrr = new Decimal(userWallet.withdrawableIrr).plus(liquidation.netIrrToUser).toFixed(0);
      await queryRunner.manager.save(userWallet);

      treasuryWallet.stakedLth = new Decimal(treasuryWallet.stakedLth).plus(liquidation.deductedStakeLth).toFixed(12);
      treasuryWallet.withdrawableIrr = new Decimal(treasuryWallet.withdrawableIrr).plus(liquidation.feeIrr).toFixed(0);
      await queryRunner.manager.save(treasuryWallet);

      position.amountLth = liquidation.remainingNegativeLth;
      position.accruedStakeLth = liquidation.remainingStakedLth;

      if (new Decimal(position.amountLth).isZero()) {
        position.status = PositionStatus.TRANSFERRED_TO_TREASURY;
      } else {
        position.status = PositionStatus.ACTIVE;
      }
      await queryRunner.manager.save(position);

      const tx = queryRunner.manager.create(WalletTransaction, {
        type: TransactionType.WITHDRAW,
        amountLth: liquidation.soldLth,
        amountIrr: liquidation.grossIrr,
        feeLth: "0",
        feeIrr: liquidation.feeIrr,
        referenceTokenId: position.tokenId,
        status: "SUCCESS",
        wallet: userWallet,
      });
      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();

      return {
        success: true,
        soldLth: liquidation.soldLth,
        deductedStakeLth: liquidation.deductedStakeLth,
        remainingPositionLth: liquidation.remainingNegativeLth,
        grossIrr: liquidation.grossIrr,
        feeIrr: liquidation.feeIrr,
        netIrrToUser: liquidation.netIrrToUser,
        netTomanToUser: new Decimal(liquidation.netIrrToUser).dividedBy(10).toFixed(0),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async requestWithdrawal(userId: string, dto: WithdrawIrrDto) {
    if (!dto || dto.amountIrr === undefined || dto.amountIrr === null || dto.amountIrr === "") {
      throw new BadRequestException("مبلغ برداشت الزامی است.");
    }
    let withdrawAmount: Decimal;
    try {
      withdrawAmount = new Decimal(dto.amountIrr);
    } catch {
      throw new BadRequestException("مبلغ برداشت نامعتبر است.");
    }
    if (withdrawAmount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("مبلغ برداشت نامعتبر است.");
    }

    if (!dto.shebaNumber || typeof dto.shebaNumber !== "string") {
      throw new BadRequestException("شماره شبا الزامی است.");
    }
    let cleanSheba = dto.shebaNumber.replace(/\s+/g, "").toUpperCase();
    if (!cleanSheba.startsWith('IR')) {
      cleanSheba = `IR${cleanSheba}`;
    }

    if (cleanSheba.length !== 26) {
      throw new BadRequestException('شماره شبا باید ۲۴ رقم عددی پس از IR باشد.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userWallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      const currentWithdrawable = new Decimal(userWallet.withdrawableIrr || '0');
      if (currentWithdrawable.lessThan(withdrawAmount)) {
        throw new BadRequestException('موجودی ریالی قابل برداشت شما برای این درخواست کافی نیست.');
      }

      userWallet.withdrawableIrr = currentWithdrawable.minus(withdrawAmount).toFixed(0);
      await queryRunner.manager.save(userWallet);

      const tx = queryRunner.manager.create(WalletTransaction, {
        type: TransactionType.WITHDRAW,
        amountLth: '0.000000000000',
        amountIrr: withdrawAmount.toFixed(0),
        feeLth: '0',
        feeIrr: '0',
        targetCardNumber: cleanSheba,
        status: 'PENDING',
        wallet: userWallet,
      });
      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();

      return {
        success: true,
        withdrawalId: tx.id,
        amountIrr: withdrawAmount.toFixed(0),
        amountToman: withdrawAmount.dividedBy(10).toFixed(0),
        destinationSheba: cleanSheba,
        status: 'PENDING',
        remainingWithdrawableIrr: userWallet.withdrawableIrr,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * دریافت لیست درخواست‌های برداشت در انتظار تسویه پایا
   */
  async getPendingWithdrawals() {
    return this.transactionRepo.find({
      where: {
        type: TransactionType.WITHDRAW,
        status: 'PENDING',
      },
      relations: ['wallet'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * تایید تسویه پایا (انتقال انجام شد)
   */
  async approveWithdrawal(transactionId: string, trackingCode?: string) {
    const tx = await this.transactionRepo.findOne({
      where: { id: transactionId, type: TransactionType.WITHDRAW },
    });
    if (!tx) {
      throw new NotFoundException('تراکنش برداشت یافت نشد.');
    }
    if (tx.status !== 'PENDING') {
      throw new BadRequestException('این تراکنش قبلاً تعیین تکلیف شده است.');
    }

    tx.status = 'SUCCESS';
    if (trackingCode) {
      tx.referenceTokenId = trackingCode;
    }
    await this.transactionRepo.save(tx);

    return {
      success: true,
      message: 'تراکنش با موفقیت تایید و تسویه شد.',
      transactionId: tx.id,
      trackingCode: tx.referenceTokenId,
    };
  }

  /**
   * رد درخواست برداشت و بازگشت آنی مبلغ ریالی به کیف پول کاربر (Refund)
   */
  async rejectWithdrawal(transactionId: string, reason?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tx = await queryRunner.manager.findOne(WalletTransaction, {
        where: { id: transactionId, type: TransactionType.WITHDRAW },
        relations: ['wallet'],
      });

      if (!tx) {
        throw new NotFoundException('تراکنش برداشت یافت نشد.');
      }
      if (tx.status !== 'PENDING') {
        throw new BadRequestException('این تراکنش در وضعیت در انتظار قرار ندارد.');
      }

      tx.status = 'FAILED';
      if (reason) {
        tx.referenceTokenId = `REJECTED: ${reason}`;
      }
      await queryRunner.manager.save(tx);

      const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
        where: { id: tx.wallet.id },
        lock: { mode: 'pessimistic_write' },
      });

      wallet.withdrawableIrr = new Decimal(wallet.withdrawableIrr || '0')
        .plus(new Decimal(tx.amountIrr))
        .toFixed(0);
      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'درخواست برداشت رد شد و مبلغ به کیف پول کاربر بازگردانده شد.',
        refundedAmountIrr: tx.amountIrr,
        newWithdrawableIrr: wallet.withdrawableIrr,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async exportPayaBatchFile() {
    const pendings = await this.getPendingWithdrawals();
    if (pendings.length === 0) {
      return {
        count: 0,
        csv: 'شماره شبا,مبلغ (ریال),شناسه پیگیری,شرح بابت\n',
      };
    }

    let csvContent = 'شماره شبا,مبلغ (ریال),شناسه پیگیری,شرح بابت\n';
    for (const tx of pendings) {
      const sheba = tx.targetCardNumber || '';
      const amount = tx.amountIrr;
      const id = tx.id;
      const desc = 'تسویه سود Central Mine';
      csvContent += `${sheba},${amount},${id},${desc}\n`;
    }

    return {
      count: pendings.length,
      totalAmountIrr: pendings
        .reduce((sum, item) => sum.plus(new Decimal(item.amountIrr)), new Decimal(0))
        .toFixed(0),
      csv: csvContent,
    };
  }
}