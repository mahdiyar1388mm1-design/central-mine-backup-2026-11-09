import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { configService } from './config.service';
import { WinstonModule } from 'nest-winston';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserRoleModule } from './modules/user_role/user-roles.module';
import { ProductsModule } from './modules/products/products.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { QueryFailedFilter } from './filters/query-failed.filter';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WinstonModule.forRoot(configService.getWinstonConfig()),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UsersModule,
    AuthModule,
    UserRoleModule,
    ProductsModule,
    UploadsModule,
    WalletModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: QueryFailedFilter,
    },
  ],
})
export class AppModule {}
