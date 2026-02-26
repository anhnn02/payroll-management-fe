import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// import { requireAuth, requireGuest } from '@/middleware/auth'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'
import { useLoadingStore } from '@/composables/useLoading'

// Lazy load views
const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/dashboard/DashboardView.vue')
const AccountListView = () => import('@/views/accounts/AccountListView.vue')
const AccountFormView = () => import('@/views/accounts/AccountFormView.vue')
const DepartmentListView = () => import('@/views/departments/DepartmentListView.vue')
const DepartmentFormView = () => import('@/views/departments/DepartmentFormView.vue')
const PositionListView = () => import('@/views/positions/PositionListView.vue')
const PositionFormView = () => import('@/views/positions/PositionFormView.vue')
const EmployeeListView = () => import('@/views/employees/EmployeeListView.vue')
const EmployeeFormView = () => import('@/views/employees/EmployeeFormView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

// Layout
const AdminLayout = () => import('@/components/layout/AdminLayout.vue')

const routes: RouteRecordRaw[] = [
  // #region Auth routes (no layout)
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: LoginView,
    // beforeEnter: requireGuest,
    meta: { title: 'Đăng nhập' },
  },

  // #region Admin routes (with layout)
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
      // #region Account
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
        meta: { title: 'Cập nhật tài khoản' },
      },
      // #region Department
      {
        path: 'departments',
        name: ROUTE_NAMES.DEPARTMENTS,
        component: DepartmentListView,
        meta: { title: 'Quản lý phòng ban' },
      },
      {
        path: 'departments/create',
        name: ROUTE_NAMES.DEPARTMENT_CREATE,
        component: DepartmentFormView,
        meta: { title: 'Thêm phòng ban' },
      },
      {
        path: 'departments/:id',
        name: ROUTE_NAMES.DEPARTMENT_DETAIL,
        component: DepartmentFormView,
        meta: { title: 'Chi tiết phòng ban' },
      },
      {
        path: 'departments/:id/edit',
        name: ROUTE_NAMES.DEPARTMENT_EDIT,
        component: DepartmentFormView,
        meta: { title: 'Cập nhật phòng ban' },
      },
      // #region Position
      {
        path: 'positions',
        name: ROUTE_NAMES.POSITIONS,
        component: PositionListView,
        meta: { title: 'Quản lý vị trí' },
      },
      {
        path: 'positions/create',
        name: ROUTE_NAMES.POSITION_CREATE,
        component: PositionFormView,
        meta: { title: 'Thêm vị trí' },
      },
      {
        path: 'positions/:id',
        name: ROUTE_NAMES.POSITION_DETAIL,
        component: PositionFormView,
        meta: { title: 'Chi tiết vị trí' },
      },
      {
        path: 'positions/:id/edit',
        name: ROUTE_NAMES.POSITION_EDIT,
        component: PositionFormView,
        meta: { title: 'Cập nhật vị trí' },
      },
      // #region Employee
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
        path: 'employees/:id',
        name: ROUTE_NAMES.EMPLOYEE_DETAIL,
        component: EmployeeFormView,
        meta: { title: 'Chi tiết nhân viên' },
      },
      {
        path: 'employees/:id/edit',
        name: ROUTE_NAMES.EMPLOYEE_EDIT,
        component: EmployeeFormView,
        meta: { title: 'Cập nhật nhân viên' },
      },
    ],
  },

  // #region 404
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

// Reset loading on navigation (safety net)
router.beforeEach(() => {
  const loading = useLoadingStore()
  loading.reset()
})

// Update page title
router.afterEach(to => {
  const title = to.meta.title as string
  document.title = title ? `${title} | Payroll Management` : 'Payroll Management'
})

export default router
