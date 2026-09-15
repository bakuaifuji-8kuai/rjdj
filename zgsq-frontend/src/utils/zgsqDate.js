/* [软著核心代码] zgsqDate.js + 日期工具函数：格式化、解析、下次巡检日计算（业务专属） */

/**
 * 数字补零：1 -> '01'，12 -> '12'
 * 内部辅助函数，不对外导出
 * @param {number} n 原始数字
 * @returns {string} 补零后的字符串
 */
const padZero = (n) => (n < 10 ? '0' + n : '' + n)

/**
 * 日期格式化（业务通用）
 * 业务说明：把 Date 对象或时间戳格式化为指定字符串
 * 占位符：YYYY 年、MM 月、DD 日、HH 时、mm 分、ss 秒
 * @param {Date|number|string} date 可被 new Date() 解析的任意值
 * @param {string} fmt  格式模板，如 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串，无效日期返回 '-'
 */
export const formatZgsqDate = (date, fmt = 'YYYY-MM-DD') => {
  if (!date) return '-'
  const d = date instanceof Date ? date : new Date(date)
  // 如果解析后仍是 Invalid Date，返回占位
  if (isNaN(d.getTime())) return '-'

  // 用正则逐个替换占位符
  const year = d.getFullYear()
  const month = padZero(d.getMonth() + 1)
  const day = padZero(d.getDate())
  const hour = padZero(d.getHours())
  const minute = padZero(d.getMinutes())
  const second = padZero(d.getSeconds())

  return fmt
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hour)
    .replace(/mm/g, minute)
    .replace(/ss/g, second)
}

/**
 * 日期时间格式化（业务常用快捷方式）
 * 业务说明：等同于 formatZgsqDate(date, 'YYYY-MM-DD HH:mm:ss')
 * @param {Date|number|string} date
 * @returns {string}
 */
export const formatZgsqDateTime = (date) => {
  return formatZgsqDate(date, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 日期字符串解析
 * 业务说明：把 'YYYY-MM-DD' 或 'YYYY-MM-DD HH:mm:ss' 格式的字符串转成 Date 对象
 * @param {string} str
 * @returns {Date|null} 解析失败返回 null
 */
export const parseZgsqDate = (str) => {
  if (!str) return null
  // 把 - 和空格替换成 / 让 Safari 也能解析
  const normalized = String(str).replace(/-/g, '/')
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

/**
 * 计算下次巡检日期（业务专属）
 * 业务说明：管廊每次巡检后，根据巡检频率（天）推算下一次应该巡检的日期
 * 算法：lastPatrolDate + frequency 天
 * @param {Date|string} lastPatrolDate 最近一次巡检日期
 * @param {number} frequency           巡检频率（天），例如 7 表示每周一次
 * @returns {string} 'YYYY-MM-DD' 格式的下次巡检日期，参数不合法返回 '-'
 */
export const calcZgsqNextPatrolDate = (lastPatrolDate, frequency) => {
  // 参数校验：最近巡检日必须有值，频率必须是正整数
  if (!lastPatrolDate || !frequency || frequency <= 0) return '-'

  const baseDate = lastPatrolDate instanceof Date
    ? lastPatrolDate
    : parseZgsqDate(lastPatrolDate)

  if (!baseDate) return '-'

  // 克隆一份避免修改原对象
  const next = new Date(baseDate.getTime())
  next.setDate(next.getDate() + Number(frequency))

  return formatZgsqDate(next, 'YYYY-MM-DD')
}
