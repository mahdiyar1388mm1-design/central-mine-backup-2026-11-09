const IRAN_MOBILE_REGEX = /^09\d{9}$/

export function validatePhone(phone: string): string | undefined {
  const trimmed = phone.trim()

  if (!trimmed) return 'فیلد اجباری'
  if (!IRAN_MOBILE_REGEX.test(trimmed)) return 'شماره تلفن معتبر نیست'

  return undefined
}
