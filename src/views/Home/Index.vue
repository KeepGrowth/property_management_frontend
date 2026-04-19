<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import useUserStore from '@/stores/user.js'
import LineChart from '@/component/charts/LineChart.vue'
import PieChart from '@/component/charts/PieChart.vue'

// --- 1. 模拟数据 (实际开发中应从 API 获取) ---
const userStore = useUserStore()
const currentRole = computed(() => userStore.userInfo?.userType)

// 核心统计数据
const statsData = ref([
  { label: '待缴费', value: 12, icon: '💰', color: 'bg-green-500' },
  { label: '待处理报修', value: 3, icon: '🔧', color: 'bg-yellow-500' }
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


//新闻模块处理
const newsList = [
  {
    title: '全球科技峰会圆满落幕，人工智能成最大亮点',
    desc: '为期三天的全球科技峰会在昨日落下帷幕，来自世界各地的专家共同探讨了AI未来的发展方向。',
    category: '科技',
    href: 'https://news.qq.com/rain/a/20260419A03VC400',
    date: '2026-04-19',
    color: '#409EFF' // 蓝色
  },
  {
    title: '新能源汽车销量持续走高，市场份额突破30%',
    desc: '据最新数据显示，本季度新能源汽车市场表现强劲，绿色环保出行已成为主流趋势。',
    category: '财经',
    href: 'https://mp.weixin.qq.com/s?__biz=MjM5NDUwMzY2MA==&mid=2651882000&idx=5&sn=0499f7ad5ada015780ab136f99312720&chksm=bcd30dda786e09bdff5d9a10cc1948de196600f63aa970984149229b1dfea2c1fa9539222e85&3rd=MjM5NzM2NjUzNg==&scene=8#rd',
    date: '2026-04-18',
    color: '#67C23A' // 绿色
  },
  {
    title: '城市马拉松赛周末开跑，万名跑友齐聚',
    desc: '一年一度的城市马拉松将于本周末鸣枪开跑，组委会提醒市民注意交通管制信息。',
    category: '体育',
    href: 'https://news.qq.com/rain/a/20260419A05LTF00',
    date: '2026-04-17',
    color: '#E6A23C' // 橙色
  },
  {
    title: '最新研究发现：深海探测发现新物种',
    desc: '科研团队在太平洋深海区域发现了一种从未见过的发光生物，为海洋生物学研究提供了新线索。',
    category: '科学',
    date: '2026-04-16',
    href: 'https://news.qq.com/rain/a/20260419A02OO200',
    color: '#F56C6C' // 红色
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 顶部欢迎栏 -->
    <div class="mb-6 bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">欢迎回来，{{ userStore.userInfo?.realName || '用户' }}！</h1>
        <p class="text-gray-500 mt-1">这里是小区物业管理系统工作台</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500">当前角色：{{ currentRole === 1 ? '业主' : currentRole === 2 ? '物业' : '管理员'
          }}</p>
        <p class="text-sm text-gray-500 mt-1">系统时间：{{ new Date().toLocaleString() }}</p>
      </div>
    </div>

    <!-- 核心快捷入口卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- 待缴费卡片 -->
      <router-link :to="currentRole===1?'/home/owner/fee':'/home/property/fee'"
                   v-if="currentRole!==3"
                   class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-l-blue-500">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-full">
            <i class="el-icon-money text-blue-500 text-2xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-800">账单管理</h3>
            <p class="text-gray-500 text-sm">管理待缴费用</p>
          </div>
        </div>
      </router-link>

      <!-- 待报修卡片 -->
      <router-link :to="currentRole===1?'/home/owner/repair':'/home/property/repair'"
                   v-if="currentRole!==3"
                   class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-l-green-500">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-full">
            <i class="el-icon-s-opportunity text-green-500 text-2xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-800">报修管理</h3>
            <p class="text-gray-500 text-sm">管理维修事项</p>
          </div>
        </div>
      </router-link>

      <!-- 公告卡片 -->
      <router-link :to="currentRole===1?'/home/owner/notice':'/home/property/notice'"
                   v-if="currentRole!==3"
                   class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-l-purple-500">
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
      <router-link to="/home/admin/user"
                   v-if="currentRole===3"
                   class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-l-purple-500">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-full">
            <i class="el-icon-s-order text-purple-500 text-2xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-800">用户管理</h3>
            <p class="text-gray-500 text-sm">管理系统用户</p>
          </div>
        </div>
      </router-link>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!--新闻轮播图-->
        <div class="news-carousel-container">
          <h3>📰 最近新闻</h3>

          <!--
            height: 轮播图高度
            indicator-position: 指示器位置 (none / outside / inside)
            interval: 自动播放间隔 (毫秒)
            trigger: 触发方式 (hover / click)
          -->
          <el-carousel height="300px" indicator-position="outside" :interval="4000">

            <el-carousel-item v-for="(item, index) in newsList" :key="index">
              <a :href="item.href" target="_blank">
                <div class="news-card cursor-pointer">
                  <!-- 模拟图片区域 -->
                  <div class="news-image" :style="{ backgroundColor: item.color }">
                    <span class="news-tag">{{ item.category }}</span>
                  </div>
                  <!-- 文字内容区域 -->
                  <div class="news-content">
                    <h4 class="news-title">{{ item.title }}</h4>
                    <p class="news-desc">{{ item.desc }}</p>
                  </div>
                </div>
              </a>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>

    </div>

    <!-- 数据概览与图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- 右侧：图表区域 -->
      <div class="lg:col-span-2 space-y-6">
        <line-chart
          :title="currentRole===1?'我的缴费':'业主缴费情况统计'"
        />
      </div>
      <div class="lg:col-span-1 space-y-6">
        <pie-chart
          :title="currentRole===1?'我的报修':'业主申请的报修分布'"
        />
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


<style scoped>
.news-carousel-container {
  margin: 20px auto;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.news-carousel-container h3 {
  margin-bottom: 15px;
  color: #303133;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

/* 轮播卡片整体样式 */
.news-card {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 图片区域 */
.news-image {
  width: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.news-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

/* 文字内容区域 */
.news-content {
  width: 60%;
  padding: 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.news-title {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #303133;
  line-height: 1.4;
}

.news-desc {
  margin: 0 0 20px 0;
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  /* 限制行数 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  color: #C0C4CC;
  font-size: 12px;
}

/* 响应式调整：手机端竖向排列 */
@media (max-width: 600px) {
  .news-card {
    flex-direction: column;
  }

  .news-image {
    width: 100%;
    height: 150px;
  }

  .news-content {
    width: 100%;
    padding: 20px;
  }

  .news-title {
    font-size: 18px;
  }
}
</style>
