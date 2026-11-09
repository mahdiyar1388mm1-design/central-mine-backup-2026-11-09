import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { configService } from 'src/config.service';
import { UserRole } from 'src/modules/users/entities/user.entity';

@Injectable()
export class UsersAdminGuard implements CanActivate {
  private readonly jwt = new JwtService({
    secret: configService.getJwtConfig().secret,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required');
    }

    let user: { id?: string; role?: string };
    try {
      user = await this.jwt.verifyAsync(auth.slice(7));
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!user?.id) {
      throw new UnauthorizedException('Invalid user identity');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
