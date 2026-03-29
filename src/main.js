import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(createPinia().use(piniaPluginPersistedstate))// ✅ 注册持久化Pinia插件

app.mount('#app')
