<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title">集控设备</div>
      <div class="header-right">
        <el-button type="primary" @click="showAddDialog = true">新增</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <div class="panel-header">
          <el-input v-model="treeSearch" placeholder="请输入层级名称" prefix-icon="Search" />
        </div>
        <el-tree
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :expand-on-click-node="false"
          @check-change="handleCheckChange"
        />
      </div>

      <div class="right-panel">
        <div class="device-list-panel">
          <div class="filter-bar">
            <el-input v-model="searchKeyword" placeholder="请输入" prefix-icon="Search" style="width: 200px; margin-right: 10px;" />
            <el-button type="primary">搜索</el-button>
            <el-button>重置</el-button>
          </div>
          <el-table :data="deviceList" border>
            <el-table-column type="selection" width="45" />
            <el-table-column prop="no" label="No" width="60" align="center" />
            <el-table-column prop="deviceName" label="设备名称" min-width="180" />
            <el-table-column prop="mac" label="MAC地址" min-width="180" />
            <el-table-column prop="ip" label="IP地址" min-width="140" />
            <el-table-column prop="networkStatus" label="网络状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
                  {{ row.networkStatus === 'online' ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="scene" label="当前场景" min-width="140" />
            <el-table-column prop="lastOnline" label="最后在线时间" min-width="160" />
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewDeviceDetail(row)">详情</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrapper">
            <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              :page-sizes="[15, 30, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
            />
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showDetailDialog" title="详情" width="900px">
      <div class="detail-content">
        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info-grid">
              <div class="info-item">
                <span class="info-label">所属产品:</span>
                <span class="info-value">G420A路灯网关-Pro</span>
              </div>
              <div class="info-item">
                <span class="info-label">设备名称:</span>
                <span class="info-value">测试128M</span>
              </div>
              <div class="info-item">
                <span class="info-label">设备编号:</span>
                <span class="info-value">test128M</span>
              </div>
              <div class="info-item">
                <span class="info-label">设备型号:</span>
                <span class="info-value">EXC-GLA0605E-P20</span>
              </div>
              <div class="info-item">
                <span class="info-label">软件版本:</span>
                <span class="info-value">3.1.9</span>
                <el-button type="primary" size="small" class="info-btn">回读</el-button>
              </div>
              <div class="info-item">
                <span class="info-label">MAC地址:</span>
                <span class="info-value">00-14-97-38-DD-D2</span>
              </div>
              <div class="info-item">
                <span class="info-label">IP地址:</span>
                <span class="info-value">10.80.91.139</span>
              </div>
              <div class="info-item">
                <span class="info-label">标准功率:</span>
                <el-button type="primary" size="small" class="info-btn">查看</el-button>
              </div>
              <div class="info-item">
                <span class="info-label">数据上报周期:</span>
                <span class="info-value">-</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后在线时间:</span>
                <span class="info-value">2025-06-18 19:12:00</span>
              </div>
              <div class="info-item">
                <span class="info-label">所属配电柜:</span>
                <span class="info-value">测试128M</span>
              </div>
              <div class="info-item">
                <span class="info-label">项目经纬度:</span>
                <span class="info-value">113.930463,22.735108</span>
                <el-button type="primary" size="small" class="info-btn">同步</el-button>
              </div>
              <div class="info-item">
                <span class="info-label">设备经纬度:</span>
                <span class="info-value">114.052778,22.545278</span>
                <el-button type="primary" size="small" class="info-btn">回读</el-button>
              </div>
              <div class="info-item">
                <span class="info-label">iccid:</span>
                <span class="info-value">-</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="回路控制" name="circuit">
            <div class="circuit-control-panel">
              <div class="circuit-header">
                <span class="update-time">数据更新时间: 2025-06-18 18:18:14</span>
                <div class="circuit-actions">
                  <el-button type="primary" size="small" @click="handleReadBack">回读</el-button>
                  <el-button type="success" size="small" @click="handleAllOpen">全开</el-button>
                  <el-button type="danger" size="small" @click="handleAllClose">全关</el-button>
                </div>
              </div>
              <el-table :data="circuitList" border size="small">
                <el-table-column prop="no" label="No" width="60" align="center" />
                <el-table-column prop="circuitNo" label="回路号" width="80" align="center" />
                <el-table-column prop="circuitName" label="回路名称" width="150" />
                <el-table-column prop="moduleName" label="模块名称" width="150" />
                <el-table-column prop="switchStatus" label="开关状态" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.switchStatus === '开' ? 'success' : 'danger'" size="small">
                      {{ row.switchStatus }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="currentA" label="A相电流(A)" width="110" align="center" />
                <el-table-column prop="currentB" label="B相电流(A)" width="110" align="center" />
                <el-table-column prop="currentC" label="C相电流(A)" width="110" align="center" />
                <el-table-column prop="reportTime" label="上报时间" width="160" />
                <el-table-column label="操作" width="150" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" size="small">开</el-button>
                    <el-button type="danger" size="small">关</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="模块信息" name="module">
            <div class="module-info-panel">
              <el-input v-model="moduleSearch" placeholder="搜索模块" prefix-icon="Search" style="width: 250px; margin-bottom: 15px;" />
              <el-table :data="moduleList" border size="small">
                <el-table-column prop="no" label="No" width="60" align="center" />
                <el-table-column prop="moduleName" label="模块名称" min-width="180" />
                <el-table-column prop="moduleType" label="模块类型" min-width="180" />
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="能耗统计" name="energy">
            <div class="energy-stat-panel">
              <div class="energy-header">
                <el-select v-model="energyTimeRange" placeholder="选择时间范围" style="width: 150px; margin-right: 10px;">
                  <el-option label="最近7天" value="7" />
                  <el-option label="最近30天" value="30" />
                  <el-option label="最近90天" value="90" />
                </el-select>
                <el-date-picker
                  v-model="energyDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 300px; margin-right: 10px;"
                />
                <el-button type="primary">查询</el-button>
                <div class="chart-type-btns">
                  <el-button type="primary" size="small"><el-icon><DataLine /></el-icon></el-button>
                  <el-button size="small"><el-icon><TrendCharts /></el-icon></el-button>
                  <el-button size="small"><el-icon><Grid /></el-icon></el-button>
                </div>
              </div>
              <div class="energy-chart-placeholder">
                <div class="chart-tabs">
                  <span class="chart-tab active">日</span>
                  <span class="chart-tab">月</span>
                  <span class="chart-tab">年</span>
                </div>
                <div class="chart-area">
                  <div class="chart-y-axis">
                    <span>1</span>
                    <span>0.8</span>
                    <span>0.6</span>
                    <span>0.4</span>
                    <span>0.2</span>
                    <span>0</span>
                  </div>
                  <div class="chart-main">
                    <div class="chart-x-axis">
                      <span>04-21</span>
                      <span>04-22</span>
                      <span>04-23</span>
                      <span>04-24</span>
                      <span>04-25</span>
                      <span>04-26</span>
                      <span>04-27</span>
                      <span>日楼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="告警信息" name="alarm">
            <div class="alarm-info-panel">
              <el-table :data="alarmList" border size="small">
                <el-table-column prop="level" label="告警级别" width="100">
                  <template #default="{ row }">
                    <div class="alarm-level-dot" :class="row.levelClass"></div>
                    <span>{{ row.level }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="告警类型" width="120" />
                <el-table-column prop="occurTime" label="告警发生时间" width="180" />
                <el-table-column prop="duration" label="持续时间" width="150" />
                <el-table-column prop="recoverTime" label="告警恢复时间" width="180" />
                <el-table-column prop="description" label="告警描述" min-width="250" />
                <el-table-column prop="status" label="告警状态" width="100">
                  <template #default="{ row }">
                    <el-tag type="danger" size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <el-dialog v-model="showAddDialog" title="新增集控设备" width="550px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="MAC地址" prop="mac">
          <el-input v-model="form.mac" placeholder="请输入MAC地址，如：00-14-97-38-DD-D2" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址，如：10.80.91.139" />
        </el-form-item>
        <el-form-item label="所属配电柜" prop="cabinetId">
          <el-select v-model="form.cabinetId" placeholder="请选择所属配电柜" style="width: 100%;">
            <el-option label="先导路1号配电柜" value="1" />
            <el-option label="先导路2号配电柜" value="2" />
            <el-option label="先导路1栋1号配电柜" value="3" />
            <el-option label="先导路1栋2号配电柜" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-select v-model="form.model" placeholder="请选择设备型号" style="width: 100%;">
            <el-option label="EXC-GLA0605E-P20" value="EXC-GLA0605E-P20" />
            <el-option label="G420A路灯网关-Pro" value="G420A" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Plus, Refresh, Delete, DataLine, TrendCharts, Grid } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(3)
const searchKeyword = ref('')
const treeSearch = ref('')
const activeTab = ref('basic')
const moduleSearch = ref('')
const energyTimeRange = ref('7')
const energyDateRange = ref([])

const defaultProps = {
  children: 'children',
  label: 'label'
}

const treeData = ref([
  {
    id: 1,
    label: '长沙',
    children: [
      {
        id: 11,
        label: '岳麓区',
        children: [
          { id: 111, label: '先导路', children: [] },
          { id: 112, label: '力唯中天1栋', children: [] }
        ]
      }
    ]
  }
])

const form = reactive({
  name: '',
  code: '',
  cabinetId: '',
  model: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  cabinetId: [{ required: true, message: '请选择所属配电柜', trigger: 'change' }]
}

const deviceList = ref([
  { id: 1, no: 1, deviceName: '先导路集控1', mac: '00-14-97-38-DD-D2', ip: '10.80.91.139', networkStatus: 'online', scene: '先导路夜间照明', lastOnline: '2026-05-14 09:30:00' },
  { id: 2, no: 2, deviceName: '先导路集控2', mac: '00-14-97-38-DD-D3', ip: '10.80.91.140', networkStatus: 'online', scene: '先导路节能模式', lastOnline: '2026-05-14 09:28:00' },
  { id: 3, no: 3, deviceName: '力唯中天1栋集控1', mac: '00-14-97-38-DD-D4', ip: '10.80.91.141', networkStatus: 'offline', scene: '力唯中天1栋照明', lastOnline: '2026-05-14 08:15:00' },
  { id: 4, no: 4, deviceName: '力唯中天1栋集控2', mac: '00-14-97-38-DD-D5', ip: '10.80.91.142', networkStatus: 'online', scene: '力唯中天1栋节能', lastOnline: '2026-05-14 09:32:00' }
])

const circuitList = ref([
  { no: 1, circuitNo: 1, circuitName: '内置回路1', moduleName: '内置6回路模块', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' },
  { no: 2, circuitNo: 2, circuitName: '内置回路2', moduleName: '内置6回路模块', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' },
  { no: 3, circuitNo: 3, circuitName: '内置回路3', moduleName: '内置6回路模块', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' },
  { no: 4, circuitNo: 4, circuitName: '内置回路4', moduleName: '内置6回路模块', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' },
  { no: 5, circuitNo: 5, circuitName: '内置回路5', moduleName: '内置6回路模块', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' },
  { no: 6, circuitNo: 6, circuitName: '内置回路6', moduleName: '内置6回路模块', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' },
  { no: 7, circuitNo: 1, circuitName: '回路1', moduleName: 'EXC_10_3', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' },
  { no: 8, circuitNo: 2, circuitName: '回路2', moduleName: 'EXC_10_3', switchStatus: '关', currentA: '-', currentB: '-', currentC: '-', reportTime: '2025-06-18 18:18:14' }
])

const moduleList = ref([
  { no: 1, moduleName: 'EXC_13_2', moduleType: 'EXC-G290C-L4' },
  { no: 2, moduleName: 'EXC_10_3', moduleType: 'EXC-G290C-B2' },
  { no: 3, moduleName: 'EXC_12_4', moduleType: 'EXC-G290C-C3' },
  { no: 4, moduleName: 'EXC_11_5', moduleType: 'EXC-G290C-D5' },
  { no: 5, moduleName: 'EXC_14_6', moduleType: 'EXC-G290C-P7' },
  { no: 6, moduleName: 'EXC_13_7', moduleType: 'EXC-G290C-L4' },
  { no: 7, moduleName: '内置6回路模块', moduleType: 'EXC-G290C-B2' }
])

const alarmList = ref([
  { level: '提示告警', levelClass: 'info', type: '网络状态', occurTime: '2025-05-06 16:09:17', duration: '357天1时45分', recoverTime: '-', description: '4g网络状态异常,请及时处理', status: '持续中' },
  { level: '提示告警', levelClass: 'info', type: '离线告警', occurTime: '2025-06-18 19:12:00', duration: '313天22时43分', recoverTime: '-', description: '当前集控产生离线告警，请及时处理！', status: '持续中' }
])

const handleCheckChange = () => {}
const viewDeviceDetail = () => {
  showDetailDialog.value = true
}
const handleReadBack = () => {
  ElMessage.success('回读成功')
}
const handleAllOpen = () => {
  ElMessageBox.confirm('确定要对所有回路执行全开操作吗？', '全开确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    circuitList.value.forEach(circuit => {
      circuit.switchStatus = '开'
    })
    ElMessage.success('全开命令下发成功')
  }).catch(() => {})
}
const handleAllClose = () => {
  ElMessageBox.confirm('确定要对所有回路执行全关操作吗？', '全关确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    circuitList.value.forEach(circuit => {
      circuit.switchStatus = '关'
    })
    ElMessage.success('全关命令下发成功')
  }).catch(() => {})
}
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该集控设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = deviceList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      deviceList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}
const submitForm = () => {
  ElMessage.success('新增成功')
  showAddDialog.value = false
}
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.page-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.header-right {
  display: flex;
  gap: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 15px;
  overflow: hidden;
}

.left-panel {
  width: 200px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.device-list-panel {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-bar {
  margin-bottom: 15px;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 10px 0;
}

.detail-tabs {
  margin-top: 10px;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 15px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #333;
  min-width: 90px;
}

.info-value {
  color: #666;
}

.info-btn {
  margin-left: 8px;
}

.circuit-control-panel {
  padding: 10px 0;
}

.circuit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.update-time {
  color: #666;
  font-size: 13px;
}

.circuit-actions {
  display: flex;
  gap: 8px;
}

.module-info-panel {
  padding: 10px 0;
}

.energy-stat-panel {
  padding: 10px 0;
}

.energy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-type-btns {
  display: flex;
  gap: 5px;
}

.energy-chart-placeholder {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 20px;
  height: 350px;
}

.chart-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding-left: 60px;
}

.chart-tab {
  padding: 5px 10px;
  cursor: pointer;
  color: #666;
}

.chart-tab.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.chart-area {
  display: flex;
  height: 260px;
}

.chart-y-axis {
  width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #999;
  font-size: 12px;
}

.chart-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.chart-x-axis {
  display: flex;
  justify-content: space-around;
  color: #999;
  font-size: 12px;
  border-top: 1px solid #e8e8e8;
  padding-top: 10px;
}

.alarm-info-panel {
  padding: 10px 0;
}

.alarm-level-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  margin-right: 6px;
}

.alarm-level-dot.info {
  background: #409eff;
}
</style>
