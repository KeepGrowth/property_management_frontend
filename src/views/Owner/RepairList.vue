<script setup>
import { ref, onMounted } from 'vue'
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElUpload,
  ElMessage,
  ElMessageBox, ElPagination
} from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import useRepairStore from '@/stores/repair'
import formatTime from '../../utils/date.js'
import useUserStore from '@/stores/user.js'

// --- 1. 模拟数据与状态 ---
// 业主ID (通常从 Pinia 或 LocalStorage 获取)
const currentOwnerId = '1001'

// 报修列表数据
const repairList = ref([])

// 抽屉控制
const drawerVisible = ref(false)
const drawerTitle = ref('')
const isViewing = ref(false) // 控制抽屉是查看模式还是编辑模式

// 表单数据
const repairForm = ref({
  id: null,
  repairNo: '',
  repairType: '',
  repairDesc: '',
  repairStatus: 0,
  evaluateStar: 0,
  comment: ''
})

// 状态映射 (用于标签显示)
const statusMap = {
  1: { label: '待受理', type: 'info' },
  2: { label: '处理中', type: 'warning' },
  3: { label: '修理中', type: 'warning' },
  4: { label: '已完成', type: 'primary' },
  5: { label: '已评价', type: 'success' }
}

// --- 2. 核心逻辑方法 ---
const repairStore = useRepairStore()
// 从后端获取数据
const total = ref()
const fetchRepairs = async () => {
  // 调用 API
  const res = await repairStore.getUserRepairList(queryParams.value)
  if (res.code === 200) {
    repairList.value = res.data.records
    total.value = res.data.total
  }
}

// 打开申请报修抽屉
const queryParams = ref({
  page: 1,
  pageSize: 10,
  isUser: 1
})
const handleApplyRepair = () => {
  repairForm.value = {
    id: null,
    repairNo: '',
    repairType: '',
    repairDesc: '',
    repairStatus: 0
  }
  drawerTitle.value = '申请报修'
  isViewing.value = false
  drawerVisible.value = true
}

// 查看/评价详情
const handleViewDetail = (row) => {
  // 模拟深拷贝
  repairForm.value = row
  console.log('查看详情', repairForm.value)
  drawerTitle.value = row.repairStatus < 4 ? '评价服务' : '报修详情'
  isViewing.value = row.repairStatus === 4 // 如果已完成，则进入评价模式
  drawerVisible.value = true
}

// 提交表单 (申请或评价)
const userStore = useUserStore()
const submitForm = async () => {
  repairForm.value.ownerId = userStore.userInfo.id
  // 简单校验
  if (!repairForm.value.repairType || !repairForm.value.repairDesc) {
    ElMessage.error('请填写必填项')
    return
  }
  if (!repairForm.value.id) {
    const res = await repairStore.addRepairOrder(repairForm.value)
    if (res.code === 200) {
      ElMessage.success('提交成功！')
      await fetchRepairs()
    } else {
      ElMessage.error({
        title: '提交失败！',
        message: res.message
      })
    }
  } else {
    // 提交更新逻辑
    repairForm.value.repairStatus = 5
    const res = await repairStore.updateRepairOrder(repairForm.value)
    if (res.code === 200) {
      ElMessage.success('评价提交成功！')
      await fetchRepairs()
    } else {
      ElMessage.error({
        title: '评价提交失败！',
        message: res.message
      })
    }
  }

  drawerVisible.value = false
  await fetchRepairs() // 刷新列表
}

// --- 3. 生命周期 ---
onMounted(async () => {
  await fetchRepairs()
})
</script>

