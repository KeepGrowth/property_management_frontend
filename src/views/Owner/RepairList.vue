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
  ElMessageBox
} from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import useRepairStore from '@/stores/repair'

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
  repairImg: [],
  repairStatus: 0,
  handleResult: '',
  evaluateStar: 0,
  evaluateContent: ''
})

// 状态映射 (用于标签显示)
const statusMap = {
  1: { label: '待受理', type: 'info' },
  2: { label: '处理中', type: 'warning' },
  3: { label: '已完成', type: 'success' },
  4: { label: '已评价', type: 'primary' }
}

// --- 2. 核心逻辑方法 ---
const repairStore = useRepairStore()
// 模拟从后端获取数据
const fetchRepairs = async () => {
  // 调用 API: apiGetRepairList({ ownerId: currentOwnerId })
  const res = await repairStore.getRepairList()
  if (res.code === 200) {
    repairList.value = res.data
  }
}

// 打开申请报修抽屉
const handleApplyRepair = () => {
  repairForm.value = {
    id: null,
    repairNo: '',
    repairType: '',
    repairDesc: '',
    repairImg: [],
    repairStatus: 0
  }
  drawerTitle.value = '申请报修'
  isViewing.value = false
  drawerVisible.value = true
}

// 查看/评价详情
const handleViewDetail = (row) => {
  // 模拟深拷贝
  Object.assign(repairForm.value, row)
  drawerTitle.value = row.repairStatus >= 3 ? '评价服务' : '报修详情'
  isViewing.value = row.repairStatus >= 3 // 如果已完成，则进入评价模式
  drawerVisible.value = true
}

// 提交表单 (申请或评价)
const submitForm = () => {
  // 简单校验
  if (!repairForm.value.repairType || !repairForm.value.repairDesc) {
    ElMessage.error('请填写必填项')
    return
  }

  if (isViewing.value) {
    // 提交评价逻辑
    // 调用 API: apiSubmitEvaluate({ id: repairForm.value.id, star: repairForm.value.evaluateStar, content: repairForm.value.evaluateContent })
    ElMessage.success('评价提交成功！')
  } else {
    // 提交报修逻辑
    // 调用 API: apiCreateRepair(repairForm.value)
    ElMessage.success('报修申请已提交，请等待物业受理！')
  }

  drawerVisible.value = false
  fetchRepairs() // 刷新列表
}

// --- 3. 生命周期 ---
onMounted(() => {
  fetchRepairs()
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
        <el-table-column prop="createTime" label="申请时间" width="160" />

        <!-- 操作 -->
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              :type="scope.row.repairStatus >= 3 ? 'success' : 'primary'"
              @click="handleViewDetail(scope.row)"
            >
              {{ scope.row.repairStatus >= 3 ? '评价' : '详情' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
          <el-form-item label="报修类型" prop="repairType" v-if="!isViewing">
            <el-input v-model="repairForm.repairType" placeholder="例如：水管漏水、电路跳闸" />
          </el-form-item>

          <!-- 问题描述 -->
          <el-form-item :label="isViewing ? '故障描述' : '详细描述'" prop="repairDesc">
            <el-input
              v-model="repairForm.repairDesc"
              type="textarea"
              :rows="4"
              :placeholder="isViewing ? '这是您之前提交的描述：' : '请详细描述故障情况，以便师傅准备工具'"
            />
          </el-form-item>

          <!-- 图片展示/上传 -->
          <el-form-item label="现场图片" v-if="!isViewing || repairForm.repairImg.length > 0">
            <el-upload
              v-if="!isViewing"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-preview="handlePictureCardPreview"
            >
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
            <div v-else class="flex flex-wrap gap-2">
              <el-image
                v-for="(img, index) in repairForm.repairImg"
                :key="index"
                :src="img"
                fit="cover"
                class="w-20 h-20 rounded"
                :preview-src-list="repairForm.repairImg"
              >
                <template #placeholder>
                  <div class="w-20 h-20 flex items-center justify-center bg-gray-100">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </el-form-item>

          <!-- 处理结果 (仅查看时显示) -->
          <el-form-item label="处理结果" v-if="isViewing && repairForm.handleResult">
            <el-tag type="warning" class="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-10">
              {{ repairForm.handleResult }}
            </el-tag>
          </el-form-item>

          <!-- 评价模块 (仅状态为已完成且未评价时显示) -->
          <template v-if="isViewing && repairForm.repairStatus === 3">
            <el-divider class="my-2">请对本次服务进行评价 🌟</el-divider>
            <el-form-item label="评分">
              <el-rate v-model="repairForm.evaluateStar" :max="5" show-text void-text="暂无评价" />
            </el-form-item>
            <el-form-item label="评价内容">
              <el-input
                v-model="repairForm.evaluateContent"
                type="textarea"
                :rows="3"
                placeholder="分享一下您的维修体验吧..."
              />
            </el-form-item>
          </template>

        </el-form>

        <!-- 底部按钮 -->
        <div class="flex justify-end mt-6 pt-4 border-t">
          <el-button @click="drawerVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="submitForm"
            v-if="!isViewing || (isViewing && repairForm.repairStatus === 3)"
          >
            {{ isViewing ? '提交评价' : '确认提交' }}
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
