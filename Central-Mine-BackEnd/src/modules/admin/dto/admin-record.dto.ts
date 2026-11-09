import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export const ADMIN_RECORD_TYPES = [
  'treasury', 'stake-return', 'base-return', 'fee', 'buyback', 'journal', 'support',
] as const;

export class CreateAdminRecordDto {
  @IsIn(ADMIN_RECORD_TYPES)
  type: (typeof ADMIN_RECORD_TYPES)[number];

  @IsObject()
  data: Record<string, unknown>;
}

export class UpdateAdminRecordDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class AdminRecordsQueryDto {
  @IsOptional()
  @IsString()
  type?: string;
}
