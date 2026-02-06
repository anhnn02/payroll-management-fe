<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import Sidebar from './Sidebar.vue'
</script>

<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <AppHeader />

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>
  </div>
</template>
