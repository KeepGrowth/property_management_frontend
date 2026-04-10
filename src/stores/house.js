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
      const res = await api.get('/house-info/list', { params:cleanParams })
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 删除房屋
  async function deleteHouse(houseId){
    try {
      const res = await api.delete(`/house-info/${houseId}` )
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 修改单个房屋信息

  return {
    getHouseList,
    deleteHouse
  }
}, {
  persist: true
})
export default useHouseStore
