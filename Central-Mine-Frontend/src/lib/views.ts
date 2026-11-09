// نمایش صرفا عدد واقعی ثبت شده در پایگاه‌داده
export function getProductViews(id?: string, name?: string, rawSeen?: number): number {
  void id;
  void name;
  return typeof rawSeen === "number" ? rawSeen : 0;
}
