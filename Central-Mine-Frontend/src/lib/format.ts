export function formatPrice(amount: number): string {
  return `IRR ${amount.toLocaleString('en-US')}`
}

/** A single price when every SKU costs the same, otherwise "min–max". */
export function formatPriceRange(prices: number[]): string {
  if (prices.length === 0) return '—'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return formatPrice(min)
  return `${formatPrice(min)}–${max.toLocaleString('en-US')}`
}
