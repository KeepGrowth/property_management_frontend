<template>
  <div class="chart-container">
    <!-- 图表挂载点 -->
    <div ref="chartRef" class="chart-ref"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

// --- 1. 默认数据 (小区物业报修类型) ---
const defaultData = [
  { value: 1048, name: '水电维修' },
  { value: 735, name: '公共设施' },
  { value: 580, name: '房屋修缮' },
  { value: 484, name: '门禁安防' },
  { value: 300, name: '其他报修' },
];

// --- 2. Props 定义 (支持外部传入数据) ---
const props = defineProps({
  chartData: {
    type: Array,
    default: () => [
      { value: 1048, name: '水电维修' },
      { value: 735, name: '公共设施' },
      { value: 580, name: '房屋修缮' },
      { value: 484, name: '门禁安防' },
      { value: 300, name: '其他报修' },
    ],
  },
  title: {
    type: String,
    default: '报修类型分布',
  }
});

// --- 3. 初始化与响应式 ---
const chartRef = ref(null);
let myChart = null;

// 极简风格配色 (莫兰迪色系/柔和色系)
const colorPalette = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

const initChart = () => {
  if (!chartRef.value) return;

  // 初始化实例
  myChart = echarts.init(chartRef.value);

  const option = {
    // 标题配置
    title: {
      text: props.title,
      left: 'center',
      top: '20',
      textStyle: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    // 提示框
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // 白色背景更清爽
      borderColor: '#eee',
      textStyle: { color: '#666' }
    },
    // 图例
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#666'
      }
    },
    // 颜色配置
    color: colorPalette,
    // 系列配置
    series: [
      {
        name: '报修类型',
        type: 'pie',
        radius: ['40%', '70%'], // 环形图设计，比实心饼图更现代
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5, // 扇区圆角
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false, // 极简风格：默认不显示扇区文字，通过 tooltip 和 legend 展示
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: '{b}\n{c}次', // 悬停时显示 名称 + 数量
            color: '#333'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: false
        },
        data: props.chartData
      }
    ]
  };

  myChart.setOption(option);
};

// --- 4. 生命周期与监听 ---

// 监听窗口大小变化，实现响应式
const handleResize = () => {
  myChart?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose(); // 销毁实例，防止内存泄漏
});

// 监听数据变化，动态更新图表
watch(() => props.chartData, (newData) => {
  myChart?.setOption({ series: [{ data: newData }] });
}, { deep: true });

</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px; /* 最小高度 */
  background-color: #fff;
  border-radius: 8px;
  /* 可选：添加轻微阴影增加层次感 */
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
}

.chart-ref {
  width: 100%;
  height: 100%;
}
</style>
