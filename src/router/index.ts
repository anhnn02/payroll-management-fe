import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { requireAuth, requireGuest } from '@/middleware/auth'

// Lazy load views
const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/dashboard/DashboardView.vue')
const AccountListView = () => import('@/views/accounts/AccountListView.vue')
const AccountFormView = () => import('@/views/accounts/AccountFormView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

// Layout
const AdminLayout = () => import('@/components/layout/AdminLayout.vue')

const routes: RouteRecordRaw[] = [
  // Auth routes (no layout)
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    beforeEnter: requireGuest,
    meta: { title: 'Đăng nhập' },
  },

  // Admin routes (with layout)
  {
    path: '/',
    component: AdminLayout,
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' },
      },
      // Account CRUD
      {
        path: 'accounts',
        name: 'accounts',
        component: AccountListView,
        meta: { title: 'Quản lý tài khoản' },
      },
      {
        path: 'accounts/create',
        name: 'account-create',
        component: AccountFormView,
        meta: { title: 'Thêm tài khoản' },
      },
      {
        path: 'accounts/:id/edit',
        name: 'account-edit',
        component: AccountFormView,
        meta: { title: 'Sửa tài khoản' },
      },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
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
