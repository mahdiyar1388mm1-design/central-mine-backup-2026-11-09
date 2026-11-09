import { ApiProperty } from '@nestjs/swagger';

export class UploadRo {
  @ApiProperty({
    description:
      'آدرس عمومی و قابل‌دانلود فایل آپلودشده — همین را در فیلد url مربوط به تصویر محصول (products.skus[].images[].url) بفرستید.',
  })
  url: string;
}
