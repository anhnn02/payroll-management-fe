// Account constants - using common enums from @/constants/enums

import { UserStatus, UserRoleLabel, UserStatusLabel, enumToOptions } from '@/constants/enums'

// Re-export for backward compatibility
export type { UserRole as AccountRole, UserStatus as AccountStatus } from '@/constants/enums'

// Role options (from common enum)
export const ACCOUNT_ROLE_OPTIONS = enumToOptions(UserRoleLabel)

// Status options (from common enum)
export const ACCOUNT_STATUS_OPTIONS = enumToOptions(UserStatusLabel)

// Role labels (from common enum)
export const ACCOUNT_ROLE_LABELS = UserRoleLabel

// Status labels (from common enum)
export const ACCOUNT_STATUS_LABELS = UserStatusLabel

// Status colors for badge
export const ACCOUNT_STATUS_COLORS: Record<UserStatus, 'success' | 'danger' | 'warning'> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.INACTIVE]: 'danger',
  [UserStatus.LOCKED]: 'warning',
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
