<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useAuthService } from '@/services/auth.service'
import { ElMessage } from 'element-plus'
import { ASSETS } from '@/constants'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const authService = useAuthService()

const isLoading = ref(false)
const form = ref({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('Vui lòng nhập tên đăng nhập và mật khẩu')
    return
  }

  isLoading.value = true

  try {
    const response = await authService.login(form.value)
    const data = response.data

    // Lưu token theo BE response format
    authStore.setToken(data.accessToken)
    authStore.setRefreshToken(data.refreshToken)

    // Gọi API /auth/me ngay sau khi login thành công để lấy profile đầy đủ
    try {
      const userProfile = await authService.getMe()
      authStore.setUser({
        username: userProfile.data.username,
        roles: userProfile.data.roles,
      })
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    }

    ElMessage.success('Đăng nhập thành công!')

    // Redirect to intended page or dashboard
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch {
    // Error already handled by useApi interceptor
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div class="flex flex-col items-center mb-6">
        <img :src="ASSETS.LOGO" alt="Logo" class="w-20 h-20 mb-4" />
        <h1 class="text-2xl font-bold text-center text-gray-800">Đăng nhập</h1>
      </div>

      <el-form :model="form" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="Tên đăng nhập">
          <el-input v-model="form.username" placeholder="Nhập tên đăng nhập" size="large" />
        </el-form-item>

        <el-form-item label="Mật khẩu">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Nhập mật khẩu"
            size="large"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          native-type="submit"
          class="w-full"
          size="large"
          :loading="isLoading"
        >
          Đăng nhập
        </el-button>
      </el-form>
    </div>
  </div>
</template>
