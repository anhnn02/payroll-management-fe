<script setup lang="ts">
// 404 Not Found Page
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center">
    <h1 class="text-6xl font-bold text-gray-300">404</h1>
    <p class="text-xl text-gray-600 mt-4">Không tìm thấy trang</p>
    <router-link
      to="/"
      class="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      ← Về trang chủ
    </router-link>
  </div>
</template>
