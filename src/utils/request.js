import axios from 'axios'
// 开发环境：本地Flask地址 | 生产环境：运行npm run build的时候自动替换为线上接口地址
const baseURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8086'  // 开发环境-本地地址
  : 'http://192.168.1.86:8086' // 生产环境-线上地址（替换成你的真实地址）


// 1. 创建axios实例（只做基础配置，不在headers中写死Token）
const instance = axios.create({
  baseURL: baseURL,
  timeout: 100000,
  withCredentials: true
})

// 2. 添加请求拦截器，每次请求前动态注入最新Token
instance.interceptors.request.use(
  async (config) => {
    // 排除登录、注册接口 → 不携带token
    const excludeUrls = ['/user/login', '/user/register']

    // 如果是这两个接口，直接返回，不添加token
    if (excludeUrls.some(url => config.url.includes(url))) {
      return config
    }

    // 其他接口才携带 token
    const useUserStore = (await import('@/stores/user')).default
    const userStore = useUserStore()
    let token = userStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 导出配置完成的axios实例
export default instance
