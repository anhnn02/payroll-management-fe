<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="text-xl font-bold text-gray-900">Payroll Management</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <slot>
        <RouterView />
      </slot>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-auto">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">© 2026 Payroll Management System</p>
      </div>
    </footer>
  </div>
</template>
