// Employee constants - using common enums from @/constants/enums

import { EmployeeStatus, EmployeeStatusLabel, GenderLabel, enumToOptions } from '@/constants/enums'
import { COLORS } from '@/constants/colors'

// Re-export for backward compatibility
export type { EmployeeStatus } from '@/constants/enums'

// Status options (from common enum)
export const EMPLOYEE_STATUS_OPTIONS = enumToOptions(EmployeeStatusLabel)

// Status labels (from common enum)
export const EMPLOYEE_STATUS_LABELS = EmployeeStatusLabel

// Status colors for badge
export const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE]: COLORS.SUCCESS,
  [EmployeeStatus.INACTIVE]: COLORS.DANGER,
}

// Gender options (from common enum)
export const GENDER_OPTIONS = enumToOptions(GenderLabel)

// Gender labels
export const GENDER_LABELS = GenderLabel

// Department options - fetched from API, this is only a type export
// Actual data should be fetched from departmentService.search()
export const DEPARTMENT_OPTIONS = [
  { label: 'Kế toán', value: 'ACCOUNTING' },
  { label: 'Nhân sự', value: 'HR' },
  { label: 'Kỹ thuật', value: 'IT' },
  { label: 'Kinh doanh', value: 'SALES' },
]
