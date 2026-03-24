import { useApi } from '@/composables'
import { API_ENDPOINTS } from '@/constants'
import type { LoginCredentials, AuthResponse, User } from '@/types'

export function useAuthService() {
  const api = useApi()

  async function login(credentials: LoginCredentials) {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)
  }

  async function logout() {
    return api.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
  }

  async function refreshToken() {
    return api.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH)
  }

  async function getMe() {
    return api.get<User>(API_ENDPOINTS.AUTH.ME)
  }

  return {
    login,
    logout,
    refreshToken,
    getMe,
  }
}
