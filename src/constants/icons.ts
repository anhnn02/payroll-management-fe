// Centralized icons management
// Import icons here and export for use across the app

import {
  House,
  User,
  Avatar,
  Money,
  Search,
  Plus,
  Edit,
  Delete,
  ArrowLeft,
  Setting,
  Menu,
  Close,
  OfficeBuilding,
  Refresh,
  View,
} from '@element-plus/icons-vue'

// Re-export all icons
export {
  House,
  User,
  Avatar,
  Money,
  Search,
  Plus,
  Edit,
  Delete,
  ArrowLeft,
  Setting,
  Menu,
  Close,
  OfficeBuilding,
  Refresh,
  View,
}

// Menu icons mapping
export const MENU_ICONS = {
  dashboard: House,
  accounts: User,
  departments: OfficeBuilding,
  employees: Avatar,
  payroll: Money,
} as const
