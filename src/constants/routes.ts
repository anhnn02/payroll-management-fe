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

  // Departments
  DEPARTMENTS: 'departments',
  DEPARTMENT_CREATE: 'department-create',
  DEPARTMENT_DETAIL: 'department-detail',
  DEPARTMENT_EDIT: 'department-edit',

  // Positions
  POSITIONS: 'positions',
  POSITION_CREATE: 'position-create',
  POSITION_DETAIL: 'position-detail',
  POSITION_EDIT: 'position-edit',

  // Employees
  EMPLOYEES: 'employees',
  EMPLOYEE_CREATE: 'employee-create',
  EMPLOYEE_DETAIL: 'employee-detail',
  EMPLOYEE_EDIT: 'employee-edit',

  // Contracts
  CONTRACTS: 'contracts',
  CONTRACT_CREATE: 'contract-create',
  CONTRACT_DETAIL: 'contract-detail',
  CONTRACT_EDIT: 'contract-edit',

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

  // Departments
  DEPARTMENTS: '/departments',
  DEPARTMENT_CREATE: '/departments/create',
  DEPARTMENT_DETAIL: '/departments/:id',
  DEPARTMENT_EDIT: '/departments/:id/edit',

  // Positions
  POSITIONS: '/positions',
  POSITION_CREATE: '/positions/create',
  POSITION_DETAIL: '/positions/:id',
  POSITION_EDIT: '/positions/:id/edit',

  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEE_CREATE: '/employees/create',
  EMPLOYEE_DETAIL: '/employees/:id',
  EMPLOYEE_EDIT: '/employees/:id/edit',

  // Contracts
  CONTRACTS: '/contracts',
  CONTRACT_CREATE: '/contracts/create',
  CONTRACT_DETAIL: '/contracts/:id',
  CONTRACT_EDIT: '/contracts/:id/edit',

  // Payroll
  PAYROLL: '/payroll',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]
