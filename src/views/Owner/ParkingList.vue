<script setup>
import { ref, onMounted } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElCard,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElTag,
  ElPagination,
  ElDialog,
  ElMessage
} from 'element-plus'
import { Search, Refresh, Wallet } from '@element-plus/icons-vue'
import useFeeStore from '@/stores/fee.js'
import useParkingInfoStore from '@/stores/parking_info.js'

const parkingInfoStore = useParkingInfoStore()
// 模拟数据定义
const feeList = ref([])
const total = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const currentBillId = ref(null)

// 筛选条件
const queryParams = ref({
  parkingNo: '',
  page: 1,
  pageSize: 10,
  isUser: 1
})

// 模拟从后端获取数据
const fetchData = async () => {
  loading.value = true
  // API调用
  const res = await parkingInfoStore.getUserParkingInfoList(queryParams.value)
  setTimeout(() => {
    // 生成模拟数据
    feeList.value = res?.data.records
    total.value = res?.data?.total
    loading.value = false
  }, 800)
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
            车位查询
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
        <el-form-item label="车位号">
          <el-input
            v-model="queryParams.parkingNo"
            placeholder="请输入车位号，不要带#号"
            :prefix-icon="Search"
            class="w-60"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item label="状态" style="width: 300px">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
          >
            <el-option :value="0" :label="'闲置'"></el-option>
            <el-option :value="1" :label="'占用'" ></el-option>
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
        <span class="text-lg font-semibold text-gray-800">车位列表</span>
      </template>

      <el-table
        :data="feeList"
        stripe
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f8fafc', color: '#1e293b', fontWeight: '600' }"
      >
        <!-- 序号列 -->
        <el-table-column type="index" label="序号" align="center" />

        <!-- 核心数据列 -->
        <el-table-column prop="parkingNo" label="车位编号">
          <template #default="{ row }">
            <div class="font-mono text-sm text-blue-600">#{{ row.parkingNo }}</div>
          </template>
        </el-table-column>
        <!-- 状态列：使用 Tag 区分 -->
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 0 ? 'success' : 'warning'"
              :effect="row.status === 0 ? 'dark' : 'light'"
            >
              {{ row.status === 0 ? '闲置' : '占用' }}
            </el-tag>
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
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

  </div>
</template>

<style scoped>
</style>
