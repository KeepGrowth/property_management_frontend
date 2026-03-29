<script setup>
import { ref, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElCard, ElInput, ElSelect, ElOption, ElButton, ElTag, ElPagination, ElDialog, ElMessage } from 'element-plus'
import { Search, Refresh, Wallet } from '@element-plus/icons-vue'

// 模拟数据定义
const feeList = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const currentBillId = ref(null)

// 筛选条件
const queryParams = ref({
  billNo: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

// 模拟从后端获取数据
const fetchData = () => {
  loading.value = true
  // 这里模拟API调用，实际开发中替换为 axios.get('/api/v1/fee/bill/list', { params: queryParams.value })
  setTimeout(() => {
    // 生成模拟数据
    const mockData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1 + (queryParams.value.pageNum - 1) * queryParams.value.pageSize,
      billNo: `BILL${new Date().getFullYear()}${String(1000 + i).slice(-4)}`,
      houseId: 'A栋 1001室',
      feeType: i % 3 === 0 ? '物业费' : i % 3 === 1 ? '电费' : '水费',
      feeAmount: (Math.random() * 500 + 50).toFixed(2),
      billStatus: i % 4 === 0 ? 1 : 2, // 1:未缴, 2:已缴
      createTime: new Date().toLocaleString()
    }))
    feeList.value = mockData
    total.value = 50 // 模拟总条数
    loading.value = false
  }, 800)
}

// 处理模拟支付
const handlePay = (id) => {
  currentBillId.value = id
  dialogVisible.value = true
}

// 确认支付
const confirmPay = () => {
  // 模拟支付请求
  loading.value = true
  setTimeout(() => {
    ElMessage.success('模拟支付成功！')
    dialogVisible.value = false
    fetchData() // 刷新列表
  }, 500)
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<template>
  <!-- 外层容器，使用 Tailwind CSS 进行布局和美化 -->
  <div class="p-4 space-y-4">

    <!-- 1. 筛选与操作卡片 -->
    <el-card class="bg-white/80 backdrop-blur-sm border-none shadow-md">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold text-gray-800 flex items-center">
            <i class="el-icon-document mr-2 text-blue-500"></i>
            费用账单查询
          </span>
          <el-button
            :icon="Refresh"
            @click="fetchData"
            circle
            class="bg-gray-100 hover:bg-gray-200 text-gray-600"
          />
        </div>
      </template>

      <!-- 筛选表单 -->
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-2 items-center justify-center">
        <el-form-item label="账单号">
          <el-input
            v-model="queryParams.billNo"
            placeholder="请输入账单号"
            :prefix-icon="Search"
            class="w-40"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" class="w-32">
            <el-option label="已缴" value="2" />
            <el-option label="未缴" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData" :icon="Search">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 数据表格卡片 -->
    <el-card class="bg-white/80 backdrop-blur-sm border-none shadow-md overflow-hidden">
      <template #header>
        <span class="text-lg font-semibold text-gray-800">账单列表</span>
      </template>

      <el-table
        :data="feeList"
        stripe
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f8fafc', color: '#1e293b', fontWeight: '600' }"
      >
        <!-- 序号列 -->
        <el-table-column type="index" label="序号" width="60" align="center" />

        <!-- 核心数据列 -->
        <el-table-column prop="billNo" label="账单编号" width="180">
          <template #default="{ row }">
            <div class="font-mono text-sm text-blue-600">#{{ row.billNo }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="houseId" label="房屋信息" width="120" />

        <el-table-column prop="feeType" label="费用类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.feeType === '物业费' ? 'success' : row.feeType === '电费' ? 'warning' : 'danger'"
              effect="light"
            >
              {{ row.feeType }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 金额列：使用红色高亮 -->
        <el-table-column prop="feeAmount" label="金额 (元)" width="120" align="center">
          <template #default="{ row }">
            <span class="text-red-500 font-bold">¥ {{ row.feeAmount }}</span>
          </template>
        </el-table-column>

        <!-- 状态列：使用 Tag 区分 -->
        <el-table-column prop="billStatus" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.billStatus === 2 ? 'success' : 'info'"
              :effect="row.billStatus === 2 ? 'dark' : 'light'"
            >
              {{ row.billStatus === 2 ? '已缴清' : '待支付' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="生成时间" width="160" />

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <!-- 仅当状态为“未缴”时显示支付按钮 -->
            <el-button
              v-if="row.billStatus === 1"
              size="small"
              type="success"
              @click="handlePay(row.id)"
              :icon="Wallet"
            >
              立即支付
            </el-button>
            <el-button v-else size="small" type="info" disabled>已结清</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[5, 10, 15, 20]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 3. 模拟支付弹窗 -->
    <el-dialog v-model="dialogVisible" title="模拟支付确认" width="30%">
      <div class="text-center">
        <p class="text-xl font-semibold mb-4 text-gray-700">确认支付该笔账单吗？</p>
        <p class="text-red-600 font-bold text-2xl mb-6">¥ {{ feeList.find(item => item.id === currentBillId)?.feeAmount || 0 }}</p>
        <el-button type="primary" size="large" @click="confirmPay" class="w-32">
          确认支付
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
</style>
