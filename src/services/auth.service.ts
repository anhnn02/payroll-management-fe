import { useApi } from '@/composables'
import { API_ENDPOINTS } from '@/constants'
import type { LoginCredentials, AuthResponse, UserInfoResponse } from '@/types'
import { useAuthStore } from '@/stores/auth'

export function useAuthService() {
  const api = useApi()

  async function login(credentials: LoginCredentials) {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
  }

  async function logout() {
    return api.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
  }

  async function refreshToken() {
    const authStore = useAuthStore()
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken: authStore.refreshToken,
    })
  }

  async function getMe() {
    return api.get<UserInfoResponse>(API_ENDPOINTS.AUTH.ME)
  }

  return {
    login,
    logout,
    refreshToken,
    getMe,
  }
}
