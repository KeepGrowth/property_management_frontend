<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElTabs, ElTabPane, ElButton, ElLink, ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'

// 定义表单数据类型
interface LoginForm {
  username: string
  password: string
  confirmPassword?: string
}

// 响应式数据
const activeTab = ref('login') // 当前激活的标签页
const loading = ref(false)
const router = useRouter()

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm>>()
const registerFormRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const loginForm = ref<LoginForm>({
  username: '',
  password: ''
})

const registerForm = ref<LoginForm>({
  username: '',
  password: '',
  confirmPassword: ''
})

// 模拟登录逻辑
const handleLogin = () => {
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      // 这里模拟 API 请求
      setTimeout(() => {
        loading.value = false
        ElMessage.success('登录成功！')
        // 模拟跳转到首页 (实际开发中这里会处理 Token)
        router.push('/home/admin/user')
      }, 800)
    } else {
      ElMessage.error('请检查输入信息')
    }
  })
}

// 模拟注册逻辑
const handleRegister = () => {
  registerFormRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        loading.value = false
        ElMessage.success('注册成功，请登录！')
        activeTab.value = 'login' // 注册成功自动切换到登录页
      }, 800)
    }
  })
}

// 密码确认校验规则
const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入的密码不一致!'))
  } else {
    callback()
  }
}

// 表单规则
const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const registerRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ]
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- 左侧宣传栏 -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-cyan-400 items-center justify-center p-12">
      <div class="text-white text-center max-w-md">
        <h1 class="text-4xl font-bold mb-4">小区物业管理系统</h1>
        <p class="text-xl mb-8">智慧社区，便捷生活</p>
        <div class="space-y-4 text-left">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-white rounded-full"></div>
            <span>便捷的报修流程管理</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-white rounded-full"></div>
            <span>可视化的缴费与账单</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-white rounded-full"></div>
            <span>实时的公告与通知</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单栏 -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="w-full max-w-md space-y-8">
        <!-- Logo/标题 -->
        <div class="text-center">
          <div class="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
            <span class="text-2xl">🏠</span>
          </div>
          <h2 class="mt-2 text-2xl font-bold text-gray-900">
            欢迎登录/注册
          </h2>
          <p class="mt-1 text-sm text-gray-500">请使用您的账号进行操作</p>
        </div>

        <!-- Tabs 切换 -->
        <ElTabs v-model="activeTab" stretch class="!w-full">
          <!-- 登录表单 -->
          <ElTabPane label="登录" name="login">
            <ElForm
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              class="mt-6 space-y-6"
              @keyup.enter="handleLogin"
            >
              <ElFormItem prop="username">
                <ElInput
                  v-model="loginForm.username"
                  placeholder="账号 (如: admin 或 业主手机号)"
                  :prefix-icon="User"
                  size="large"
                  clearable
                />
              </ElFormItem>

              <ElFormItem prop="password">
                <ElInput
                  v-model="loginForm.password"
                  type="password"
                  placeholder="密码"
                  :prefix-icon="Lock"
                  size="large"
                  show-password
                />
              </ElFormItem>

              <div class="flex items-center justify-between">
                <ElCheckbox>记住我</ElCheckbox>
                <ElLink type="primary" :underline="false">忘记密码?</ElLink>
              </div>

              <ElButton
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="w-full"
              >
                登录系统
              </ElButton>
            </ElForm>
          </ElTabPane>

          <!-- 注册表单 -->
          <ElTabPane label="注册" name="register">
            <ElForm
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              class="mt-6 space-y-6"
              @keyup.enter="handleRegister"
            >
              <ElFormItem prop="username">
                <ElInput
                  v-model="registerForm.username"
                  placeholder="请输入账号 (手机号/自定义)"
                  :prefix-icon="User"
                  size="large"
                  clearable
                />
              </ElFormItem>

              <ElFormItem prop="password">
                <ElInput
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  size="large"
                  show-password
                />
              </ElFormItem>

              <ElFormItem prop="confirmPassword">
                <ElInput
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  :prefix-icon="Lock"
                  size="large"
                  show-password
                />
              </ElFormItem>

              <ElButton
                type="success"
                size="large"
                :loading="loading"
                @click="handleRegister"
                class="w-full"
              >
                立即注册
              </ElButton>
            </ElForm>
          </ElTabPane>
        </ElTabs>

        <!-- 底部提示 -->
        <div class="text-center text-sm text-gray-500">
          <p>💡 演示账号：</p>
          <p>业主：user / 123456 | 物业：property / 123456 | 管理员:root /123456</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 优化 Element Plus Tabs 的样式 */
:deep(.el-tabs__nav-wrap::after) {
  height: 0 !important;
}
</style>
