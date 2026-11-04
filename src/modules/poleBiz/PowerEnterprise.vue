<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  OfficeBuilding, Key, User, Avatar, Coin, Money, Document, Download,
  Check, Warning, Refresh, Plus, Filter, Calendar, Search, Setting,
  CircleClose, Tickets, UserFilled, Service, CreditCard, Timer, Shop
} from '@element-plus/icons-vue'

/* ============================================================
 * 共享用电 · 企业客户中心
 * ============================================================ */

/* ---------- 当前激活 Tab ---------- */
const activeTab = ref('auth')

/* ---------- 企业列表 Mock ---------- */
const companyList = [
  { id: 1, name: '湖南建工集团有限公司', creditCode: '91430100MA4Q7X9XX0', legalPerson: '王建国', status: '已认证', passDate: '2026-08-15', invoiceTitle: '湖南建工集团有限公司', taxNo: '91430100MA4Q7X9XX0', addr: '长沙市岳麓区先导路 88 号', phone: '0731-88888888', bank: '工商银行长沙岳麓支行', account: '6222 **** **** 8899' },
  { id: 2, name: '长沙先导物业管理有限公司', creditCode: '91430105MA4R2Y9XX1', legalPerson: '陈振华', status: '已认证', passDate: '2026-08-20', invoiceTitle: '长沙先导物业管理有限公司', taxNo: '91430105MA4R2Y9XX1', addr: '长沙市岳麓区滨江路 10 号', phone: '0731-89999999', bank: '建设银行长沙滨江支行', account: '6217 **** **** 1122' },
  { id: 3, name: '麓谷产业园运营有限公司', creditCode: '91430100MA4S3Z9XX2', legalPerson: '周明辉', status: '审核中', passDate: '', invoiceTitle: '麓谷产业园运营有限公司', taxNo: '91430100MA4S3Z9XX2', addr: '长沙市高新区麓谷大道 599 号', phone: '0731-87777777', bank: '招商银行长沙麓谷支行', account: '6225 **** **** 3344' },
  { id: 4, name: '梅溪湖商业综合体管理有限公司', creditCode: '91430104MA4T4W9XX3', legalPerson: '刘晓燕', status: '已认证', passDate: '2026-09-01', invoiceTitle: '梅溪湖商业综合体管理有限公司', taxNo: '91430104MA4T4W9XX3', addr: '长沙市岳麓区梅溪湖路 1 号', phone: '0731-86666666', bank: '交通银行长沙梅溪湖支行', account: '6226 **** **** 5566' },
  { id: 5, name: '岳麓区农业合作社联合社', creditCode: '91430104MA4U5V9XX4', legalPerson: '罗国强', status: '未认证', passDate: '', invoiceTitle: '岳麓区农业合作社联合社', taxNo: '91430104MA4U5V9XX4', addr: '长沙市岳麓区莲花镇莲花大道 8 号', phone: '0731-85555555', bank: '农业银行长沙岳麓支行', account: '6228 **** **** 7788' }
]

const currentCompany = ref(companyList[0])

/* ---------- 认证 Tab ---------- */
const authTab = ref('materials')

const boundAccounts = ref([
  { id: 'YD20260815001', name: '先导路#23 路灯终端', location: '先导路与麓山南路交叉口', bindTime: '2026-08-15', status: '正常' },
  { id: 'YD20260815002', name: '滨江大道#12 商业综合体', location: '滨江大道 128 号', bindTime: '2026-08-15', status: '正常' },
  { id: 'YD20260820003', name: '梅溪湖路#8 园区', location: '梅溪湖路 8 号门岗', bindTime: '2026-08-20', status: '正常' },
  { id: 'YD20260901004', name: '麓谷大道#599 产业园', location: '麓谷大道 599 号 A 栋', bindTime: '2026-09-01', status: '正常' }
])

const accountDialog = ref(false)
const accountForm = reactive({ id: '', name: '', location: '' })

const openAddAccount = () => {
  accountForm.id = ''; accountForm.name = ''; accountForm.location = ''
  accountDialog.value = true
}
const submitAccount = () => {
  if (!accountForm.id || !accountForm.name) return ElMessage.warning('请填写完整户号和名称')
  boundAccounts.value.push({
    id: accountForm.id, name: accountForm.name, location: accountForm.location,
    bindTime: new Date().toISOString().slice(0, 10), status: '正常'
  })
  accountDialog.value = false
  ElMessage.success('户号绑定成功')
}
const unbindAccount = (row) => {
  ElMessageBox.confirm(`确定解绑户号 ${row.id} ？`, '提示', { type: 'warning' }).then(() => {
    boundAccounts.value = boundAccounts.value.filter(a => a.id !== row.id)
    ElMessage.success('已解绑')
  }).catch(() => {})
}

