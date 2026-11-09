import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Erc1156Position } from './entities/erc1156-position.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { SystemSettings } from './entities/system-settings.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { LthEngineService } from './services/lth-engine.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      Erc1156Position,
      WalletTransaction,
      SystemSettings,
    ]),
    AuthModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, LthEngineService],
  exports: [WalletService, LthEngineService, TypeOrmModule],
})
export class WalletModule {}