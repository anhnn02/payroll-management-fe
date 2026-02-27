/**
 * Format date string (YYYY-MM-DD) to DD/MM/YYYY
 * Returns "Không thời hạn" if dateStr is null/undefined
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Không thời hạn'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
