<script setup>
import { ref, onMounted } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import useHouseStore from '@/stores/house.js'

const houseStore = useHouseStore()

// 1. 定义响应式数据
const loading = ref(false) // 加载状态
const tableData = ref([]) // 表格数据
const total = ref(0) // 总条数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  buildingNo: null,
  roomNo: null
})




// 3. 核心方法：获取列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟网络延迟，提升用户体验感
    await new Promise(resolve => setTimeout(resolve, 500))

    // 调用数据
    const mockData = await houseStore.getHouseList(queryParams.value)

    tableData.value = mockData?.data.slice(0,50)
    total.value = mockData.total || 1
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 4. 搜索与重置
const handleQuery = async () => {
  queryParams.value.pageNum = 1
  await getList()
}

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    buildingNo: '',
    roomNo: ''
  }
  getList()
}

// 5. 分页处理
const handleSizeChange = (val) => {
  queryParams.value.pageSize = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.value.pageNum = val
  getList()
}

// 6. 操作方法 (暂定)
const handleAdd = () => {
  ElMessage.info('点击了新增按钮（功能待开发）')
  // 这里通常会打开一个弹窗 (Dialog)
}

const handleEdit = (row) => {
  ElMessage.success(`编辑房屋：${row.buildingNo}-${row.roomNo}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除 ${row.buildingNo} 栋 ${row.roomNo} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    ElMessage.success('删除成功')
    // 本地模拟删除，实际需调用 API
    await houseStore.deleteHouse(row.id)
    await getList()
  }).catch((e) => {
    ElMessage.info('已取消删除'+e)
  })
}

// 7. 页面初始化
onMounted(() => {
  getList()
})
</script>

<template>
  <!-- 外层容器，增加呼吸感 -->
  <div class="p-4 bg-gray-50 min-h-screen">

    <!-- 搜索卡片 -->
    <el-card class="box-card mb-4 shadow-md rounded-xl" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold text-gray-800">📋 筛选查询</span>
<!--          <el-button-->
<!--            :icon="Plus"-->
<!--            type="primary"-->
<!--            @click="handleAdd"-->
<!--            class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"-->
<!--          >-->
<!--            新增房屋-->
<!--          </el-button>-->
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="demo-form-inline flex flex-wrap gap-2">
        <el-form-item label="楼栋号">
          <el-input
            v-model="queryParams.buildingNo"
            placeholder="请输入楼栋"
            clearable
            class="w-32"
          />
        </el-form-item>
        <el-form-item label="房号">
          <el-input
            v-model="queryParams.roomNo"
            placeholder="请输入房号"
            clearable
            class="w-32"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery" class="ml-2">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格卡片 -->
    <el-card class="box-card shadow-lg rounded-xl" shadow="hover">
      <template #header>
        <span class="text-lg font-semibold text-gray-800">🏘️ 房屋信息列表</span>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        :stripe="true"
        :border="false"
        class="text-sm"
      >
        <!-- 序号 -->
        <el-table-column label="#序号" type="index" width="80" align="center" />

        <!-- 楼栋与房号 -->
        <el-table-column label="房屋信息" width="180" align="center">
          <template #default="scope">
            <div class="font-medium text-blue-600">{{ scope.row.buildingNo }} 栋</div>
            <div class="text-xs text-gray-500">Room {{ scope.row.roomNo }}</div>
          </template>
        </el-table-column>

        <!-- 房屋属性 -->
        <el-table-column label="属性" align="center">
          <template #default="scope">
            <el-tag type="info" size="small" class="mr-2">单元: {{ scope.row.unitNo }}</el-tag>
            <el-tag type="success" size="small">面积: {{ scope.row.houseArea }}㎡</el-tag>
          </template>
        </el-table-column>

        <!-- 业主信息 -->
        <el-table-column label="业主详情" width="200" align="center">
          <template #default="scope">
            <div class="flex flex-col items-center">
              <span class="font-medium">{{ scope.row.user.realName || '暂无' }}</span>
              <span class="text-xs text-gray-400 mt-1">{{ scope.row.user.phone || '未登记' }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
<!--            <el-button-->
<!--              :icon="Edit"-->
<!--              size="small"-->
<!--              type="primary"-->
<!--              link-->
<!--              @click="handleEdit(scope.row)"-->
<!--            >-->
<!--              编辑-->
<!--            </el-button>-->
            <el-popconfirm
              title="确定删除吗？"
              @confirm="handleDelete(scope.row)"
              cancelButtonType="text"
            >
              <template #reference>
                <el-button :icon="Delete" size="small" type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="flex justify-end mt-4 pt-4 border-t border-gray-100">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="flex items-center"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
</style>
