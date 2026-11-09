import { ApiProperty } from '@nestjs/swagger';
import { UserRo } from './user.ro';

export class UsersRo {
  @ApiProperty({ type: [UserRo] })
  users: UserRo[];

  @ApiProperty()
  count: number;
}
