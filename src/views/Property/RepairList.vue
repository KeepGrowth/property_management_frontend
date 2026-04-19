<script setup>
import { ref, onMounted } from 'vue'
import { Search, Refresh, Tickets, Check, Close } from '@element-plus/icons-vue'
import useUserStore from '@/stores/user.js'
import useRepairStore from '@/stores/repair.js'
import { ElMessage, ElNotification, ElPagination } from 'element-plus'

// --- 1. 状态定义 ---
const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false) // 控制处理弹窗

// 搜索与分页
const queryParams = ref({
  repairNo: '',
  repairStatus: null, // 状态筛选：1待分配, 2处理中, 3已完成
  page: 1,
  pageSize: 10,
  isUser: 0
})
const total = ref(0)
const repairList = ref([])


// 状态映射 (用于展示不同颜色的Tag)
const statusMap = {
  1: { label: '待受理', type: 'info' },
  2: { label: '处理中', type: 'warning' },
  3: { label: '修理中', type: 'warning' },
  4: { label: '已完成', type: 'primary' },
  5: { label: '已评价', type: 'success' }
}

// --- 2. 逻辑方法 ---
const repairStore = useRepairStore()
// 获取列表数据
const fetchList = async () => {
  loading.value = true
  try {
    // API调用
    const res = await repairStore.queryRepairList(queryParams.value)
    if (res.code === 200) {
      repairList.value = res?.data.records
      total.value = res.data.total
    } else {
      ElNotification.error('获取数据失败，请检查网络。')
      repairList.value = []
      total.value = 0
    }

  } catch (err) {
    ElMessage.error('获取报修列表失败' + e)
  } finally {
    loading.value = false
  }
}

// 处理报修 (打开弹窗)
const handleProcess = async (row) => {
  // 调用API进行处理
  const res = await repairStore.changeRepairStatus(row.id, 2)
  if (res.code === 200) {
    ElNotification.success('状态已变为正在处理中，请及时处理后点击完成。')
    await fetchList()
  }
}

// 将状态改为已完成
const changeToFinish = async (repairId) => {
  try {
    // 更改状态
    const res = await repairStore.changeRepairStatus(repairId, 4)
    if (res.code === 200) {
      ElMessage.success('处理成功')
      dialogVisible.value = false
      await fetchList() // 刷新列表
    }

  } catch (err) {
    ElMessage.error('处理失败')
  }
}

// --- 3. 生命周期 ---
onMounted(() => {
  fetchList()
})

// --- Mock Data (开发阶段使用，接口通了可删) ---
const mockData = [
  {
    id: 1001,
    repairNo: 'BX20240510001',
    houseId: '1栋-502',
    applicant: '张三',
    phone: '138****5678',
    type: '水管维修',
    repairDesc: '厨房水龙头漏水严重，需要更换垫片。',
    images: ['https://via.placeholder.com/150'], // 占位图
    status: 1,
    createTime: '2024-05-10 09:15:22'
  },
  {
    id: 1002,
    repairNo: 'BX20240510002',
    houseId: '3栋-1201',
    applicant: '李四',
    phone: '139****1234',
    type: '电路故障',
    repairDesc: '客厅插座没电，疑似跳闸。',
    images: [],
    status: 2,
    createTime: '2024-05-10 10:30:45'
  }
]
</script>

<template>
  <div class="p-4 bg-gray-50 min-h-screen">
    <!-- 卡片容器 -->
    <el-card class="shadow-md">
      <!-- 标题与搜索栏 -->
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center">
            <Tickets class="mr-2 text-blue-500" />
            报修管理
          </h3>
          <el-button
            :icon="Refresh"
            circle
            @click="fetchList"
            :loading="loading"
            class="text-gray-500 hover:text-blue-500"
          />
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="mb-4 flex flex-wrap gap-2">
        <el-form-item>
          <el-input
            v-model="queryParams.repairNo"
            placeholder="报修单号/房号/申请人"
            clearable
            class="w-48"
          >
            <template #prefix>
              <Search class="text-gray-400" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="状态" style="width: 200px">
          <el-select v-model="queryParams.repairStatus" placeholder="全部" clearable class="w-24">
            <el-option label="待处理" :value="1" />
            <el-option label="处理中" :value="2" />
            <el-option label="已完成" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchList">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        :data="repairList"
        v-loading="loading"
        stripe
        style="width: 100%; --el-table-border: none;"
        class="bg-transparent"
      >
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center" />

        <!-- 报修信息 -->
        <el-table-column prop="repairNo" label="报修单号" />


        <el-table-column prop="repairType" label="报修类型" />

        <!-- 问题描述 (带Tooltip) -->
        <el-table-column label="问题描述">
          <template #default="{ row }">
            <el-popover
              placement="top"
              :width="300"
              trigger="hover"
            >
              <div class="text-sm whitespace-pre-line">{{ row.repairDesc }}</div>
              <template #reference>
                <el-tag type="info" effect="plain" size="small" class="cursor-help">
                  {{ row.repairDesc.length > 100 ? row.repairDesc.slice(0, 100) + '...' : row.repairDesc }}
                </el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>


        <!-- 状态标签 -->
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag
              :type="statusMap[row.repairStatus]?.type"
              effect="dark"
              size="default"
              class="px-3 py-1 text-xs font-medium"
            >
              {{ statusMap[row.repairStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <!-- 待处理时显示“处理”按钮 -->
            <el-button
              v-if="row.repairStatus===1"
              size="small"
              type="success"
              :icon="Check"
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <!-- 已完成显示“已完成”文字 -->
            <el-button class="text-green-600 font-medium"
                       v-else-if="row.repairStatus<4"
                       type="danger"
                       size="small"
                       @click="changeToFinish(row.id)"
            >
              点击完成
            </el-button>
            <el-button v-else class="text-green-600 font-medium" size="small" type="info" v-if="row.repairStatus>=4"
                       disabled>
              已完成
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[5, 10, 15, 20]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* 优化表格斑马纹和悬停效果 */
:deep(.el-table tbody tr:hover > td) {
  background-color: #f0f9ff !important;
  transition: all 0.3s;
}

</style>
