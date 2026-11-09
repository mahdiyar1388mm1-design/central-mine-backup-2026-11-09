import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminState } from './entities/admin-state.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminRecord } from './entities/admin-record.entity';
import { AdminSale } from './entities/admin-sale.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Erc1156Position } from '../wallet/entities/erc1156-position.entity';
import { WalletTransaction } from '../wallet/entities/wallet-transaction.entity';
import { SystemSettings } from '../wallet/entities/system-settings.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdminState, AdminRecord, AdminSale, Product, User, Wallet, Erc1156Position, WalletTransaction, SystemSettings]), AuthModule, WalletModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
