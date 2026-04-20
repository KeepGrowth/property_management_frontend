import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from '@/stores/user.js'
import { ElMessage } from 'element-plus'

// 定义公共路由（不需要登录即可访问）
const publicRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'), // 假设登录页在 views 目录下
    meta: { title: '登录系统', requiresAuth: false }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { title: '页面不存在' }
  },
  {
    // 重定向：访问根路径 / 时跳转到登录页
    path: '/',
    redirect: '/login'
  }
]

// 定义主布局及受保护的路由（需要登录后访问）
const protectedRoutes = [
  {
    path: '/home',
    name: 'HomeLayout',
    component: () => import('@/Layout/HomeLayout.vue'), // 假设主布局组件在此路径
    meta: { title: '工作台', requiresAuth: true, roles: [1, 2, 3] },
    children: [
      // A. 首页与通用模块 (所有角色可见)
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/Home/Index.vue'),
        meta: { title: '首页', icon: 'HomeFilled', roles: [1, 2, 3] }
      },
      {
        path: 'personal',
        name: 'Personal',
        component: () => import('@/views/Home/Personal.vue'),
        meta: { title: '个人中心', icon: 'User', roles: [1, 2, 3] }
      },

      // B. 管理员模块 (仅 admin 可见)
      {
        path: 'admin/user',
        name: 'AdminUser',
        component: () => import('@/views/Admin/UserManage.vue'),
        meta: { title: '用户管理', icon: 'Operation', roles: [3] }
      },

      // C. 物业模块 (仅 property 可见)
      {
        path: 'property/house',
        name: 'PropertyHouse',
        component: () => import('@/views/Property/HouseList.vue'),
        meta: { title: '房屋管理', icon: 'Building', roles: [2] }
      },
      {
        path: 'property/fee',
        name: 'PropertyFee',
        component: () => import('@/views/Property/FeeList.vue'),
        meta: { title: '账单管理', icon: 'Money', roles: [2] }
      },
      {
        path: 'property/repair',
        name: 'PropertyRepair',
        component: () => import('@/views/Property/RepairList.vue'),
        meta: { title: '报修处理', icon: 'Tickets', roles: [2] }
      },
      {
        path: 'property/notice',
        name: 'PropertyNotice',
        component: () => import('@/views/Property/NoticeList.vue'),
        meta: { title: '公告管理', icon: 'Notification', roles: [2] }
      },
      {
        path: 'property/parking',
        name: 'PropertyParking',
        component: () => import('@/views/Property/ParkingList.vue'),
        meta: { title: '车位管理', icon: 'Notification', roles: [2] }
      },

      // D. 业主模块 (仅 owner 可见)
      {
        path: 'owner/fee',
        name: 'OwnerFee',
        component: () => import('@/views/Owner/FeeList.vue'),
        meta: { title: '我的账单', icon: 'Wallet', roles: [1] }
      },
      {
        path: 'owner/repair',
        name: 'OwnerRepair',
        component: () => import('@/views/Owner/RepairList.vue'),
        meta: { title: '我的报修', icon: 'Service', roles: [1] }
      },
      {
        path: 'owner/notice',
        name: 'OwnerNotice',
        component: () => import('@/views/Owner/NoticeList.vue'),
        meta: { title: '公告查看', icon: 'Document', roles: [1] }
      },
      {
        path: 'owner/parking',
        name: 'OwnerParking',
        component: () => import('@/views/Owner/ParkingList.vue'),
        meta: { title: '公告查看', icon: 'Document', roles: [1] }
      }
    ]
  },
  // 捕获所有未定义的路由，跳转到 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 合并路由
const routes = [...publicRoutes, ...protectedRoutes]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫 (导航守卫)
// 作用：控制页面跳转时的权限验证
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 1. 获取 Token (假设存储在 localStorage 中)
  const token = userStore.token

  // 2. 如果访问的是不需要登录的页面 (如 login)，直接放行
  if (!to.meta.requiresAuth) {
    next()
    return
  }


  // 3. 如果访问的是需要登录的页面
  if (to.meta.roles.includes(userStore.userInfo.userType)) {
    // 有 Token，允许进入
    next()
  } else {
    // 没有 Token，跳转回登录页
    console.log('无法跳转')
    next('/login')
  }
})

export default router
