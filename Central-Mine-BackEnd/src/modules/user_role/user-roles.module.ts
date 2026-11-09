import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { RolesService } from './roles.service';
import { UserRolesService } from './user-roles.service';
import { UserRoleController } from './user-roles.controller';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { AuthModule } from 'src/modules/auth/auth.module';

/** ماژول نقش‌ها و دسترسی‌ها در معماری مونولیت */
@Module({
  imports: [TypeOrmModule.forFeature([Role, User]), AuthModule],
  controllers: [UserRoleController],
  providers: [RolesService, UserRolesService, PermissionsGuard],
  exports: [RolesService, UserRolesService],
})
export class UserRoleModule {}
