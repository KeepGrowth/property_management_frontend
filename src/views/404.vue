<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton, ElMessage } from 'element-plus'

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement | null>(null)

// 404 提示语
const messages = [
  '您访问的页面被外星人劫持了 🛸',
  '这里本该有一条路，但程序员把它写丢了 🚧',
  '页面去环游世界了，暂时回不来 🌍',
  '系统提示：前方无路，请原路返回 ⛔'
]
const randomMessage = ref(messages[Math.floor(Math.random() * messages.length)])

// 返回首页
const goHome = () => {
  router.push('/home/index')
}

// --- Canvas 代码雨逻辑 ---
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 适配屏幕
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const fontSize = 16
  const columns = Math.floor(canvas.width / fontSize) // 计算列数

  // 汉字/字符集（可以是二进制 01，也可以是汉字）
  const chars = '01'.split('')
  // 或者使用汉字雨：'雨纷繁世界代码编程客'.split('')

  // 记录每一列的Y坐标
  const drops: number[] = []
  for (let i = 0; i < columns; i++) {
    drops[i] = 1
  }

  // 绘制函数
  const draw = () => {
    // 半透明背景色，制造拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 设置字体和颜色
    ctx.fillStyle = '#39ff14' // 霓虹绿色
    // ctx.fillStyle = '#00FFFF' // 青色 (可选)
    ctx.font = `${fontSize}px monospace`

    // 遍历每一列
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)]
      const x = i * fontSize
      const y = drops[i] * fontSize

      ctx.fillText(text, x, y)

      // 随机重置列的位置，制造随机性
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
  }

  // 控制动画帧率
  let interval: number
  const run = () => {
    draw()
    interval = requestAnimationFrame(run)
  }
  run()

  // 窗口大小改变时重置
  const handleResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  // 组件卸载时清理
  // (在 Vue 3 setup 中，通常不需要显式返回，但在复杂场景下建议使用 onUnmounted)
})
</script>

<template>
  <div class="relative w-full h-screen bg-black overflow-hidden">
    <!-- Canvas 背景 -->
    <canvas
      ref="canvasRef"
      class="absolute top-0 left-0 w-full h-full"
    />

    <!-- 遮罩层 (为了防止文字看不清) -->
    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">

      <!-- 内容容器 -->
      <div class="text-center relative z-10 px-4">

        <!-- 404 数字 (使用大号字体和发光效果) -->
        <div class="mb-4">
          <div class="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-2 animate-pulse">
            404
          </div>
          <div class="text-4xl font-bold text-gray-200 mb-6">
            Not Found
          </div>
        </div>

        <!-- 随机提示语 -->
        <p class="text-lg text-gray-300 mb-8 font-mono">
          {{ randomMessage }}
        </p>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <!-- 返回首页 -->
          <ElButton
            type="success"
            size="large"
            @click="goHome"
            class="px-8 py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            🏠 返回首页
          </ElButton>

          <!-- 刷新页面 -->
          <ElButton
            type="primary"
            size="large"
            @click="() => location.reload()"
            class="px-8 py-6 text-lg font-bold border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black transition-all duration-300 transform hover:scale-105"
          >
            🔁 刷新重试
          </ElButton>
        </div>

        <!-- 装饰性边框 -->
        <div class="absolute top-1/4 left-1/4 w-48 h-48 border border-cyan-500 border-opacity-20 rounded-full animate-ping"></div>
        <div class="absolute bottom-1/4 right-1/4 w-64 h-64 border border-emerald-500 border-opacity-20 rounded-full animate-ping delay-1000"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 自定义字体大小过渡 */
:deep(.el-button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 鼠标悬停放大效果 */
.animate-hover-scale:hover {
  transform: scale(1.05);
}

/* 闪烁动画 */
.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  75% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 脉冲发光 */
.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14;
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff;
  }
}
</style>
