// Constants for account module

import type { AccountRole, AccountStatus } from './types'

// Role options for select dropdown
export const ACCOUNT_ROLE_OPTIONS: { label: string; value: AccountRole }[] = [
  { label: 'Kế toán', value: 'ACCOUNTANT' },
  { label: 'Nhân sự', value: 'HR' },
]

// Status options for select dropdown
export const ACCOUNT_STATUS_OPTIONS: { label: string; value: AccountStatus }[] = [
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Ngừng hoạt động', value: 'INACTIVE' },
]

// Role labels for display
export const ACCOUNT_ROLE_LABELS: Record<AccountRole, string> = {
  ACCOUNTANT: 'Kế toán',
  HR: 'Nhân sự',
}

// Status labels for display
export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
}

// Status colors for badge
export const ACCOUNT_STATUS_COLORS: Record<AccountStatus, 'success' | 'danger'> = {
  ACTIVE: 'success',
  INACTIVE: 'danger',
}

// Table columns configuration
export const ACCOUNT_TABLE_COLUMNS = [
  { prop: 'username', label: 'Tên đăng nhập', minWidth: 120 },
  { prop: 'fullName', label: 'Họ và tên', minWidth: 150 },
  { prop: 'email', label: 'Email', minWidth: 180 },
  { prop: 'role', label: 'Vai trò', width: 120 },
  { prop: 'status', label: 'Trạng thái', width: 130 },
  { prop: 'actions', label: 'Thao tác', width: 150, fixed: 'right' },
] as const
