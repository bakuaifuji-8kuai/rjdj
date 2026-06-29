<template>
  <div class="module-info-container">
    <div class="page-header">
      <div class="title">模块信息</div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input
            v-model="searchForm.deviceName"
            placeholder="请输入集控名称"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="请选择模块状态" class="search-select">
            <el-option label="全部状态" value="" />
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table 
        :data="filteredModules" 
        border 
        :height="350" 
        class="module-table"
        @row-click="handleModuleClick"
        :row-class-name="getRowClassName"
        highlight-current-row
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="no" label="No" width="60" align="center" />
        <el-table-column prop="deviceName" label="设备名称" min-width="150" />
        <el-table-column prop="moduleType" label="模块类型" min-width="180" />
        <el-table-column prop="moduleName" label="模块名称" min-width="120" />
        <el-table-column prop="moduleAddress" label="模块地址" width="100" align="center" />
        <el-table-column prop="model" label="模块型号" min-width="140" />
        <el-table-column prop="serialNumber" label="序列号" min-width="160" />
        <el-table-column prop="networkStatus" label="网络状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
              {{ row.networkStatus === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="数据更新时间" width="180" />
      </el-table>
    </div>

    <div class="pagination">
      <span style="margin-right: 10px;">上一页</span>
      <el-select v-model="currentPage" style="width: 60px; margin: 0 5px;">
        <el-option v-for="page in totalPages" :key="page" :value="page" :label="page" />
      </el-select>
      <span style="margin: 0 5px;">下一页</span>
      <span style="margin: 0 10px;">前往</span>
      <el-input-number v-model="currentPage" :min="1" :max="totalPages" style="width: 80px;" />
      <span style="margin: 0 5px;">页</span>
      <span>每页显示</span>
      <el-select v-model="pageSize" style="width: 80px; margin: 0 5px;">
        <el-option :value="10" label="10" />
        <el-option :value="20" label="20" />
        <el-option :value="50" label="50" />
      </el-select>
      <span>条 共 {{ total }} 条</span>
    </div>

    <div class="circuit-section" v-show="showCircuit">
      <div class="section-header">
        <span class="section-title">
          {{ selectedModule ? `回路数据 - ${selectedModule.moduleName}` : '回路数据' }}
        </span>
        <div class="section-actions">
          <el-button type="text" @click="showCircuit = false">隐藏</el-button>
          <el-button type="text" @click="showCircuit = true">显示</el-button>
        </div>
      </div>

      <div v-if="!selectedModule" class="no-selection-tip">
        <el-alert title="请在上表中点击选择一个模块，查看其管控的供电回路" type="info" :closable="false" />
      </div>

      <div v-else class="circuit-table-container">
        <el-table :data="currentCircuitData" border :height="280" class="circuit-table">
          <el-table-column type="selection" width="45" />
          <el-table-column prop="no" label="No" width="60" align="center" />
          <el-table-column prop="circuitName" label="回路名称" min-width="150" />
          <el-table-column prop="circuitNo" label="回路编号" width="100" />
          <el-table-column prop="currentA" label="A相电流(A)" width="120" align="right">
            <template #default="{ row }">
              <span>{{ row.currentA }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="currentB" label="B相电流(A)" width="120" align="right">
            <template #default="{ row }">
              <span>{{ row.currentB }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="currentC" label="C相电流(A)" width="120" align="right">
            <template #default="{ row }">
              <span>{{ row.currentC }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="circuitStatus" label="回路状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.circuitStatus === 'on' ? 'success' : 'danger'" size="small">
                {{ row.circuitStatus === 'on' ? '通电' : '断电' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="switchRecord" label="开关记录" width="180" />
          <el-table-column prop="display" label="是否显示" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.display" size="small" @change="toggleDisplay(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="selectedModule" class="circuit-pagination">
        <span>上一页</span>
        <el-select v-model="circuitPage" style="width: 60px; margin: 0 5px;">
          <el-option v-for="page in circuitTotalPages" :key="page" :value="page" :label="page" />
        </el-select>
        <span>下一页</span>
        <span style="margin: 0 10px;">前往</span>
        <el-input-number v-model="circuitPage" :min="1" :max="circuitTotalPages" style="width: 80px;" />
        <span style="margin: 0 5px;">页</span>
        <span>每页显示</span>
        <el-select v-model="circuitPageSize" style="width: 80px; margin: 0 5px;">
          <el-option :value="10" label="10" />
        </el-select>
        <span>条 共 {{ circuitTotal }} 条</span>
      </div>
    </div>

    <div class="circuit-toggle" v-if="!showCircuit">
      <el-button type="text" @click="showCircuit = true">显示</el-button>
    </div>

    <el-dialog v-model="showDetail" title="回路详情" width="500px">
      <div class="detail-info">
        <div class="info-row">
          <label>所属模块：</label>
          <span>{{ selectedModule?.moduleName }}</span>
        </div>
        <div class="info-row">
          <label>回路名称：</label>
          <span>{{ selectedCircuit?.circuitName }}</span>
        </div>
        <div class="info-row">
          <label>回路编号：</label>
          <span>{{ selectedCircuit?.circuitNo }}</span>
        </div>
        <div class="info-row">
          <label>A相电流：</label>
          <span>{{ selectedCircuit?.currentA }} A</span>
        </div>
        <div class="info-row">
          <label>B相电流：</label>
          <span>{{ selectedCircuit?.currentB }} A</span>
        </div>
        <div class="info-row">
          <label>C相电流：</label>
          <span>{{ selectedCircuit?.currentC }} A</span>
        </div>
        <div class="info-row">
          <label>回路状态：</label>
          <span>{{ selectedCircuit?.circuitStatus === 'on' ? '通电' : '断电' }}</span>
        </div>
        <div class="info-row">
          <label>开关记录：</label>
          <span>{{ selectedCircuit?.switchRecord }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  deviceName: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showCircuit = ref(true)
const showDetail = ref(false)
const selectedCircuit = ref(null)
const selectedModule = ref(null)
const circuitPage = ref(1)
const circuitPageSize = ref(10)
const circuitTotal = ref(0)

const modules = ref([
  { id: 1, no: 1, deviceName: '测试128M', moduleType: '8回路剩余电流检测单元', moduleName: 'EXC_13_2', moduleAddress: 2, model: 'EXC-G290C-L4', serialNumber: '113230802001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 2, no: 2, deviceName: '测试128M', moduleType: '6回路控制单元', moduleName: 'EXC_10_3', moduleAddress: 3, model: 'EXC-G290C-B2', serialNumber: '110231123001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 3, no: 3, deviceName: '测试128M', moduleType: '12回路电流检测单元', moduleName: 'EXC_12_4', moduleAddress: 4, model: 'EXC-G290C-C3', serialNumber: '112230620003', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 4, no: 4, deviceName: '测试128M', moduleType: '12回路输入状态检测单元', moduleName: 'EXC_11_5', moduleAddress: 5, model: 'EXC-G290C-D5', serialNumber: '111230620000', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 5, no: 5, deviceName: '测试128M', moduleType: '4回路供电控制单元', moduleName: 'EXC_14_6', moduleAddress: 6, model: 'EXC-G290C-P7', serialNumber: '114230210001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 6, no: 6, deviceName: '测试128M', moduleType: '8回路剩余电流检测单元', moduleName: 'EXC_13_7', moduleAddress: 7, model: 'EXC-G290C-L4', serialNumber: '113230620006', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 7, no: 7, deviceName: '测试128M', moduleType: '6回路控制单元', moduleName: '内置6回路模块', moduleAddress: 66, model: 'EXC-G290C-B2', serialNumber: '152403120001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 8, no: 8, deviceName: '园区290', moduleType: '6回路控制单元', moduleName: 'EXC_10_1', moduleAddress: 1, model: 'EXC-G290C-B2', serialNumber: '110231215560', networkStatus: 'online', updateTime: '2026-04-28 17:54:42' },
  { id: 9, no: 9, deviceName: '园区290', moduleType: '12回路电流检测单元', moduleName: 'EXC_12_2', moduleAddress: 2, model: 'EXC-G290C-C3', serialNumber: '112231215574', networkStatus: 'online', updateTime: '2026-04-28 17:54:42' }
])

total.value = modules.value.length

const allCircuitData = ref({
  1: [
    { id: 1, no: 1, circuitName: '回路1-剩余电流1', circuitNo: 'L1', currentA: 3.2, currentB: 3.0, currentC: 3.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 2, no: 2, circuitName: '回路1-剩余电流2', circuitNo: 'L2', currentA: 2.8, currentB: 2.9, currentC: 2.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 3, no: 3, circuitName: '回路1-剩余电流3', circuitNo: 'L3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 4, no: 4, circuitName: '回路1-剩余电流4', circuitNo: 'L4', currentA: 4.5, currentB: 4.6, currentC: 4.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 5, no: 5, circuitName: '回路1-剩余电流5', circuitNo: 'L5', currentA: 1.2, currentB: 1.3, currentC: 1.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: false },
    { id: 6, no: 6, circuitName: '回路1-剩余电流6', circuitNo: 'L6', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 7, no: 7, circuitName: '回路1-剩余电流7', circuitNo: 'L7', currentA: 2.1, currentB: 2.2, currentC: 2.0, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 8, no: 8, circuitName: '回路1-剩余电流8', circuitNo: 'L8', currentA: 1.5, currentB: 1.4, currentC: 1.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  2: [
    { id: 101, no: 1, circuitName: '回路2-控制1', circuitNo: 'C1', currentA: 5.2, currentB: 5.1, currentC: 5.0, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 102, no: 2, circuitName: '回路2-控制2', circuitNo: 'C2', currentA: 3.8, currentB: 3.7, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 103, no: 3, circuitName: '回路2-控制3', circuitNo: 'C3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 104, no: 4, circuitName: '回路2-控制4', circuitNo: 'C4', currentA: 2.5, currentB: 2.6, currentC: 2.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 105, no: 5, circuitName: '回路2-控制5', circuitNo: 'C5', currentA: 1.8, currentB: 1.9, currentC: 1.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: false },
    { id: 106, no: 6, circuitName: '回路2-控制6', circuitNo: 'C6', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true }
  ],
  3: [
    { id: 201, no: 1, circuitName: '回路3-检测1', circuitNo: 'D1', currentA: 4.2, currentB: 4.0, currentC: 4.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 202, no: 2, circuitName: '回路3-检测2', circuitNo: 'D2', currentA: 3.0, currentB: 3.1, currentC: 2.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 203, no: 3, circuitName: '回路3-检测3', circuitNo: 'D3', currentA: 1.5, currentB: 1.4, currentC: 1.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 204, no: 4, circuitName: '回路3-检测4', circuitNo: 'D4', currentA: 2.3, currentB: 2.4, currentC: 2.2, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 205, no: 5, circuitName: '回路3-检测5', circuitNo: 'D5', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: false },
    { id: 206, no: 6, circuitName: '回路3-检测6', circuitNo: 'D6', currentA: 3.7, currentB: 3.8, currentC: 3.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 207, no: 7, circuitName: '回路3-检测7', circuitNo: 'D7', currentA: 2.1, currentB: 2.0, currentC: 2.2, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 208, no: 8, circuitName: '回路3-检测8', circuitNo: 'D8', currentA: 1.0, currentB: 1.1, currentC: 0.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 209, no: 9, circuitName: '回路3-检测9', circuitNo: 'D9', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 210, no: 10, circuitName: '回路3-检测10', circuitNo: 'D10', currentA: 4.0, currentB: 4.1, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 211, no: 11, circuitName: '回路3-检测11', circuitNo: 'D11', currentA: 1.8, currentB: 1.9, currentC: 1.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 212, no: 12, circuitName: '回路3-检测12', circuitNo: 'D12', currentA: 2.5, currentB: 2.4, currentC: 2.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  4: [
    { id: 301, no: 1, circuitName: '回路4-输入1', circuitNo: 'I1', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 302, no: 2, circuitName: '回路4-输入2', circuitNo: 'I2', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 303, no: 3, circuitName: '回路4-输入3', circuitNo: 'I3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 304, no: 4, circuitName: '回路4-输入4', circuitNo: 'I4', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true }
  ],
  5: [
    { id: 401, no: 1, circuitName: '回路5-供电1', circuitNo: 'P1', currentA: 10.5, currentB: 10.6, currentC: 10.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 402, no: 2, circuitName: '回路5-供电2', circuitNo: 'P2', currentA: 8.2, currentB: 8.1, currentC: 8.3, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 403, no: 3, circuitName: '回路5-供电3', circuitNo: 'P3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 404, no: 4, circuitName: '回路5-供电4', circuitNo: 'P4', currentA: 15.3, currentB: 15.2, currentC: 15.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  6: [
    { id: 501, no: 1, circuitName: '回路6-剩余电流A', circuitNo: 'LA1', currentA: 2.2, currentB: 2.3, currentC: 2.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 502, no: 2, circuitName: '回路6-剩余电流B', circuitNo: 'LA2', currentA: 1.8, currentB: 1.7, currentC: 1.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  7: [
    { id: 601, no: 1, circuitName: '内置回路1', circuitNo: 'B1', currentA: 3.2, currentB: 3.0, currentC: 3.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 602, no: 2, circuitName: '内置回路2', circuitNo: 'B2', currentA: 2.8, currentB: 2.9, currentC: 2.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 603, no: 3, circuitName: '内置回路3', circuitNo: 'B3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 604, no: 4, circuitName: '内置回路4', circuitNo: 'B4', currentA: 4.5, currentB: 4.6, currentC: 4.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 605, no: 5, circuitName: '内置回路5', circuitNo: 'B5', currentA: 1.2, currentB: 1.3, currentC: 1.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: false },
    { id: 606, no: 6, circuitName: '内置回路6', circuitNo: 'B6', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true }
  ],
  8: [
    { id: 701, no: 1, circuitName: '园区回路1', circuitNo: 'Y1', currentA: 5.5, currentB: 5.4, currentC: 5.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 702, no: 2, circuitName: '园区回路2', circuitNo: 'Y2', currentA: 4.2, currentB: 4.3, currentC: 4.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 703, no: 3, circuitName: '园区回路3', circuitNo: 'Y3', currentA: 3.8, currentB: 3.7, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 704, no: 4, circuitName: '园区回路4', circuitNo: 'Y4', currentA: 2.5, currentB: 2.6, currentC: 2.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 705, no: 5, circuitName: '园区回路5', circuitNo: 'Y5', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 706, no: 6, circuitName: '园区回路6', circuitNo: 'Y6', currentA: 6.1, currentB: 6.0, currentC: 6.2, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  9: [
    { id: 801, no: 1, circuitName: '园区检测回路1', circuitNo: 'YD1', currentA: 7.2, currentB: 7.3, currentC: 7.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 802, no: 2, circuitName: '园区检测回路2', circuitNo: 'YD2', currentA: 6.8, currentB: 6.7, currentC: 6.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 803, no: 3, circuitName: '园区检测回路3', circuitNo: 'YD3', currentA: 5.5, currentB: 5.6, currentC: 5.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 804, no: 4, circuitName: '园区检测回路4', circuitNo: 'YD4', currentA: 4.0, currentB: 4.1, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 805, no: 5, circuitName: '园区检测回路5', circuitNo: 'YD5', currentA: 3.2, currentB: 3.1, currentC: 3.3, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 806, no: 6, circuitName: '园区检测回路6', circuitNo: 'YD6', currentA: 2.8, currentB: 2.9, currentC: 2.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 807, no: 7, circuitName: '园区检测回路7', circuitNo: 'YD7', currentA: 1.5, currentB: 1.4, currentC: 1.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 808, no: 8, circuitName: '园区检测回路8', circuitNo: 'YD8', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 809, no: 9, circuitName: '园区检测回路9', circuitNo: 'YD9', currentA: 1.0, currentB: 1.1, currentC: 0.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 810, no: 10, circuitName: '园区检测回路10', circuitNo: 'YD10', currentA: 0.5, currentB: 0.6, currentC: 0.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 811, no: 11, circuitName: '园区检测回路11', circuitNo: 'YD11', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 812, no: 12, circuitName: '园区检测回路12', circuitNo: 'YD12', currentA: 2.0, currentB: 1.9, currentC: 2.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ]
})

const currentCircuitData = computed(() => {
  if (!selectedModule.value) return []
  return allCircuitData.value[selectedModule.value.id] || []
})

const filteredModules = computed(() => {
  let result = modules.value
  if (searchForm.deviceName) result = result.filter(m => m.deviceName.includes(searchForm.deviceName))
  if (searchForm.status) result = result.filter(m => m.networkStatus === searchForm.status)
  return result
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const circuitTotalPages = computed(() => Math.ceil(circuitTotal.value / circuitPageSize.value))

const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.deviceName = ''
  searchForm.status = ''
  currentPage.value = 1
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const toggleDisplay = (row) => {
  ElMessage.success(`${row.circuitName} 显示状态已${row.display ? '开启' : '关闭'}`)
}

const viewDetail = (row) => {
  selectedCircuit.value = row
  showDetail.value = true
}

const handleModuleClick = (row) => {
  selectedModule.value = row
  circuitPage.value = 1
  circuitTotal.value = currentCircuitData.value.length
  ElMessage.info(`已选择模块：${row.moduleName}`)
}

const getRowClassName = ({ row }) => {
  return selectedModule.value?.id === row.id ? 'selected-row' : ''
}
</script>

<style scoped>
.module-info-container {
  padding: 20px;
  min-height: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-input {
  width: 200px;
}

.search-select {
  width: 150px;
}

.table-container {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.module-table {
  width: 100%;
}

.selected-row {
  background-color: #ecf5ff !important;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.circuit-section {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.section-title {
  font-weight: 600;
  color: #333;
}

.section-actions {
  display: flex;
  gap: 20px;
}

.circuit-table-container {
  padding: 15px;
}

.circuit-table {
  width: 100%;
}

.circuit-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 15px;
  border-top: 1px solid #e8e8e8;
}

.circuit-toggle {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-selection-tip {
  padding: 30px;
  text-align: center;
}

.detail-info {
  padding: 20px;
}

.info-row {
  margin-bottom: 15px;
  display: flex;
}

.info-row label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.info-row span {
  color: #333;
}
</style>
