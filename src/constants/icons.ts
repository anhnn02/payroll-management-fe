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
} from '@element-plus/icons-vue'

// Re-export all icons
export { House, User, Avatar, Money, Search, Plus, Edit, Delete, ArrowLeft, Setting, Menu, Close }

// Menu icons mapping
export const MENU_ICONS = {
  dashboard: House,
  accounts: User,
  employees: Avatar,
  payroll: Money,
} as const