/* 权限变更申请 */
const changeType = ref('add')
const changeForm = reactive({ name: '', phone: '', role: '经办人', dept: '' })
const changeRecords = ref([
  { id: 1, type: '新增', name: '张工', phone: '139****6677', role: '经办人', dept: '工程部', applyTime: '2026-09-01 10:23', status: '已通过' },
  { id: 2, type: '变更', name: '李明', phone: '138****8899', role: '管理员', dept: '采购部→运营部', applyTime: '2026-09-15 14:12', status: '已通过' },
  { id: 3, type: '注销', name: '王工', phone: '135****3344', role: '经办人', dept: '工程部', applyTime: '2026-10-02 09:08', status: '已通过' }
])
const submitChange = () => {
  if (!changeForm.name || !changeForm.phone) return ElMessage.warning('请填写完整')
  changeRecords.value.unshift({
    id: Date.now(), type: { add: '新增', update: '变更', revoke: '注销' }[changeType.value],
    name: changeForm.name, phone: changeForm.phone, role: changeForm.role, dept: changeForm.dept,
    applyTime: new Date().toLocaleString(), status: '审批中'
  })
  ElMessage.success('申请已提交，预计 1-3 个工作日审核')
  changeForm.name = ''; changeForm.phone = ''; changeForm.dept = ''
}

/* ---------- Tab2 用电记录 ---------- */
const dateRange = ref([])
const termFilter = ref('')
const statusFilter = ref('全部')
const invoiceFilter = ref('全部')

