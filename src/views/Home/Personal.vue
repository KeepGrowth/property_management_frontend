<script setup>
import { ref, reactive, onMounted } from 'vue'
import { User, Lock, EditPen, Upload, Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user' // 假设你使用了 Pinia
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 1. 数据定义 ---
const userStore = useUserStore()
const userInfo = ref({ ...userStore.userInfo }) // 从 Pinia 获取用户信息

// 表单数据
const form = reactive({
  real_name: '',
  phone: '',
})

// 密码表单
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }]
}

// --- 2. 逻辑处理 ---
// 模拟头像上传
const handleAvatarSuccess = (res, file) => {
  ElMessage.success('头像上传成功！')
  // 这里更新 Pinia 和本地显示
  userStore.updateAvatar(file.url)
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJPG) ElMessage.error('上传头像图片只能是 JPG 格式!')
  if (!isLt2M) ElMessage.error('上传头像图片大小不能超过 2MB!')
  return isJPG && isLt2M
}

// 提交基本信息
const submitProfile = async () => {
  // 这里调用 API 更新
  try {
    // await updateProfileAPI(form)
    ElMessage.success('资料更新成功！')
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 提交密码修改
const submitPassword = () => {
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致！')
    return
  }
  // 调用修改密码 API
  // await changePasswordAPI(pwdForm)
  ElMessageBox.alert('密码修改成功，请重新登录', '提示', {
    confirmButtonText: '确定',
    type: 'success',
    callback: () => {
      userStore.logout() // 修改密码后强制退出重新登录
    }
  })
}

// --- 3. 生命周期 ---
onMounted(() => {
  // 初始化表单数据
  form.real_name = userInfo.value.realName || ''
  form.phone = userInfo.value.phone || ''
  form.email = userInfo.value.email || ''
})
</script>

<template>
  <div class="min-h-screen bg-gray-50/80 p-6">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">👤 个人中心</h1>
      <p class="text-gray-500">管理您的账户信息与安全设置</p>
    </div>

    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">

      <!-- 左侧：核心信息与头像 -->
      <div class="lg:col-span-2 space-y-6">

        <!-- 信息卡片 -->
        <el-card class="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl bg-white/60 backdrop-blur-sm border-none">
          <template #header>
            <div class="flex items-center text-lg font-semibold text-gray-700">
               基本信息
            </div>
          </template>

          <el-form :model="form" label-width="100px" class="px-4" size="large">
            <el-form-item label="用户ID" class="text-gray-400">
              <el-tag type="info" size="large">{{ userInfo.id }}</el-tag>
            </el-form-item>

            <el-form-item label="真实姓名">
              <el-input v-model="form.real_name" :placeholder="userInfo.real_name" class="w-full" clearable>
                <template #prefix>
                  <User class="text-gray-400" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="form.phone" :placeholder="userInfo.phone" type="tel" clearable>
                <template #prefix>
                  <i class="el-icon-phone text-gray-400"></i>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="角色">
              <el-tag type="success" size="large" v-if="userInfo.user_type===1">业主</el-tag>
              <el-tag type="success" size="large" v-if="userInfo.user_type===2">物业</el-tag>
              <el-tag type="success" size="large" v-if="userInfo.user_type===3">系统管理员</el-tag>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitProfile" size="large" class="w-full mt-4">
                <Check class="mr-1" /> 保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 密码修改卡片 -->
        <el-card class="shadow-lg bg-white/60 backdrop-blur-sm border-none">
          <template #header>
            <div class="flex items-center text-lg font-semibold text-gray-700">
              修改密码
            </div>
          </template>

          <el-form :model="pwdForm" :rules="pwdRules" label-width="100px" class="px-4" size="large">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" placeholder="请输入旧密码" show-password clearable>
                <template #prefix>
                  <Lock class="text-gray-400" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-tooltip effect="dark" content="建议使用字母+数字组合" placement="top">
                <el-input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码" show-password clearable />
              </el-tooltip>
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password clearable />
            </el-form-item>

            <el-form-item>
              <el-button type="warning" @click="submitPassword" size="large" class="w-full mt-4">
                🔑 修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 右侧：头像与状态 -->
      <div class="lg:col-span-1 space-y-6">

        <!-- 头像上传卡片 -->
        <el-card class="text-center shadow-lg bg-white/60 backdrop-blur-sm border-none">
          <template #header>
            <div class="text-lg font-semibold text-gray-700">🖼️ 头像设置</div>
          </template>

          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userStore.avatar" :src="userStore.avatar" class="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-md" alt="avatar" />
            <el-avatar v-else :size="120" class="shadow-md">
              {{ userInfo.realName?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="mt-4 text-sm text-gray-500">点击上传新头像</div>
            <el-icon class="text-gray-400 text-4xl mt-2"><Upload /></el-icon>
          </el-upload>
        </el-card>

        <!-- 账户状态卡片 -->
        <el-card class="shadow-lg bg-white/60 backdrop-blur-sm border-none">
          <template #header>
            <div class="text-lg font-semibold text-gray-700">📊 账户状态</div>
          </template>
          <div class="space-y-3 text-sm">

            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-gray-500">登录IP:</span>
              <span class="font-medium">192.168.1.100</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-500">账户状态:</span>
              <el-tag type="success" effect="dark">正常</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="text-center space-y-3 mt-4">
          <el-button type="info" plain @click="$router.push('/home/index')" class="w-full">
            返回首页
          </el-button>
          <el-button type="danger" @click="userStore.logout" class="w-full">
            退出登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


</style>
