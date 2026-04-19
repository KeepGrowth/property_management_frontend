<template>
  <div class="chart-container" ref="chartRef"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

// --- Props 定义 ---
const props = defineProps({
  // 允许外部传入数据，如果不传则使用默认数据
  chartData: {
    type: Object,
    default: () => ({})
  },
  // 图表标题
  title: {
    type: String,
    default: '缴费情况统计'
  },
  // 图表高度
  height: {
    type: String,
    default: '350px'
  }
});

// --- 默认数据 ---
const defaultData = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [1200, 1320, 1010, 1340, 1900, 2300]
};

// --- 响应式引用 ---
const chartRef = ref(null);
let myChart = null;

// --- ECharts 配置项 ---
const getOption = () => {
  const data = Object.keys(props.chartData).length ? props.chartData : defaultData;

  return {
    // 标题配置
    title: {
      text: props.title,
      left: 'center',
      top: 20,
      textStyle: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500'
      }
    },
    // 提示框
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: 'transparent',
      textStyle: {
        color: '#fff'
      },
      formatter: '{b}: ¥{c}'
    },
    // 网格布局 (极简风格：去左右边距，留上下边距)
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    // X轴配置
    xAxis: {
      type: 'category',
      boundaryGap: false, // 曲线从0开始，不留白
      data: data.xAxis,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#E0E0E0' // 极淡的灰色线条
        }
      },
      axisTick: {
        show: false // 隐藏刻度
      },
      axisLabel: {
        color: '#999',
        margin: 15
      }
    },
    // Y轴配置
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed', // 虚线
          color: '#E0E0E0'
        }
      },
      axisLabel: {
        color: '#999',
        formatter: (value) => {
          // 将数值转换为千元单位显示，保持简洁
          return value >= 1000 ? `${value / 1000}k` : value;
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      }
    },
    // 系列配置
    series: [
      {
        name: '缴费金额',
        type: 'line',
        smooth: true, // 平滑曲线
        symbol: 'circle', // 拐点样式
        symbolSize: 8,
        sampling: 'average',
        itemStyle: {
          color: '#5470C6' // 主色调：极简蓝
        },
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#5470C6' },
              { offset: 1, color: '#91CC75' } // 渐变色效果
            ]
          }
        },
        areaStyle: {
          // 渐变填充背景
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
          ])
        },
        data: data.series
      }
    ]
  };
};

// --- 初始化与Resize ---
const initChart = () => {
  if (!chartRef.value) return;

  // 初始化实例
  myChart = echarts.init(chartRef.value);
  myChart.setOption(getOption());
};

// --- 监听窗口大小变化 ---
const handleResize = () => {
  myChart && myChart.resize();
};

// --- 生命周期 ---
onMounted(() => {
  nextTick(() => {
    initChart();
  });
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
});

// --- 监听数据变化 ---
watch(() => props.chartData, () => {
  myChart && myChart.setOption(getOption());
}, { deep: true });

watch(() => props.title, () => {
  myChart && myChart.setOption(getOption());
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: v-bind(height);
  background-color: #fff;
  border-radius: 8px; /* 圆角卡片风格 */
  /* 可选：添加轻微阴影增加层次感 */
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); */
}
</style>
