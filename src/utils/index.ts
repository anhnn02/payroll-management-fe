/**
 * Entity code prefixes — dùng cho generateCode()
 * Format: PREFIX + YYMMDD + ### (random 3 digits)
 */
export const CODE_PREFIX = {
  DEPARTMENT: 'PB', // Phòng ban
  POSITION: 'VT', // Vị trí
  EMPLOYEE: 'NV', // Nhân viên
  CONTRACT: 'HD', // Hợp đồng
  PAYROLL: 'BL', // Bảng lương
} as const

export type CodePrefixKey = keyof typeof CODE_PREFIX

/**
 * Sinh mã code tự động dựa trên timestamp
 * Format: PREFIX + YYMMDD + ### (3 số random)
 *
 * VD: PB260226001, VT260226042, NV260226123
 *
 * @param prefix - Key trong CODE_PREFIX (DEPARTMENT, POSITION, ...)
 * @returns Mã code duy nhất
 */
export function generateCode(prefix: CodePrefixKey): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')

  return `${CODE_PREFIX[prefix]}${yy}${mm}${dd}${random}`
}
