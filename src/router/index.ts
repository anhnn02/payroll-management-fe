import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// import { requireAuth, requireGuest } from '@/middleware/auth'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

// Lazy load views
const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/dashboard/DashboardView.vue')
const AccountListView = () => import('@/views/accounts/AccountListView.vue')
const AccountFormView = () => import('@/views/accounts/AccountFormView.vue')
const EmployeeListView = () => import('@/views/employees/EmployeeListView.vue')
const EmployeeFormView = () => import('@/views/employees/EmployeeFormView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

// Layout
const AdminLayout = () => import('@/components/layout/AdminLayout.vue')

const routes: RouteRecordRaw[] = [
  // Auth routes (no layout)
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: LoginView,
    // beforeEnter: requireGuest,
    meta: { title: 'Đăng nhập' },
  },

  // Admin routes (with layout)
  {
    path: '/',
    component: AdminLayout,
    // beforeEnter: requireAuth,
    children: [
      {
        path: '',
        redirect: ROUTE_PATHS.DASHBOARD,
      },
      {
        path: 'dashboard',
        name: ROUTE_NAMES.DASHBOARD,
        component: DashboardView,
        meta: { title: 'Dashboard' },
      },
      // Account CRUD
      {
        path: 'accounts',
        name: ROUTE_NAMES.ACCOUNTS,
        component: AccountListView,
        meta: { title: 'Quản lý tài khoản' },
      },
      {
        path: 'accounts/create',
        name: ROUTE_NAMES.ACCOUNT_CREATE,
        component: AccountFormView,
        meta: { title: 'Thêm tài khoản' },
      },
      {
        path: 'accounts/:id/edit',
        name: ROUTE_NAMES.ACCOUNT_EDIT,
        component: AccountFormView,
        meta: { title: 'Sửa tài khoản' },
      },
      // Employee CRUD
      {
        path: 'employees',
        name: ROUTE_NAMES.EMPLOYEES,
        component: EmployeeListView,
        meta: { title: 'Quản lý nhân viên' },
      },
      {
        path: 'employees/create',
        name: ROUTE_NAMES.EMPLOYEE_CREATE,
        component: EmployeeFormView,
        meta: { title: 'Thêm nhân viên' },
      },
      {
        path: 'employees/:id/edit',
        name: ROUTE_NAMES.EMPLOYEE_EDIT,
        component: EmployeeFormView,
        meta: { title: 'Sửa nhân viên' },
      },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.NOT_FOUND,
    component: NotFoundView,
    meta: { title: 'Không tìm thấy trang' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Update page title
router.afterEach(to => {
  const title = to.meta.title as string
  document.title = title ? `${title} | Payroll Management` : 'Payroll Management'
})

export default router
