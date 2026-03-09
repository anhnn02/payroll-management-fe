import { ElMessage } from 'element-plus'
import type { ApiResponse, ApiError, ApiRequestOptions } from '@/types'
import { ERROR_CODES, getErrorMessage } from '@/constants'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from './useLoading'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 8000

// Store for tracking pending requests to abort duplicates
const pendingRequests = new Map<string, AbortController>()

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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...authHeaders,
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: options.signal || controller.signal,
      })

      clearTimeout(timeoutId)
      pendingRequests.delete(requestKey)

      const result = await response.json()

      // Normalize response
      if (!response.ok) {
        const error: ApiError = {
          status: 'error',
          code: response.status,
          message: result.message || getErrorMessage(response.status),
          errors: result.errors,
        }

        // Handle unauthorized - logout
        if (response.status === ERROR_CODES.UNAUTHORIZED) {
          authStore.logout()
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