const orderList = ref([
  { orderNo: 'ZG20261025001', location: '先导路#23', timeRange: '10-25 09:15~11:49', kwh: 284.6, peakPrice: 0.98, valleyPrice: 0.46, total: '¥224.69', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261025002', location: '滨江大道#12', timeRange: '10-25 13:02~15:30', kwh: 198.2, peakPrice: 0.98, valleyPrice: 0.46, total: '¥165.32', pay: '对公转账', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261024003', location: '梅溪湖路#8', timeRange: '10-24 08:20~12:10', kwh: 412.5, peakPrice: 0.98, valleyPrice: 0.46, total: '¥332.41', pay: '月结', invoiceStatus: '待开票', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' },
  { orderNo: 'ZG20261024004', location: '麓谷大道#599', timeRange: '10-24 14:30~17:45', kwh: 156.8, peakPrice: 0.98, valleyPrice: 0.46, total: '¥128.58', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261023005', location: '先导路#23', timeRange: '10-23 06:30~09:15', kwh: 320.1, peakPrice: 0.98, valleyPrice: 0.46, total: '¥260.88', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261023006', location: '滨江大道#12', timeRange: '10-23 18:00~21:30', kwh: 276.4, peakPrice: 0.98, valleyPrice: 0.46, total: '¥221.43', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261022007', location: '梅溪湖路#8', timeRange: '10-22 09:00~12:00', kwh: 188.3, peakPrice: 0.98, valleyPrice: 0.46, total: '¥150.32', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' },
  { orderNo: 'ZG20261021008', location: '麓谷大道#599', timeRange: '10-21 10:30~13:45', kwh: 245.6, peakPrice: 0.98, valleyPrice: 0.46, total: '¥201.39', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261021009', location: '先导路#23', timeRange: '10-21 19:00~22:00', kwh: 398.7, peakPrice: 0.98, valleyPrice: 0.46, total: '¥325.91', pay: '月结', invoiceStatus: '待开票', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261020010', location: '滨江大道#12', timeRange: '10-20 07:30~10:15', kwh: 167.9, peakPrice: 0.98, valleyPrice: 0.46, total: '¥137.12', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' },
  { orderNo: 'ZG20261019011', location: '梅溪湖路#8', timeRange: '10-19 14:00~17:20', kwh: 234.1, peakPrice: 0.98, valleyPrice: 0.46, total: '¥189.77', pay: '对公转账', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261018012', location: '先导路#23', timeRange: '10-18 08:00~11:30', kwh: 312.4, peakPrice: 0.98, valleyPrice: 0.46, total: '¥254.73', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261017013', location: '麓谷大道#599', timeRange: '10-17 16:10~19:40', kwh: 189.5, peakPrice: 0.98, valleyPrice: 0.46, total: '¥153.93', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' },
  { orderNo: 'ZG20261016014', location: '滨江大道#12', timeRange: '10-16 09:45~13:05', kwh: 298.1, peakPrice: 0.98, valleyPrice: 0.46, total: '¥243.23', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261015015', location: '先导路#23', timeRange: '10-15 11:00~14:15', kwh: 215.7, peakPrice: 0.98, valleyPrice: 0.46, total: '¥176.87', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261014016', location: '梅溪湖路#8', timeRange: '10-14 07:20~10:40', kwh: 367.8, peakPrice: 0.98, valleyPrice: 0.46, total: '¥298.75', pay: '月结', invoiceStatus: '待开票', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' },
  { orderNo: 'ZG20261013017', location: '麓谷大道#599', timeRange: '10-13 13:30~16:55', kwh: 145.2, peakPrice: 0.98, valleyPrice: 0.46, total: '¥118.19', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261012018', location: '滨江大道#12', timeRange: '10-12 20:00~23:15', kwh: 276.5, peakPrice: 0.98, valleyPrice: 0.46, total: '¥220.58', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261011019', location: '先导路#23', timeRange: '10-11 06:45~09:30', kwh: 423.8, peakPrice: 0.98, valleyPrice: 0.46, total: '¥343.53', pay: '对公转账', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' },
  { orderNo: 'ZG20261010020', location: '梅溪湖路#8', timeRange: '10-10 09:10~12:25', kwh: 198.6, peakPrice: 0.98, valleyPrice: 0.46, total: '¥162.07', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261009021', location: '麓谷大道#599', timeRange: '10-09 14:00~17:10', kwh: 256.3, peakPrice: 0.98, valleyPrice: 0.46, total: '¥210.17', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261008022', location: '滨江大道#12', timeRange: '10-08 08:30~11:45', kwh: 312.1, peakPrice: 0.98, valleyPrice: 0.46, total: '¥253.65', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' },
  { orderNo: 'ZG20261007023', location: '先导路#23', timeRange: '10-07 18:15~21:30', kwh: 284.5, peakPrice: 0.98, valleyPrice: 0.46, total: '¥231.70', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '李明', status: '已结算' },
  { orderNo: 'ZG20261006024', location: '梅溪湖路#8', timeRange: '10-06 09:30~13:00', kwh: 378.2, peakPrice: 0.98, valleyPrice: 0.46, total: '¥307.67', pay: '月结', invoiceStatus: '待开票', company: '湖南建工', taxNo: '9143..', operator: '张工', status: '已结算' },
  { orderNo: 'ZG20261005025', location: '麓谷大道#599', timeRange: '10-05 07:00~10:20', kwh: 168.9, peakPrice: 0.98, valleyPrice: 0.46, total: '¥137.63', pay: '月结', invoiceStatus: '已开', company: '湖南建工', taxNo: '9143..', operator: '王会计', status: '已结算' }
])

const filteredOrders = computed(() => {
  return orderList.value.filter(o => {
    if (termFilter.value && o.location !== termFilter.value) return false
    if (statusFilter.value !== '全部') {
      if (statusFilter.value === '待开票' && o.invoiceStatus !== '待开票') return false
      if (statusFilter.value !== '待开票' && o.status !== statusFilter.value) return false
    }
    if (invoiceFilter.value !== '全部' && o.invoiceStatus !== invoiceFilter.value) return false
    return true
  })
})

const selectedOrders = ref([])
const onSelectionChange = (rows) => { selectedOrders.value = rows }

/* 月度汇总 */
const monthSummary = computed(() => {
  const list = orderList.value
  const totalKwh = list.reduce((s, o) => s + o.kwh, 0).toFixed(1)
  const totalFee = list.reduce((s, o) => s + parseFloat(o.total.replace('¥', '')), 0).toFixed(2)
  const invoicedCount = list.filter(o => o.invoiceStatus === '已开').length
  return { count: list.length, totalKwh, totalFee, invoicedCount }
})

const downloadVisible = ref(false)
const exportCSV = () => {
  const rows = selectedOrders.value.length ? selectedOrders.value : filteredOrders.value
  if (!rows.length) return ElMessage.warning('请选择或存在可导出的记录')
  ElMessage.success('正在生成 Excel...')
  downloadVisible.value = true
  setTimeout(() => {
    const headers = ['订单号', '终端地址', '起止时间', '用电量kWh', '峰单价', '谷单价', '总费用', '支付方式', '开票状态', '企业抬头', '税号', '经办人']
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.map(o => [o.orderNo, o.location, o.timeRange, o.kwh, o.peakPrice, o.valleyPrice, o.total.replace('¥', ''), o.pay, o.invoiceStatus, o.company, o.taxNo, o.operator].join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `共享用电账单_${Date.now()}.csv`; a.click()
    downloadVisible.value = false
    ElMessage.success(`导出成功，共 ${rows.length} 条记录`)
  }, 800)
}

/* ---------- Tab3 批量开票 ---------- */
const invoiceType = ref('special') // special=专票, general=普票, electronic=电子发票

const invoiceOrders = ref([
  { id: 'ZG20261024003', company: '湖南建工集团有限公司', taxNo: '91430100MA4Q7X9XX0', amount: 332.41, kwh: 412.5, status: '待开票', time: '2026-10-24' },
  { id: 'ZG20261021009', company: '湖南建工集团有限公司', taxNo: '91430100MA4Q7X9XX0', amount: 325.91, kwh: 398.7, status: '待开票', time: '2026-10-21' },
  { id: 'ZG20261016016', company: '湖南建工集团有限公司', taxNo: '91430100MA4Q7X9XX0', amount: 298.75, kwh: 367.8, status: '待开票', time: '2026-10-16' },
  { id: 'ZG20261006024', company: '湖南建工集团有限公司', taxNo: '91430100MA4Q7X9XX0', amount: 307.67, kwh: 378.2, status: '待开票', time: '2026-10-06' },
  { id: 'ZG20261003027', company: '长沙先导物业管理有限公司', taxNo: '91430105MA4R2Y9XX1', amount: 412.00, kwh: 512.0, status: '开票中', time: '2026-10-03' },
  { id: 'ZG20261002028', company: '岳麓区农业合作社联合社', taxNo: '91430104MA4U5V9XX4', amount: 88.50, kwh: 110.6, status: '失败', time: '2026-10-02' }
])
const selectedInvoiceOrders = ref([])
const onInvoiceSelect = (rows) => { selectedInvoiceOrders.value = rows }

const recentInvoices = ref([
  { invoiceNo: 'FP20261025001', type: '增值税专用发票', company: '湖南建工集团有限公司', amount: '¥224.69', date: '2026-10-25', status: '成功', link: true },
  { invoiceNo: 'FP20261024002', type: '增值税专用发票', company: '湖南建工集团有限公司', amount: '¥165.32', date: '2026-10-24', status: '成功', link: true },
  { invoiceNo: 'FP20261023003', type: '增值税普通发票', company: '长沙先导物业管理有限公司', amount: '¥312.00', date: '2026-10-23', status: '成功', link: true },
  { invoiceNo: 'FP20261022004', type: '电子发票', company: '梅溪湖商业综合体管理有限公司', amount: '¥458.70', date: '2026-10-22', status: '成功', link: true }
])

const batchInvoice = () => {
  if (!selectedInvoiceOrders.value.length) return ElMessage.warning('请先勾选订单')
  ElMessage.success(`已提交 ${selectedInvoiceOrders.value.length} 笔订单开票（${{ special: '增值税专用发票', general: '增值税普通发票', electronic: '电子发票' }[invoiceType.value]}）`)
  // 模拟刷新
  selectedInvoiceOrders.value.forEach(o => { o.status = '开票中' })
}
const reissueFailed = (row) => {
  row.status = '开票中'
  ElMessage.success(`订单 ${row.id} 重新提交开票`)
}

/* ---------- Tab4 员工权限 ---------- */
const employeeList = ref([
  { id: 1, name: '李明', phone: '138****8899', role: '管理员', dept: '采购部', joinDate: '2026-08-15', status: '在职', avatar: 'LM' },
  { id: 2, name: '张工', phone: '139****6677', role: '经办人', dept: '工程部', joinDate: '2026-09-01', status: '在职', avatar: 'ZG' },
  { id: 3, name: '王会计', phone: '137****1122', role: '财务', dept: '财务部', joinDate: '2026-08-15', status: '在职', avatar: 'WK' },
  { id: 4, name: '陈助理', phone: '136****2233', role: '经办人', dept: '运营部', joinDate: '2026-10-10', status: '在职', avatar: 'CZ' },
  { id: 5, name: '赵主任', phone: '135****4455', role: '财务', dept: '财务部', joinDate: '2026-09-20', status: '已离职', avatar: 'ZZ' }
])

const drawerVisible = ref(false)
const editDialogVisible = ref(false)
const empForm = reactive({ name: '', phone: '', role: '经办人', dept: '采购部', inviteWay: 'sms' })
const editForm = reactive({ row: null, role: '经办人', dept: '' })

const openAddEmp = () => {
  empForm.name = ''; empForm.phone = ''; empForm.role = '经办人'; empForm.dept = '采购部'; empForm.inviteWay = 'sms'
  drawerVisible.value = true
}
const submitEmp = () => {
  if (!empForm.name || !empForm.phone) return ElMessage.warning('请填写姓名和手机号')
  employeeList.value.push({
    id: Date.now(), name: empForm.name, phone: empForm.phone, role: empForm.role,
    dept: empForm.dept, joinDate: new Date().toISOString().slice(0, 10), status: '在职',
    avatar: empForm.name.slice(0, 2)
  })
  ElMessage.success(`已通过${empForm.inviteWay === 'sms' ? '短信' : '扫码'}邀请 ${empForm.name}`)
  drawerVisible.value = false
}

const openEditEmp = (row) => {
  editForm.row = row; editForm.role = row.role; editForm.dept = row.dept
  editDialogVisible.value = true
}
const submitEditEmp = () => {
  if (!editForm.row) return
  editForm.row.role = editForm.role
  editForm.row.dept = editForm.dept
  ElMessage.success('已保存修改')
  editDialogVisible.value = false
}
const removeEmp = (row) => {
  ElMessageBox.confirm(`确定移除员工 ${row.name} ？`, '提示', { type: 'warning' }).then(() => {
    employeeList.value = employeeList.value.filter(e => e.id !== row.id)
    ElMessage.success('已移除')
  }).catch(() => {})
}

/* 角色颜色 */
const roleColor = (role) => ({
  '管理员': 'danger', '经办人': 'primary', '财务': 'warning'
}[role] || 'info')
const roleIcon = (role) => ({
  '管理员': '🔑', '经办人': '👷', '财务': '💰'
}[role] || '👤')
</script>

<template>
<div class="zg-pe">

  <!-- 顶部企业横幅 -->
  <el-card class="zg-pe__banner" shadow="never">
    <div class="banner-left">
      <el-avatar :size="64" class="banner-avatar">{{ currentCompany.name.slice(0, 1) }}</el-avatar>
      <div>
        <div class="banner-title">
          <OfficeBuilding class="icon" />
          <span>{{ currentCompany.name }}</span>
          <el-tag type="success" effect="dark" size="small" v-if="currentCompany.status === '已认证'">✅ 已认证</el-tag>
          <el-tag type="warning" size="small" v-else-if="currentCompany.status === '审核中'">⏳ 审核中</el-tag>
          <el-tag type="info" size="small" v-else>未认证</el-tag>
        </div>
        <div class="banner-sub">信用代码：{{ currentCompany.creditCode }} · 法定代表人：{{ currentCompany.legalPerson }}</div>
      </div>
    </div>
    <div class="banner-right">
      <el-statistic title="本月用电" :value="monthSummary.totalKwh" suffix="kWh" />
      <el-statistic title="本月费用" :value="monthSummary.totalFee" prefix="¥" :precision="2" />
      <el-statistic title="在职员工" :value="employeeList.filter(e => e.status === '在职').length" />
    </div>
  </el-card>

  <!-- 主 Tab -->
  <el-tabs v-model="activeTab" class="zg-pe__tabs">

    <!-- ================ Tab1 企业认证 ================ -->
    <el-tab-pane label="企业认证" name="auth">
      <div class="auth-wrap">

        <!-- 左侧企业信息 -->
        <el-card class="auth-info" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><OfficeBuilding /> 企业信息</span>
              <el-badge class="pass-badge" v-if="currentCompany.status === '已认证'">
                <el-tag type="success" effect="dark" round>✅ 已认证 · {{ currentCompany.passDate }} 审核通过</el-tag>
              </el-badge>
            </div>
          </template>

          <el-descriptions :column="2" border size="default">
            <el-descriptions-item label="企业全称">
              <span class="locked">{{ currentCompany.name }} 🔒</span>
            </el-descriptions-item>
            <el-descriptions-item label="统一社会信用代码">
              {{ currentCompany.creditCode }}
            </el-descriptions-item>
            <el-descriptions-item label="法定代表人">
              {{ currentCompany.legalPerson }} 🔒
            </el-descriptions-item>
            <el-descriptions-item label="授权经办人">
              李明（湖南建工·采购部）
            </el-descriptions-item>
            <el-descriptions-item label="对公账户">
              {{ currentCompany.bank }} · {{ currentCompany.account }}
            </el-descriptions-item>
            <el-descriptions-item label="发票抬头">
              {{ currentCompany.invoiceTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="税号">
              {{ currentCompany.taxNo }}
            </el-descriptions-item>
            <el-descriptions-item label="地址 / 电话">
              {{ currentCompany.addr }} / {{ currentCompany.phone }}
            </el-descriptions-item>
          </el-descriptions>

          <el-alert type="success" :closable="false" class="perm-alert" show-icon>
            <template #title>
              <strong>已开通权限：</strong>
              <el-tag size="small" type="success" effect="plain">开票</el-tag>
              <el-tag size="small" type="primary" effect="plain">月结</el-tag>
              <el-tag size="small" type="warning" effect="plain">对公转账</el-tag>
              <el-tag size="small" type="info" effect="plain">批量导出</el-tag>
            </template>
          </el-alert>
        </el-card>

        <!-- 右侧认证 Tab 切换 -->
        <el-card class="auth-tabs-card" shadow="hover">
          <el-tabs v-model="authTab" type="border-card">
            <!-- 认证资料查看 -->
            <el-tab-pane label="认证资料" name="materials">
              <div class="materials-grid">
                <div class="material-item" v-for="m in [
                  { title: '营业执照', code: '91430100MA4Q7X9XX0' },
                  { title: '法人身份证（正面）', code: '4301**********1234' },
                  { title: '法人身份证（反面）', code: '有效期限 2018-2038' },
                  { title: '授权委托书', code: '加盖公章 · 2026-08-10' },
                  { title: '经办人身份证', code: '4301**********5678' },
                  { title: '对公账户开户许可证', code: '基本存款账户' }
                ]" :key="m.title">
                  <div class="thumb">
                    <Document class="thumb-icon" />
                    <span class="thumb-code">{{ m.code }}</span>
                  </div>
                  <div class="thumb-title">{{ m.title }}</div>
                  <div class="thumb-actions">
                    <el-button link type="primary" size="small">查看</el-button>
                    <el-button link type="primary" size="small">下载</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 绑定户号 -->
            <el-tab-pane label="绑定户号" name="accounts">
              <div class="toolbar">
                <el-button type="primary" :icon="Plus" @click="openAddAccount">添加户号</el-button>
                <span class="toolbar-info">共 {{ boundAccounts.length }} 个户号</span>
              </div>
              <el-table :data="boundAccounts" stripe size="default">
                <el-table-column prop="id" label="户号" width="160" />
                <el-table-column prop="name" label="终端名称" />
                <el-table-column prop="location" label="位置" />
                <el-table-column prop="bindTime" label="绑定时间" width="120" />
                <el-table-column label="状态" width="90">
                  <template #default="{ row }">
                    <el-tag type="success" size="small" effect="plain">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button link type="danger" size="small" @click="unbindAccount(row)">解绑</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 权限变更申请 -->
            <el-tab-pane label="权限变更申请" name="change">
              <el-form :inline="true" class="change-form">
                <el-form-item label="申请类型">
                  <el-radio-group v-model="changeType">
                    <el-radio-button value="add">新增经办人</el-radio-button>
                    <el-radio-button value="update">变更角色</el-radio-button>
                    <el-radio-button value="revoke">注销经办人</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="姓名">
                  <el-input v-model="changeForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="changeForm.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="角色">
                  <el-select v-model="changeForm.role" style="width:120px">
                    <el-option label="管理员" value="管理员" />
                    <el-option label="经办人" value="经办人" />
                    <el-option label="财务" value="财务" />
                  </el-select>
                </el-form-item>
                <el-form-item label="部门">
                  <el-input v-model="changeForm.dept" placeholder="请输入部门" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :icon="Check" @click="submitChange">提交申请</el-button>
                </el-form-item>
              </el-form>

              <el-divider content-position="left">申请记录</el-divider>
              <el-table :data="changeRecords" stripe size="default">
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="{新增:'success',变更:'warning',注销:'danger'}[row.type]" size="small">{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="phone" label="手机号" width="140" />
                <el-table-column prop="role" label="角色" width="100" />
                <el-table-column prop="dept" label="部门" />
                <el-table-column prop="applyTime" label="申请时间" width="160" />
                <el-table-column label="状态" width="110">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '已通过' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </el-tab-pane>

    <!-- ================ Tab2 用电记录 ================ -->
    <el-tab-pane label="用电记录 · 对账导出" name="records">

      <!-- 月度汇总 -->
      <div class="summary-row">
        <el-card class="summary-card" shadow="hover">
          <div class="summary-icon summary-blue"><Timer /></div>
          <div class="summary-content">
            <div class="summary-label">本月订单</div>
            <div class="summary-value">{{ monthSummary.count }} 笔</div>
          </div>
        </el-card>
        <el-card class="summary-card" shadow="hover">
          <div class="summary-icon summary-green"><Coin /></div>
          <div class="summary-content">
            <div class="summary-label">总用电量</div>
            <div class="summary-value">{{ monthSummary.totalKwh }} kWh</div>
          </div>
        </el-card>
        <el-card class="summary-card" shadow="hover">
          <div class="summary-icon summary-orange"><Money /></div>
          <div class="summary-content">
            <div class="summary-label">总费用</div>
            <div class="summary-value">¥{{ monthSummary.totalFee }}</div>
          </div>
        </el-card>
        <el-card class="summary-card" shadow="hover">
          <div class="summary-icon summary-purple"><Tickets /></div>
          <div class="summary-content">
            <div class="summary-label">已开专票</div>
            <div class="summary-value">{{ monthSummary.invoicedCount }} 张</div>
          </div>
        </el-card>
      </div>

      <el-card shadow="never" class="filter-card">
        <div class="filter-wrap">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
          <el-select v-model="termFilter" placeholder="终端地址" clearable style="width:180px">
            <el-option v-for="loc in [...new Set(orderList.map(o => o.location))]" :key="loc" :label="loc" :value="loc" />
          </el-select>
          <el-select v-model="statusFilter" style="width:130px">
            <el-option label="全部状态" value="全部" />
            <el-option label="已结算" value="已结算" />
            <el-option label="用电中" value="用电中" />
            <el-option label="待开票" value="待开票" />
          </el-select>
          <el-select v-model="invoiceFilter" style="width:130px">
            <el-option label="全部开票" value="全部" />
            <el-option label="已开" value="已开" />
            <el-option label="待开票" value="待开票" />
          </el-select>
          <el-button type="primary" :icon="Search">查询</el-button>
          <el-button :icon="Refresh">重置</el-button>
          <el-button type="success" :icon="Download" @click="exportCSV">导出 Excel</el-button>
          <el-button v-if="downloadVisible" type="warning" :icon="Download" @click="exportCSV">↓ 再次下载</el-button>
        </div>
      </el-card>

      <el-card shadow="never">
        <el-alert class="table-tip" :closable="false" show-icon type="info">
          <template #title>
            国网 12 字段规范 · 当前筛选结果 <b>{{ filteredOrders.length }}</b> 条 · 已选 <b>{{ selectedOrders.length }}</b> 条
          </template>
        </el-alert>
        <el-table :data="filteredOrders" stripe border size="default" @selection-change="onSelectionChange" height="520">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="orderNo" label="订单号" width="170" fixed />
          <el-table-column prop="location" label="终端地址" width="140" />
          <el-table-column prop="timeRange" label="起止时间" width="170" />
          <el-table-column prop="kwh" label="用电量(kWh)" width="110" align="right" />
          <el-table-column prop="peakPrice" label="峰单价" width="90" align="right" />
          <el-table-column prop="valleyPrice" label="谷单价" width="90" align="right" />
          <el-table-column prop="total" label="总费用" width="100" align="right">
            <template #default="{ row }"><b class="money">{{ row.total }}</b></template>
          </el-table-column>
          <el-table-column prop="pay" label="支付方式" width="110">
            <template #default="{ row }">
              <el-tag size="small" :type="row.pay === '月结' ? 'primary' : 'success'">{{ row.pay }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="invoiceStatus" label="开票状态" width="110">
            <template #default="{ row }">
              <el-tag v-if="row.invoiceStatus === '已开'" type="success" size="small" effect="dark">✅ 已开</el-tag>
              <el-tag v-else type="warning" size="small">待开票</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="company" label="企业抬头" width="120" />
          <el-table-column prop="taxNo" label="税号" width="110" />
          <el-table-column prop="operator" label="经办人" width="90" fixed="right" />
        </el-table>
      </el-card>
    </el-tab-pane>

    <!-- ================ Tab3 批量开票 ================ -->
    <el-tab-pane label="批量开票" name="invoice">
      <el-card shadow="never">
        <div class="invoice-header">
          <div class="invoice-header-left">
            <span class="invoice-title"><Tickets /> 可开票订单</span>
            <el-tag type="warning">待开票 {{ invoiceOrders.filter(o => o.status === '待开票').length }} 笔</el-tag>
          </div>
          <div class="invoice-header-right">
            <span class="label">发票类型：</span>
            <el-radio-group v-model="invoiceType">
              <el-radio-button value="special">增值税专用发票</el-radio-button>
              <el-radio-button value="general">增值税普通发票</el-radio-button>
              <el-radio-button value="electronic">电子发票</el-radio-button>
            </el-radio-group>
            <el-button type="primary" :icon="Tickets" @click="batchInvoice" style="margin-left:12px">批量开票</el-button>
          </div>
        </div>

        <el-table :data="invoiceOrders" stripe border @selection-change="onInvoiceSelect">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="id" label="订单号" width="170" fixed />
          <el-table-column prop="company" label="企业抬头" />
          <el-table-column prop="taxNo" label="税号" width="150" />
          <el-table-column prop="kwh" label="用电量(kWh)" width="120" align="right" />
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }"><b class="money">¥{{ row.amount.toFixed(2) }}</b></template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.status === '待开票'" type="info" size="small">{{ row.status }}</el-tag>
              <el-tag v-else-if="row.status === '开票中'" type="warning" size="small" effect="dark">{{ row.status }}</el-tag>
              <el-tag v-else-if="row.status === '已开'" type="success" size="small" effect="dark">{{ row.status }}</el-tag>
              <el-tag v-else type="danger" size="small">失败</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === '待开票'" link type="primary" size="small">立即开票</el-button>
              <el-button v-else-if="row.status === '失败'" link type="danger" size="small" @click="reissueFailed(row)">重新提交</el-button>
              <el-button v-else link type="primary" size="small" :disabled="row.status === '开票中'">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-alert type="info" :closable="false" show-icon class="invoice-rules">
          <template #title>
            <strong>开票规则：</strong>
            <el-tag size="small" type="primary" effect="plain">单笔订单可即时开票</el-tag>
            <el-tag size="small" type="success" effect="plain">同企业按月批量合并开票</el-tag>
            <el-tag size="small" type="warning" effect="plain">金额合并后自动生成一张专票</el-tag>
          </template>
        </el-alert>
      </el-card>

      <el-card shadow="never" class="invoice-recent">
        <template #header><span><Document /> 最近开票记录</span></template>
        <el-table :data="recentInvoices" stripe>
          <el-table-column prop="invoiceNo" label="发票号" width="170" />
          <el-table-column prop="type" label="发票类型" width="160" />
          <el-table-column prop="company" label="企业抬头" />
          <el-table-column prop="amount" label="金额" width="120" align="right" />
          <el-table-column prop="date" label="开票日期" width="130" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag type="success" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default>
              <el-button link type="primary" size="small" :icon="Download">下载 PDF</el-button>
              <el-button link type="primary" size="small" :icon="Document">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-tab-pane>

    <!-- ================ Tab4 员工权限 ================ -->
    <el-tab-pane label="员工权限管理" name="employees">
      <el-card shadow="never">

        <!-- 权限说明 -->
        <el-alert type="warning" :closable="false" show-icon title="角色权限说明">
          <div class="perm-grid">
            <div><b>🔑 管理员</b>：全部权限（认证 / 开票 / 员工管理 / 报表）</div>
            <div><b>👷 经办人</b>：扫码用电 / 查看订单 / 申请开票（无管理权限）</div>
            <div><b>💰 财务</b>：对账 / 批量开票 / 导出报表（不能断电操作）</div>
          </div>
        </el-alert>

        <div class="emp-toolbar">
          <el-button type="primary" :icon="Plus" @click="openAddEmp">+ 添加员工</el-button>
          <span class="toolbar-info">共 {{ employeeList.length }} 人 · 在职 {{ employeeList.filter(e=>e.status==='在职').length }} 人</span>
        </div>

        <el-table :data="employeeList" stripe border size="default">
          <el-table-column label="姓名" width="180">
            <template #default="{ row }">
              <el-avatar :size="32" class="emp-avatar">{{ row.avatar }}</el-avatar>
              <span class="emp-name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column label="角色" width="140">
            <template #default="{ row }">
              <el-tag :type="roleColor(row.role)" effect="dark" round>{{ roleIcon(row.role) }} {{ row.role }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="dept" label="所属部门" width="130" />
          <el-table-column prop="joinDate" label="加入时间" width="130" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '在职' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openEditEmp(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="removeEmp(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-tab-pane>

  </el-tabs>

  <!-- ============ 添加员工 Drawer ============ -->
  <el-drawer v-model="drawerVisible" title="添加员工" size="420px" destroy-on-close>
    <el-form label-position="top">
      <el-form-item label="姓名" required>
        <el-input v-model="empForm.name" placeholder="请输入员工姓名" />
      </el-form-item>
      <el-form-item label="手机号" required>
        <el-input v-model="empForm.phone" placeholder="11 位手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="角色" required>
        <el-radio-group v-model="empForm.role">
          <el-radio value="管理员">🔑 管理员</el-radio>
          <el-radio value="经办人">👷 经办人</el-radio>
          <el-radio value="财务">💰 财务</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="所属部门">
        <el-select v-model="empForm.dept" style="width:100%">
          <el-option label="采购部" value="采购部" />
          <el-option label="工程部" value="工程部" />
          <el-option label="财务部" value="财务部" />
          <el-option label="运营部" value="运营部" />
          <el-option label="综合部" value="综合部" />
        </el-select>
      </el-form-item>
      <el-divider content-position="left">邀请方式</el-divider>
      <el-form-item>
        <el-radio-group v-model="empForm.inviteWay">
          <el-radio value="sms">📱 短信邀请</el-radio>
          <el-radio value="qr">📷 扫码加入</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="submitEmp">发送邀请</el-button>
    </template>
  </el-drawer>

  <!-- ============ 编辑 Dialog ============ -->
  <el-dialog v-model="editDialogVisible" title="编辑员工信息" width="420px">
    <el-form label-position="top" v-if="editForm.row">
      <el-form-item label="姓名"><el-input :model-value="editForm.row.name" disabled /></el-form-item>
      <el-form-item label="手机号"><el-input :model-value="editForm.row.phone" disabled /></el-form-item>
      <el-form-item label="角色">
        <el-radio-group v-model="editForm.role">
          <el-radio value="管理员">🔑 管理员</el-radio>
          <el-radio value="经办人">👷 经办人</el-radio>
          <el-radio value="财务">💰 财务</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="部门">
        <el-input v-model="editForm.dept" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitEditEmp">保存</el-button>
    </template>
  </el-dialog>

  <!-- ============ 添加户号 Dialog ============ -->
  <el-dialog v-model="accountDialog" title="添加户号" width="420px">
    <el-form label-position="top">
      <el-form-item label="户号"><el-input v-model="accountForm.id" placeholder="如 YD20261026001" /></el-form-item>
      <el-form-item label="终端名称"><el-input v-model="accountForm.name" placeholder="如 先导路#23 路灯终端" /></el-form-item>
      <el-form-item label="位置（可选）"><el-input v-model="accountForm.location" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="accountDialog = false">取消</el-button>
      <el-button type="primary" @click="submitAccount">确认绑定</el-button>
    </template>
  </el-dialog>
</div>
</template>

<style lang="scss" scoped>
.zg-pe {
  padding: 16px;
  background: linear-gradient(180deg, #f4f7fb 0%, #eef2f7 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #1f2d3d;
}

/* ---- 顶部横幅 ---- */
.zg-pe__banner {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #eaf3ff 0%, #f6f9ff 100%);
  border-left: 4px solid #409eff;
  border-radius: 10px;
  .banner-left { display: flex; align-items: center; gap: 16px; }
  .banner-avatar {
    background: linear-gradient(135deg, #409eff, #67c23a);
    color: #fff; font-weight: bold; font-size: 28px;
  }
  .banner-title {
    font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px;
    .icon { color: #409eff; font-size: 22px; }
  }
  .banner-sub { color: #909399; margin-top: 4px; font-size: 13px; }
  .banner-right {
    display: flex; gap: 32px;
    :deep(.el-statistic__head) { color: #909399; font-size: 12px; }
    :deep(.el-statistic__content) { color: #303133; font-weight: 700; }
  }
}

/* ---- Tabs ---- */
.zg-pe__tabs {
  background: #fff; border-radius: 10px; padding: 12px;
  :deep(.el-tabs__item) { font-size: 15px; font-weight: 600; }
}

/* ---- 企业认证 ---- */
.auth-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 15px; }
.perm-alert { margin-top: 16px; }
.locked { color: #606266; font-weight: 600; }

.materials-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  .material-item {
    border: 1px dashed #dcdfe6; border-radius: 8px; padding: 10px; text-align: center;
    transition: .2s;
    &:hover { border-color: #409eff; box-shadow: 0 4px 12px rgba(64,158,255,.12); }
  }
  .thumb {
    background: linear-gradient(135deg, #eaf3ff, #f6f9ff);
    height: 90px; border-radius: 6px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; margin-bottom: 8px;
  }
  .thumb-icon { font-size: 28px; color: #409eff; margin-bottom: 4px; }
  .thumb-code { font-size: 11px; color: #909399; }
  .thumb-title { font-weight: 600; font-size: 13px; margin-bottom: 6px; }
}

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.toolbar-info { color: #909399; font-size: 13px; }

.change-form { margin-bottom: 8px; }

/* ---- 月度汇总卡 ---- */
.summary-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;
  .summary-card {
    display: flex; align-items: center; gap: 14px; border-radius: 10px;
    border: none; box-shadow: 0 2px 10px rgba(0,0,0,.04);
  }
  .summary-icon {
    width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 22px;
  }
  .summary-blue { background: linear-gradient(135deg, #409eff, #66b1ff); }
  .summary-green { background: linear-gradient(135deg, #67c23a, #85ce61); }
  .summary-orange { background: linear-gradient(135deg, #e6a23c, #ebb563); }
  .summary-purple { background: linear-gradient(135deg, #909399, #a6a9ad); }
  .summary-label { color: #909399; font-size: 13px; }
  .summary-value { font-size: 20px; font-weight: 700; color: #303133; margin-top: 2px; }
}

/* ---- 筛选条 ---- */
.filter-card { margin-bottom: 12px; border-radius: 10px; }
.filter-wrap { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.table-tip { margin-bottom: 12px; }
.money { color: #f56c6c; font-weight: 700; }

/* ---- 开票 ---- */
.invoice-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;
  .invoice-header-left { display: flex; align-items: center; gap: 10px; }
  .invoice-header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .invoice-title { font-size: 16px; font-weight: 700; }
  .label { color: #606266; font-size: 13px; margin-right: 4px; }
}
.invoice-rules { margin-top: 16px; }
.invoice-recent { margin-top: 16px; border-radius: 10px; }

/* ---- 员工权限 ---- */
.perm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 4px; font-size: 13px; }
.emp-toolbar { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 12px; }
.emp-avatar { background: linear-gradient(135deg, #409eff, #67c23a); color: #fff; font-weight: 700; margin-right: 10px; }
.emp-name { font-weight: 600; }

/* ---- 响应式 ---- */
@media (max-width: 1200px) {
  .auth-wrap { grid-template-columns: 1fr; }
  .summary-row { grid-template-columns: repeat(2, 1fr); }
  .perm-grid { grid-template-columns: 1fr; }
  .zg-pe__banner { flex-direction: column; gap: 12px; align-items: flex-start; }
}
</style>
