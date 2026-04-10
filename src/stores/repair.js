import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import cleanObject from '@/utils/common.js'

export const useRepairStore = defineStore('repair', () => {
  // 查询某用户的账单列表
  async function getRepairList() {
    try {
      const res = await api.get('/repair-order/list')
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }



  return {
    getRepairList,
  }
}, {
  persist: true
})
export default useRepairStore
