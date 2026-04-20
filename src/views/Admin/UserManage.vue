<script setup>
import { ref, onMounted } from 'vue'
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElPagination
} from 'element-plus'
import { Search, Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import useUserStore from '@/stores/user.js'

// 1. 定义数据模型 (模拟或对接后端)
const userList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

// 搜索表单
const queryParams = ref({
  username: '',
  realName: '',
  userType: null,
  page: 1,
  pageSize: 10
})
const total = ref()

// 表单数据 (用于弹窗)
const formData = ref({
  id: null,
  username: '',
  realName: '',
  phone: '',
  userType: '1', // 默认业主
  status: '1' // 默认启用
})

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

// 2. 模拟数据 (实际开发中替换为 API 调用)
const mockData = [
  { id: 1, username: 'admin', realName: '系统管理员', phone: '13800000000', userType: '3', status: '1' },
  { id: 2, username: 'owner001', realName: '张三', phone: '13900000001', userType: '1', status: '1' },
  { id: 3, username: 'staff001', realName: '李四', phone: '13900000002', userType: '2', status: '0' }
]

// 角色映射 (用于显示)
const roleMap = {
  '1': { label: '业主', type: 'success' },
  '2': { label: '物业人员', type: 'warning' },
  '3': { label: '管理员', type: 'danger' }
}

// 状态映射
const statusMap = {
  '1': { label: '正常', type: 'primary' },
  '0': { label: '禁用', type: 'info' }
}

// 3. 核心方法
const userStore = useUserStore()
// 获取列表
const fetchList = async () => {
  loading.value = true
  const res = await userStore.queryUserList(queryParams.value)
  if (res.code === 200) {
    userList.value = res.data.records
    total.value = res.data.total
    loading.value = false
    ElNotification.success('用户数据获取成功')
  } else {
    ElNotification.error('数据获取失败，请检查网络')
  }
}

// 重置搜索
const handleReset = async () => {
  queryParams.value = { username: '', real_name: '', userType: '' }
  await fetchList(queryParams.value)
}

// 打开新增弹窗
const handleAdd = () => {
  isEdit.value = false
  formData.value = { id: null, username: '', realName: '', phone: '', userType: 1, status: 1 }
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (isEdit.value) {
    const res = await userStore.updateUser(formData.value)
    if (res.code === 200) {
      ElMessage.success(`更新用户 ${formData.value.realName} 成功`)
      await fetchList(queryParams.value)
    }
  } else {
    const res = await userStore.addUser(formData.value)
    if (res.code === 200) {
      ElMessage.success(`更新用户 ${formData.value.realName} 成功`)
      await fetchList(queryParams.value)
    }
  }
  dialogVisible.value = false
  await fetchList() // 刷新列表
}

// 删除用户
const handleDelete = async (id) => {
  ElMessageBox.confirm(`确定要删除用户吗？删除后不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    center: true
  }).then(async () => {
    const res = await userStore.delUser(id)
    if (res.code===200){
      ElMessage.success('删除成功')
      await fetchList() // 刷新
    }else{
      ElMessage.error('删除失败')
    }

  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchList()
})
</script>

<template>
  <!-- 容器：添加内边距和背景色，使用 Tailwindcss 美化 -->
  <div class="p-4 bg-gray-50 min-h-screen">

    <!-- 卡片容器：白色背景，圆角，阴影 -->
    <el-card class="shadow-md rounded-lg overflow-hidden border-none w-full">

      <!-- 卡片标题：物业人员管理 -->
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-800">物业人员管理</h3>
          <div class="flex space-x-2">
            <!-- 刷新按钮 -->
            <el-button
              :icon="Refresh"
              circle
              @click="fetchList"
              :loading="loading"
              class="border-gray-300 hover:bg-blue-50"
            />
          </div>
        </div>
      </template>

      <!-- 搜索与操作区域 -->
      <div class="mb-4 space-y-4">

        <!-- 搜索表单 -->
        <el-form :inline="true" :model="queryParams" class="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-2">
          <el-form-item label="账号">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入账号"
              clearable
              class="w-32"
            />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input
              v-model="queryParams.realName"
              placeholder="请输入姓名"
              clearable
              class="w-32"
            />
          </el-form-item>
          <el-form-item label="角色" style="width: 200px">
            <el-select v-model="queryParams.userType" placeholder="请选择角色" clearable class="w-32">
              <el-option label="业主" :value="1" />
              <el-option label="物业人员" :value="2" />
              <el-option label="管理员" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="fetchList">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 操作按钮 -->
        <el-button type="success" :icon="Plus" @click="handleAdd">
          新增人员
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="userList"
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#1e293b', fontWeight: '600' }"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID"  />
        <el-table-column prop="username" label="账号"  />
        <el-table-column prop="realName" label="姓名"  />
        <el-table-column prop="phone" label="手机号"  />

        <!-- 角色列：使用 Tag 标签可视化 -->
        <el-table-column prop="userType" label="角色" >
          <template #default="scope">
            <el-tag
              :type="roleMap[scope.row.userType]?.type || 'info'"
              effect="dark"
              class="text-xs px-2 py-1"
            >
              {{ roleMap[scope.row.userType]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" >
          <template #default="scope">
            <el-tag
              :type="statusMap[scope.row.status]?.type || 'info'"
              :effect="scope.row.status === '1' ? 'dark' : 'plain'"
            >
              {{ statusMap[scope.row.status]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" >
          <template #default="scope">
            <el-button
              size="small"
              :icon="Edit"
              type="warning"
              @click="handleEdit(scope.row)"
              class="mr-2"
            >
              编辑
            </el-button>
<!--            <el-button-->
<!--              size="small"-->
<!--              :icon="Delete"-->
<!--              type="danger"-->
<!--              @click="handleDelete(scope.row.id)"-->
<!--            >-->
<!--              删除-->
<!--            </el-button>-->
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '新增用户'"
      v-model="dialogVisible"
      width="40%"
      center
    >
      <el-form :model="formData" :rules="rules" label-width="80px" ref="formRef">
        <el-form-item label="账号" prop="username">
          <el-input v-model="formData.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="userType">
          <el-radio-group v-model="formData.userType">
            <el-radio label="1" :value="1">业主</el-radio>
            <el-radio label="2" :value="2">物业人员</el-radio>
            <el-radio label="3" :value="3">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <!-- 如果是新增，显示密码设置 -->
        <el-form-item label="密码" v-if="!isEdit" prop="password">
          <el-input type="password" v-model="formData.password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped>
/* 自定义一些样式 */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.text-gray-800 {
  color: #1f2937;
}

.font-bold {
  font-weight: 700;
}

/* 表格行悬停效果 */
.el-table :deep(.el-table__body tr:hover > td) {
  background-color: #f0f9ff !important;
}
</style>
