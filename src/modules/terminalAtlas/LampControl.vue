<!--
  智光云枢 · 终端图谱 · 灯具控制
  业务域：terminalAtlas
  功能：城市照明灯具台账与远程调光控制
        支持卡片/列表双视图、抽屉式详情、开/关/调光业务流
-->
<template>
  <section class="zg-lampctrl">
    <!-- 页面头部：品牌徽标 + 标题 + 批量业务操作 -->
    <header class="zg-lampctrl__head">
      <div class="zg-lampctrl__headline">
        <div class="zg-lampctrl__sigil">
          <el-icon :size="22"><Sunny /></el-icon>
        </div>
        <div class="zg-lampctrl__copy">
          <h1 class="zg-lampctrl__title">灯具控制</h1>
          <p class="zg-lampctrl__sub">
            城市照明灯具中枢 · 在役 {{ activeLampCount }} 盏 ·
            离线 {{ offlineLampCount }} 盏 · 平均亮度 {{ avgBrightness }}%
          </p>
        </div>
      </div>
      <div class="zg-lampctrl__cta">
        <el-button type="primary" @click="onTurnOnBatch()">
          <el-icon><Sunny /></el-icon>
          <span>开灯</span>
        </el-button>
        <el-button type="warning" @click="onTurnOffBatch()">
          <el-icon><Lightning /></el-icon>
          <span>关灯</span>
        </el-button>
        <el-button @click="onDimmingBatch()">
          <el-icon><Sunny /></el-icon>
          <span>调光</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ lampCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">灯具总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeLampCount }}</span>
        <span class="zg-metrics__lbl">在线照明</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlineLampCount }}</span>
        <span class="zg-metrics__lbl">离线待检</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ avgBrightness }}</span>
        <span class="zg-metrics__lbl">平均亮度(%)</span>
      </div>
    </div>

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
          v-model="lampCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-select
          v-model="lampCtl.typeBucket"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区" value="长沙-岳麓区" />
          <el-option label="长沙-天心区" value="长沙-天心区" />
          <el-option label="长沙-开福区" value="长沙-开福区" />
        </el-select>
        <el-input
          v-model="lampCtl.filterLexicon"
          placeholder="检索设备名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="lampCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="lampCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="lampCtl.onFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="lamp in lampCtl.pagedRows"
        :key="lamp.id"
        class="zg-lampcard"
        :class="lamp.status === '在线' ? 'online' : 'offline'"
        @click="lampInspector.openInspector(lamp)"
      >
        <div class="zg-lampcard__head">
          <div class="zg-lampcard__glyph">
            <el-icon :size="24"><Sunny /></el-icon>
          </div>
          <span class="zg-status" :class="lamp.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ lamp.status }}
          </span>
        </div>
        <div class="zg-lampcard__body">
          <h3 class="zg-lampcard__name">{{ lamp.name }}</h3>
          <p class="zg-lampcard__area">{{ lamp.area }} · {{ lamp.poleName }}</p>
          <div class="zg-lampcard__stats">
            <span class="zg-lampcard__stat">
              <em>{{ lamp.brightness }}</em> %
            </span>
            <span class="zg-lampcard__stat">
              <em>{{ lamp.power }}</em> W
            </span>
            <span class="zg-lampcard__stat">
              <em>{{ lamp.voltage }}</em> V
            </span>
          </div>
        </div>
        <div class="zg-lampcard__foot">
          <span class="zg-lampcard__time">{{ lamp.lastOnline }}</span>
          <div class="zg-lampcard__actions">
            <el-button link type="primary" size="small" @click.stop="onTurnOn(lamp)">
              开灯
            </el-button>
            <el-button link type="warning" size="small" @click.stop="onTurnOff(lamp)">
              关灯
            </el-button>
            <el-button link type="primary" size="small" @click.stop="onDimming(lamp)">
              调光
            </el-button>
            <el-button link type="info" size="small" @click.stop="onViewSwitchRecord(lamp)">
              记录
            </el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="lampCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="area" label="所属区域" width="130" />
        <el-table-column prop="name" label="灯具名称" min-width="150" />
        <el-table-column prop="poleName" label="杆塔名称" min-width="120" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="brightness" label="亮度(%)" width="90" align="center" />
        <el-table-column prop="power" label="功率(W)" width="100" align="center" />
        <el-table-column prop="voltage" label="电压(V)" width="100" align="center" />
        <el-table-column prop="lastOnline" label="最后在线" width="160" />
        <el-table-column label="处置" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="onTurnOn(row)">开灯</el-button>
            <el-button type="warning" size="small" @click="onTurnOff(row)">关灯</el-button>
            <el-button type="primary" size="small" @click="onDimming(row)">调光</el-button>
            <el-button type="info" size="small" @click="onViewSwitchRecord(row)">记录</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="lampCtl.pagingCursor"
        v-model:page-size="lampCtl.pageSpan"
        :total="lampCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 调光抽屉 -->
    <el-drawer
      v-model="dimmingDrawerOpen"
      :title="'灯具调光 · ' + (dimmingTarget?.name || '')"
      direction="rtl"
      size="480px"
    >
      <div v-if="dimmingTarget" class="zg-dimmer">
        <div class="zg-dimmer__head">
          <div class="zg-dimmer__glyph">
            <el-icon :size="32"><Sunny /></el-icon>
          </div>
          <div class="zg-dimmer__meta">
            <h2 class="zg-dimmer__name">{{ dimmingTarget.name }}</h2>
            <p class="zg-dimmer__type">{{ dimmingTarget.area }} · {{ dimmingTarget.poleName }}</p>
            <span class="zg-status" :class="dimmingTarget.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ dimmingTarget.status }}
            </span>
          </div>
        </div>

        <div class="zg-dimmer__section">
          <h4 class="zg-dimmer__section-title">亮度调节</h4>
          <div class="zg-dimmer__slider">
            <el-slider v-model="dimmingValue" :min="0" :max="100" show-stops />
            <div class="zg-dimmer__value">
              <span>{{ dimmingValue }}</span>
              <em>%</em>
            </div>
          </div>
          <div class="zg-dimmer__presets">
            <el-button-group>
              <el-button :type="dimmingValue === 0 ? 'primary' : 'default'" @click="dimmingValue = 0">关闭</el-button>
              <el-button :type="dimmingValue === 30 ? 'primary' : 'default'" @click="dimmingValue = 30">30%</el-button>
              <el-button :type="dimmingValue === 50 ? 'primary' : 'default'" @click="dimmingValue = 50">50%</el-button>
              <el-button :type="dimmingValue === 70 ? 'primary' : 'default'" @click="dimmingValue = 70">70%</el-button>
              <el-button :type="dimmingValue === 100 ? 'primary' : 'default'" @click="dimmingValue = 100">100%</el-button>
            </el-button-group>
          </div>
        </div>

        <div class="zg-dimmer__actions">
          <el-button size="large" @click="dimmingDrawerOpen = false">取消</el-button>
          <el-button type="primary" size="large" @click="onCommitDimming">确认调光</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="lampInspector.drawerOpen"
      :title="'灯具详情 · ' + (focusedLamp?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedLamp" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Sunny /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedLamp.name }}</h2>
            <p class="zg-inspector__type">{{ focusedLamp.area }} · {{ focusedLamp.poleName }}</p>
            <span class="zg-status" :class="focusedLamp.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedLamp.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">所属产品</span>
              <span class="val">{{ focusedLamp.product }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">IMEI号</span>
              <span class="val">{{ focusedLamp.imei }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">设备型号</span>
              <span class="val">{{ focusedLamp.model }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">最后在线</span>
              <span class="val">{{ focusedLamp.lastOnline }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">实时遥测</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">亮度</div>
              <div class="zg-datacard__val">{{ focusedLamp.brightness }}<em>%</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">功率</div>
              <div class="zg-datacard__val">{{ focusedLamp.power }}<em>W</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">电压</div>
              <div class="zg-datacard__val">{{ focusedLamp.voltage }}<em>V</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">链路数</div>
              <div class="zg-datacard__val">{{ focusedLamp.circuitCount }}<em>条</em></div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">开关记录</h4>
          <el-table :data="focusedLamp.switchRecords" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="action" label="操作" width="90" align="center" />
            <el-table-column prop="brightness" label="亮度(%)" width="90" align="center" />
            <el-table-column prop="operator" label="操作人" width="110" />
            <el-table-column prop="time" label="操作时间" min-width="150" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="lampInspector.closeInspector()">关闭</el-button>
          <el-button
            type="success"
            size="large"
            @click="onTurnOn(focusedLamp)"
          >
            开灯
          </el-button>
          <el-button
            type="warning"
            size="large"
            @click="onTurnOff(focusedLamp)"
          >
            关灯
          </el-button>
          <el-button
            type="primary"
            size="large"
            @click="onDimming(focusedLamp)"
          >
            调光
          </el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端图谱 · 灯具控制
 * 业务域：terminalAtlas
 * 功能：城市照明灯具台账与远程调光控制
 * @module terminalAtlas/LampControl
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Sunny,
  Lightning,
  Grid,
  List,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 初始 mock 数据池 ----
const initialLamps = [
  {
    id: 1,
    no: 1,
    area: '长沙-岳麓区',
    name: '先导路1号灯具',
    poleName: '先导路1号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066803780',
    model: 'ZD-L100',
    status: '在线',
    brightness: 80,
    power: 120,
    voltage: 220,
    circuitCount: 1,
    lastOnline: '2026-07-03 08:30:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 80, operator: '系统', time: '2026-07-03 06:00:00' },
      { no: 2, action: '调光', brightness: 80, operator: '管理员', time: '2026-07-03 08:30:00' }
    ]
  },
  {
    id: 2,
    no: 2,
    area: '长沙-岳麓区',
    name: '先导路2号灯具',
    poleName: '先导路2号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066830981',
    model: 'ZD-L100',
    status: '在线',
    brightness: 100,
    power: 150,
    voltage: 220,
    circuitCount: 1,
    lastOnline: '2026-07-03 09:15:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 100, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  },
  {
    id: 3,
    no: 3,
    area: '长沙-天心区',
    name: '芙蓉路1号灯具',
    poleName: '芙蓉路1号杆塔',
    product: '电信CAT1',
    imei: '864900066389699',
    model: 'ZD-L200',
    status: '离线',
    brightness: 0,
    power: 0,
    voltage: 0,
    circuitCount: 2,
    lastOnline: '2026-07-01 22:00:00',
    switchRecords: [
      { no: 1, action: '关灯', brightness: 0, operator: '系统', time: '2026-07-01 22:00:00' }
    ]
  },
  {
    id: 4,
    no: 4,
    area: '长沙-天心区',
    name: '芙蓉路2号灯具',
    poleName: '芙蓉路2号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066368727',
    model: 'ZD-L100',
    status: '在线',
    brightness: 60,
    power: 90,
    voltage: 220,
    circuitCount: 1,
    lastOnline: '2026-07-03 10:00:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 60, operator: '管理员', time: '2026-07-03 10:00:00' }
    ]
  },
  {
    id: 5,
    no: 5,
    area: '长沙-开福区',
    name: '湘江路1号灯具',
    poleName: '湘江路1号杆塔',
    product: '电信CAT1',
    imei: '864900066365889',
    model: 'ZD-L200',
    status: '在线',
    brightness: 70,
    power: 105,
    voltage: 220,
    circuitCount: 2,
    lastOnline: '2026-07-03 09:45:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 70, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  },
  {
    id: 6,
    no: 6,
    area: '长沙-岳麓区',
    name: '先导路3号灯具',
    poleName: '先导路3号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066389038',
    model: 'ZD-L100',
    status: '在线',
    brightness: 50,
    power: 75,
    voltage: 220,
    circuitCount: 1,
    lastOnline: '2026-07-03 08:00:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 50, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  },
  {
    id: 7,
    no: 7,
    area: '长沙-天心区',
    name: '芙蓉路3号灯具',
    poleName: '芙蓉路3号杆塔',
    product: '电信CAT1',
    imei: '864900066361359',
    model: 'ZD-L200',
    status: '离线',
    brightness: 0,
    power: 0,
    voltage: 0,
    circuitCount: 1,
    lastOnline: '2026-06-28 20:00:00',
    switchRecords: [
      { no: 1, action: '关灯', brightness: 0, operator: '系统', time: '2026-06-28 20:00:00' }
    ]
  },
  {
    id: 8,
    no: 8,
    area: '长沙-开福区',
    name: '湘江路2号灯具',
    poleName: '湘江路2号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066801586',
    model: 'ZD-L100',
    status: '在线',
    brightness: 90,
    power: 135,
    voltage: 220,
    circuitCount: 1,
    lastOnline: '2026-07-03 09:30:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 90, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  },
  {
    id: 9,
    no: 9,
    area: '长沙-岳麓区',
    name: '先导路4号灯具',
    poleName: '先导路4号杆塔',
    product: '电信CAT1',
    imei: '864900066368735',
    model: 'ZD-L200',
    status: '在线',
    brightness: 75,
    power: 112,
    voltage: 220,
    circuitCount: 2,
    lastOnline: '2026-07-03 08:45:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 75, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  },
  {
    id: 10,
    no: 10,
    area: '长沙-天心区',
    name: '芙蓉路4号灯具',
    poleName: '芙蓉路4号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066392321',
    model: 'ZD-L100',
    status: '离线',
    brightness: 0,
    power: 0,
    voltage: 0,
    circuitCount: 1,
    lastOnline: '2026-06-30 21:00:00',
    switchRecords: [
      { no: 1, action: '关灯', brightness: 0, operator: '系统', time: '2026-06-30 21:00:00' }
    ]
  },
  {
    id: 11,
    no: 11,
    area: '长沙-开福区',
    name: '湘江路3号灯具',
    poleName: '湘江路3号杆塔',
    product: '电信CAT1',
    imei: '864900066785755',
    model: 'ZD-L200',
    status: '在线',
    brightness: 85,
    power: 127,
    voltage: 220,
    circuitCount: 2,
    lastOnline: '2026-07-03 09:00:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 85, operator: '管理员', time: '2026-07-03 07:00:00' }
    ]
  },
  {
    id: 12,
    no: 12,
    area: '长沙-岳麓区',
    name: '先导路5号灯具',
    poleName: '先导路5号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066817368',
    model: 'ZD-L100',
    status: '在线',
    brightness: 65,
    power: 97,
    voltage: 220,
    circuitCount: 1,
    lastOnline: '2026-07-03 08:20:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 65, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  },
  {
    id: 13,
    no: 13,
    area: '长沙-天心区',
    name: '芙蓉路5号灯具',
    poleName: '芙蓉路5号杆塔',
    product: '电信CAT1',
    imei: '864900066841392',
    model: 'ZD-L200',
    status: '在线',
    brightness: 55,
    power: 82,
    voltage: 220,
    circuitCount: 2,
    lastOnline: '2026-07-03 09:10:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 55, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  },
  {
    id: 14,
    no: 14,
    area: '长沙-开福区',
    name: '湘江路4号灯具',
    poleName: '湘江路4号杆塔',
    product: 'EXC-CAT1',
    imei: '864900066392024',
    model: 'ZD-L100',
    status: '离线',
    brightness: 0,
    power: 0,
    voltage: 0,
    circuitCount: 1,
    lastOnline: '2026-06-29 19:30:00',
    switchRecords: [
      { no: 1, action: '关灯', brightness: 0, operator: '系统', time: '2026-06-29 19:30:00' }
    ]
  },
  {
    id: 15,
    no: 15,
    area: '长沙-岳麓区',
    name: '先导路6号灯具',
    poleName: '先导路6号杆塔',
    product: '电信CAT1',
    imei: '864900066793361',
    model: 'ZD-L200',
    status: '在线',
    brightness: 45,
    power: 67,
    voltage: 220,
    circuitCount: 2,
    lastOnline: '2026-07-03 08:50:00',
    switchRecords: [
      { no: 1, action: '开灯', brightness: 45, operator: '系统', time: '2026-07-03 06:00:00' }
    ]
  }
]

// ---- 表格数据容器（usePresetTable） ----
const lampCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialLamps
})

// ---- 概览指标派生 ----
const activeLampCount = computed(
  () => lampCtl.presetPlaybook.filter(l => l.status === '在线').length
)
const offlineLampCount = computed(
  () => lampCtl.presetPlaybook.filter(l => l.status === '离线').length
)
const avgBrightness = computed(() => {
  const online = lampCtl.presetPlaybook.filter(l => l.status === '在线')
  if (!online.length) return 0
  return Math.round(online.reduce((sum, l) => sum + (l.brightness || 0), 0) / online.length)
})

// ---- 详情抽屉容器（useDrawerInspector） ----
const lampInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedLamp = computed(() => lampInspector.focusedRecord)

// ---- 调光抽屉状态 ----
const dimmingDrawerOpen = ref(false)
const dimmingTarget = ref(null)
const dimmingValue = ref(0)

/**
 * 开灯：将灯具切换至在线状态并置默认亮度
 * @param {Object} lamp 目标灯具
 */
const onTurnOn = (lamp) => {
  if (lamp.status === '在线') {
    ElMessage.warning(`「${lamp.name}」已处于照明状态`)
    return
  }
  ElMessageBox.confirm(
    `确认开启「${lamp.name}」？`,
    '开灯确认',
    { type: 'info' }
  )
    .then(() => {
      lampCtl.reviseRecord(lamp.id, {
        status: '在线',
        brightness: lamp.brightness || 80,
        power: lamp.power || 120,
        voltage: 220,
        lastOnline: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success(`「${lamp.name}」已开灯，亮度 ${lamp.brightness || 80}%`)
    })
    .catch(() => {})
}

/**
 * 关灯：将灯具切换至离线状态并清零亮度
 * @param {Object} lamp 目标灯具
 */
const onTurnOff = (lamp) => {
  if (lamp.status === '离线') {
    ElMessage.warning(`「${lamp.name}」已处于熄灭状态`)
    return
  }
  ElMessageBox.confirm(
    `确认关闭「${lamp.name}」？`,
    '关灯确认',
    { type: 'warning' }
  )
    .then(() => {
      lampCtl.reviseRecord(lamp.id, {
        status: '离线',
        brightness: 0,
        power: 0,
        voltage: 0,
        lastOnline: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success(`「${lamp.name}」已关灯`)
    })
    .catch(() => {})
}

/**
 * 调光：打开调光抽屉并加载当前亮度
 * @param {Object} lamp 目标灯具
 */
const onDimming = (lamp) => {
  dimmingTarget.value = lamp
  dimmingValue.value = lamp.brightness || 0
  dimmingDrawerOpen.value = true
}

/**
 * 确认调光：将设定亮度下发至灯具
 */
const onCommitDimming = () => {
  if (!dimmingTarget.value) return
  const target = dimmingTarget.value
  lampCtl.reviseRecord(target.id, {
    brightness: dimmingValue.value,
    power: target.power || 120,
    voltage: 220,
    status: dimmingValue.value > 0 ? '在线' : target.status,
    lastOnline: new Date().toLocaleString('zh-CN')
  })
  ElMessage.success(`「${target.name}」亮度已调至 ${dimmingValue.value}%`)
  dimmingDrawerOpen.value = false
}

/**
 * 批量开灯（演示：仅提示）
 */
const onTurnOnBatch = () => {
  ElMessage.info('批量开灯：请选择目标灯具后执行单灯操作')
}

/**
 * 批量关灯（演示：仅提示）
 */
const onTurnOffBatch = () => {
  ElMessage.info('批量关灯：请选择目标灯具后执行单灯操作')
}

/**
 * 批量调光（演示：仅提示）
 */
const onDimmingBatch = () => {
  ElMessage.info('批量调光：请选择目标灯具后执行单灯操作')
}

/**
 * 查看记录：打开详情抽屉并定位至开关记录
 * @param {Object} lamp 目标灯具
 */
const onViewSwitchRecord = (lamp) => {
  lampInspector.openInspector(lamp)
}
</script>

<style scoped lang="scss">
.zg-lampctrl {
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

  &__cta {
    display: flex;
    gap: 10px;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-lampcard {
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

  &__area {
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__stats {
    display: flex;
    gap: 14px;
    margin-top: 6px;
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

.zg-dimmer {
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

  &__slider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .el-slider {
      flex: 1;
    }
  }

  &__value {
    min-width: 60px;
    text-align: right;

    span {
      font-size: 24px;
      font-weight: 700;
      color: var(--zg-brand-primary);
    }

    em {
      font-style: normal;
      font-size: 13px;
      color: var(--zg-ink-tertiary);
      margin-left: 4px;
    }
  }

  &__presets {
    display: flex;
    justify-content: center;
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
</style>
