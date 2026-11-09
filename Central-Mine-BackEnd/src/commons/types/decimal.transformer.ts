import { ValueTransformer } from 'typeorm';

/** ستون‌های `numeric`/`decimal` توسط درایور pg همیشه به‌صورت رشته برمی‌گردند؛
 * این transformer آن‌ها را در خواندن/نوشتن به عدد جاوااسکریپت تبدیل می‌کند. */
export class DecimalTransformer implements ValueTransformer {
  to(data?: number): number | undefined {
    return data;
  }

  from(data?: string): number | undefined {
    return data === null || data === undefined ? undefined : parseFloat(data);
  }
}
