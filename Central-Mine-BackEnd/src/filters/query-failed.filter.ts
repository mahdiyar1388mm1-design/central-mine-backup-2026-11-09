import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PostgresError } from 'src/commons/types/postgres.error.type';

/**
 * رسیدگی کننده به خطا‌های پایگاه‌داده
 */
@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  catch(
    exception: QueryFailedError & { code: string } & { detail: string },
    _host: ArgumentsHost,
  ): void {
    let error: HttpException;
    switch (exception.code) {
      case PostgresError.PG_UNIQUE_VIOLATION:
        error = new ConflictException(exception.detail);
        break;
      case PostgresError.PG_DATATYPE_MISMATCH:
        error = new BadRequestException(exception.detail);
        break;
      default:
        error = new InternalServerErrorException(exception.detail);
    }
    throw error;
  }
}
