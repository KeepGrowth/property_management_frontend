<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElTabs, ElTabPane, ElButton, ElLink, ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import useUserStore from '@/stores/user'

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

const userStore = useUserStore()
// 模拟登录逻辑
const handleLogin = () => {
  loginFormRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const res = await userStore.login(loginForm.value)
      if (res?.code === 200) {
        loading.value = false
        ElMessage.success('登录成功！')
        router.push('/home/index')
      } else {
        ElMessage.error(res?.msg)
        loading.value = false
      }
    } else {
      ElMessage.error('请检查输入信息')
    }
    loading.value = false
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
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-cyan-400 items-center justify-center p-12">
      <div class="text-white text-center max-w-md">
        <h1 class="text-4xl font-bold mb-4">小区物业管理系统</h1>
        <p class="text-xl mb-8">基于SpringBoot+Vue3的智慧社区，便捷生活</p>
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
            欢迎登录
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
                <ElLink type="primary" :underline="false">有问题请联系物业</ElLink>
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

        </ElTabs>

        <!-- 底部提示 -->
        <div class="text-center text-sm text-gray-500">
          <p>💡 演示账号：</p>
          <p>业主：123 / 123 | 物业：1234 / 1234 | 管理员:123456 /123456</p>
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
