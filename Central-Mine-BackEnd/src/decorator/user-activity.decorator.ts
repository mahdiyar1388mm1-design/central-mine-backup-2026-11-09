import { SetMetadata } from '@nestjs/common';
import { CalleeTypeEnum } from 'src/commons/enums/user_activity/calleeType.enum';
import { MethodEnum } from 'src/commons/enums/user_activity/method.enum';

/** دکوریتور فعالیت‌های کاربر */
export const UserActivity = (
  method: MethodEnum,
  calleeType: CalleeTypeEnum,
  calleeKey: string,
  isRequest: Boolean = true,
) => SetMetadata('userActivity', { method, calleeType, calleeKey, isRequest });
