// Route constants - centralized route management

export const ROUTE_NAMES = {
  // Auth
  LOGIN: 'login',

  // Dashboard
  DASHBOARD: 'dashboard',

  // Accounts
  ACCOUNTS: 'accounts',
  ACCOUNT_CREATE: 'account-create',
  ACCOUNT_EDIT: 'account-edit',

  // Employees
  EMPLOYEES: 'employees',
  EMPLOYEE_CREATE: 'employee-create',
  EMPLOYEE_EDIT: 'employee-edit',

  // Payroll
  PAYROLL: 'payroll',

  // Errors
  NOT_FOUND: 'not-found',
} as const

export const ROUTE_PATHS = {
  // Auth
  LOGIN: '/login',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Accounts
  ACCOUNTS: '/accounts',
  ACCOUNT_CREATE: '/accounts/create',
  ACCOUNT_EDIT: '/accounts/:id/edit',

  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEE_CREATE: '/employees/create',
  EMPLOYEE_EDIT: '/employees/:id/edit',

  // Payroll
  PAYROLL: '/payroll',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]
