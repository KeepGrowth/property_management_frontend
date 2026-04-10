<script setup>
import { ref, onMounted } from 'vue'
import { Search, Document, Clock, User } from '@element-plus/icons-vue'
import useUserStore from '@/stores/user.js'
import { ElMessage } from 'element-plus'
import useNoticeStore from '@/stores/notice.js'

const userStore = useUserStore()
const loading = ref(false)
const noticeList = ref([])

// 模拟数据类型映射（对应数据库的 notice_type）
const typeMap = {
  '1': { label: '物业通知', color: 'text-blue-500' },
  '2': { label: '紧急停水停电', color: 'text-red-500' },
  '3': { label: '社区活动', color: 'text-green-500' },
  '4': { label: '节日问候', color: 'text-purple-500' }
}
const noticeStore = useNoticeStore()
// 获取公告列表
const fetchNotices = async () => {
  loading.value = true
  try {
    // API
    const res = await noticeStore.getNoticeList()
    console.log(res)
    noticeList.value = res.data
    // noticeList.value =  mockData
  } catch (error) {
    ElMessage.error('加载公告失败'+error)
  } finally {
    loading.value = false
  }
}

// 模拟数据（开发调试用）
const mockData = [
  {
    id: 1,
    noticeTitle: '关于本周六进行电梯维护的通知',
    noticeContent: '尊敬的业主：为了保障电梯安全运行，物业将于本周六上午8:00-12:00对1-5栋电梯进行例行维护...',
    noticeType: 2,
    publish_time: '2024-04-20 09:00',
    isRead: false
  },
  {
    id: 2,
    title: '五月物业费缴纳提醒',
    content: '您好，本月的物业管理费账单已生成，请登录系统查看账单详情并及时缴纳，感谢您的配合。',
    type: 1,
    publisher: '物业财务',
    isRead: true
  }
]

// 阅读状态切换
const markAsRead = (id) => {
  const item = noticeList.value.find(n => n.id === id)
  if (item) item.isRead = true
}

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <!-- 页面头部 -->
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">🏘️ 小区公告</h1>
      <p class="text-sm text-gray-500">查看最新的物业通知与社区动态</p>
    </div>

    <!-- 搜索与统计 -->
    <div class="flex flex-col md:flex-row  items-center mb-6 gap-4">
      <div class="text-sm text-gray-500">
        共 {{ noticeList.length }} 条公告
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="space-y-4">
      <el-card
        v-for="item in noticeList"
        :key="item.id"
        class="transition-all duration-300 hover:shadow-md hover:border-blue-100 cursor-pointer group"
        @click="markAsRead(item.id)"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <!-- 标题与状态 -->
            <div class="flex items-center space-x-2">
              <!-- 未读红点 -->
              <span
                v-if="!item.isRead"
                class="w-2 h-2 bg-red-500 rounded-full animate-pulse"
              ></span>
              <h3
                class="font-semibold text-lg group-hover:text-blue-600 transition-colors"
              >
                {{ item.noticeTitle }}
              </h3>
            </div>

            <!-- 类型标签 -->
            <el-tag
              :type="item.noticeType === '2' ? 'danger' : item.noticeType === '1' ? 'primary' : 'success'"
              size="small"
              :effect="'light'"
            >
              {{ typeMap[item.noticeType]?.label || '通知' }}
            </el-tag>
          </div>
        </template>

        <!-- 内容摘要 -->
        <div class="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
          {{ item.noticeContent }}
        </div>

        <!-- 底部元信息 -->
        <div class="flex flex-wrap items-center justify-between text-xs text-gray-400 border-t pt-3 mt-2">
          <div class="flex items-center space-x-4">
            <el-tag class="flex items-center">公告ID:{{ item.id }}</el-tag>
            <el-tag class="flex items-center" type="success">{{ item.publish_time }}</el-tag>
          </div>
          <div>
            <!-- 阅读状态 -->
            <el-text :type="item.isRead ? 'success' : 'info'" size="small">
              {{ item.isRead ? '已阅读' : '阅读' }}
            </el-text>
          </div>
        </div>
      </el-card>

      <!-- 空状态 -->
      <el-empty
        v-if="noticeList.length === 0"
        description="暂无公告"
        :image-size="100"
      />
    </div>
  </div>
</template>

<style scoped>
/* 优化移动端体验 */
@media (max-width: 768px) {
  .min-h-screen {
    padding: 1rem;
  }
}
</style>
