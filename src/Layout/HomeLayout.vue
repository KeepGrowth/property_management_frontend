<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElScrollbar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox } from 'element-plus'
import { HomeFilled, Fold, Expand, User, SwitchButton, House, ArrowDown } from '@element-plus/icons-vue'
import useUserStore from '@/stores/user.js'


// 状态管理
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 用户信息 (从 Pinia 或本地获取)
const userInfo = computed(() => userStore?.userInfo || { realName: '管理员', avatar: '' })

// 切换折叠
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '退出提示', {
    type: 'warning'
  }).then(() => {
    router.push('/login')
  })
}

// 下拉菜单点击按钮方法
const handleCommand = (command) => {
  if (command === 'profile') {
    router.push({ name: 'Personal' })

  } else {
    router.push({ name: 'Login' })
  }
}

// 面包屑生成逻辑 (简单版，根据路由 path 生成)
const breadcrumbList = computed(() => {
  // 这里可以根据你的路由 meta.title 进行更复杂的处理
  return route.matched.filter(item => item.meta.title).map(item => item.meta.title)
})
</script>

<template>
  <!-- 根容器：Flex 布局，高度100vh -->
  <el-container class="h-screen bg-gray-100 transition-all duration-300 ease-in-out">

    <!-- 👈 左侧侧边栏 -->
    <el-aside
      :width="isCollapse ? '64px' : '200px'"
      class="bg-gray-900 text-gray-100 border-r border-gray-200 transition-all duration-300 ease-in-out relative"
    >
      <!-- Logo/系统名称 -->
      <div class="flex items-center justify-center h-16 border-b border-gray-700">
        <span v-if="!isCollapse" class="text-xl font-bold text-white">小区物业系统</span>
        <span v-else class="text-xl font-bold text-white">物业</span>
      </div>

      <!-- 菜单区域-->
      <el-scrollbar class="h-[calc(100%-4rem)]">
        <el-menu
          :default-active="$route.path"
          :collapse="isCollapse"
          :router="true"
          :collapse-transition="false"
          background-color="#1f2937"
          text-color="#cbd5e1"
          active-text-color="#3b82f6"
          class="border-0"
        >
          <!-- 首页菜单 -->
          <el-menu-item index="/home/index">
            <el-icon>
              <HomeFilled />
            </el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <!-- 业主模块 (根据角色 v-if 控制显示，此处为示例) -->
          <el-sub-menu index="owner" v-if="userStore.userInfo.user_type===1">
            <template #title>
              <el-icon>
                <User />
              </el-icon>
              <span>业主中心</span>
            </template>
            <el-menu-item index="/home/owner/fee">我的账单</el-menu-item>
            <el-menu-item index="/home/owner/repair">我的报修</el-menu-item>
            <el-menu-item index="/home/owner/notice">查看公告</el-menu-item>
          </el-sub-menu >

          <!-- 物业模块 -->
          <el-sub-menu index="property" v-if="userStore.userInfo.user_type===2">
            <template #title>
              <el-icon>
                <House />
              </el-icon>
              <span>物业管理</span>
            </template>
            <el-menu-item index="/home/property/house">房屋管理</el-menu-item>
            <el-menu-item index="/home/property/fee">账单管理</el-menu-item>
            <el-menu-item index="/home/property/notice">公告管理</el-menu-item>
            <el-menu-item index="/home/property/repair">维修管理</el-menu-item>
          </el-sub-menu>
          <!-- 系统管理员模块 -->
          <el-sub-menu index="admin" v-if="userStore.userInfo.user_type===3">
            <template #title>
              <el-icon>
                <House />
              </el-icon>
              <span>物业管理</span>
            </template>
            <el-menu-item index="/home/admin/user">系统用户管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>

    </el-aside>

    <!-- 👉 右侧主内容区 -->
    <el-container class="flex-1 flex-col overflow-hidden">

      <!-- 顶部导航栏 -->
      <el-header class="bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <!-- 面包屑导航 -->
        <div class="flex items-center">
          <el-button @click="toggleSidebar" type="primary" size="small" circle class="mr-2">
            <el-icon>
              <Fold />
            </el-icon>
          </el-button>
          <el-breadcrumb separator="/" class="text-sm">
            <el-breadcrumb-item :to="{ path: '/home/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 右侧用户操作区 -->
        <div class="flex items-center space-x-4">
          <!-- 欢迎语 -->
          <span class="text-gray-600 text-sm">欢迎，{{ userInfo.real_name }}</span>

          <!-- 头像下拉菜单 -->
          <el-dropdown @command="handleCommand" placement="bottom-end">
            <div class="flex items-center cursor-pointer hover:text-primary">
              <!-- 头像占位符 -->
              <el-avatar :size="32" class="bg-blue-500">U</el-avatar>
              <el-icon class="ml-1">
                <arrow-down />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" :icon="User">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主体内容区域 (Tabs 或 页面内容) -->
      <el-main class="bg-gray-50 p-0 overflow-auto">
        <!-- 使用 Tailwind 的卡片样式包裹视图，增加阴影和圆角 -->
        <div class="m-4 rounded-lg shadow-lg bg-white transition-all duration-200">
          <!-- 路由视图 -->
          <!-- 注意：这里使用了 keep-alive 缓存页面状态，提升体验 -->
          <div class="p-6">
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" v-if="$route.meta.keepAlive" />
              </keep-alive>
              <component :is="Component" v-if="!$route.meta.keepAlive" />
            </router-view>
          </div>
        </div>
      </el-main>

      <!-- 底部 (可选) -->
      <el-footer class="text-center text-xs text-gray-400 bg-white border-t border-gray-100">
        版权所有 © 2026 小区物业管理系统 | 毕业设计
      </el-footer>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 深度样式覆盖 ElementPlus 默认样式 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-header) {
  height: 60px;
  line-height: 60px;
}

:deep(.el-footer) {
  height: 40px;
  line-height: 40px;
  font-size: 12px;
}

:deep(.el-aside) {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
</style>
