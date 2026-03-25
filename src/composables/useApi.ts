import { ElMessage } from 'element-plus'
import type { ApiResponse, ApiError, ApiRequestOptions } from '@/types'
import { ERROR_CODES, getErrorMessage, API_ENDPOINTS } from '@/constants'
import { useAuthStore } from '@/stores/auth'
import { useAuthService } from '@/services/auth.service'
import { useLoadingStore } from './useLoading'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 8000

// Store for tracking pending requests to abort duplicates
const pendingRequests = new Map<string, AbortController>()

// Shared promise for token refresh to handle concurrent 401s
let refreshPromise: Promise<string | null> | null = null

function getRequestKey(method: string, url: string): string {
  return `${method}:${url}`
}

function abortPendingRequest(key: string): void {
  const controller = pendingRequests.get(key)
  if (controller) {
    controller.abort()
    pendingRequests.delete(key)
  }
}

export function useApi() {
  const authStore = useAuthStore()

  /**
   * Handles token refresh and returns the new token
   * Uses a shared promise to prevent multiple refresh calls if multiple requests fail at once
   */
  async function handleTokenRefresh(): Promise<string | null> {
    if (refreshPromise) return refreshPromise

    const authService = useAuthService()
    
    refreshPromise = (async () => {
      try {
        const refreshToken = authStore.refreshToken
        if (!refreshToken) {
          return null
        }

        const response = await authService.refreshToken()
        
        if (response.status === 'success' && response.data.accessToken) {
          authStore.setToken(response.data.accessToken)
          if (response.data.refreshToken) {
            authStore.setRefreshToken(response.data.refreshToken)
          }
          return response.data.accessToken
        }
        
        return null
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  async function request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = DEFAULT_TIMEOUT,
      headers = {},
      showErrorToast = true,
      showLoading = true,
    } = options

    // Global loading
    const loading = useLoadingStore()
    if (showLoading) loading.show()

    const url = `${BASE_URL}${endpoint}`
    const requestKey = getRequestKey(method, url)

    // Abort any pending request with the same key
    abortPendingRequest(requestKey)

    // Create new AbortController for this request
    const controller = new AbortController()
    pendingRequests.set(requestKey, controller)

    // Setup timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Get auth token
      const authStore = useAuthStore()
      const authHeaders: Record<string, string> = {}
      if (authStore.token) {
        authHeaders['Authorization'] = `Bearer ${authStore.token}`
      }

      const isFormData = data instanceof FormData
      const defaultHeaders: Record<string, string> = {
        Accept: 'application/json',
      }
      // Don't set Content-Type for FormData — browser auto-sets multipart/form-data with boundary
      if (!isFormData) {
        defaultHeaders['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        method,
        headers: {
          ...defaultHeaders,
          ...authHeaders,
          ...headers,
        },
        body: data
          ? isFormData
            ? data
            : JSON.stringify(data)
          : undefined,
        signal: options.signal || controller.signal,
      })

      clearTimeout(timeoutId)
      pendingRequests.delete(requestKey)

      // Handle unauthorized or forbidden (token expired)
      if (
        response.status === ERROR_CODES.UNAUTHORIZED ||
        response.status === ERROR_CODES.FORBIDDEN
      ) {
        // If it's already a refresh token request, don't try to refresh again
        if (endpoint === '/api/v1' + API_ENDPOINTS.AUTH.REFRESH || endpoint === API_ENDPOINTS.AUTH.REFRESH) {
          authStore.logout()
          throw {
            status: 'error',
            code: Number(response.status),
            message: getErrorMessage(response.status),
          } as ApiError
        }

        // Attempt to refresh token
        const newToken = await handleTokenRefresh()
        
        if (newToken) {
          // Retry the original request with the new token
          return await request<T>(method, endpoint, data, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`
            }
          })
        }

        // If we reach here, refresh failed or returned null
        authStore.logout()
        const error: ApiError = {
          status: 'error',
          code: Number(response.status),
          message: getErrorMessage(response.status),
        }
        if (showErrorToast) {
          ElMessage.error(error.message)
        }
        throw error
      }

      // Safely parse JSON response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: Record<string, any>
      try {
        result = await response.json()
      } catch {
        result = {}
      }

      // Normalize response
      if (!response.ok) {
        const error: ApiError = {
          status: 'error',
          code: response.status,
          message: result.message || getErrorMessage(response.status),
          errors: result.errors,
        }

        if (showErrorToast) {
          ElMessage.error(error.message)
        }

        throw error
      }

      // Return normalized success response
      return {
        status: 'success',
        code: response.status,
        message: result.message || 'Success',
        data: result.data ?? result,
        meta: result.meta,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      pendingRequests.delete(requestKey)

      // Handle abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        const abortError: ApiError = {
          status: 'error',
          code: 0,
          message: getErrorMessage(ERROR_CODES.ABORTED),
        }
        throw abortError
      }

      // Handle network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError: ApiError = {
          status: 'error',
          code: 0,
          message: getErrorMessage(ERROR_CODES.NETWORK_ERROR),
        }
        if (showErrorToast) {
          ElMessage.error(networkError.message)
        }
        throw networkError
      }

      // Re-throw ApiError
      throw error
    } finally {
      setTimeout(() => {
        if (showLoading) loading.hide()
      }, 300)
    }
  }

  // HTTP methods
  function get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return request<T>('GET', endpoint, undefined, options)
  }

  function post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return request<T>('POST', endpoint, data, options)
  }

  function put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return request<T>('PUT', endpoint, data, options)
  }

  function del<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return request<T>('DELETE', endpoint, undefined, options)
  }

  return {
    get,
    post,
    put,
    del,
    request,
  }
}
