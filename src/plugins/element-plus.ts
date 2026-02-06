import type { App } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import vi from 'element-plus/es/locale/lang/vi'

export function setupElementPlus(app: App) {
  app.use(ElementPlus, {
    locale: vi,
  })
}
