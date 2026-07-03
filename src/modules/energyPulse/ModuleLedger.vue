<!--
  智光云枢 · 能源脉动 · 模块台账
  业务域：energyPulse
  功能：能源监测系统的模块台账管理，支持卡片/列表双视图、链路数据子表与详情抽屉检视
-->
<template>
  <section class="zg-module">
    <header class="zg-module__head">
      <div class="zg-module__headline">
        <div class="zg-module__sigil">
          <el-icon :size="22"><DataLine /></el-icon>
        </div>
        <div class="zg-module__copy">
          <h1 class="zg-module__title">模块台账</h1>
          <p class="zg-module__sub">
            能源监测模块管理 · 在役 {{ activeModuleCount }} 台 ·
            离线 {{ offlineModuleCount }} 台 · 累计链路 {{ totalCircuitCount }} 条
          </p>
        </div>
      </div>
      <div class="zg-module__cta">
        <el-button type="primary" @click="onRefreshModuleData">
          <el-icon><RefreshLeft /></el-icon>
          <span>刷新数据</span>
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ moduleCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">模块总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeModuleCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineModuleCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalCircuitCount }}</span>
        <span class="zg-metrics__lbl">链路总数</span>
      </div>
    </div>

    <div class="zg-filterband">
      <div class="zg-filterband__density">
        <el-radio-group v-model="densityMode" size="default">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            <span>卡片视图</span>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            <span>列表视图</span>
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="zg-filterband__fields">
        <el-select
          v-model="moduleCtl.statusBuckets"
          placeholder="网络状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
        </el-select>
        <el-input
          v-model="moduleCtl.filterLexicon"
          placeholder="检索设备名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="moduleCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="moduleCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="moduleCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="module in moduleCtl.pagedRows"
        :key="module.id"
        :class="[
          'zg-modulecard',
          module.networkStatus === 'online' ? 'online' : 'offline',
          { selected: focusedModule?.id === module.id }
        ]"
        @click="onSelectModule(module)"
      >
        <div class="zg-modulecard__head">
          <div class="zg-modulecard__glyph">
            <el-icon :size="24"><DataLine /></el-icon>
          </div>
          <span class="zg-status" :class="module.networkStatus === 'online' ? 'online' : 'offline'">
            <i class="dot"></i>{{ module.networkStatus === 'online' ? '在线' : '离线' }}
          </span>
        </div>
        <div class="zg-modulecard__body">
          <h3 class="zg-modulecard__name">{{ module.moduleName }}</h3>
          <p class="zg-modulecard__type">{{ module.moduleType }}</p>
          <div class="zg-modulecard__meta">
            <span class="zg-modulecard__prop">{{ module.deviceName }}</span>
            <span class="zg-modulecard__prop">{{ module.model }}</span>
          </div>
        </div>
        <div class="zg-modulecard__foot">
          <span class="zg-modulecard__time">地址: {{ module.moduleAddress }}</span>
          <div class="zg-modulecard__actions">
            <el-button link type="primary" size="small" @click.stop="moduleInspector.openInspector(module)">详情</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetireModule(module)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="zg-tablewrap">
      <el-table
        :data="moduleCtl.pagedRows"
        stripe
        class="zg-datatable"
        highlight-current-row
        @row-click="onSelectModule"
      >
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="deviceName" label="设备名称" min-width="150" />
        <el-table-column prop="moduleType" label="模块类型" min-width="180" />
        <el-table-column prop="moduleName" label="模块名称" min-width="120" />
        <el-table-column prop="moduleAddress" label="模块地址" width="100" align="center" />
        <el-table-column prop="model" label="模块型号" min-width="140" />
        <el-table-column prop="serialNumber" label="序列号" min-width="160" />
        <el-table-column prop="networkStatus" label="网络状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.networkStatus === 'online' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.networkStatus === 'online' ? '在线' : '离线' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="数据更新时间" width="180" />
        <el-table-column label="处置" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="moduleInspector.openInspector(row)">详情</el-button>
            <el-button type="danger" size="small" @click="onRetireModule(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="moduleCtl.pagingCursor"
        v-model:page-size="moduleCtl.pageSpan"
        :total="moduleCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <div v-if="focusedModule" class="zg-circuitpanel">
      <div class="zg-circuitpanel__header">
        <div class="zg-circuitpanel__title">
          <el-icon :size="18"><DataLine /></el-icon>
          <span>链路数据 · {{ focusedModule.moduleName }}</span>
        </div>
        <div class="zg-circuitpanel__meta">
          <span>共 {{ currentCircuitData.length }} 条链路</span>
        </div>
      </div>
      <div class="zg-circuitpanel__body">
        <el-table :data="currentCircuitData" size="small" border class="zg-circuitpanel__table">
          <el-table-column prop="no" label="序号" width="60" align="center" />
          <el-table-column prop="circuitName" label="链路名称" min-width="150" />
          <el-table-column prop="circuitNo" label="链路编号" width="100" />
          <el-table-column prop="currentA" label="A相电流(A)" width="110" align="right" />
          <el-table-column prop="currentB" label="B相电流(A)" width="110" align="right" />
          <el-table-column prop="currentC" label="C相电流(A)" width="110" align="right" />
          <el-table-column prop="circuitStatus" label="链路状态" width="100" align="center">
            <template #default="{ row }">
              <span class="zg-status" :class="row.circuitStatus === 'on' ? 'online' : 'idle'">
                <i class="dot"></i>{{ row.circuitStatus === 'on' ? '通电' : '断电' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="switchRecord" label="开关记录" width="180" />
          <el-table-column prop="display" label="是否显示" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.display" size="small" @change="onToggleCircuitDisplay(row)" />
            </template>
          </el-table-column>
          <el-table-column label="处置" width="80" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="onViewCircuitDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div v-else class="zg-circuitplaceholder">
      <el-alert title="请在上方列表中点击选择一个模块，查看其管控的供电链路数据" type="info" :closable="false" />
    </div>

    <el-drawer
      v-model="moduleInspector.drawerOpen"
      :title="'模块详情 · ' + (focusedModule?.moduleName || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedModule" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><DataLine /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedModule.moduleName }}</h2>
            <p class="zg-inspector__type">{{ focusedModule.moduleType }} · {{ focusedModule.model }}</p>
            <span class="zg-status" :class="focusedModule.networkStatus === 'online' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedModule.networkStatus === 'online' ? '在线' : '离线' }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">设备名称</span>
              <span class="val">{{ focusedModule.deviceName }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">模块地址</span>
              <span class="val">{{ focusedModule.moduleAddress }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">序列号</span>
              <span class="val">{{ focusedModule.serialNumber }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">数据更新时间</span>
              <span class="val">{{ focusedModule.updateTime }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">链路清单</h4>
          <div v-if="currentCircuitData.length > 0">
            <el-table :data="currentCircuitData" size="small" border>
              <el-table-column prop="no" label="序号" width="60" align="center" />
              <el-table-column prop="circuitName" label="链路名称" min-width="120" />
              <el-table-column prop="circuitNo" label="链路编号" width="100" />
              <el-table-column prop="circuitStatus" label="状态" width="90" align="center">
                <template #default="{ row }">
                  <span class="zg-status" :class="row.circuitStatus === 'on' ? 'online' : 'idle'">
                    <i class="dot"></i>{{ row.circuitStatus === 'on' ? '通电' : '断电' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="currentA" label="A相电流(A)" width="100" align="right" />
              <el-table-column prop="currentB" label="B相电流(A)" width="100" align="right" />
              <el-table-column prop="currentC" label="C相电流(A)" width="100" align="right" />
            </el-table>
          </div>
          <div v-else class="zg-inspector__empty">
            <span>暂无链路数据</span>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="moduleInspector.closeInspector()">关闭</el-button>
          <el-button type="danger" size="large" @click="onRetireModule(focusedModule)">废止模块</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      v-model="circuitDetailDrawer.open"
      :title="'链路详情 · ' + (selectedCircuit?.circuitName || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="selectedCircuit" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><DataLine /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ selectedCircuit.circuitName }}</h2>
            <p class="zg-inspector__type">{{ selectedCircuit.circuitNo }} · {{ selectedCircuit.circuitStatus === 'on' ? '通电' : '断电' }}</p>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">电流数据</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">A相电流</div>
              <div class="zg-datacard__val">{{ selectedCircuit.currentA }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">B相电流</div>
              <div class="zg-datacard__val">{{ selectedCircuit.currentB }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">C相电流</div>
              <div class="zg-datacard__val">{{ selectedCircuit.currentC }}<em>A</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">显示状态</div>
              <div class="zg-datacard__val">{{ selectedCircuit.display ? '显示' : '隐藏' }}</div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">开关记录</h4>
          <div class="zg-inspector__cell">
            <span class="lbl">最近操作</span>
            <span class="val">{{ selectedCircuit.switchRecord }}</span>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="circuitDetailDrawer.close()">关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 能源脉动 · 模块台账
 * 业务域：energyPulse
 * 功能：能源监测系统的模块台账管理，支持卡片/列表双视图、链路数据子表与详情抽屉检视
 * @module energyPulse/ModuleLedger
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataLine,
  Grid,
  List,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const densityMode = ref('card')

const circuitDetailDrawer = ref({
  open: false
})
const selectedCircuit = ref(null)

const initialModules = [
  { id: 1, no: 1, deviceName: '测试128M', moduleType: '8链路剩余电流检测单元', moduleName: 'EXC_13_2', moduleAddress: 2, model: 'EXC-G290C-L4', serialNumber: '113230802001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 2, no: 2, deviceName: '测试128M', moduleType: '6链路通断单元', moduleName: 'EXC_10_3', moduleAddress: 3, model: 'EXC-G290C-B2', serialNumber: '110231123001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 3, no: 3, deviceName: '测试128M', moduleType: '12链路电流检测单元', moduleName: 'EXC_12_4', moduleAddress: 4, model: 'EXC-G290C-C3', serialNumber: '112230620003', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 4, no: 4, deviceName: '测试128M', moduleType: '12链路输入状态检测单元', moduleName: 'EXC_11_5', moduleAddress: 5, model: 'EXC-G290C-D5', serialNumber: '111230620000', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 5, no: 5, deviceName: '测试128M', moduleType: '4链路供电控制单元', moduleName: 'EXC_14_6', moduleAddress: 6, model: 'EXC-G290C-P7', serialNumber: '114230210001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 6, no: 6, deviceName: '测试128M', moduleType: '8链路剩余电流检测单元', moduleName: 'EXC_13_7', moduleAddress: 7, model: 'EXC-G290C-L4', serialNumber: '113230620006', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 7, no: 7, deviceName: '测试128M', moduleType: '6链路通断单元', moduleName: '内置6链路模块', moduleAddress: 66, model: 'EXC-G290C-B2', serialNumber: '152403120001', networkStatus: 'offline', updateTime: '2025-06-18 19:12:00' },
  { id: 8, no: 8, deviceName: '园区290', moduleType: '6链路通断单元', moduleName: 'EXC_10_1', moduleAddress: 1, model: 'EXC-G290C-B2', serialNumber: '110231215560', networkStatus: 'online', updateTime: '2026-04-28 17:54:42' },
  { id: 9, no: 9, deviceName: '园区290', moduleType: '12链路电流检测单元', moduleName: 'EXC_12_2', moduleAddress: 2, model: 'EXC-G290C-C3', serialNumber: '112231215574', networkStatus: 'online', updateTime: '2026-04-28 17:54:42' }
]

const circuitDataPool = {
  1: [
    { id: 1, no: 1, circuitName: '链路1-剩余电流1', circuitNo: 'L1', currentA: 3.2, currentB: 3.0, currentC: 3.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 2, no: 2, circuitName: '链路1-剩余电流2', circuitNo: 'L2', currentA: 2.8, currentB: 2.9, currentC: 2.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 3, no: 3, circuitName: '链路1-剩余电流3', circuitNo: 'L3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 4, no: 4, circuitName: '链路1-剩余电流4', circuitNo: 'L4', currentA: 4.5, currentB: 4.6, currentC: 4.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 5, no: 5, circuitName: '链路1-剩余电流5', circuitNo: 'L5', currentA: 1.2, currentB: 1.3, currentC: 1.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: false },
    { id: 6, no: 6, circuitName: '链路1-剩余电流6', circuitNo: 'L6', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 7, no: 7, circuitName: '链路1-剩余电流7', circuitNo: 'L7', currentA: 2.1, currentB: 2.2, currentC: 2.0, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 8, no: 8, circuitName: '链路1-剩余电流8', circuitNo: 'L8', currentA: 1.5, currentB: 1.4, currentC: 1.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  2: [
    { id: 101, no: 1, circuitName: '链路2-控制1', circuitNo: 'C1', currentA: 5.2, currentB: 5.1, currentC: 5.0, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 102, no: 2, circuitName: '链路2-控制2', circuitNo: 'C2', currentA: 3.8, currentB: 3.7, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 103, no: 3, circuitName: '链路2-控制3', circuitNo: 'C3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 104, no: 4, circuitName: '链路2-控制4', circuitNo: 'C4', currentA: 2.5, currentB: 2.6, currentC: 2.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 105, no: 5, circuitName: '链路2-控制5', circuitNo: 'C5', currentA: 1.8, currentB: 1.9, currentC: 1.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: false },
    { id: 106, no: 6, circuitName: '链路2-控制6', circuitNo: 'C6', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true }
  ],
  3: [
    { id: 201, no: 1, circuitName: '链路3-检测1', circuitNo: 'D1', currentA: 4.2, currentB: 4.0, currentC: 4.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 202, no: 2, circuitName: '链路3-检测2', circuitNo: 'D2', currentA: 3.0, currentB: 3.1, currentC: 2.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 203, no: 3, circuitName: '链路3-检测3', circuitNo: 'D3', currentA: 1.5, currentB: 1.4, currentC: 1.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 204, no: 4, circuitName: '链路3-检测4', circuitNo: 'D4', currentA: 2.3, currentB: 2.4, currentC: 2.2, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 205, no: 5, circuitName: '链路3-检测5', circuitNo: 'D5', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: false },
    { id: 206, no: 6, circuitName: '链路3-检测6', circuitNo: 'D6', currentA: 3.7, currentB: 3.8, currentC: 3.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 207, no: 7, circuitName: '链路3-检测7', circuitNo: 'D7', currentA: 2.1, currentB: 2.0, currentC: 2.2, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 208, no: 8, circuitName: '链路3-检测8', circuitNo: 'D8', currentA: 1.0, currentB: 1.1, currentC: 0.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 209, no: 9, circuitName: '链路3-检测9', circuitNo: 'D9', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 210, no: 10, circuitName: '链路3-检测10', circuitNo: 'D10', currentA: 4.0, currentB: 4.1, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 211, no: 11, circuitName: '链路3-检测11', circuitNo: 'D11', currentA: 1.8, currentB: 1.9, currentC: 1.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 212, no: 12, circuitName: '链路3-检测12', circuitNo: 'D12', currentA: 2.5, currentB: 2.4, currentC: 2.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  4: [
    { id: 301, no: 1, circuitName: '链路4-输入1', circuitNo: 'I1', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 302, no: 2, circuitName: '链路4-输入2', circuitNo: 'I2', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 303, no: 3, circuitName: '链路4-输入3', circuitNo: 'I3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 304, no: 4, circuitName: '链路4-输入4', circuitNo: 'I4', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true }
  ],
  5: [
    { id: 401, no: 1, circuitName: '链路5-供电1', circuitNo: 'P1', currentA: 10.5, currentB: 10.6, currentC: 10.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 402, no: 2, circuitName: '链路5-供电2', circuitNo: 'P2', currentA: 8.2, currentB: 8.1, currentC: 8.3, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 403, no: 3, circuitName: '链路5-供电3', circuitNo: 'P3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 404, no: 4, circuitName: '链路5-供电4', circuitNo: 'P4', currentA: 15.3, currentB: 15.2, currentC: 15.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  6: [
    { id: 501, no: 1, circuitName: '链路6-剩余电流A', circuitNo: 'LA1', currentA: 2.2, currentB: 2.3, currentC: 2.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 502, no: 2, circuitName: '链路6-剩余电流B', circuitNo: 'LA2', currentA: 1.8, currentB: 1.7, currentC: 1.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  7: [
    { id: 601, no: 1, circuitName: '内置链路1', circuitNo: 'B1', currentA: 3.2, currentB: 3.0, currentC: 3.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 602, no: 2, circuitName: '内置链路2', circuitNo: 'B2', currentA: 2.8, currentB: 2.9, currentC: 2.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 603, no: 3, circuitName: '内置链路3', circuitNo: 'B3', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 604, no: 4, circuitName: '内置链路4', circuitNo: 'B4', currentA: 4.5, currentB: 4.6, currentC: 4.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 605, no: 5, circuitName: '内置链路5', circuitNo: 'B5', currentA: 1.2, currentB: 1.3, currentC: 1.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: false },
    { id: 606, no: 6, circuitName: '内置链路6', circuitNo: 'B6', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true }
  ],
  8: [
    { id: 701, no: 1, circuitName: '园区链路1', circuitNo: 'Y1', currentA: 5.5, currentB: 5.4, currentC: 5.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 702, no: 2, circuitName: '园区链路2', circuitNo: 'Y2', currentA: 4.2, currentB: 4.3, currentC: 4.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 703, no: 3, circuitName: '园区链路3', circuitNo: 'Y3', currentA: 3.8, currentB: 3.7, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 704, no: 4, circuitName: '园区链路4', circuitNo: 'Y4', currentA: 2.5, currentB: 2.6, currentC: 2.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 705, no: 5, circuitName: '园区链路5', circuitNo: 'Y5', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 706, no: 6, circuitName: '园区链路6', circuitNo: 'Y6', currentA: 6.1, currentB: 6.0, currentC: 6.2, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ],
  9: [
    { id: 801, no: 1, circuitName: '园区检测链路1', circuitNo: 'YD1', currentA: 7.2, currentB: 7.3, currentC: 7.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 802, no: 2, circuitName: '园区检测链路2', circuitNo: 'YD2', currentA: 6.8, currentB: 6.7, currentC: 6.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 803, no: 3, circuitName: '园区检测链路3', circuitNo: 'YD3', currentA: 5.5, currentB: 5.6, currentC: 5.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 804, no: 4, circuitName: '园区检测链路4', circuitNo: 'YD4', currentA: 4.0, currentB: 4.1, currentC: 3.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 805, no: 5, circuitName: '园区检测链路5', circuitNo: 'YD5', currentA: 3.2, currentB: 3.1, currentC: 3.3, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 806, no: 6, circuitName: '园区检测链路6', circuitNo: 'YD6', currentA: 2.8, currentB: 2.9, currentC: 2.7, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 807, no: 7, circuitName: '园区检测链路7', circuitNo: 'YD7', currentA: 1.5, currentB: 1.4, currentC: 1.6, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 808, no: 8, circuitName: '园区检测链路8', circuitNo: 'YD8', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 809, no: 9, circuitName: '园区检测链路9', circuitNo: 'YD9', currentA: 1.0, currentB: 1.1, currentC: 0.9, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 810, no: 10, circuitName: '园区检测链路10', circuitNo: 'YD10', currentA: 0.5, currentB: 0.6, currentC: 0.4, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true },
    { id: 811, no: 11, circuitName: '园区检测链路11', circuitNo: 'YD11', currentA: 0.0, currentB: 0.0, currentC: 0.0, circuitStatus: 'off', switchRecord: '2026-05-13 22:00:00 关', display: true },
    { id: 812, no: 12, circuitName: '园区检测链路12', circuitNo: 'YD12', currentA: 2.0, currentB: 1.9, currentC: 2.1, circuitStatus: 'on', switchRecord: '2026-05-14 06:00:00 开', display: true }
  ]
}

const moduleCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialModules
})

const moduleInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedModule = computed(() => moduleInspector.focusedRecord)

const currentCircuitData = computed(() => {
  if (!focusedModule.value) return []
  return circuitDataPool[focusedModule.value.id] || []
})

const activeModuleCount = computed(
  () => moduleCtl.presetPlaybook.filter(m => m.networkStatus === 'online').length
)

const offlineModuleCount = computed(
  () => moduleCtl.presetPlaybook.filter(m => m.networkStatus === 'offline').length
)

const totalCircuitCount = computed(() => {
  return Object.values(circuitDataPool).reduce((sum, circuits) => sum + circuits.length, 0)
})

/**
 * 选中模块：触发链路数据加载，高亮当前模块
 * @param {Object} module 目标模块记录
 */
const onSelectModule = (module) => {
  moduleInspector.focusedRecord = module
  ElMessage.info(`已选择模块：${module.moduleName}`)
}

/**
 * 废止模块：二次确认后从台账中移除
 * @param {Object} module 目标模块记录
 */
const onRetireModule = (module) => {
  ElMessageBox.confirm(
    `确定要将「${module.moduleName}」从模块台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      moduleCtl.retireRecord(module.id)
      moduleInspector.closeInspector()
      ElMessage.success('模块已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 刷新模块数据：重新加载台账数据池
 */
const onRefreshModuleData = () => {
  moduleCtl.refreshPlaybook()
  ElMessage.success('模块台账数据已刷新')
}

/**
 * 切换链路显示状态：控制链路在视图中的可见性
 * @param {Object} circuit 目标链路记录
 */
const onToggleCircuitDisplay = (circuit) => {
  ElMessage.success(`${circuit.circuitName} 显示状态已${circuit.display ? '开启' : '关闭'}`)
}

/**
 * 查看链路详情：打开链路详情抽屉
 * @param {Object} circuit 目标链路记录
 */
const onViewCircuitDetail = (circuit) => {
  selectedCircuit.value = circuit
  circuitDetailDrawer.value.open = true
}
</script>

<style scoped lang="scss">
.zg-module {
  padding: 24px;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__headline {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__sigil {
    width: 44px;
    height: 44px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--zg-shadow-btn);
  }

  &__copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__sub {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }
}

.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  &__cell {
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: var(--zg-shadow-card);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background: var(--zg-brand-primary);
    }

    &--ok::before { background: var(--zg-success); }
    &--warn::before { background: var(--zg-warning); }
    &--info::before { background: var(--zg-info); }
  }

  &__num {
    font-size: 26px;
    font-weight: 700;
    color: var(--zg-ink-primary);
    line-height: 1;
  }

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-filterband {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 14px 18px;
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  flex-wrap: wrap;

  &__fields {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__select { width: 160px; }
  &__search { width: 240px; }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-modulecard {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--zg-transition-normal);
  display: flex;
  flex-direction: column;
  gap: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--zg-shadow-card-hover);
    border-color: var(--zg-line-brand);
  }

  &.selected {
    border-color: var(--zg-brand-primary);
    box-shadow: var(--zg-shadow-card-hover);
  }

  &.offline {
    border-left: 3px solid var(--zg-danger);
  }
  &.online {
    border-left: 3px solid var(--zg-success);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__glyph {
    width: 38px;
    height: 38px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-brand-tint-50);
    color: var(--zg-brand-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__type {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  &__prop {
    font-size: 12px;
    color: var(--zg-ink-secondary);
    padding: 2px 6px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-sm);
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }

  &__time {
    font-size: 12px;
    color: var(--zg-ink-placeholder);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--zg-line-soft);
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
}

.zg-circuitpanel {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  overflow: hidden;
  margin-bottom: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: var(--zg-surface-muted);
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
  }

  &__meta {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
  }

  &__body {
    padding: 16px;
  }

  &__table {
    width: 100%;
  }
}

.zg-circuitplaceholder {
  background: var(--zg-surface-card);
  border: 1px dashed var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 32px;
  margin-bottom: 16px;
}

.zg-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--zg-radius-pill);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &.online {
    color: var(--zg-success);
    background: var(--zg-success-soft);
  }
  &.offline {
    color: var(--zg-danger);
    background: var(--zg-danger-soft);
  }
  &.idle {
    color: var(--zg-warning);
    background: var(--zg-warning-soft);
  }
}

.zg-inspector {
  &__head {
    display: flex;
    gap: 14px;
    align-items: center;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--zg-line-soft);
    margin-bottom: 18px;
  }

  &__glyph {
    width: 56px;
    height: 56px;
    border-radius: var(--zg-radius-lg);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__type {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__section {
    margin-bottom: 22px;
  }

  &__section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    margin: 0 0 12px;
    padding-left: 8px;
    border-left: 3px solid var(--zg-brand-primary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  &__cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);

    .lbl {
      font-size: 12px;
      color: var(--zg-ink-tertiary);
    }
    .val {
      font-size: 14px;
      color: var(--zg-ink-primary);
      font-weight: 500;
    }
  }

  &__empty {
    padding: 20px;
    text-align: center;
    color: var(--zg-ink-placeholder);
    font-size: 13px;
  }

  &__actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 18px;
    border-top: 1px solid var(--zg-line-soft);
    margin-top: 8px;
  }
}

.zg-datagrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.zg-datacard {
  padding: 14px 16px;
  background: var(--zg-gradient-surface);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);

  &__lbl {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin-bottom: 6px;
  }

  &__val {
    font-size: 22px;
    font-weight: 700;
    color: var(--zg-brand-primary);

    em {
      font-style: normal;
      font-size: 13px;
      color: var(--zg-ink-tertiary);
      margin-left: 4px;
      font-weight: 400;
    }
  }
}
</style>