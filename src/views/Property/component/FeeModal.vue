<template>
  <!-- 遮罩层：使用 transition 实现淡入淡出 -->
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      @click="handleCancel"
    >
      <!-- 模态框主体：使用 scale 过渡 -->
      <transition name="scale">
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5"
          @click.stop
        >
          <!-- 1. 头部区域 -->
          <div class="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50">
            <h3 class="text-lg font-semibold text-slate-800 tracking-tight">
              {{ isEdit ? '编辑账单' : '新增账单' }}
            </h3>
            <button
              @click="handleCancel"
              class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- 2. 表单区域 -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
            <!-- 第一行：账单编号 & 费用类型 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">账单编号</label>
                <input
                  v-model="formData.billNo"
                  type="text"
                  placeholder="请输入B-开头的账单编号"
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:opacity-60"
                  :disabled="isEdit"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium ">业主ID</label>
                <input
                  v-model.number="formData.ownerId"
                  type="text"
                  placeholder="请输入业主ID"
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:opacity-60"
                  :disabled="isEdit"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium ">房屋ID</label>
                <input
                  v-model.number="formData.houseId"
                  type="text"
                  placeholder="请输入此账单对应的房屋ID"
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:opacity-60"
                  :disabled="isEdit"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">费用类型</label>
                <select
                  v-model.number="formData.feeType"
                  class="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none cursor-pointer"
                >
                  <option v-for="type in feeTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 第二行：金额 & 状态 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">金额 (元)</label>
                <div class="relative">
                  <input
                    v-model.number="formData.feeAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                  <span class="absolute right-3 top-2 text-slate-400 text-sm font-medium">RMB</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">状态</label>
                <select
                  v-model.number="formData.billStatus"
                  class="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                >
                  <option :value="0">已支付</option>
                  <option :value="1">未支付</option>
                </select>
              </div>
            </div>

            <!-- 第三行：时间范围 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">开始时间</label>
                <input
                  v-model="formData.startTime"
                  type="datetime-local"
                  class="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-slate-700">结束时间</label>
                <input
                  v-model="formData.endTime"
                  type="datetime-local"
                  class="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>
            </div>

          </form>

          <!-- 3. 底部操作栏 -->
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              @click="handleCancel"
              class="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            >
              取消
            </button>
            <button
              @click="handleSubmit"
              class="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all shadow-sm hover:shadow"
            >
              确认保存
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// 定义 Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 用于编辑时传入的数据对象
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// 定义 Emits
const emit = defineEmits(['update:modelValue', 'submit'])

// 控制模态框显示隐藏
const visible = ref(props.modelValue)

// 表单数据
const formData = ref({
  id: null,
  billNo: '',
  houseId: null, // 实际项目中通常隐藏或自动关联
  ownerId: null, // 实际项目中通常隐藏或自动关联
  feeType: 1,
  feeAmount: 0.00,
  billStatus: 0,
  startTime: '',
  endTime: '',
  pay_time: ''
})

// 费用类型选项 (根据业务逻辑调整)
const feeTypes = [
  { label: '物业费', value: 1 },
  { label: '水电费', value: 2 }
]

// 判断是否为编辑模式
const isEdit = computed(() => !!formData.value.id)

// 监听外部 v-model 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal && props.initialData) {
      // 如果是编辑模式，填充数据
      // 注意：这里需要根据实际后端返回的数据格式进行适配，尤其是日期格式
      formData.value = { ...props.initialData }
    } else if (newVal) {
      // 如果是新增模式，重置表单 (保留默认值)
      formData.value = {
        id: null,
        billNo: '',
        houseId: null,
        ownerId: null,
        feeType: 1,
        feeAmount: 0.00,
        billStatus: 1,
        startTime: '',
        endTime: '',
        payTime: ''
      }
    }
  }
)

// 监听内部 visible 变化同步给父组件 (实现 v-model)
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 取消操作
const handleCancel = () => {
  visible.value = false
}

// 提交操作
const handleSubmit = () => {
  // 可以在这里添加简单的表单验证
  emit('submit', { ...formData.value })
}
</script>

<style scoped>
/* 简单的过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.scale-leave-active {
  transition: all 0.15s ease-in;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
