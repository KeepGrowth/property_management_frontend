import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import cleanObject from '@/utils/common.js'

export const useHouseStore = defineStore('house', () => {
  // 条件查询房屋信息
  async function getHouseList(params) {
    try {
      const cleanParams = cleanObject(params)
      const res = await api.get('/house-info/list', { params: cleanParams })
      return res
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 删除房屋
  async function deleteHouse(houseId) {
    try {
      const res = await api.delete(`/house-info/${houseId}`)
      return res
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 新增房屋
  async function addHouse(houseForm) {
    try {
      const cleanParams = cleanObject(houseForm)
      const res = await api.post(`/house-info`, cleanParams)
      return res
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 修改单个房屋信息
  async function updateHouse(houseForm) {
    try {
      const cleanParams = cleanObject(houseForm)
      const res = await api.put(`/house-info`, cleanParams)
      return res
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return {
    getHouseList,
    deleteHouse,
    addHouse,
    updateHouse
  }
}, {
  persist: true
})
export default useHouseStore
