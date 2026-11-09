import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminState } from './entities/admin-state.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminRecord } from './entities/admin-record.entity';
import { AdminSale } from './entities/admin-sale.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminState, AdminRecord, AdminSale, Product]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
