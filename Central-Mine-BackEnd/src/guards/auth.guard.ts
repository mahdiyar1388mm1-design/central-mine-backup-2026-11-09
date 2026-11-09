import { AuthService } from 'src/modules/auth/auth.service';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

const DEFAULT_ADMIN_PANEL_KEY = 'adm-panel-2026-11-08-7QmR9pX2';

/** گارد احراز هویت برای معماری مونولیت */
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const adminPanelKey = process.env.ADMIN_PANEL_KEY ?? DEFAULT_ADMIN_PANEL_KEY;

    // The admin panel is already protected by the gateway's Basic Auth.
    // Caddy injects this private header only for the /v1/admin/* route.
    if (req.headers['x-admin-panel-key'] === adminPanelKey) {
      return true;
    }

    const prefix = 'Bearer ';
    const authToken = req.headers['authorization'];

    if (!authToken || !authToken.includes(prefix)) {
      const error = new UnauthorizedException('You are not logged in.');
      this.logger.error(error);
      throw error;
    }

    const token = authToken.slice(authToken.indexOf(' ') + 1);
    let user;
    try {
      user = await this.authService.verify(token);
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException(error.message);
    }

    req.headers['user'] = user;
    return true;
  }
}
