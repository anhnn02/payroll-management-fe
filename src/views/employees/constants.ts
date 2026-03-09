// Employee constants - using common enums from @/constants/enums

import { EmployeeStatus, EmployeeStatusLabel, GenderLabel, enumToOptions } from '@/constants/enums'

// Re-export for backward compatibility
export type { EmployeeStatus } from '@/constants/enums'

// Status options (from common enum)
export const EMPLOYEE_STATUS_OPTIONS = enumToOptions(EmployeeStatusLabel)

// Status labels (from common enum)
export const EMPLOYEE_STATUS_LABELS = EmployeeStatusLabel

// Status tag type (Element Plus tag types)
type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'

export const EMPLOYEE_STATUS_TAG_TYPE: Record<EmployeeStatus, TagType> = {
  [EmployeeStatus.ACTIVE]: 'success',
  [EmployeeStatus.INACTIVE]: 'danger',
}

// Gender options (from common enum)
export const GENDER_OPTIONS = enumToOptions(GenderLabel)

// Gender labels
export const GENDER_LABELS = GenderLabel
