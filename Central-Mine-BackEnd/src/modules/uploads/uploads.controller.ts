import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { UploadRo } from './dto/upload.ro';

/** فایل‌ها روی دیسک محلی سرور ذخیره می‌شوند و از مسیر GET /uploads/<file>
 * سرو می‌شوند (بدون پیشوند v1 — نگاه کن main.ts). این یک CDN واقعی نیست؛
 * برای دیپلوی واقعی جای این پوشه را با یک object storage واقعی (S3 و
 * مشابه آن) عوض کن — چون خروجی همیشه یک url ساده است، تغییرش به کد سمت
 * مصرف‌کننده (فرانت) دست نمی‌زند. */
export const UPLOADS_DIR = join(process.cwd(), 'uploads');
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * مسیریاب و کنترل‌کننده‌ی http آپلود فایل (فعلاً فقط تصویر)
 */
@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  @Post()
  @ApiOperation({
    summary: 'آپلود یک فایل تصویر',
    description:
      'فایل را به‌صورت multipart/form-data با کلید "file" بفرست؛ آدرس عمومیِ قابل‌دانلودش برگردانده می‌شود.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiCreatedResponse({ description: 'The file has been uploaded.', type: UploadRo })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('فقط تصویر (jpeg/png/webp/gif) مجاز است'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request): Promise<UploadRo> {
    if (!file) throw new BadRequestException('فایلی ارسال نشده است');
    return { url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}` };
  }
}
