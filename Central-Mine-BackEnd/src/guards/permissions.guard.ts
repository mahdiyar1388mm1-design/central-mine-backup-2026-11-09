import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRolesService } from 'src/modules/user_role/user-roles.service';
import { PermissionTag } from 'src/modules/user_role/types/permission-tag.enum';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

/** گارد بررسی دسترسی بر اساس متادیتای @Permissions */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRolesService: UserRolesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<PermissionTag[]>(
      'permissions',
      context.getHandler(),
    );
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const phoneNumber: string | undefined = req.headers?.user?.phoneNumber;
    if (!phoneNumber) return false;

    try {
      await this.userRolesService.checkPermission({
        username: phoneNumber,
        permissions: required,
      } as any);
      return true;
    } catch (err) {
      this.logger.warn(`Permission denied for ${phoneNumber}: ${err?.message}`);
      return false;
    }
  }
}
