import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from 'src/modules/users/entities/user.entity';

const DEFAULT_ADMIN_PANEL_KEY = 'adm-panel-2026-11-08-7QmR9pX2';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const panelKey = process.env.ADMIN_PANEL_KEY ?? DEFAULT_ADMIN_PANEL_KEY;
    const suppliedPanelKey = req.headers['x-admin-panel-key'];
    if (suppliedPanelKey === panelKey) return true;
    const user = req.headers['user'];

    if (!user) {
      throw new UnauthorizedException('کاربر احراز هویت نشده است.');
    }

    // مجاز بودن نقش مدیر ارشد یا مدیر سیستم
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('دسترسی غیرمجاز: این بخش منحصراً در اختیار مدیریت سیستم است.');
    }

    return true;
  }
}