<template>
  <!-- 页面容器 -->
  <div class="p-4 space-y-4">
    <!-- 顶部操作栏 -->
    <el-card class="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-md" shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-gray-800">🛠️ 我的报修中心</span>
          <el-button type="primary" :icon="Plus" @click="handleApplyRepair">
            申请报修
          </el-button>
        </div>
      </template>
      <div class="text-sm text-gray-600">
        在这里您可以查看报修进度，或申请新的维修服务。物业人员会尽快与您联系。
      </div>
    </el-card>

    <!-- 报修列表 -->
    <el-card class="border-0 shadow-sm" shadow="never">
      <el-table
        :data="repairList"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#F8FAFC', color: '#1E293B', fontWeight: '600' }"
        empty-text="暂无报修记录，快去申请吧！"
      >
        <!-- 序号 -->
        <el-table-column type="index" label="序号" width="80" align="center" />

        <!-- 报修单号 -->
        <el-table-column prop="repairNo" label="单号" width="180">
          <template #default="scope">
            <code class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{{ scope.row.repairNo }}</code>
          </template>
        </el-table-column>

        <!-- 报修类型 -->
        <el-table-column prop="repairType" label="类型" width="120">
          <template #default="scope">
            <el-tag type="danger" size="small" effect="light">{{ scope.row.repairType }}</el-tag>
          </template>
        </el-table-column>

        <!-- 简要描述 -->
        <el-table-column prop="repairDesc" label="问题描述" min-width="200" show-overflow-tooltip />

        <!-- 状态 (核心交互点) -->
        <el-table-column prop="repairStatus" label="状态" width="140" align="center">
          <template #default="scope">
            <el-tag
              :type="statusMap[scope.row.repairStatus]?.type || 'info'"
              :effect="scope.row.repairStatus === 4 ? 'dark' : 'light'"
            >
              {{ statusMap[scope.row.repairStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 时间 -->
        <el-table-column prop="create_time" label="申请时间" width="300">

          <template #default="scope">
            <el-tag type="success">{{ formatTime(scope.row.create_time) }}</el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              :type="scope.row.repairStatus >= 4 ? 'success' : 'primary'"
              @click="handleViewDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分页组件 -->
    <div class="flex justify-end mt-4">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[5, 10, 15, 20]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="fetchRepairs"
        @current-change="fetchRepairs"
      />
    </div>

    <!-- 侧边抽屉 (申请/详情/评价) -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      size="40%"
      destroy-on-close
    >
      <div class="px-6 pb-6">
        <el-form :model="repairForm" label-width="100px" class="space-y-4">

          <!-- 报修类型 (仅申请时显示) -->
          <el-form-item label="报修类型" prop="repairType">
            <el-input
              :disabled="repairForm.repairStatus>=1"
              v-model="repairForm.repairType"
              placeholder="例如：水管漏水、电路跳闸" />
          </el-form-item>

          <!-- 问题描述 -->
          <el-form-item :label="'详细描述'" prop="repairDesc">
            <el-input
              v-model="repairForm.repairDesc"
              :disabled="repairForm.repairStatus>=1"
              type="textarea"
              :rows="4"
            />
          </el-form-item>

          <!-- 评价模块 (仅状态为已完成且未评价时显示) -->
          <template v-if="repairForm.repairStatus === 4">
            <el-divider class="my-2">请对本次服务进行评价 🌟</el-divider>
            <el-form-item label="评分">
              <el-rate v-model="repairForm.evaluateStar" :max="5" show-text void-text="暂无评价" />
            </el-form-item>
            <el-form-item label="评价内容">
              <el-input
                v-model="repairForm.comment"
                type="textarea"
                :rows="3"
                placeholder="分享一下您的维修体验吧..."
              />
            </el-form-item>
          </template>

        </el-form>

        <!-- 底部按钮 -->
        <div class="flex justify-end mt-6 pt-4 border-t" v-if="repairForm.repairStatus === 4 || !repairForm.id">
          <el-button @click="drawerVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="submitForm"
          >
            确认提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
/* 优化表格行高 */
:deep(.el-table tbody tr:hover) {
  background-color: #F0F9FF !important;
}

/* 优化卡片圆角 */
:deep(.el-card) {
  border-radius: 12px;
}

/* 优化按钮间距 */
:deep(.el-button--small) {
  padding: 8px 16px;
}
</style>
