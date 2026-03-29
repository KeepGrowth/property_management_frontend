<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import useUserStore from '@/stores/user.js'

// --- 1. 模拟数据 (实际开发中应从 API 获取) ---
const userStore = useUserStore()
const currentRole = computed(() => userStore.userInfo?.user_type || 'owner')

// 核心统计数据
const statsData = ref([
  { label: '今日访客', value: 24, icon: '👥', color: 'bg-blue-500' },
  { label: '待缴费', value: 12, icon: '💰', color: 'bg-green-500' },
  { label: '待处理报修', value: 3, icon: '🔧', color: 'bg-yellow-500' },
  { label: '已入住', value: 89, icon: '🏠', color: 'bg-purple-500' }
])

// --- 2. Echarts 图表初始化 ---
let paymentChart = null
let repairChart = null

onMounted(() => {
  // 延迟初始化图表，确保 DOM 渲染完成
  setTimeout(() => {
    initPaymentChart()
    initRepairChart()
  }, 300)
})

const initPaymentChart = () => {
  paymentChart = echarts.init(document.getElementById('paymentChart'))
  const option = {
    title: { text: '月度缴费统计', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: { type: 'value' },
    series: [{
      name: '缴费金额',
      type: 'line',
      data: [1200, 1320, 1010, 1340, 900, 2300, 2100, 2500, 2200, 2000, 2400, 2800],
      smooth: true, // 平滑曲线
      areaStyle: { color: 'rgba(54, 162, 235, 0.2)' }, // 填充区域，增加美观度
      itemStyle: { color: '#3b82f6' } // 蓝色
    }]
  }
  paymentChart.setOption(option)
  window.addEventListener('resize', () => paymentChart?.resize())
}

const initRepairChart = () => {
  repairChart = echarts.init(document.getElementById('repairChart'))
  const option = {
    title: { text: '报修类型分布', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', show: false },
    series: [{
      name: '报修类型',
      type: 'pie',
      radius: ['40%', '70%'], // 空心环形图，更现代
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: true, formatter: '{b}: {d}%' }, // 显示名称和百分比
      data: [
        { value: 40, name: '水电维修', itemStyle: { color: '#3b82f6' } },
        { value: 20, name: '网络故障', itemStyle: { color: '#10b981' } },
        { value: 15, name: '门窗锁具', itemStyle: { color: '#f59e0b' } },
        { value: 10, name: '电梯故障', itemStyle: { color: '#ef4444' } },
        { value: 15, name: '其他', itemStyle: { color: '#8b5cf6' } }
      ]
    }]
  }
  repairChart.setOption(option)
  window.addEventListener('resize', () => repairChart?.resize())
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 顶部欢迎栏 -->
    <div class="mb-6 bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">欢迎回来，{{ userStore.userInfo?.real_name || '用户' }}！</h1>
        <p class="text-gray-500 mt-1">这里是小区物业管理系统工作台</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500">当前角色：{{ currentRole === 'owner' ? '业主' : currentRole === 'property' ? '物业' : '管理员' }}</p>
        <p class="text-sm text-gray-500 mt-1">系统时间：{{ new Date().toLocaleString() }}</p>
      </div>
    </div>

    <!-- 核心快捷入口卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- 待缴费卡片 -->
      <router-link to="/home/owner/fee" class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-l-blue-500">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-full">
            <i class="el-icon-money text-blue-500 text-2xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-800">我的账单</h3>
            <p class="text-gray-500 text-sm">查看待缴物业费/水电费</p>
          </div>
        </div>
      </router-link>

      <!-- 待报修卡片 -->
      <router-link to="/home/owner/repair" class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-l-green-500">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-full">
            <i class="el-icon-s-opportunity text-green-500 text-2xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-800">我的报修</h3>
            <p class="text-gray-500 text-sm">提交新的维修申请</p>
          </div>
        </div>
      </router-link>

      <!-- 公告卡片 -->
      <router-link to="/home/owner/notice" class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-l-purple-500">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-full">
            <i class="el-icon-s-order text-purple-500 text-2xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-800">小区公告</h3>
            <p class="text-gray-500 text-sm">查看最新停水停电通知</p>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 数据概览与图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：数据概览卡片 -->
      <div class="lg:col-span-1 space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">核心数据</h2>

        <div v-for="(stat, index) in statsData" :key="index" class="bg-white rounded-lg shadow p-4 flex items-center transition-transform hover:scale-105 duration-200">
          <div :class="`${stat.color} p-3 rounded-full text-white text-xl`">
            {{ stat.icon }}
          </div>
          <div class="ml-4">
            <p class="text-gray-500 text-sm">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-800">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧：图表区域 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 月度缴费统计 (折线图) -->
        <div class="bg-white rounded-lg shadow p-4 h-64">
          <div id="paymentChart" class="w-full h-full"></div>
        </div>

        <!-- 报修类型分布 (饼图) -->
        <div class="bg-white rounded-lg shadow p-4 h-64">
          <div id="repairChart" class="w-full h-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保图表容器有固定高度 */
#paymentChart, #repairChart {
  width: 100%;
  height: 100%;
}
</style>
