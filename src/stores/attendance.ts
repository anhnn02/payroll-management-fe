import { defineStore } from 'pinia'
import { ref } from 'vue'
import { attendanceService } from '@/services/attendance.service'
import { ElMessage } from 'element-plus'
import type { AttendanceMonthlyRow } from '@/types/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
  // --- State ---
  
  // Default to current month: YYYY-MM
  const today = new Date()
  const currentMonth = ref<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  )

  const isLoading = ref<boolean>(false)
  const isLocked = ref<boolean>(false)
  const employeeCount = ref<number>(0)
  const totalOtHours = ref<number>(0)
  const avgWorkDays = ref<number>(0)
  
  const records = ref<AttendanceMonthlyRow[]>([])

  // --- Actions ---

  function setMonth(month: string) {
    currentMonth.value = month
  }

  async function fetchMonthlyData(keyword?: string, deptId?: string) {
    isLoading.value = true
    try {
      const response = await attendanceService.getMonthly({
        month: currentMonth.value,
        keyword,
        deptId
      })
      
      const data = response.data
      if (data) {
        isLocked.value = data.locked
        employeeCount.value = data.employeeCount
        totalOtHours.value = data.totalOtHours
        avgWorkDays.value = data.avgWorkDays
        records.value = data.rows || []
      }
    } catch (error: unknown) {
      console.error('Failed to fetch monthly attendance:', error)
      ElMessage.error((error as Error).message || 'Lỗi khi tải dữ liệu chấm công')
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    currentMonth,
    isLoading,
    isLocked,
    employeeCount,
    totalOtHours,
    avgWorkDays,
    records,
    
    // Actions
    setMonth,
    fetchMonthlyData
  }
})
