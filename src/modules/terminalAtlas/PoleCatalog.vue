<!--
  智光云枢 · 终端图谱 · 杆塔位点
  业务域：terminalAtlas
  功能：城市照明杆塔位点的台账与挂载设备管理
        支持卡片/列表双视图、抽屉式详情与编排、位点上下线投切
-->
<template>
  <section class="zg-pole">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-pole__head">
      <div class="zg-pole__headline">
        <div class="zg-pole__sigil">
          <el-icon :size="22"><LocationInformation /></el-icon>
        </div>
        <div class="zg-pole__copy">
          <h1 class="zg-pole__title">杆塔位点</h1>
          <p class="zg-pole__sub">
            城市照明终端图谱 · 在役 {{ onlinePoleCount }} 处 ·
            离线 {{ offlinePoleCount }} 处 · 累计挂载 {{ totalLampCount }} 设备
          </p>
        </div>
      </div>
      <div class="zg-pole__cta">
        <el-button type="primary" @click="poleForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>登记杆塔位点</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ poleCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">位点总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ onlinePoleCount }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ offlinePoleCount }}</span>
        <span class="zg-metrics__lbl">离线待挂载</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalLampCount }}</span>
        <span class="zg-metrics__lbl">累计挂载设备</span>
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
          v-model="poleCtl.statusBuckets"
          placeholder="运行状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
        </el-select>
        <el-select
          v-model="poleCtl.typeBucket"
          placeholder="杆塔类型"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="单臂灯杆" value="单臂灯杆" />
          <el-option label="双臂灯杆" value="双臂灯杆" />
          <el-option label="高杆灯" value="高杆灯" />
          <el-option label="景观灯杆" value="景观灯杆" />
        </el-select>
        <el-select
          v-model="poleAreaFilter"
          placeholder="所属区域"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
          <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋" />
        </el-select>
        <el-input
          v-model="poleCtl.filterLexicon"
          placeholder="检索位点名称/编号"
          clearable
          class="zg-filterband__search"
          @keyup.enter="poleCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="poleCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>检索</span>
        </el-button>
        <el-button @click="onPoleFilterReset()">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="densityMode === 'card'" class="zg-cardgrid">
      <article
        v-for="pole in visiblePoles"
        :key="pole.id"
        class="zg-polecard"
        :class="pole.status === '在线' ? 'online' : 'offline'"
        @click="poleInspector.openInspector(pole)"
      >
        <div class="zg-polecard__head">
          <div class="zg-polecard__glyph">
            <el-icon :size="24"><LocationInformation /></el-icon>
          </div>
          <span class="zg-status" :class="pole.status === '在线' ? 'online' : 'offline'">
            <i class="dot"></i>{{ pole.status }}
          </span>
        </div>
        <div class="zg-polecard__body">
          <h3 class="zg-polecard__name">{{ pole.name }}</h3>
          <p class="zg-polecard__area">{{ pole.location }} · {{ pole.code }}</p>
          <div class="zg-polecard__stats">
            <span class="zg-polecard__stat">
              <em>{{ pole.height }}</em> 米
            </span>
            <span class="zg-polecard__stat">
              <em>{{ pole.lampCount }}</em> 设备
            </span>
            <span class="zg-polecard__stat">
              <em>{{ pole.type }}</em>
            </span>
          </div>
        </div>
        <div class="zg-polecard__foot">
          <span class="zg-polecard__time">{{ pole.installTime }}</span>
          <div class="zg-polecard__actions">
            <el-button link type="primary" size="small" @click.stop="onTogglePole(pole)">
              {{ pole.status === '在线' ? '下线' : '上线' }}
            </el-button>
            <el-button link type="primary" size="small" @click.stop="poleForm.openReviser(pole)">修订</el-button>
            <el-button link type="danger" size="small" @click.stop="onRetirePole(pole)">废止</el-button>
          </div>
        </div>
      </article>
    </div>

    <!-- 列表视图 -->
    <div v-else class="zg-tablewrap">
      <el-table :data="visiblePoles" stripe class="zg-datatable">
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="杆塔编号" width="140" />
        <el-table-column prop="name" label="杆塔名称" min-width="150" />
        <el-table-column prop="location" label="所属区域" min-width="190" />
        <el-table-column prop="type" label="杆塔类型" width="110" align="center" />
        <el-table-column prop="height" label="规格(米)" width="100" align="center" />
        <el-table-column prop="lampCount" label="挂载设备数" width="110" align="center" />
        <el-table-column label="运行状态" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-status" :class="row.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="installTime" label="安装时间" width="130" />
        <el-table-column label="处置" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="poleInspector.openInspector(row)">详情</el-button>
            <el-button type="warning" size="small" @click="onTogglePole(row)">
              {{ row.status === '在线' ? '下线' : '上线' }}
            </el-button>
            <el-button type="primary" size="small" @click="poleForm.openReviser(row)">修订</el-button>
            <el-button type="danger" size="small" @click="onRetirePole(row)">废止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页条 -->
    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="poleCtl.pagingCursor"
        v-model:page-size="poleCtl.pageSpan"
        :total="poleCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="poleInspector.drawerOpen"
      :title="'杆塔位点详情 · ' + (focusedPole?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedPole" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><LocationInformation /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedPole.name }}</h2>
            <p class="zg-inspector__type">{{ focusedPole.location }} · {{ focusedPole.code }}</p>
            <span class="zg-status" :class="focusedPole.status === '在线' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedPole.status }}
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">基本档案</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">安装时间</span>
              <span class="val">{{ focusedPole.installTime }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">安装位置</span>
              <span class="val">{{ focusedPole.installLocation || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">杆塔经度</span>
              <span class="val">{{ focusedPole.lng || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">杆塔纬度</span>
              <span class="val">{{ focusedPole.lat || '-' }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">备注</span>
              <span class="val">{{ focusedPole.remark || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">站点参数</h4>
          <div class="zg-datagrid">
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">杆塔高度</div>
              <div class="zg-datacard__val">{{ focusedPole.height }}<em>米</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">挂载设备</div>
              <div class="zg-datacard__val">{{ focusedPole.lampCount }}<em>台</em></div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">杆塔类型</div>
              <div class="zg-datacard__val">{{ focusedPole.type }}</div>
            </div>
            <div class="zg-datacard">
              <div class="zg-datacard__lbl">运行状态</div>
              <div class="zg-datacard__val">{{ focusedPole.status }}</div>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">挂载设备清单</h4>
          <el-table :data="focusedPole.mountedDevices" size="small" border>
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="设备名称" min-width="140" />
            <el-table-column prop="type" label="设备类型" width="110" align="center" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '在线' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="power" label="功率(W)" width="100" align="center" />
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="poleInspector.closeInspector()">关闭</el-button>
          <el-button
            type="warning"
            size="large"
            @click="onTogglePole(focusedPole)"
          >
            {{ focusedPole.status === '在线' ? '下线位点' : '上线位点' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/修订抽屉 -->
    <el-drawer
      v-model="poleForm.drawerOpen"
      :title="poleForm.editMode === 'compose' ? '登记杆塔位点' : '修订杆塔位点'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="poleForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-form-item label="杆塔名称" required>
          <el-input v-model="poleForm.draftPayload.name" placeholder="请输入杆塔名称" />
        </el-form-item>
        <el-form-item label="杆塔编号" required>
          <el-input v-model="poleForm.draftPayload.code" placeholder="请输入杆塔编号" />
        </el-form-item>
        <el-form-item label="所属层级" required>
          <el-select v-model="poleForm.draftPayload.location" placeholder="请选择所属层级" style="width: 100%">
            <el-option label="长沙-岳麓区-先导路" value="长沙-岳麓区-先导路" />
            <el-option label="长沙-岳麓区-力唯中天1栋" value="长沙-岳麓区-力唯中天1栋" />
          </el-select>
        </el-form-item>
        <el-form-item label="杆塔类型">
          <el-select v-model="poleForm.draftPayload.type" placeholder="请选择杆塔类型" style="width: 100%">
            <el-option label="单臂灯杆" value="单臂灯杆" />
            <el-option label="双臂灯杆" value="双臂灯杆" />
            <el-option label="高杆灯" value="高杆灯" />
            <el-option label="景观灯杆" value="景观灯杆" />
          </el-select>
        </el-form-item>
        <el-form-item label="杆塔规格">
          <el-input-number v-model="poleForm.draftPayload.height" :min="0" :max="60" :step="0.5" />
          <span class="zg-draftform__unit">米</span>
        </el-form-item>
        <el-form-item label="杆塔经度">
          <el-input v-model="poleForm.draftPayload.lng" placeholder="请输入杆塔经度" />
        </el-form-item>
        <el-form-item label="杆塔纬度">
          <el-input v-model="poleForm.draftPayload.lat" placeholder="请输入杆塔纬度" />
        </el-form-item>
        <el-form-item label="安装时间">
          <el-date-picker
            v-model="poleForm.draftPayload.installTime"
            type="date"
            placeholder="选择安装时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="安装位置">
          <el-input v-model="poleForm.draftPayload.installLocation" placeholder="请输入杆塔安装位置" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="poleForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="poleForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="poleForm.submitting"
          @click="onCommitPoleDraft"
        >
          {{ poleForm.editMode === 'compose' ? '登记' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 终端图谱 · 杆塔位点
 * 业务域：terminalAtlas
 * 功能：城市照明杆塔位点的台账与挂载设备管理
 * @module terminalAtlas/PoleCatalog
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  LocationInformation,
  Plus,
  Grid,
  List,
  Search,
  RefreshLeft
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- 视图密度切换 ----
const densityMode = ref('card')

// ---- 本地区域过滤（叠加在 composable 分页之上） ----
const poleAreaFilter = ref('')

// ---- 初始 mock 数据池：城市照明杆塔位点台账 ----
const initialPoles = [
  {
    id: 1,
    no: 1,
    name: '美人广场新1',
    code: '美人广场新1',
    type: '高杆灯',
    height: 11,
    lampCount: 0,
    location: '长沙-岳麓区-先导路',
    status: '离线',
    installTime: '2024-06-12',
    lng: '112.9388',
    lat: '28.2282',
    installLocation: '美人广场东南角',
    remark: '广场主位点，待挂载设备',
    mountedDevices: []
  },
  {
    id: 2,
    no: 2,
    name: '光源展示06',
    code: 'ZS06',
    type: '单臂灯杆',
    height: 3,
    lampCount: 3,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-05-20',
    lng: '112.9251',
    lat: '28.2156',
    installLocation: '力唯中天1栋北侧',
    remark: '展示位',
    mountedDevices: [
      { no: 1, name: 'LED投光灯-A', type: '投光灯', status: '在线', power: 60 },
      { no: 2, name: 'LED投光灯-B', type: '投光灯', status: '在线', power: 60 },
      { no: 3, name: '监控终端-M1', type: '监控终端', status: '在线', power: 15 }
    ]
  },
  {
    id: 3,
    no: 3,
    name: '光源展示05',
    code: 'ZS05',
    type: '单臂灯杆',
    height: 3,
    lampCount: 4,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-05-19',
    lng: '112.9252',
    lat: '28.2157',
    installLocation: '力唯中天1栋北侧',
    remark: '展示位',
    mountedDevices: []
  },
  {
    id: 4,
    no: 4,
    name: '光源展示04',
    code: 'ZS04',
    type: '单臂灯杆',
    height: 3,
    lampCount: 4,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-05-18',
    lng: '112.9253',
    lat: '28.2158',
    installLocation: '力唯中天1栋东侧',
    remark: '展示位',
    mountedDevices: []
  },
  {
    id: 5,
    no: 5,
    name: '光源展示03',
    code: 'ZS03',
    type: '单臂灯杆',
    height: 3,
    lampCount: 4,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-05-17',
    lng: '112.9254',
    lat: '28.2159',
    installLocation: '力唯中天1栋东侧',
    remark: '展示位',
    mountedDevices: []
  },
  {
    id: 6,
    no: 6,
    name: '光源展示02',
    code: 'ZS02',
    type: '单臂灯杆',
    height: 3,
    lampCount: 4,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-05-16',
    lng: '112.9255',
    lat: '28.2160',
    installLocation: '力唯中天1栋南侧',
    remark: '展示位',
    mountedDevices: []
  },
  {
    id: 7,
    no: 7,
    name: '光源展示01',
    code: 'ZS01',
    type: '单臂灯杆',
    height: 3,
    lampCount: 4,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-05-15',
    lng: '112.9256',
    lat: '28.2161',
    installLocation: '力唯中天1栋南侧',
    remark: '展示位',
    mountedDevices: []
  },
  {
    id: 8,
    no: 8,
    name: '彩云街路灯',
    code: 'X001',
    type: '景观灯杆',
    height: 0,
    lampCount: 0,
    location: '长沙-岳麓区-先导路',
    status: '离线',
    installTime: '2024-07-02',
    lng: '112.9401',
    lat: '28.2290',
    installLocation: '彩云街路口',
    remark: '待安装灯臂',
    mountedDevices: []
  },
  {
    id: 9,
    no: 9,
    name: '太阳能测试',
    code: 'T001',
    type: '景观灯杆',
    height: 0,
    lampCount: 1,
    location: '长沙-岳麓区-先导路',
    status: '在线',
    installTime: '2024-06-28',
    lng: '112.9402',
    lat: '28.2291',
    installLocation: '先导路试验段',
    remark: '太阳能样机测试',
    mountedDevices: [
      { no: 1, name: '太阳能灯头-S1', type: '灯头', status: '在线', power: 30 }
    ]
  },
  {
    id: 10,
    no: 10,
    name: '光亚展杆塔',
    code: 'GYZ0036',
    type: '高杆灯',
    height: 10,
    lampCount: 3,
    location: '长沙-岳麓区-先导路',
    status: '在线',
    installTime: '2024-04-10',
    lng: '112.9403',
    lat: '28.2292',
    installLocation: '光亚展展区中央',
    remark: '展会展演位点',
    mountedDevices: [
      { no: 1, name: '高杆投光灯-H1', type: '投光灯', status: '在线', power: 120 },
      { no: 2, name: '高杆投光灯-H2', type: '投光灯', status: '在线', power: 120 },
      { no: 3, name: '环境感知终端-E1', type: '感知终端', status: '在线', power: 20 }
    ]
  },
  {
    id: 11,
    no: 11,
    name: 'Z08杆塔(左)',
    code: 'ZT-Z08',
    type: '单臂灯杆',
    height: 3,
    lampCount: 1,
    location: '长沙-岳麓区-先导路',
    status: '在线',
    installTime: '2024-03-22',
    lng: '112.9404',
    lat: '28.2293',
    installLocation: '先导路Z08段',
    remark: '左侧位',
    mountedDevices: []
  },
  {
    id: 12,
    no: 12,
    name: 'Z05杆塔(中)',
    code: 'ZT-Z05',
    type: '单臂灯杆',
    height: 3,
    lampCount: 1,
    location: '长沙-岳麓区-先导路',
    status: '在线',
    installTime: '2024-03-22',
    lng: '112.9405',
    lat: '28.2294',
    installLocation: '先导路Z05段',
    remark: '中央位',
    mountedDevices: []
  },
  {
    id: 13,
    no: 13,
    name: 'Z10杆塔(右)',
    code: 'ZT-Z10',
    type: '单臂灯杆',
    height: 3,
    lampCount: 1,
    location: '长沙-岳麓区-先导路',
    status: '在线',
    installTime: '2024-03-22',
    lng: '112.9406',
    lat: '28.2295',
    installLocation: '先导路Z10段',
    remark: '右侧位',
    mountedDevices: []
  },
  {
    id: 14,
    no: 14,
    name: '1号楼-极简05',
    code: 'L05',
    type: '双臂灯杆',
    height: 6,
    lampCount: 2,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-02-15',
    lng: '112.9257',
    lat: '28.2162',
    installLocation: '1号楼入口左侧',
    remark: '极简系列',
    mountedDevices: [
      { no: 1, name: '极简灯头-L05A', type: '灯头', status: '在线', power: 40 },
      { no: 2, name: '极简灯头-L05B', type: '灯头', status: '离线', power: 40 }
    ]
  },
  {
    id: 15,
    no: 15,
    name: '1号楼-极简06',
    code: 'L06',
    type: '双臂灯杆',
    height: 6,
    lampCount: 2,
    location: '长沙-岳麓区-力唯中天1栋',
    status: '在线',
    installTime: '2024-02-15',
    lng: '112.9258',
    lat: '28.2163',
    installLocation: '1号楼入口右侧',
    remark: '极简系列',
    mountedDevices: []
  }
]

// ---- 表格数据容器（usePresetTable） ----
const poleCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialPoles
})

// ---- 概览指标派生 ----
const onlinePoleCount = computed(
  () => poleCtl.presetPlaybook.filter(p => p.status === '在线').length
)
const offlinePoleCount = computed(
  () => poleCtl.presetPlaybook.filter(p => p.status === '离线').length
)
const totalLampCount = computed(
  () => poleCtl.presetPlaybook.reduce((sum, p) => sum + (p.lampCount || 0), 0)
)

/**
 * 叠加区域过滤后的可视行：在 composable 分页结果上再过滤所属区域
 * 区域筛选属本地状态，与 composable 的状态/类型/检索分桶协同工作
 */
const visiblePoles = computed(() => {
  let rows = poleCtl.pagedRows.value
  if (poleAreaFilter.value) {
    rows = rows.filter(r => r.location === poleAreaFilter.value)
  }
  return rows
})

/**
 * 重置检索：清空本地区域过滤并回到第一页
 */
const onPoleFilterReset = () => {
  poleAreaFilter.value = ''
  poleCtl.onFilterReset()
}

// ---- 表单草稿容器（useFormDraft） ----
const poleForm = useFormDraft(
  {
    name: '',
    code: '',
    location: '',
    type: '',
    height: 0,
    lng: '',
    lat: '',
    installTime: '',
    installLocation: '',
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.name) {
        ElMessage.warning('请输入杆塔名称')
        return false
      }
      if (!draft.code) {
        ElMessage.warning('请输入杆塔编号')
        return false
      }
      if (!draft.location) {
        ElMessage.warning('请选择所属层级')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器（useDrawerInspector） ----
const poleInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedPole = computed(() => poleInspector.focusedRecord)

/**
 * 提交草稿：根据编排/修订模式写入位点台账
 * 业务流包装：登记生成默认运行态，修订同步档案字段
 */
const onCommitPoleDraft = async () => {
  const snapshot = await poleForm.onDraftCommit()
  if (!snapshot) return

  if (poleForm.editMode === 'compose') {
    // 登记：附带默认运行态与空挂载清单
    poleCtl.appendRecord({
      ...snapshot,
      status: '离线',
      lampCount: 0,
      mountedDevices: []
    })
    ElMessage.success('杆塔位点登记成功，已纳入终端图谱')
  } else {
    // 修订：合并更新到原位点档案
    const origin = poleForm.originRecord
    poleCtl.reviseRecord(origin.id, { ...snapshot })
    ElMessage.success('杆塔位点档案已更新')
  }
}

/**
 * 位点投切：在线↔离线切换，含二次确认与挂载链路联动回执
 * @param {Object} pole 目标杆塔位点
 */
const onTogglePole = (pole) => {
  const nextStatus = pole.status === '在线' ? '离线' : '在线'
  ElMessageBox.confirm(
    `确认将「${pole.name}」${nextStatus === '在线' ? '上线' : '下线'}？挂载设备将随之${nextStatus === '在线' ? '激活' : '休眠'}。`,
    '位点投切确认',
    { type: 'warning' }
  )
    .then(() => {
      poleCtl.reviseRecord(pole.id, { status: nextStatus })
      ElMessage.success(`位点已${nextStatus === '在线' ? '上线' : '下线'}，挂载链路回执已签收`)
    })
    .catch(() => {})
}

/**
 * 废止位点：二次确认后从终端图谱台账中移除
 * @param {Object} pole 目标杆塔位点
 */
const onRetirePole = (pole) => {
  ElMessageBox.confirm(
    `确定要将「${pole.name}」从终端图谱台账中废止吗？废止后挂载设备将一并解绑。`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      poleCtl.retireRecord(pole.id)
      ElMessage.success('位点已废止，台账已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-pole {
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.zg-polecard {
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

.zg-draftform {
  &__unit {
    margin-left: 8px;
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}
</style>
