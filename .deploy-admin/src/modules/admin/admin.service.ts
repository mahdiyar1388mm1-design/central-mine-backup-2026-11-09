import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminState } from './entities/admin-state.entity';
import { AdminRecord } from './entities/admin-record.entity';
import { AdminSale } from './entities/admin-sale.entity';
import { Product } from '../products/entities/product.entity';
import { CreateAdminSaleDto, UpdateAdminSaleDto } from './dto/admin-sale.dto';

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
  ) {}

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
