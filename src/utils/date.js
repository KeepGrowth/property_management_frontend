import { dayjs } from 'element-plus'

/**
 * 时间格式化工具函数
 * @param {string | number | Date | dayjs.Dayjs} dateTime - 要格式化的时间（支持多种类型）
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串（无效时间返回空字符串）
 */
const formatTime = (dateTime, format = 'YYYY-MM-DD HH:mm:ss') => {
  // 处理空值/无效值
  if (!dateTime) return ''

  // 用 dayjs 解析时间，失败则返回空
  const time = dayjs(dateTime)
  if (!time.isValid()) return ''

  // 格式化并返回
  return time.format(format)
}

export default formatTime
