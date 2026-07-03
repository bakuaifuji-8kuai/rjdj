<!--
  智光云枢 · 终端图谱 · 光源台账
  业务域：terminalAtlas
  功能：城市照明光源设备的台账管理与远程控制
        支持左树右表布局、卡片/列表双视图、抽屉式详情与调光、开关灯记录查询
-->
<template>
  <section class="zg-fixturelist">
    <!-- 页面头部：品牌徽标 + 标题 + 操作按钮 -->
    <header class="zg-fixturelist__head">
      <div class="zg-fixturelist__headline">
        <div class="zg-fixturelist__sigil">
          <el-icon :size="22"><Sunny /></el-icon>
        </div>
        <div class="zg-fixturelist__copy">
          <h1 class="zg-fixturelist__title">光源台账</h1>
          <p class="zg-fixturelist__sub">
            城市照明光源设备管理 · 在役 {{ activeFixtureCount }} 台 ·
            亮灯 {{ lampOnCount }} 台 · 离线 {{ offlineCount }} 台
          </p>
        </div>
      </div>
      <div class="zg-fixturelist__cta">
        <el-button type="primary" @click="onTurnOn">
          <el-icon><Lightning /></el-icon>
          <span>开灯</span>
        </el-button>
        <el-button type="danger" @click="onTurnOff">
          <el-icon><Lightning /></el-icon>
          <span>关灯</span>
        </el-button>
        <el-button @click="onDimming">
          <el-icon><Sunny /></el-icon>
          <span>调光</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ fixtureCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">光源总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ onlineCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ lampOnCount }}</span>
        <span class="zg-metrics__lbl">当前亮灯</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ activeFixtureCount }}</span>
        <span class="zg-metrics__lbl">在役设备</span>
      </div>
    </div>

    <!-- 左树右表主布局 -->
    <div class="zg-fixturelist__layout">
      <!-- 左侧树面板 -->
      <aside class="zg-fixturelist__sidebar">
        <div class="zg-fixturelist__sidebar-header">
          <el-input
            v-model="treeSearch"
            placeholder="搜索层级名称"
            class="zg-fixturelist__tree-search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-tree
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :expand-on-click-node="false"
          @check="onTreeCheck"
          class="zg-fixturelist__tree"
        />
      </aside>

      <!-- 右侧内容区 -->
      <main class="zg-fixturelist__main">
        <!-- 过滤工具栏 -->
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
              v-model="filterProduct"
              placeholder="所属产品"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="全部" value="" />
              <el-option label="电信CAT1" value="电信CAT1" />
              <el-option label="EXC-CAT1" value="EXC-CAT1" />
            </el-select>
            <el-select
              v-model="filterLampStatus"
              placeholder="光源状态"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="全部" value="" />
              <el-option label="开" value="开" />
              <el-option label="关" value="关" />
            </el-select>
            <el-select
              v-model="filterNetworkStatus"
              placeholder="网络状态"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="全部" value="" />
              <el-option label="在线" value="在线" />
              <el-option label="离线" value="离线" />
            </el-select>
            <el-select
              v-model="filterAvailable"
              placeholder="可用状态"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="全部" value="" />
              <el-option label="在役" value="在役" />
              <el-option label="不在役" value="不在役" />
            </el-select>
            <el-input
              v-model="searchText"
              placeholder="检索IMEI号/名称"
              clearable
              class="zg-filterband__search"
              @keyup.enter="onFilterApply"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="onFilterApply">
              <el-icon><Search /></el-icon>
              <span>检索</span>
            </el-button>
            <el-button @click="onFilterReset">
              <el-icon><RefreshLeft /></el-icon>
              <span>重置</span>
            </el-button>
          </div>
        </div>

        <!-- 卡片视图 -->
        <div v-if="densityMode === 'card'" class="zg-cardgrid">
          <article
            v-for="fixture in filteredRows"
            :key="fixture.id"
            class="zg-fixturecard"
            :class="[
              fixture.lampStatus === '开' ? 'lit' : 'dark',
              fixture.networkStatus === '在线' ? 'online' : 'offline'
            ]"
            @click="fixtureInspector.openInspector(fixture)"
          >
            <div class="zg-fixturecard__head">
              <div class="zg-fixturecard__glyph">
                <el-icon :size="24"><Sunny /></el-icon>
              </div>
              <div class="zg-fixturecard__badges">
                <span class="zg-status" :class="fixture.lampStatus === '开' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ fixture.lampStatus }}
                </span>
                <span class="zg-status" :class="fixture.networkStatus === '在线' ? 'online' : 'danger'">
                  <i class="dot"></i>{{ fixture.networkStatus }}
                </span>
              </div>
            </div>
            <div class="zg-fixturecard__body">
              <h3 class="zg-fixturecard__name">{{ fixture.name }}</h3>
              <p class="zg-fixturecard__imei">{{ fixture.product }} · {{ fixture.imei }}</p>
              <div class="zg-fixturecard__stats">
                <span class="zg-fixturecard__stat">
                  <em>{{ fixture.loadWatt }}</em> W
                </span>
                <span class="zg-fixturecard__stat">
                  <em>{{ fixture.voltageProbe }}</em> V
                </span>
                <span class="zg-fixturecard__stat">
                  <em>{{ fixture.luminancePct }}</em>%
                </span>
              </div>
            </div>
            <div class="zg-fixturecard__foot">
              <span class="zg-fixturecard__time">最后在线 {{ fixture.lastOnline }}</span>
              <div class="zg-fixturecard__actions">
                <el-button link type="primary" size="small" @click.stop="onTurnOn(fixture)">开灯</el-button>
                <el-button link type="danger" size="small" @click.stop="onTurnOff(fixture)">关灯</el-button>
                <el-button link type="primary" size="small" @click.stop="onViewSwitchRecord(fixture)">记录</el-button>
              </div>
            </div>
          </article>
        </div>

        <!-- 列表视图 -->
        <div v-else class="zg-tablewrap">
          <el-table :data="filteredRows" stripe class="zg-datatable" @selection-change="onSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="product" label="所属产品" width="120" />
            <el-table-column prop="imei" label="IMEI号" min-width="150" />
            <el-table-column prop="name" label="光源名称" min-width="150" />
            <el-table-column prop="loadWatt" label="功率(W)" width="100" align="center" />
            <el-table-column prop="voltageProbe" label="电压(V)" width="100" align="center" />
            <el-table-column prop="amperageProbe" label="电流(mA)" width="110" align="center" />
            <el-table-column label="光源状态" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.lampStatus === '开' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.lampStatus }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="luminancePct" label="亮度(%)" width="100" align="center" />
            <el-table-column label="网络状态" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.networkStatus === '在线' ? 'online' : 'danger'">
                  <i class="dot"></i>{{ row.networkStatus }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="lastOnline" label="最后在线" min-width="160" />
            <el-table-column prop="strategy" label="当前处方" min-width="120" />
            <el-table-column label="可用状态" width="100" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.available === '在役' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.available }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="处置" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="fixtureInspector.openInspector(row)">详情</el-button>
                <el-button size="small" @click="onViewSwitchRecord(row)">记录</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页条 -->
        <div class="zg-pagerbar">
          <el-pagination
            v-model:current-page="fixtureCtl.pagingCursor"
            v-model:page-size="fixtureCtl.pageSpan"
            :total="filteredTotal"
            :page-sizes="[10, 15, 30, 50]"
            layout="prev, pager, next, jumper, ->, sizes, total"
            background
          />
        </div>
      </main>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="fixtureInspector.drawerOpen"
      :title="'光源详情 · ' + (focusedFixture?.name || '')"
      :size="fixtureInspector.drawerSize"
      :direction="fixtureInspector.drawerDirection"
    >
      <div v-if="focusedFixture" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Sunny /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedFixture.name }}</h2>
            <p class="zg-inspector__type">{{ focusedFixture.product }} · {{ focusedFixture.imei }}</p>
            <div class="zg-inspector__status">
              <span class="zg-status" :class="focusedFixture.lampStatus === '开' ? 'online' : 'offline'">
                <i class="dot"></i>{{ focusedFixture.lampStatus }}
              </span>
              <span class="zg-status" :class="focusedFixture.networkStatus === '在线' ? 'online' : 'danger'">
                <i class="dot"></i>{{ focusedFixture.networkStatus }}
              </span>
              <span class="zg-status" :class="focusedFixture.available === '在役' ? 'online' : 'idle'">
                <i class="dot"></i>{{ focusedFixture.available }}
              </span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">序号</span>
              <span class="val">{{ focusedFixture.no }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">IMEI号</span>
              <span class="val">{{ focusedFixture.imei }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">当前处方</span>
              <span class="val">{{ focusedFixture.strategy || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后在线</span>
              <span class="val">{{ focusedFixture.lastOnline }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率</div>
              <div class="zg-datacard__val">{{ focusedFixture.loadWatt }}<em>W</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedFixture.voltageProbe }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电流</div>
              <div class="zg-datacard__val">{{ focusedFixture.amperageProbe }}<em>mA</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">亮度</div>
              <div class="zg-datacard__val">{{ focusedFixture.luminancePct }}<em>%</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="fixtureInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="onTurnOn(focusedFixture)">开灯</el-button>
          <el-button type="danger" size="large" @click="onTurnOff(focusedFixture)">关灯</el-button>
          <el-button size="large" @click="onDimming(focusedFixture)">调光</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 调光抽屉 -->
    <el-drawer
      v-model="showDimmingDrawer"
      title="调光设置"
      direction="rtl"
      size="520px"
    >
      <div class="zg-dimming-panel">
        <el-form label-width="80px" class="zg-draftform">
          <el-form-item label="亮度">
            <el-slider
              v-model="brightnessValue"
              :min="0"
              :max="100"
              :step="10"
              :marks="marks"
              show-input
            />
          </el-form-item>
          <el-form-item label="预设亮度">
            <el-button-group>
              <el-button @click="brightnessValue = 100">100%</el-button>
              <el-button @click="brightnessValue = 75">75%</el-button>
              <el-button @click="brightnessValue = 50">50%</el-button>
              <el-button @click="brightnessValue = 25">25%</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showDimmingDrawer = false">取消</el-button>
        <el-button type="primary" @click="onDimmingConfirm">确认调光</el-button>
      </template>
    </el-drawer>

    <!-- 开关灯记录抽屉 -->
    <el-drawer
      v-model="showRecordDrawer"
      :title="'开关灯记录 · ' + (focusedFixture?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div class="zg-inspector">
        <el-table :data="switchRecords" size="small" border class="zg-datatable">
          <el-table-column prop="id" label="序号" width="60" align="center" />
          <el-table-column prop="time" label="时间" min-width="160" />
          <el-table-column label="动作" width="100" align="center">
            <template #default="{ row }">
              <span class="zg-status" :class="row.action === '开灯' ? 'online' : 'offline'">
                <i class="dot"></i>{{ row.action }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="处置人" width="120" />
          <el-table-column prop="remark" label="备注" min-width="150" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showRecordDrawer = false">关闭</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端图谱 · 光源台账
 * 业务域：terminalAtlas
 * 功能：城市照明光源设备的台账管理与远程控制
 *       支持左树右表布局、卡片/列表双视图、抽屉式详情与调光、开关灯记录查询
 * @module terminalAtlas/FixtureList
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Sunny,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft,
  Lightning
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const densityMode = ref('card')
const treeSearch = ref('')
const filterProduct = ref('')
const filterLampStatus = ref('')
const filterNetworkStatus = ref('')
const filterAvailable = ref('')
const searchText = ref('')
const showDimmingDrawer = ref(false)
const showRecordDrawer = ref(false)
const brightnessValue = ref(100)
const selectedItems = ref([])

const marks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

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

const initialFixtures = [
  { id: 1, no: 1, product: '电信CAT1', imei: '862715067560391', name: '光亚展光源', loadWatt: 0, voltageProbe: 231.3, amperageProbe: 0, lampStatus: '关', luminancePct: '-', networkStatus: '在线', lastOnline: '2026-04-28 17:57:42', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 2, no: 2, product: '电信CAT1', imei: '863123069184162', name: '1号楼-极简07', loadWatt: 0, voltageProbe: 231.3, amperageProbe: 0, lampStatus: '关', luminancePct: '-', networkStatus: '在线', lastOnline: '2026-04-28 17:54:54', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 3, no: 3, product: '电信CAT1', imei: '863123069133946', name: '宿舍楼02', loadWatt: 48, voltageProbe: 0, amperageProbe: 222, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:53:41', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 4, no: 4, product: '电信CAT1', imei: '863123069031165', name: '3号楼-极简13', loadWatt: 24, voltageProbe: 233.1, amperageProbe: 127, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:52:52', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 5, no: 5, product: '电信CAT1', imei: '863123069267413', name: '食堂-极简18辅路', loadWatt: 22, voltageProbe: 233.5, amperageProbe: 110, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:52:09', strategy: '光明园区灯网(勿删)', available: '不在役' },
  { id: 6, no: 6, product: '电信CAT1', imei: '863123069265714', name: '食堂-极简18', loadWatt: 25, voltageProbe: 233.8, amperageProbe: 125, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:51:17', strategy: '光明园区灯网(勿删)', available: '不在役' },
  { id: 7, no: 7, product: '电信CAT1', imei: '863123069277032', name: '3号楼-极简14', loadWatt: 24, voltageProbe: 234.9, amperageProbe: 122, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-24 04:56:48', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 8, no: 8, product: '电信CAT1', imei: '863123069201446', name: '食堂-极简17', loadWatt: 26, voltageProbe: 234.3, amperageProbe: 130, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:56:48', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 9, no: 9, product: '电信CAT1', imei: '863123069081624', name: '宿舍楼01', loadWatt: 48, voltageProbe: 0, amperageProbe: 218, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:55:13', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 10, no: 10, product: '电信CAT1', imei: '863123069146013', name: '宿舍楼03', loadWatt: 47, voltageProbe: 233.2, amperageProbe: 214, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:55:12', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 11, no: 11, product: '电信CAT1', imei: '863123069236392', name: '食堂-极简16', loadWatt: 26, voltageProbe: 234.4, amperageProbe: 130, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-28 04:54:04', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 12, no: 12, product: 'EXC-CAT1', imei: '8649000666365673', name: '0104Z4Z11', loadWatt: 103, voltageProbe: 233.3, amperageProbe: 445, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-24 18:20:10', strategy: '', available: '在役' },
  { id: 13, no: 13, product: '电信CAT1', imei: '863123069231120', name: '1号楼-极简05', loadWatt: 44, voltageProbe: 234.3, amperageProbe: 202, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-23 17:56:55', strategy: '光明园区灯网(勿删)', available: '在役' },
  { id: 14, no: 14, product: 'EXC-CAT1', imei: '8649000666361359', name: '展示0204Z05', loadWatt: 232, voltageProbe: 237.9, amperageProbe: 999, lampStatus: '关', luminancePct: '-', networkStatus: '离线', lastOnline: '2026-04-09 21:29:55', strategy: '', available: '在役' }
]

const switchRecords = ref([
  { id: 1, time: '2026-04-28 17:57:42', action: '开灯', operator: 'admin', remark: '定时任务' },
  { id: 2, time: '2026-04-28 06:00:00', action: '关灯', operator: 'admin', remark: '定时任务' },
  { id: 3, time: '2026-04-27 18:00:00', action: '开灯', operator: 'admin', remark: '定时任务' },
  { id: 4, time: '2026-04-27 06:00:00', action: '关灯', operator: 'admin', remark: '定时任务' }
])

const fixtureCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialFixtures
})

const fixtureInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedFixture = computed(() => fixtureInspector.focusedRecord)

const onlineCount = computed(
  () => fixtureCtl.presetPlaybook.filter(f => f.networkStatus === '在线').length
)
const offlineCount = computed(
  () => fixtureCtl.presetPlaybook.filter(f => f.networkStatus === '离线').length
)
const lampOnCount = computed(
  () => fixtureCtl.presetPlaybook.filter(f => f.lampStatus === '开').length
)
const activeFixtureCount = computed(
  () => fixtureCtl.presetPlaybook.filter(f => f.available === '在役').length
)

const filteredTotal = computed(() => {
  let rows = fixtureCtl.presetPlaybook
  if (filterProduct.value) {
    rows = rows.filter(f => f.product === filterProduct.value)
  }
  if (filterLampStatus.value) {
    rows = rows.filter(f => f.lampStatus === filterLampStatus.value)
  }
  if (filterNetworkStatus.value) {
    rows = rows.filter(f => f.networkStatus === filterNetworkStatus.value)
  }
  if (filterAvailable.value) {
    rows = rows.filter(f => f.available === filterAvailable.value)
  }
  if (searchText.value) {
    rows = rows.filter(f => f.imei.includes(searchText.value) || f.name.includes(searchText.value))
  }
  return rows.length
})

const filteredRows = computed(() => {
  let rows = fixtureCtl.presetPlaybook
  if (filterProduct.value) {
    rows = rows.filter(f => f.product === filterProduct.value)
  }
  if (filterLampStatus.value) {
    rows = rows.filter(f => f.lampStatus === filterLampStatus.value)
  }
  if (filterNetworkStatus.value) {
    rows = rows.filter(f => f.networkStatus === filterNetworkStatus.value)
  }
  if (filterAvailable.value) {
    rows = rows.filter(f => f.available === filterAvailable.value)
  }
  if (searchText.value) {
    rows = rows.filter(f => f.imei.includes(searchText.value) || f.name.includes(searchText.value))
  }
  const start = (fixtureCtl.pagingCursor - 1) * fixtureCtl.pageSpan
  return rows.slice(start, start + fixtureCtl.pageSpan)
})

const onTreeCheck = () => {}

const onSelectionChange = (val) => {
  selectedItems.value = val
}

const onFilterApply = () => {
  fixtureCtl.pagingCursor = 1
}

const onFilterReset = () => {
  filterProduct.value = ''
  filterLampStatus.value = ''
  filterNetworkStatus.value = ''
  filterAvailable.value = ''
  searchText.value = ''
  fixtureCtl.pagingCursor = 1
}

/**
 * 开灯操作：将选中光源或单个光源切换为开启状态
 * @param {Object} [target] 目标光源（可选，不传则使用选中项）
 */
const onTurnOn = (target) => {
  const targets = target ? [target] : selectedItems.value
  if (targets.length === 0) {
    ElMessage.warning('请先选择要开灯的光源')
    return
  }

  targets.forEach(item => {
    fixtureCtl.reviseRecord(item.id, { lampStatus: '开', luminancePct: 100 })
  })

  ElMessage.success(`已将 ${targets.length} 个光源开启`)
}

/**
 * 关灯操作：将选中光源或单个光源切换为关闭状态
 * @param {Object} [target] 目标光源（可选，不传则使用选中项）
 */
const onTurnOff = (target) => {
  const targets = target ? [target] : selectedItems.value
  if (targets.length === 0) {
    ElMessage.warning('请先选择要关灯的光源')
    return
  }

  targets.forEach(item => {
    fixtureCtl.reviseRecord(item.id, { lampStatus: '关', luminancePct: 0 })
  })

  ElMessage.success(`已将 ${targets.length} 个光源关闭`)
}

/**
 * 调光操作：打开调光抽屉，支持单个光源或批量调光
 * @param {Object} [target] 目标光源（可选，不传则使用选中项）
 */
const onDimming = (target) => {
  const targets = target ? [target] : selectedItems.value
  if (targets.length === 0) {
    ElMessage.warning('请先选择要调光的光源')
    return
  }
  brightnessValue.value = 100
  showDimmingDrawer.value = true
}

/**
 * 确认调光：应用亮度设置到选中光源
 */
const onDimmingConfirm = () => {
  const targets = focusedFixture.value ? [focusedFixture.value] : selectedItems.value
  if (targets.length === 0) {
    ElMessage.warning('请先选择要调光的光源')
    return
  }

  targets.forEach(item => {
    fixtureCtl.reviseRecord(item.id, { luminancePct: brightnessValue.value })
  })

  ElMessage.success(`已将 ${targets.length} 个光源亮度设置为 ${brightnessValue.value}%`)
  showDimmingDrawer.value = false
}

/**
 * 查看开关灯记录：打开记录抽屉
 * @param {Object} target 目标光源
 */
const onViewSwitchRecord = (target) => {
  fixtureInspector.focusedRecord = target
  showRecordDrawer.value = true
}
</script>

<style scoped lang="scss">
.zg-fixturelist {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;

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

  &__cta {
    display: flex;
    gap: 10px;
  }

  &__layout {
    display: flex;
    gap: 16px;
    flex: 1;
    min-height: 0;
  }

  &__sidebar {
    width: 240px;
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: var(--zg-shadow-card);
  }

  &__sidebar-header {
    padding: 14px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__tree-search {
    width: 100%;
  }

  &__tree {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    :deep(.el-tree-node__content) {
      border-radius: var(--zg-radius-sm);
      margin-bottom: 4px;
      transition: all var(--zg-transition-fast);

      &:hover {
        background: var(--zg-brand-tint-50);
      }
    }

    :deep(.el-tree-node.is-selected > .el-tree-node__content) {
      background: var(--zg-brand-tint-100);
      color: var(--zg-brand-primary);
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
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

  &__select { width: 140px; }
  &__search { width: 200px; }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.zg-fixturecard {
  background: var(--zg-surface-card);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--zg-transition-normal);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--zg-shadow-card-hover);
    border-color: var(--zg-line-brand);
  }

  &.lit {
    border-left: 3px solid var(--zg-success);
  }
  &.dark {
    border-left: 3px solid var(--zg-danger);
  }
  &.offline {
    opacity: 0.7;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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

  &__badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
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

  &__imei {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 0;
    font-family: monospace;
  }

  &__stats {
    display: flex;
    gap: 14px;
    margin-top: 4px;
  }

  &__stat {
    font-size: 12px;
    color: var(--zg-ink-tertiary);

    em {
      font-style: normal;
      font-size: 16px;
      font-weight: 600;
      color: var(--zg-brand-primary);
      margin-right: 2px;
    }
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }

  &__time {
    font-size: 11px;
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
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid var(--zg-line-soft);
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
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
  &.danger {
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
    font-family: monospace;
  }

  &__status {
    display: flex;
    gap: 8px;
    margin-top: 4px;
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

.zg-dimming-panel {
  padding: 8px 0;
}

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>