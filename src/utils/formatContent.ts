/**
 * Format số thành chuỗi tiền tệ VNĐ: 25000000 → "25,000,000"
 */
// export const formatCurrency = (value: number | string): string => {
//   const num = typeof value === 'string' ? parseCurrency(value) : value
//   if (isNaN(num) || num === 0) return ''
//   return num.toLocaleString('vi-VN')
// }
export const formatCurrency = (n: number | string): string => {
  n = Number(n)
  if (!n && n !== 0) return ''
  return n.toLocaleString('de-DE')
}

/**
 * Parse chuỗi tiền tệ về số: "25,000,000" → 25000000
 * Loại bỏ tất cả ký tự không phải số
 */
export const parseCurrency = (value: string | number): number => {
  const cleaned = String(value).replace(/[^\d]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

/**
 * Xử lý input tiền tệ: chỉ giữ số, tự động format dấu phẩy
 * Dùng với @input event của el-input
 *
 * @returns Chuỗi đã format (VD: "25,000,000")
 */
export const handleCurrencyInput = (rawValue: string | number): string => {
  // Loại bỏ mọi ký tự không phải số
  const digitsOnly = String(rawValue).replace(/[^\d]/g, '')
  if (!digitsOnly) return ''

  const num = parseInt(digitsOnly, 10)
  return num.toLocaleString('de-DE')
}
