<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-white border-t border-gray-200 h-12 flex items-center justify-center px-6">
    <p class="text-sm text-gray-500">
      © {{ currentYear }} Payroll Management System. All rights reserved.
    </p>
  </footer>
</template>
