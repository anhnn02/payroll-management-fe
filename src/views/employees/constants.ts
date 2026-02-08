// Employee constants

import type { EmployeeStatus } from './types'

export const EMPLOYEE_STATUS_OPTIONS: { label: string; value: EmployeeStatus }[] = [
  { label: 'Đang làm việc', value: 'ACTIVE' },
  { label: 'Nghỉ việc', value: 'INACTIVE' },
  { label: 'Nghỉ phép', value: 'ON_LEAVE' },
]

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Đang làm việc',
  INACTIVE: 'Nghỉ việc',
  ON_LEAVE: 'Nghỉ phép',
}

import { COLORS } from '@/constants/colors'

export const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, string> = {
  ACTIVE: COLORS.SUCCESS,
  INACTIVE: COLORS.DANGER,
  ON_LEAVE: COLORS.WARNING,
}

export const DEPARTMENT_OPTIONS = [
  { label: 'Kế toán', value: 'ACCOUNTING' },
  { label: 'Nhân sự', value: 'HR' },
  { label: 'Kỹ thuật', value: 'IT' },
  { label: 'Kinh doanh', value: 'SALES' },
]
