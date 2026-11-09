import { plainToClass } from 'class-transformer';

export default function getExposedFieldsOfClass(Class): string[] {
  const items = plainToClass(Class, {}, { excludeExtraneousValues: true });
  return Object.keys(items);
}
