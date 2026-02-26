<script setup lang="ts">
import { type Component } from 'vue'

export interface BreadcrumbItem {
  label: string
  to?: { name: string } | string
}

defineProps<{
  items: BreadcrumbItem[]
  icon?: Component
}>()
</script>

<template>
  <el-breadcrumb separator="/" class="h-8 flex items-center">
    <component :is="icon" v-if="icon" class="w-5 h-5 mr-2" />
    <el-breadcrumb-item v-for="(item, index) in items" :key="index" :to="item.to">
      {{ item.label }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
