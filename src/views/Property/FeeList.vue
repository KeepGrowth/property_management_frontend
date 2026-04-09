<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElCard, ElButton, ElInput, ElSelect, ElOption, ElForm, ElFormItem, ElTag, ElMessageBox, ElMessage } from 'element-plus'
import { Search, Plus, Download, Refresh } from '@element-plus/icons-vue'

// --- 1. 类型定义 ---
type BillStatus = 1 | 2
interface FeeBill {
  id: number
  billNo: string
  houseId: number
  houseAddress: string // 楼栋-单元-房号
  ownerName: string
  feeType: string
  feeAmount: number
  billStatus: BillStatus // 1未缴 2已缴
  startTime: string
  endTime: string
}

// --- 2. 响应式数据 ---
// 表格数据
const billList = ref<FeeBill[]>([])
const loading = ref(false)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  feeType: '',
  billStatus: 2,
  dateRange: [] as string[] // [开始时间, 结束时间]
})

// 高级搜索开关
const isAdvancedSearch = ref(false)

// --- 3. 模拟数据与逻辑 ---
// 模拟账单类型
const feeTypes = [
  { label: '物业费', value: 'property' },
  { label: '电费', value: 'electric' },
  { label: '水费', value: 'water' },
  { label: '取暖费', value: 'heating' }
]

// 模拟状态标签
const getStatusTag = (status: BillStatus) => {
  return status === 1
    ? { type: 'danger', label: '未缴' }
    : { type: 'success', label: '已缴' }
}

// --- 4. 核心方法 ---

// 模拟获取数据
const fetchData = () => {
  loading.value = true
  // 模拟API延迟
  setTimeout(() => {
    billList.value = [
      {
        id: 1001,
        billNo: 'BILL20240329001',
        houseId: 101,
        houseAddress: '1栋-1单元-101',
        ownerName: '张三',
        feeType: '物业费',
        feeAmount: 280.50,
        billStatus: 1,
        startTime: '2024-03-01',
        endTime: '2024-03-31'
      },
      {
        id: 1002,
        billNo: 'BILL20240329002',
        houseId: 102,
        houseAddress: '1栋-1单元-102',
        ownerName: '李四',
        feeType: '电费',
        feeAmount: 150.00,
        billStatus: 2,
        startTime: '2024-03-01',
        endTime: '2024-03-31'
      }
    ]
    total.value = 2
    loading.value = false
  }, 500)
}

// 搜索/重置
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  fetchData()
}
const handleReset = () => {
  // 重置表单
  searchForm.keyword = ''
  searchForm.feeType = ''
  searchForm.billStatus = ''
  searchForm.dateRange = []
  fetchData()
}

// 模拟生成账单 (实际调用后端API)
const handleGenerateBills = () => {
  ElMessageBox.confirm('确定要批量生成本月账单吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    // 调用API生成账单
    ElMessage.success('账单生成任务已提交！')
    fetchData() // 刷新列表
  }).catch(() => {
    ElMessage.info('已取消生成')
  })
}

// 模拟缴费 (物业代缴或确认)
const handlePay = (row: FeeBill) => {
  ElMessageBox.alert(`已为业主 ${row.ownerName} (房号: ${row.houseAddress}) 完成【${row.feeType}】的缴费操作。`, '缴费成功', {
    type: 'success',
    confirmButtonText: '确定'
  }).then(() => {
    // 更新本地状态模拟
    row.billStatus = 2
    ElMessage.success('状态已更新')
  })
}

// 导出Excel
const handleExport = () => {
  ElMessage.info('正在导出账单数据...')
  // 这里通常会触发一个下载链接或调用后端流式接口
}

// --- 5. 生命周期 ---
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 bg-gray-50 min-h-screen">
    <!-- 顶部操作栏 -->
    <el-card class="shadow-md mb-4 transition-all duration-300">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-xl font-semibold text-gray-800">账单管理</span>
          <div class="space-x-2">
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="flex flex-wrap gap-2" label-width="auto">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="房号/业主/账单号"
            clearable
            class="w-40"
            :suffix-icon="Search"
          />
        </el-form-item>

        <el-form-item label="费用类型" style="width: 200px">
          <el-select v-model="searchForm.feeType" placeholder="全部" clearable class="w-32">
            <el-option
              v-for="item in feeTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" style="width: 200px">
          <el-select v-model="searchForm.billStatus" placeholder="全部" clearable >
            <el-option label="已缴" :value="2" />
            <el-option label="未缴" :value="1" />
          </el-select>
        </el-form-item>

        <!-- 高级搜索区域 (可折叠) -->
        <template v-if="isAdvancedSearch">
          <el-form-item label="时间范围" class="!mb-2">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              class="w-64"
            />
          </el-form-item>
        </template>

        <div class="flex items-center mt-2 ml-2 space-x-2">
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          <el-button
            type="text"
            @click="isAdvancedSearch = !isAdvancedSearch"
            class="text-blue-600"
          >
            {{ isAdvancedSearch ? '收起' : '展开' }} <i class="el-icon-arrow-down" :class="{ 'el-icon-arrow-up': isAdvancedSearch }"></i>
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 账单列表 -->
    <el-card class="shadow-md transition-all duration-300">
      <el-table
        :data="billList"
        style="width: 100%"
        v-loading="loading"
        :row-class-name="'hover:bg-blue-50 transition-colors duration-200'"
        stripe
      >
        <!-- 选择框 -->
        <el-table-column type="selection" width="55" align="center" />

        <!-- 账单号 -->
        <el-table-column prop="billNo" label="账单号" width="180" />

        <!-- 房屋信息 -->
        <el-table-column prop="houseAddress" label="房屋信息" width="150" />

        <!-- 业主信息 -->
        <el-table-column prop="ownerName" label="业主" width="100" />

        <!-- 费用类型 -->
        <el-table-column prop="feeType" label="类型" width="100">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.feeType }}</el-tag>
          </template>
        </el-table-column>

        <!-- 金额 -->
        <el-table-column prop="feeAmount" label="金额(元)" width="120" align="right">
          <template #default="scope">
            <span class="font-medium text-lg text-gray-900">¥{{ scope.row.feeAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column prop="billStatus" label="状态" width="150">
          <template #default="scope">
            <el-tag
              :type="getStatusTag(scope.row.billStatus).type"
              effect="dark"
            >
              {{ getStatusTag(scope.row.billStatus).label }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 时间范围 -->
        <el-table-column prop="startTime" label="计费周期" width="180">
          <template #default="scope">
            {{ scope.row.startTime }} 至 {{ scope.row.endTime }}
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <el-button
              size="small"
              type="success"
              :icon="Check"
              @click="handlePay(scope.row)"
              v-if="scope.row.billStatus === 1"
            >
              代缴费
            </el-button>
            <el-button
              size="small"
              type="info"
              disabled
              v-else
            >
              已结清
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 (模拟) -->
      <div class="flex justify-end mt-4">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="10"
          @current-change="handleSearch"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>

</style>
