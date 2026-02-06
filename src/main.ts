import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupElementPlus } from './plugins'
import { useAuthStore } from './stores'

// Styles
import './assets/main.css'

const app = createApp(App)

// Setup Pinia
const pinia = createPinia()
app.use(pinia)

// Initialize auth from storage (must be after pinia is installed)
const authStore = useAuthStore()
authStore.initFromStorage()

// Setup plugins
setupElementPlus(app)

// Setup router
app.use(router)

// Mount app
app.mount('#app')
