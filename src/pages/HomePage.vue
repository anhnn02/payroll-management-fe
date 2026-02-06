<script setup lang="ts">
// Home page component - Demo Tailwind CSS v4
</script>

<template>
  <div class="space-y-8">
    <!-- Demo Tailwind CSS: Custom colors từ tailwind.config.js -->
    <div class="bg-green-500 p-8 rounded-lg shadow-lg">
      <h1 class="text-red-500 text-4xl font-bold text-center">🎉 Tailwind CSS hoạt động!</h1>
      <p class="text-white text-center mt-4">Text đỏ trên nền xanh lá - Demo Tailwind CSS</p>
    </div>
    <div class="bg-primary text-white">Primary</div>
    <div class="bg-secondary text-white">Secondary</div>
    <div class="bg-accent text-white">Accent</div>
    <div class="text-primary">Text primary color</div>

    <!-- Demo Custom Colors -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">
        🎨 Custom Colors (tailwind.config.js)
      </h2>
      <div class="flex flex-wrap gap-4">
        <div class="bg-primary text-white px-6 py-3 rounded-lg font-semibold">
          bg-primary (#1976D2)
        </div>
        <div class="bg-secondary text-white px-6 py-3 rounded-lg font-semibold">
          bg-secondary (#424242)
        </div>
        <div class="bg-accent text-white px-6 py-3 rounded-lg font-semibold">
          bg-accent (#FF9800)
        </div>
      </div>
    </div>

    <!-- Project Info -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">📦 Vue.js Base Project</h2>
      <ul class="space-y-2 text-gray-600">
        <li>✅ <strong>Vite</strong> - Build tool</li>
        <li>✅ <strong>Vue 3</strong> + TypeScript</li>
        <li>✅ <strong>Tailwind CSS</strong> - với custom colors</li>
        <li>✅ <strong>Element Plus</strong> - UI Components</li>
        <li>✅ <strong>Pinia</strong> - State Management</li>
        <li>✅ <strong>Vue Router</strong> - Routing</li>
      </ul>
    </div>

    <!-- Element Plus Demo -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">🧩 Element Plus Components</h2>
      <div class="flex flex-wrap gap-4">
        <el-button type="primary">Primary Button</el-button>
        <el-button type="success">Success Button</el-button>
        <el-button type="warning">Warning Button</el-button>
        <el-button type="danger">Danger Button</el-button>
      </div>
    </div>
  </div>
</template>
