<script setup>
import { ref, reactive, onMounted, markRaw } from 'vue'
import {
  ElCard,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn,
  ElTag,
  ElSwitch,
  ElTooltip,
  ElMessageBox,
  ElMessage, ElNotification, ElPagination
} from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import useNoticeStore from '@/stores/notice.js'

// 1. 定义数据模型
const noticeList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 搜索表单
const queryParams = reactive({
  noticeTitle: '',
  noticeType: '',
  page: 1,
  pageSize: 10
})

// 公告表单 (用于新增/编辑)
const noticeForm = reactive({
  id: null,
  noticeTitle: '',
  noticeType: '',
  noticeContent: '',
  status: 1 // 默认启用
})

// 表单验证规则
const rules = {
  noticeTitle: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择公告类型', trigger: 'change' }]
}

// 数据 ( API 调用)
const total = ref()
const fetchNoticeList = async () => {
  const res = await noticeStore.getNoticeList(queryParams)
  if (res.code === 200) {
    noticeList.value = res?.data.records
    total.value = res.data.total
  } else {
    ElNotification.error({
      title: '数据获取失败',
      message: '请检查网络。'
    })
  }
}

// 2. 交互逻辑
const noticeStore = useNoticeStore()
// 搜索功能 (模拟)
const handleSearch = () => {
  loading.value = true
  setTimeout(async () => {
    // 这里应该是 filter 过滤逻辑或者 API 请求
    console.log(queryParams)
    await fetchNoticeList()
    loading.value = false
    ElMessage.success(`搜索 "${queryParams.noticeTitle}" 完成`)
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  queryParams.noticeTitle = ''
  queryParams.noticeType = ''
  fetchNoticeList()
}

// 打开新增对话框
const openAddDialog = () => {
  dialogTitle.value = '新增公告'
  isEdit.value = false
  // 重置表单
  noticeForm.id = null
  noticeForm.noticeTitle = ''
  noticeForm.noticeType = ''
  noticeForm.noticeContent = ''
  noticeForm.status = 1
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑公告'
  isEdit.value = true
  // 深拷贝数据到表单
  Object.assign(noticeForm, { ...row })
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  // 这里应该调用 API
  if (noticeForm.id) {
    // 编辑逻辑
    await noticeStore.updateNotice(noticeForm)
    await ElMessageBox.alert('修改成功！', '提示', { type: 'success' })
    dialogVisible.value = false
    await fetchNoticeList() // 刷新列表
  } else {
    // 新增逻辑
    await noticeStore.addNotice(noticeForm)
    await ElMessageBox.alert('新增成功！', '提示', { type: 'success' })
    dialogVisible.value = false
    await fetchNoticeList() // 刷新列表
  }
  console.log('提交数据:', noticeForm)


}

// 切换状态
const changeStatus = (row) => {
  ElMessageBox.confirm(`确定将 "${row.noticeTitle}" 的状态修改为 ${row.status ? '启用' : '禁用'} 吗?`, '警告', {
    type: 'warning'
  }).then(async () => {

    // 调用 API 修改状态-1为发布，0为草稿
    const res = await noticeStore.changeNoticeStatus(row.id, row.status === 1 ? 0 : 1)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      await fetchNoticeList()
    } else {
      ElMessage.error('更新失败，请检查网络。')
    }

  }).catch(() => {
    // 如果用户取消，回滚状态
    row.status = row.status === 1 ? 0 : 1
  })
}

// 删除操作
const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除该公告吗？此操作不可恢复', '警告', { type: 'error' }).then(() => {
    noticeList.value = noticeList.value.filter(item => item.id !== id)
    ElMessage.success('删除成功')
  })
}

// 3. 生命周期
onMounted(() => {
  fetchNoticeList()
})
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- 顶部卡片：搜索与操作 -->
    <el-card shadow="hover" class="bg-gradient-to-r from-blue-50 to-white">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold text-gray-800">📋 公告筛选</span>
          <el-button
            type="primary"
            :icon="Plus"
            @click="openAddDialog"
            class="transition-transform hover:scale-105"
          >
            新增公告
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="queryParams" label-width="80px" class="flex flex-wrap gap-2" @submit.prevent>
        <el-form-item label="公告标题">
          <el-input
            v-model="queryParams.noticeTitle"
            placeholder="请输入公告标题"
            clearable
            class="w-40"
          />
        </el-form-item>
        <el-form-item label="公告类型" style="width: 200px">
          <el-select v-model="queryParams.noticeType" placeholder="请选择" clearable class="w-32">
            <el-option label="维护" :value=1 />
            <el-option label="停供" :value=2 />
            <el-option label="活动" :value=3 />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="border-t-4 border-blue-500">
      <el-table
        :data="noticeList"
        style="width: 100%"
        stripe
        :loading="loading"
        header-cell-class-name="bg-gray-50 font-medium text-gray-700"
      >
        <el-table-column prop="noticeTitle" label="公告标题" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.noticeTitle" placement="top">
              <span class="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">{{ row.noticeTitle }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="noticeContent" label="公告内容" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.noticeContent" placement="top">
              <span class="font-medium hover:text-blue-800 cursor-pointer">{{ row.noticeContent }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="noticeType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.noticeType === 1 ? 'success' : row.noticeType === 2 ? 'warning' : 'danger'"
              effect="dark"
            >
              {{ row.noticeType === 1 ? '维护' : row.noticeTyoe === 2 ? '停水停电' : row.noticeTyoe === 3 ? '社区活动' : '调整'
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="publishTime" label="发布时间" width="160" align="center" />

        <el-table-column prop="status" label="状态" width="180" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status===1?'success':'warning'">{{ row.status===1?'启用':'禁用' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
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
        @size-change="fetchNoticeList"
        @current-change="fetchNoticeList"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500"
      center
    >
      <el-form :model="noticeForm" :rules="rules" label-width="90px">
        <el-form-item label="公告标题" prop="noticeTitle">
          <el-input v-model="noticeForm.noticeTitle" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="公告类型" prop="noticeType">
          <el-select v-model="noticeForm.noticeType" placeholder="请选择类型" class="w-full">
            <el-option label="园区维护" :value=1 />
            <el-option label="停水停电" :value=2 />
            <el-option label="社区活动" :value=3 />
            <el-option label="费用调整" :value=4 />
          </el-select>
        </el-form-item>
        <el-form-item label="公告内容" prop="noticeContent">
          <el-input
            v-model="noticeForm.noticeContent"
            type="textarea"
            :rows="4"
            placeholder="请输入公告详细内容..."
          />
        </el-form-item>
        <el-form-item label="默认状态">
          <el-radio-group v-model="noticeForm.status">
            <el-radio :label="1" :value=1>启用</el-radio>
            <el-radio :label="0" :value=0>禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 自定义表格表头背景色 */
:deep(.el-table th.el-table__cell) {
  background-color: #f8fafc !important;
}

/* 按钮悬停微动效 */
:deep(.el-button--primary) {
  transition: all 0.3s ease;
}
</style>
