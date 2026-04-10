import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'

export const useHouseStore = defineStore('house', () => {
  // 条件查询房屋信息
  async function getHouseList(params) {
    try {
      const res = await api.post('/users/profile', params)
      if (res.data.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 修改单个房屋信息

  return {
    getHouseList,
  }
}, {
  persist: true
})
export default useHouseStore
