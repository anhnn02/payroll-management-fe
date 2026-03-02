// Payroll constants - using enums from @/constants/enums

import { PayrollStatus, PayrollStatusLabel, enumToOptions } from '@/constants/enums'

// Payroll Status options for filter dropdown
export const PAYROLL_STATUS_OPTIONS = enumToOptions(PayrollStatusLabel)

// Payroll Status labels (re-export for convenience)
export const PAYROLL_STATUS_LABELS = PayrollStatusLabel

// Payroll Status tag type (Element Plus tag types)
type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'

export const PAYROLL_STATUS_TAG_TYPE: Record<PayrollStatus, TagType> = {
  [PayrollStatus.UNPAID]: 'warning', // Tag vàng
  [PayrollStatus.PAID]: 'success', // Tag xanh
}

// Month options for filter dropdown (Tháng 1-12)
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}))
