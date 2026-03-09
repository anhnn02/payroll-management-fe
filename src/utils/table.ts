/**
 * Table utility functions - Shared helpers for list views
 *
 * Các hàm dùng chung cho tất cả bảng danh sách (list views)
 */

/**
 * Tính STT (số thứ tự) cho row trong bảng
 * @param currentPage - Trang hiện tại (1-indexed, FE dùng)
 * @param pageSize - Số bản ghi mỗi trang
 * @param index - Index của row trong trang hiện tại (0-indexed)
 * @returns Số thứ tự hiển thị trên UI
 *
 * @example
 * // Trang 1, size 10, row đầu tiên → STT = 1
 * getRowIndex(1, 10, 0) // → 1
 *
 * // Trang 2, size 10, row thứ 3 → STT = 13
 * getRowIndex(2, 10, 2) // → 13
 */
export const getRowIndex = (currentPage: number, pageSize: number, index: number): number => {
  return (currentPage - 1) * pageSize + index + 1
}

/**
 * Format datetime string sang dạng hiển thị cho người dùng Việt Nam
 * @param dateStr - ISO timestamp string (VD: "2026-01-15T08:30:00Z")
 * @returns Chuỗi ngày giờ đã format (VD: "15/01/2026 08:30")
 *
 * @example
 * formatDateTime('2026-01-15T08:30:00Z') // → "15/01/2026 08:30"
 * formatDateTime('')                      // → "-"
 * formatDateTime(undefined)               // → "-"
 */
export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date string sang dạng ngắn (chỉ ngày, không giờ)
 * @param dateStr - ISO date/datetime string
 * @returns Chuỗi ngày đã format (VD: "15/01/2026")
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
