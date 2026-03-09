/**
 * Format date string (YYYY-MM-DD) to DD/MM/YYYY
 * Returns "Không thời hạn" if dateStr is null/undefined
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Không thời hạn'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Contract type → Tailwind color class
 */
export const getContractTypeClass = (type: string): string => {
  const map: Record<string, string> = {
    OFFICIAL: 'text-green-600 font-medium',
    PROBATION: 'text-orange-500 font-medium',
    SEASONAL: 'text-blue-500 font-medium',
  }
  return map[type] || 'text-gray-500'
}
