<script setup>
import { ref, onMounted } from 'vue'
import { Search, Refresh, Tickets, Check, Close } from '@element-plus/icons-vue'
import useUserStore from '@/stores/user.js'

// --- 1. 状态定义 ---
const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false) // 控制处理弹窗

// 搜索与分页
const queryParams = ref({
  keyword: '',
  status: '', // 状态筛选：1待分配, 2处理中, 3已完成
  pageNum: 1,
  pageSize: 10
})
const total = ref(0)
const repairList = ref([])

// 处理表单 (用于弹窗)
const handleForm = ref({
  id: null,
  status: '2', // 默认改为处理中
  remark: ''
})

// 状态映射 (用于展示不同颜色的Tag)
const statusMap = {
  1: { label: '待分配', type: 'danger' },
  2: { label: '处理中', type: 'warning' },
  3: { label: '已完成', type: 'success' }
}

// --- 2. 逻辑方法 ---

// 获取列表数据
const fetchList = async () => {
  loading.value = true
  try {
    // 模拟API调用，实际替换为 service 调用
    const res = await getRepairList(queryParams.value)
    repairList.value = res.data.list || mockData // 如果接口未好，使用mock数据
    total.value = res.data.total || mockData.length
  } catch (err) {
    ElMessage.error('获取报修列表失败')
  } finally {
    loading.value = false
  }
}

// 处理报修 (打开弹窗)
const handleProcess = (row) => {
  handleForm.value = {
    id: row.id,
    status: '2',
    remark: ''
  }
  dialogVisible.value = true
}

// 确认处理 (提交表单)
const submitHandle = async () => {
  try {
    await updateRepairStatus(handleForm.value)
    ElMessage.success('处理成功')
    dialogVisible.value = false
    fetchList() // 刷新列表
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
    houseInfo: '1栋-502',
    applicant: '张三',
    phone: '138****5678',
    type: '水管维修',
    desc: '厨房水龙头漏水严重，需要更换垫片。',
    images: ['https://via.placeholder.com/150'], // 占位图
    status: 1,
    createTime: '2024-05-10 09:15:22'
  },
  {
    id: 1002,
    repairNo: 'BX20240510002',
    houseInfo: '3栋-1201',
    applicant: '李四',
    phone: '139****1234',
    type: '电路故障',
    desc: '客厅插座没电，疑似跳闸。',
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
            <Tickets class="mr-2 text-blue-500" /> 报修工单管理
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
            v-model="queryParams.keyword"
            placeholder="报修单号/房号/申请人"
            clearable
            class="w-48"
          >
            <template #prefix>
              <Search class="text-gray-400" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable class="w-24">
            <el-option label="待分配" value="1" />
            <el-option label="处理中" value="2" />
            <el-option label="已完成" value="3" />
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
        <el-table-column type="index" label="序号" width="60" align="center" />

        <!-- 报修信息 -->
        <el-table-column prop="repairNo" label="报修单号" width="140" />

        <el-table-column label="房屋/申请人" width="140">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="font-medium text-gray-800">{{ row.houseInfo }}</div>
              <div class="text-xs text-gray-500">{{ row.applicant }} ({{ row.phone }})</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="报修类型" width="100" />

        <!-- 问题描述 (带Tooltip) -->
        <el-table-column label="问题描述" min-width="180">
          <template #default="{ row }">
            <el-popover
              placement="top"
              :width="300"
              trigger="hover"
            >
              <div class="text-sm whitespace-pre-line">{{ row.desc }}</div>
              <template #reference>
                <el-tag type="info" effect="plain" size="small" class="cursor-help">
                  {{ row.desc.length > 20 ? row.desc.slice(0, 20) + '...' : row.desc }}
                </el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>

        <!-- 图片预览 -->
        <el-table-column label="现场图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="row.images[0]"
              :preview-src-list="row.images"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px;"
              class="cursor-pointer hover:shadow-md transition-shadow"
            />
            <el-tag v-else size="small">无</el-tag>
          </template>
        </el-table-column>

        <!-- 状态标签 -->
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="statusMap[row.status]?.type"
              effect="dark"
              size="default"
              class="px-3 py-1 text-xs font-medium"
            >
              {{ statusMap[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <!-- 待处理时显示“处理”按钮 -->
            <el-button
              v-if="row.status == 1 || row.status == 2"
              size="small"
              type="success"
              :icon="Check"
              @click="handleProcess(row)"
              link
            >
              处理
            </el-button>
            <!-- 已完成显示“已完成”文字 -->
            <span v-else class="text-green-600 font-medium">已完成</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 处理弹窗 -->
    <el-dialog v-model="dialogVisible" title="处理报修工单" width="500" center>
      <div class="text-center">
        <p class="text-lg font-medium mb-4">确认将该报修单状态更新为 <span class="text-green-600">处理中</span> 吗？</p>
        <el-input
          v-model="handleForm.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入处理备注（可选）"
          class="w-11/12 mx-auto"
        />
      </div>
      <template #footer>
        <div class="dialog-footer text-center">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitHandle">确 认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 优化表格斑马纹和悬停效果 */
:deep(.el-table tbody tr:hover > td) {
  background-color: #f0f9ff !important;
  transition: all 0.3s;
}

</style>
