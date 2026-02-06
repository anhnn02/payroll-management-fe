export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  THEME: 'app_theme',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
