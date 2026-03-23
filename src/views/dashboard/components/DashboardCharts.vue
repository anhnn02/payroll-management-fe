<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type {
  TrendChartData,
  DeptPieChartData,
  DeptOTBarChartData,
} from '@/services/dashboard.service'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
])

const props = defineProps<{
  trendChart?: TrendChartData[]
  deptPieChart?: DeptPieChartData[]
  deptOTBarChart?: DeptOTBarChartData[]
  currentMonth?: string
}>()

const router = useRouter()

const trendOption = computed(() => {
  return {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: props.trendChart?.map(d => d.monthYear) || [],
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: props.trendChart?.map(d => d.totalFund) || [],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#eff6ff' },
            ],
          },
        },
        itemStyle: { color: '#3b82f6' },
      },
    ],
  }
})

const pieOption = computed(() => {
  if (!props.deptPieChart || props.deptPieChart.length === 0) return null
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        data: props.deptPieChart.map(d => ({
          value: d.totalFund,
          name: d.deptName,
          deptId: d.deptId,
        })),
      },
    ],
  }
})

const barOption = computed(() => {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: props.deptOTBarChart?.map(d => d.deptName) || [],
      axisLabel: { interval: 0, rotate: 30 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: props.deptOTBarChart?.map(d => d.totalOTHours) || [],
        itemStyle: { color: '#f97316' },
        barWidth: '40%',
      },
    ],
  }
})

const handlePieClick = (params: any) => {
  if (params.data && params.data.deptId && props.currentMonth) {
    router.push(`/reports/payroll?dept=${params.data.deptId}&month=${props.currentMonth}`)
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    <el-card shadow="never">
      <template #header><div class="font-semibold text-gray-700">Xu Hướng Quỹ Lương</div></template>
      <div class="h-[300px]">
        <v-chart
          v-if="trendChart && trendChart.length > 0"
          class="w-full h-full"
          :option="trendOption"
          autoresize
        />
        <div v-else class="flex h-full items-center justify-center text-gray-400">
          Không có dữ liệu
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header
        ><div class="font-semibold text-gray-700">Phân Bổ Lương Theo Phòng Ban</div></template
      >
      <div class="h-[300px]">
        <v-chart
          v-if="pieOption"
          class="w-full h-full"
          :option="pieOption"
          @click="handlePieClick"
          autoresize
        />
        <div v-else class="flex h-full items-center justify-center text-gray-400">
          Không có dữ liệu (Chưa tính lương)
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="lg:col-span-2">
      <template #header
        ><div class="font-semibold text-gray-700">Giờ OT Theo Phòng Ban</div></template
      >
      <div class="h-[300px]">
        <v-chart
          v-if="deptOTBarChart && deptOTBarChart.length > 0"
          class="w-full h-full"
          :option="barOption"
          autoresize
        />
        <div v-else class="flex h-full items-center justify-center text-gray-400">
          Không có dữ liệu OT
        </div>
      </div>
    </el-card>
  </div>
</template>
