import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus' // 如果需要登录后跳转

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const token = ref('')
  const userInfo = ref({})

  // --- Actions ---

  /**
   * 用户登录
   * @param {Object} loginForm { username, password, role }
   */
  async function login(loginForm) {

    const res = await api.post('/auth/login', loginForm)
    if (res.code === 200) {
      token.value = res.data.token
      userInfo.value = res.data.user
      return res
    } else {
      return null
    }

  }

  /**
   * 用户注册
   * @param {Object} registerForm { username, password, phone, ... }
   */
  async function register(registerForm) {
    try {
      const res = await api.post('/auth/auth/register', registerForm)
      ElNotification.success({
        title: '注册成功',
        message: '注册成功~'
      })
      return true
    } catch (error) {
      throw error.response?.data || error
    }
  }

  /**
   * 获取当前用户个人信息
   */
  async function fetchProfile() {
    if (!token.value) return
    try {
      const res = await api.get('/users/profile')
      if (res.code === 200 || res.message === '获取成功') {
        userInfo.value = res.data
        return res.data
      }
    } catch (error) {
      console.error('Fetch profile failed:', error)
      throw error
    }
  }

  /**
   * 修改个人资料
   * @param {Object} updateData
   */
  async function updateProfile(updateData) {
    try {
      const res = await api.put('/users/profile', updateData)
      if (res.data.code === 200 || res.data.message === '修改成功') {
        userInfo.value = res.data.data // 更新本地状态
        return res.data
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  /**
   * 上传头像
   * @param {File} file
   */
  async function uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.code === 200 || res.message === '上传成功') {
        // 上传成功后通常重新获取一次用户信息以更新头像 URL
        await fetchProfile()
        return true
      } else {
        throw new Error(res.message || '上传失败')
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }



  return {
    login,
    userInfo,
    token
  }
}, {
  persist: true
})
export default useUserStore
