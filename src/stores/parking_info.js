import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import cleanObject from '@/utils/common.js'

export const useParkingInfoStore = defineStore('parkingInfo', () => {
  // 条件查询查询某用户的账单列表
  async function getUserParkingInfoList(params) {
    try {
      const clean_params = cleanObject(params)
      const res = await api.get('/parking-info/list', { params: clean_params })

      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 条件查询所有的账单列表
  async function queryAllParkingInfoList(params) {
    try {
      const clean_params = cleanObject(params)
      const res = await api.get('/parking-info/list', { params: clean_params })

      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }


  // 删除车位
  async function delParking(parkingId) {
    const res = await api.delete(`/parking-info/${parkingId}`)
    return res
  }

  // 新增车位分配
  async function addParking(parkingForm) {
    const cleanParams = cleanObject(parkingForm)
    const res = await api.post('/parking-info', cleanParams)
    return res
  }

  // 更改车位分配信息
  async function updateParking(parkingForm) {
    const cleanParams = cleanObject(parkingForm)
    const res = await api.put('/parking-info', cleanParams)
    return res
  }


  return {
    getUserParkingInfoList,
    queryAllParkingInfoList,
    delParking,
    addParking,
    updateParking
  }
}, {
  persist: true
})
export default useParkingInfoStore
