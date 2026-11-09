import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as traverse from 'traverse';

const SECRET_KEYS = [
  /passw(or)?d/i,
  /^pw$/,
  /^pass$/i,
  /secret/i,
  /token/i,
  /api[-._]?key/i,
  /session[-._]?id/i,
  /^connect\.sid$/,
];

function redact(info: any): any {
  return traverse(info).map(function () {
    if (SECRET_KEYS.some((regex) => regex.test(this.key))) {
      this.update('************');
    }
  });
}

/** لاگ کننده اعمال مشخص شده‌ی کاربران */
@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const userActivity = this.reflector.get<any>(
      'userActivity',
      context.getHandler(),
    );

    if (!userActivity) return next.handle();

    return next.handle().pipe(
      tap((response) => {
        const request = context.switchToHttp().getRequest();
        this.logActivity(userActivity, request, response);
      }),
    );
  }

  private logActivity(userActivity: any, request: any, response: any): void {
    try {
      const isLogin = userActivity.method === 'LOGIN';
      const caller = isLogin
        ? request.body?.phoneNumber
        : request.headers?.user?.phoneNumber;

      const calleeSource = userActivity.isRequest ? request.body : response;
      const callee = calleeSource
        ? calleeSource[userActivity.calleeKey]?.toString()
        : undefined;

      this.logger.info('User activity', {
        method: userActivity.method,
        request: redact(request.body),
        response: redact(response),
        caller,
        callee,
        calleeKey: userActivity.calleeKey,
        calleeType: userActivity.calleeType,
      });
    } catch (err) {
      this.logger.error('Failed to log user activity', err);
    }
  }
}
