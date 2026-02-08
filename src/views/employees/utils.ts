import type { EmployeeStatus } from './types'
import { EMPLOYEE_STATUS_COLORS } from './constants'

export const getStatusColor = (status: EmployeeStatus): string => {
  return EMPLOYEE_STATUS_COLORS[status] || ''
}
