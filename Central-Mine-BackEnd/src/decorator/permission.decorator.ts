import { SetMetadata } from '@nestjs/common';
import { PermissionTag } from 'src/modules/user_role/types/permission-tag.enum';

/** دکوریتور تخصیص دسترسی‌ها */
export const Permissions = (...permissions: PermissionTag[]) =>
  SetMetadata('permissions', permissions);
