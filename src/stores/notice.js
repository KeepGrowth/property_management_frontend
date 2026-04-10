import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import cleanObject from '@/utils/common.js'

export const useNoticeStore = defineStore('notice', () => {
  // 查询某用户的账单列表
  async function getNoticeList() {
    try {
      const res = await api.get('/notice/list', )
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }



  return {
    getNoticeList,
  }
}, {
  persist: true
})
export default useNoticeStore
