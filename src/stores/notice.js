import { defineStore } from 'pinia'
import api from '@/utils/request.js'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import cleanObject from '@/utils/common.js'

export const useNoticeStore = defineStore('notice', () => {
  // 条件查询用户公告列表
  async function getUserNoticeList(queryParams) {
    try {
      const cleanParams = cleanObject(queryParams)
      const res = await api.get('/notice/list', { params: cleanParams })
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 条件查询所有公告列表
  async function getNoticeList(queryParams) {
    try {
      const cleanParams = cleanObject(queryParams)
      const res = await api.get('/notice/list', {
        params: cleanParams
      })
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }


  // 启用或禁用公告
  async function changeNoticeStatus(noticeId, status) {
    try {
      const res = await api.put('/notice', {
        id: noticeId,
        status: status
      })
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 编辑公告
  async function updateNotice(noticeForm) {
    try {
      const cleanParams = cleanObject(noticeForm)
      const res = await api.put('/notice', cleanParams)
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  // 新增公告
  async function addNotice(noticeForm) {
    try {
      const cleanParams = cleanObject(noticeForm)
      const res = await api.post('/notice', cleanParams)
      if (res.code === 200) {
        return res
      }
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return {
    getUserNoticeList,
    getNoticeList,
    changeNoticeStatus,
    updateNotice,
    addNotice
  }
}, {
  persist: true
})
export default useNoticeStore
