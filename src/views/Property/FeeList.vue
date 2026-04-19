<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElCard,
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
  ElTag,
  ElMessageBox,
  ElMessage, ElPagination
} from 'element-plus'
import { Search, Plus, Download, Refresh, Check } from '@element-plus/icons-vue'
import useFeeStore from '@/stores/fee'

// --- 1. 类型定义 ---
type BillStatus = 1 | 2

interface FeeBill {
  id: number
  billNo: string
  houseId: number
  buildingNo: string // 楼栋-单元-房号
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
const total = ref()

// 搜索表单
const queryParams = ref({
  billNo: '',
  feeType: '',
  billStatus: 2,
  isUser: 0,
  page: 1,
  pageSize: 10
})


// --- 3. 模拟数据与逻辑 ---
// 模拟账单类型
const feeTypes = [
  { label: '物业费', value: 1 },
  { label: '水电费', value: 2 }
]

// 模拟状态标签
const getStatusTag = (status: BillStatus) => {
  return status === 1
    ? { type: 'danger', label: '未缴' }
    : { type: 'success', label: '已缴' }
}

// --- 4. 核心方法 ---
const feeStore = useFeeStore()
// 模拟获取数据
const fetchFeeList = async () => {
  loading.value = true
  const res = await feeStore.getUserFeeList(queryParams.value)
  if (res.code === 200) {
    billList.value = res.data.records
    total.value = res.data.total
    loading.value = false
  }
}

// 搜索/重置
const handleSearch = async () => {
  console.log('搜索条件:', queryParams)
  await fetchFeeList()
}
const handleReset = async () => {
  // 重置表单
  queryParams.keyword = ''
  queryParams.feeType = ''
  queryParams.billStatus = ''
  await fetchFeeList()
}


// 模拟缴费 (物业代缴或确认)
const handlePay = (row: FeeBill) => {
  ElMessageBox.alert(`已为业主 ${row.ownerName} (房号: ${row.buildingNo}) 完成【${row.feeType}】的缴费操作。`, '缴费成功', {
    type: 'success',
    confirmButtonText: '确定'
  }).then(async () => {
    await feeStore.payFee(row.id)
    await fetchFeeList()
    ElMessage.success('状态已更新')
  })
}

// 导出Excel
const handleExport = () => {
  ElMessage.info('正在导出账单数据...')
}

// --- 5. 生命周期 ---
onMounted(() => {
  fetchFeeList()
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
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-2" label-width="auto">
        <el-form-item label="账单号">
          <el-input
            v-model="queryParams.billNo"
            placeholder="账单号"
            clearable
            class="w-40"
            :suffix-icon="Search"
          />
        </el-form-item>

        <el-form-item label="费用类型" style="width: 200px">
          <el-select v-model="queryParams.feeType" placeholder="全部" clearable class="w-32">
            <el-option
              v-for="item in feeTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" style="width: 200px">
          <el-select v-model="queryParams.billStatus" placeholder="全部" clearable>
            <el-option label="已缴" :value="2" />
            <el-option label="未缴" :value="1" />
          </el-select>
        </el-form-item>


        <div class="flex items-center mt-2 ml-2 space-x-2">
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
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
        <el-table-column type="selection"  align="center" />

        <!-- 账单号 -->
        <el-table-column prop="billNo" label="账单号"  />

        <!-- 房屋信息 -->
        <el-table-column prop="houseId" label="房屋信息(Id)"  />

        <!-- 业主信息 -->
        <el-table-column prop="ownerId" label="业主ID"  />

        <!-- 费用类型 -->
        <el-table-column prop="feeType" label="类型" >
          <template #default="scope">
            <el-tag
              :type="scope.row.feeType==='1'?'primary':'warning'"
              size="small"
            >{{ scope.row.feeType === '1' ? '物业费' : '水电费' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 金额 -->
        <el-table-column prop="feeAmount" label="金额(元)"  align="right">
          <template #default="scope">
            <span class="font-medium text-lg text-gray-900">¥{{ scope.row.feeAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column prop="billStatus" label="状态">
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
        <el-table-column prop="startTime" label="计费周期">
          <template #default="scope">
            {{ scope.row.startTime }} 至 {{ scope.row.endTime }}
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" fixed="right" >
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
        @size-change="fetchFeeList"
        @current-change="fetchFeeList"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
