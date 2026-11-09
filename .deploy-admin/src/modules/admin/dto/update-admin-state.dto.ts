import { IsObject } from 'class-validator';

export class UpdateAdminStateDto {
  @IsObject()
  state: Record<string, unknown>;
}
