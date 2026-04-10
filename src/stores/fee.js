import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import cleanObject from '@/utils/common.js'

export const useFeeStore = defineStore('fee', () => {
  // 条件查询查询某用户的账单列表
  async function getUserFeeList(params) {
    try {
      const clean_params = cleanObject(params)
      const res = await api.get('/fee-bill/list', { params: clean_params })

      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 条件查询所有的账单列表
  async function queryAllFeeList(params) {
    try {
      const clean_params = cleanObject(params)
      const res = await api.get('/fee-bill/list', { params: clean_params })

      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }


  // 支付对应id的账单
  async function payFee(feeId) {
    try {
      const res = await api.put('/fee-bill', {
        id: feeId,
        billStatus:2
      })
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return {
    getUserFeeList,
    payFee,
    queryAllFeeList
  }
}, {
  persist: true
})
export default useFeeStore
