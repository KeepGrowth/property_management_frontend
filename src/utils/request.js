import axios from 'axios'
import useUserStore from '@/stores/user.js'
import { ElMessage, ElNotification } from 'element-plus'
// 开发环境：本地Flask地址 | 生产环境：运行npm run build的时候自动替换为线上接口地址
// const baseURL = process.env.NODE_ENV === 'development'
//   ? 'https://859707243.xyz:21351'  // 开发环境-本地地址
//   : 'https://859707243.xyz:21351' // 生产环境-线上地址（替换成你的真实地址）
const baseURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8888'  // 开发环境-本地地址
  : 'http://localhost:8888' // 生产环境-线上地址（替换成你的真实地址）


// 1. 创建axios实例（只做基础配置，不在headers中写死Token）
const instance = axios.create({
  baseURL: baseURL,
  timeout: 0,
  withCredentials: true
})

// 2. 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 1. 更精确的排除逻辑 (使用正则或完整路径匹配)
    const noNeedTokenUrls = ['/auth/login', '/auth/register']
    const isNoNeedToken = noNeedTokenUrls.some(url => config.url.endsWith(url))

    if (isNoNeedToken) {
      return config
    }

    // 2. 获取 Token
    const userStore = useUserStore()
    const token = userStore.token

    if (token) {
      // 确保 headers 存在
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 3. 强烈建议添加响应拦截器 (处理 401 过期)
instance.interceptors.response.use(
  (response) => {
    if (response.data.code === 200) {
      return response.data
    } else if (response.data.code === 401) {
      ElNotification.error({
        noticeTitle: '凭证过期',
        message: '用户凭证过期，请重新登录。'
      })
    }

  }
)

// 导出配置完成的axios实例
export default instance
