import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import cleanObject from '@/utils/common.js'

export const useRepairStore = defineStore('repair', () => {
  // 条件查询某用户的报修列表
  async function getUserRepairList() {
    try {
      const res = await api.get('/repair-order/list')
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 条件查询所有报修列表
  async function queryRepairList(params) {
    try {
      const cleanParams = cleanObject(params)
      const res = await api.get('/repair-order/list', {
        params: cleanParams
      })
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 更改报修单的状态
  async function changeRepairStatus(repairId,status) {
    try {
      const res = await api.put('/repair-order', {
        id:repairId,
        repairStatus:status
      })
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }


  return {
    getUserRepairList,
    queryRepairList,
    changeRepairStatus
  }
}, {
  persist: true
})
export default useRepairStore
