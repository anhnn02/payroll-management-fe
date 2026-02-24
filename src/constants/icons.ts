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
  Guide,
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
  Guide,
}

// Menu icons mapping
export const MENU_ICONS = {
  dashboard: House,
  accounts: User,
  departments: Guide,
  employees: Avatar,
  payroll: Money,
} as const
