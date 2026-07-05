<!--
  智光云枢 · 管廊照明 · 隧道照明
  业务域：tubeLumen
  功能：隧道照明的调光控制与通断监测
        支持卡片/列表双视图、抽屉式详情与编排、链路控制回执
-->
<template>
  <section class="zg-lumen">
    <!-- 页面头部：品牌徽标 + 标题 + 概览指标 + 新建入口 -->
    <header class="zg-lumen__head">
      <div class="zg-lumen__headline">
        <div class="zg-lumen__sigil">
          <el-icon :size="22"><Sunny /></el-icon>
        </div>
        <div class="zg-lumen__copy">
          <h1 class="zg-lumen__title">隧道照明</h1>
          <p class="zg-lumen__sub">
            管廊照明控制中枢 · 在役 {{ activeDimmingCount }} 组 ·
            故障 {{ faultCircuitCount }} 条 · 累计链路 {{ totalCircuitCount }} 条
          </p>
        </div>
      </div>
      <div class="zg-lumen__cta">
        <el-button type="primary" @click="dimmingForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增调光配置</span>
        </el-button>
      </div>
    </header>

    <!-- 概览指标卡 -->
    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ dimmingCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">调光配置总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeDimmingCount }}</span>
        <span class="zg-metrics__lbl">已配置</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ faultCircuitCount }}</span>
        <span class="zg-metrics__lbl">故障链路</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalCircuitCount }}</span>
        <span class="zg-metrics__lbl">链路总数</span>
      </div>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" type="card" class="zg-lumen__tabs">
      <!-- 调光控制 Tab -->
      <el-tab-pane label="调光控制" name="dimming">
        <!-- 过滤工具栏 -->
        <div class="zg-filterband">
          <div class="zg-filterband__density">
            <el-radio-group v-model="dimmingDensity" size="default">
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
              v-model="dimmingCtl.typeBucket"
              placeholder="照明类型"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="基本照明" value="基本照明" />
              <el-option label="加强照明" value="加强照明" />
              <el-option label="应急照明" value="应急照明" />
            </el-select>
            <el-select
              v-model="dimmingCtl.statusBuckets"
              placeholder="配置状态"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="已配置" value="已配置" />
              <el-option label="未配置" value="未配置" />
            </el-select>
            <el-input
              v-model="dimmingCtl.filterLexicon"
              placeholder="检索照明分段"
              clearable
              class="zg-filterband__search"
              @keyup.enter="dimmingCtl.onFilterApply()"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="dimmingCtl.onFilterApply()">
              <el-icon><Search /></el-icon>
              <span>检索</span>
            </el-button>
            <el-button @click="dimmingCtl.onFilterReset()">
              <el-icon><RefreshLeft /></el-icon>
              <span>重置</span>
            </el-button>
          </div>
        </div>

        <!-- 调光卡片视图 -->
        <div v-if="dimmingDensity === 'card'" class="zg-cardgrid">
          <article
            v-for="dimming in dimmingCtl.pagedRows"
            :key="dimming.id"
            class="zg-lumencard"
            :class="dimming.status === '已配置' ? 'configured' : 'unconfigured'"
            @click="lumenInspector.openInspector(dimming)"
          >
            <div class="zg-lumencard__head">
              <div class="zg-lumencard__glyph">
                <el-icon :size="24"><Sunny /></el-icon>
              </div>
              <span class="zg-status" :class="dimming.status === '已配置' ? 'online' : 'idle'">
                <i class="dot"></i>{{ dimming.status }}
              </span>
            </div>
            <div class="zg-lumencard__body">
              <h3 class="zg-lumencard__name">{{ dimming.sectionType }}</h3>
              <div class="zg-lumencard__timeline">
                <span class="zg-lumencard__timeitem">
                  <em>凌晨</em>{{ dimming.dawn || '-' }}
                </span>
                <span class="zg-lumencard__timeitem">
                  <em>白天</em>{{ dimming.day || '-' }}
                </span>
                <span class="zg-lumencard__timeitem">
                  <em>傍晚</em>{{ dimming.dusk || '-' }}
                </span>
                <span class="zg-lumencard__timeitem">
                  <em>夜间</em>{{ dimming.night || '-' }}
                </span>
              </div>
            </div>
            <div class="zg-lumencard__foot">
              <span class="zg-lumencard__tag">{{ dimming.lightingLevel || '-' }}</span>
              <div class="zg-lumencard__actions">
                <el-button link type="primary" size="small" @click.stop="dimmingForm.openReviser(dimming)">修订</el-button>
                <el-button link type="danger" size="small" @click.stop="onRetireDimming(dimming)">废止</el-button>
              </div>
            </div>
          </article>
        </div>

        <!-- 调光列表视图 -->
        <div v-else class="zg-tablewrap">
          <el-table :data="dimmingCtl.pagedRows" stripe class="zg-datatable">
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="sectionType" label="分段-照明类型" min-width="150" />
            <el-table-column prop="lightingLevel" label="照明级别" width="100" />
            <el-table-column prop="dawn" label="凌晨" width="80" align="center">
              <template #default="{ row }">{{ row.dawn || '-' }}</template>
            </el-table-column>
            <el-table-column prop="day" label="白天" width="80" align="center">
              <template #default="{ row }">{{ row.day || '-' }}</template>
            </el-table-column>
            <el-table-column prop="dusk" label="傍晚" width="80" align="center">
              <template #default="{ row }">{{ row.dusk || '-' }}</template>
            </el-table-column>
            <el-table-column prop="night" label="夜间" width="80" align="center">
              <template #default="{ row }">{{ row.night || '-' }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '已配置' ? 'online' : 'idle'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="处置" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="lumenInspector.openInspector(row)">详情</el-button>
                <el-button type="primary" size="small" @click="dimmingForm.openReviser(row)">修订</el-button>
                <el-button type="danger" size="small" @click="onRetireDimming(row)">废止</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 调光分页条 -->
        <div class="zg-pagerbar">
          <el-pagination
            v-model:current-page="dimmingCtl.pagingCursor"
            v-model:page-size="dimmingCtl.pageSpan"
            :total="dimmingCtl.totalRows"
            :page-sizes="[10, 15, 20, 50, 100]"
            layout="prev, pager, next, jumper, ->, sizes, total"
            background
          />
        </div>
      </el-tab-pane>

      <!-- 通断监测 Tab -->
      <el-tab-pane label="通断监测" name="circuit">
        <!-- 链路过滤工具栏 -->
        <div class="zg-filterband">
          <div class="zg-filterband__density">
            <el-radio-group v-model="circuitDensity" size="default">
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
              v-model="circuitCtl.statusBuckets"
              placeholder="链路状态"
              clearable
              class="zg-filterband__select"
            >
              <el-option label="正常" value="正常" />
              <el-option label="故障" value="故障" />
            </el-select>
            <el-input
              v-model="circuitCtl.filterLexicon"
              placeholder="检索链路名称/编号"
              clearable
              class="zg-filterband__search"
              @keyup.enter="circuitCtl.onFilterApply()"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="circuitCtl.onFilterApply()">
              <el-icon><Search /></el-icon>
              <span>检索</span>
            </el-button>
            <el-button @click="circuitCtl.onFilterReset()">
              <el-icon><RefreshLeft /></el-icon>
              <span>重置</span>
            </el-button>
          </div>
        </div>

        <!-- 链路卡片视图 -->
        <div v-if="circuitDensity === 'card'" class="zg-cardgrid">
          <article
            v-for="circuit in circuitCtl.pagedRows"
            :key="circuit.id"
            class="zg-circuitcard"
            :class="circuit.status === '正常' ? 'normal' : 'fault'"
            @click="lumenInspector.openInspector(circuit)"
          >
            <div class="zg-circuitcard__head">
              <div class="zg-circuitcard__glyph">
                <el-icon :size="24"><Lightning /></el-icon>
              </div>
              <span class="zg-status" :class="circuit.status === '正常' ? 'online' : 'offline'">
                <i class="dot"></i>{{ circuit.status }}
              </span>
            </div>
            <div class="zg-circuitcard__body">
              <h3 class="zg-circuitcard__name">{{ circuit.name }}</h3>
              <p class="zg-circuitcard__id">{{ circuit.id }}</p>
              <div class="zg-circuitcard__stats">
                <span class="zg-circuitcard__stat">
                  <em>{{ circuit.load }}</em>% 负载
                </span>
                <span class="zg-circuitcard__stat">
                  <em>{{ circuit.power }}</em> kW
                </span>
                <span class="zg-circuitcard__stat">
                  <em>{{ circuit.devices }}</em> 设备
                </span>
              </div>
            </div>
            <div class="zg-circuitcard__foot">
              <div class="zg-circuitcard__actions">
                <el-button link type="primary" size="small" @click.stop="onCircuitControl(circuit)">控制</el-button>
                <el-button link type="danger" size="small" @click.stop="onRetireCircuit(circuit)">废止</el-button>
              </div>
            </div>
          </article>
        </div>

        <!-- 链路列表视图 -->
        <div v-else class="zg-tablewrap">
          <el-table :data="circuitCtl.pagedRows" stripe class="zg-datatable">
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="id" label="链路编号" width="100" />
            <el-table-column prop="name" label="链路名称" width="120" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <span class="zg-status" :class="row.status === '正常' ? 'online' : 'offline'">
                  <i class="dot"></i>{{ row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="load" label="负载率(%)" width="90" align="center" />
            <el-table-column prop="power" label="功率(kW)" width="100" align="center" />
            <el-table-column prop="devices" label="关联设备" width="100" align="center" />
            <el-table-column label="处置" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="lumenInspector.openInspector(row)">详情</el-button>
                <el-button type="warning" size="small" @click="onCircuitControl(row)">控制</el-button>
                <el-button type="danger" size="small" @click="onRetireCircuit(row)">废止</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 链路分页条 -->
        <div class="zg-pagerbar">
          <el-pagination
            v-model:current-page="circuitCtl.pagingCursor"
            v-model:page-size="circuitCtl.pageSpan"
            :total="circuitCtl.totalRows"
            :page-sizes="[10, 15, 20, 50, 100]"
            layout="prev, pager, next, jumper, ->, sizes, total"
            background
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="lumenInspector.drawerOpen"
      :title="activeTab === 'dimming' ? '调光配置详情 · ' + (focusedRecord?.sectionType || '') : '链路详情 · ' + (focusedRecord?.name || '')"
      :size="lumenInspector.drawerSize"
      :direction="lumenInspector.drawerDirection"
    >
      <div v-if="focusedRecord" class="zg-inspector">
        <!-- 调光详情 -->
        <template v-if="activeTab === 'dimming'">
          <div class="zg-inspector__head">
            <div class="zg-inspector__glyph">
              <el-icon :size="36"><Sunny /></el-icon>
            </div>
            <div class="zg-inspector__meta">
              <h2 class="zg-inspector__name">{{ focusedRecord.sectionType }}</h2>
              <p class="zg-inspector__type">{{ focusedRecord.lightingLevel || '-' }}</p>
              <span class="zg-status" :class="focusedRecord.status === '已配置' ? 'online' : 'idle'">
                <i class="dot"></i>{{ focusedRecord.status }}
              </span>
            </div>
          </div>

          <div class="zg-inspector__section">
            <h4 class="zg-inspector__section-title">时段调光值</h4>
            <div class="zg-datagrid">
              <div class="zg-datacard">
                <div class="zg-datacard__lbl">凌晨</div>
                <div class="zg-datacard__val">{{ focusedRecord.dawn || '-' }}</div>
              </div>
              <div class="zg-datacard">
                <div class="zg-datacard__lbl">白天</div>
                <div class="zg-datacard__val">{{ focusedRecord.day || '-' }}</div>
              </div>
              <div class="zg-datacard">
                <div class="zg-datacard__lbl">傍晚</div>
                <div class="zg-datacard__val">{{ focusedRecord.dusk || '-' }}</div>
              </div>
              <div class="zg-datacard">
                <div class="zg-datacard__lbl">夜间</div>
                <div class="zg-datacard__val">{{ focusedRecord.night || '-' }}</div>
              </div>
            </div>
          </div>

          <div class="zg-inspector__section">
            <h4 class="zg-inspector__section-title">配置信息</h4>
            <div class="zg-inspector__grid">
              <div class="zg-inspector__cell">
                <span class="lbl">照明级别</span>
                <span class="val">{{ focusedRecord.lightingLevel || '-' }}</span>
              </div>
              <div class="zg-inspector__cell">
                <span class="lbl">执行模式</span>
                <span class="val">{{ focusedRecord.executeMode || '-' }}</span>
              </div>
              <div class="zg-inspector__cell">
                <span class="lbl">传感器类型</span>
                <span class="val">{{ focusedRecord.sensorType || '-' }}</span>
              </div>
              <div class="zg-inspector__cell">
                <span class="lbl">在役状态</span>
                <span class="val">{{ focusedRecord.enabled ? '启用' : '停用' }}</span>
              </div>
            </div>
          </div>

          <div class="zg-inspector__actions">
            <el-button size="large" @click="lumenInspector.closeInspector()">关闭</el-button>
            <el-button type="primary" size="large" @click="dimmingForm.openReviser(focusedRecord)">修订配置</el-button>
          </div>
        </template>

        <!-- 链路详情 -->
        <template v-else>
          <div class="zg-inspector__head">
            <div class="zg-inspector__glyph">
              <el-icon :size="36"><Lightning /></el-icon>
            </div>
            <div class="zg-inspector__meta">
              <h2 class="zg-inspector__name">{{ focusedRecord.name }}</h2>
              <p class="zg-inspector__type">{{ focusedRecord.id }}</p>
              <span class="zg-status" :class="focusedRecord.status === '正常' ? 'online' : 'offline'">
                <i class="dot"></i>{{ focusedRecord.status }}
              </span>
            </div>
          </div>

          <div class="zg-inspector__section">
            <h4 class="zg-inspector__section-title">实时遥测</h4>
            <div class="zg-datagrid">
              <div class="zg-datacard">
                <div class="zg-datacard__lbl">负载率</div>
                <div class="zg-datacard__val">{{ focusedRecord.load }}<em>%</em></div>
              </div>
              <div class="zg-datacard">
                <div class="zg-datacard__lbl">功率</div>
                <div class="zg-datacard__val">{{ focusedRecord.power }}<em>kW</em></div>
              </div>
              <div class="zg-datacard">
                <div class="zg-datacard__lbl">关联设备</div>
                <div class="zg-datacard__val">{{ focusedRecord.devices }}<em>台</em></div>
              </div>
            </div>
          </div>

          <div class="zg-inspector__section">
            <h4 class="zg-inspector__section-title">链路参数</h4>
            <div class="zg-inspector__grid">
              <div class="zg-inspector__cell">
                <span class="lbl">链路编号</span>
                <span class="val">{{ focusedRecord.id }}</span>
              </div>
              <div class="zg-inspector__cell">
                <span class="lbl">链路名称</span>
                <span class="val">{{ focusedRecord.name }}</span>
              </div>
            </div>
          </div>

          <div class="zg-inspector__actions">
            <el-button size="large" @click="lumenInspector.closeInspector()">关闭</el-button>
            <el-button type="warning" size="large" @click="onCircuitControl(focusedRecord)">链路控制</el-button>
          </div>
        </template>
      </div>
    </el-drawer>

    <!-- 调光配置新建/修订抽屉 -->
    <el-drawer
      v-model="dimmingForm.drawerOpen"
      :title="dimmingForm.editMode === 'compose' ? '新增调光配置' : '修订调光配置'"
      direction="rtl"
      size="560px"
    >
      <el-form :model="dimmingForm.draftPayload" label-width="96px" class="zg-draftform">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分段类型" required>
              <el-select v-model="dimmingForm.draftPayload.sectionType" style="width: 100%">
                <el-option label="入口段" value="入口段" />
                <el-option label="基本段" value="基本段" />
                <el-option label="出口段" value="出口段" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="照明级别" required>
              <el-select v-model="dimmingForm.draftPayload.lightingLevel" style="width: 100%">
                <el-option label="基本照明" value="基本照明" />
                <el-option label="加强照明" value="加强照明" />
                <el-option label="应急照明" value="应急照明" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="执行模式" required>
              <el-select v-model="dimmingForm.draftPayload.executeMode" style="width: 100%">
                <el-option label="光感" value="光感" />
                <el-option label="时序" value="时序" />
                <el-option label="手动" value="手动" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="传感器类型" required>
              <el-select v-model="dimmingForm.draftPayload.sensorType" style="width: 100%">
                <el-option label="照度探针" value="照度探针" />
                <el-option label="CO传感器" value="CO传感器" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="凌晨调光值">
              <el-input-number v-model="dimmingForm.draftPayload.dawn" :min="0" :max="100" style="width: 100%" />
              <span class="zg-draftform__unit">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="白天调光值">
              <el-input-number v-model="dimmingForm.draftPayload.day" :min="0" :max="100" style="width: 100%" />
              <span class="zg-draftform__unit">%</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="傍晚调光值">
              <el-input-number v-model="dimmingForm.draftPayload.dusk" :min="0" :max="100" style="width: 100%" />
              <span class="zg-draftform__unit">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="夜间调光值">
              <el-input-number v-model="dimmingForm.draftPayload.night" :min="0" :max="100" style="width: 100%" />
              <span class="zg-draftform__unit">%</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="在役">
          <el-checkbox v-model="dimmingForm.draftPayload.enabled" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="dimmingForm.draftPayload.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dimmingForm.onDraftDiscard()">取消</el-button>
        <el-button
          type="primary"
          :loading="dimmingForm.submitting"
          @click="onCommitDimmingDraft"
        >
          {{ dimmingForm.editMode === 'compose' ? '新增' : '保存修订' }}
        </el-button>
      </template>
    </el-drawer>

    <!-- 链路控制抽屉 -->
    <el-drawer
      v-model="circuitControlDrawerOpen"
      :title="'链路控制 · ' + (focusedCircuit?.name || '')"
      direction="rtl"
      size="480px"
    >
      <div v-if="focusedCircuit" class="zg-circuitcontrol">
        <div class="zg-circuitcontrol__info">
          <div class="zg-circuitcontrol__name">{{ focusedCircuit.name }}</div>
          <div class="zg-circuitcontrol__id">{{ focusedCircuit.id }}</div>
          <span class="zg-status" :class="focusedCircuit.status === '正常' ? 'online' : 'offline'">
            <i class="dot"></i>{{ focusedCircuit.status }}
          </span>
        </div>

        <div class="zg-circuitcontrol__section">
          <h4 class="zg-circuitcontrol__title">亮度调节</h4>
          <div class="zg-circuitcontrol__sliderwrap">
            <el-slider
              v-model="circuitControlForm.brightness"
              :min="0"
              :max="100"
              :show-input="false"
              style="width: 100%"
            />
            <div class="zg-circuitcontrol__brightness-display">{{ circuitControlForm.brightness }}%</div>
          </div>
          <div class="zg-circuitcontrol__presets">
            <el-button size="small" @click="circuitControlForm.brightness = 0">0%</el-button>
            <el-button size="small" @click="circuitControlForm.brightness = 25">25%</el-button>
            <el-button size="small" @click="circuitControlForm.brightness = 50">50%</el-button>
            <el-button size="small" @click="circuitControlForm.brightness = 75">75%</el-button>
            <el-button size="small" @click="circuitControlForm.brightness = 100">100%</el-button>
          </div>
        </div>

        <div class="zg-circuitcontrol__section">
          <h4 class="zg-circuitcontrol__title">当前状态</h4>
          <div class="zg-circuitcontrol__stats">
            <div class="zg-circuitcontrol__stat">
              <span class="lbl">负载率</span>
              <span class="val">{{ focusedCircuit.load }}%</span>
            </div>
            <div class="zg-circuitcontrol__stat">
              <span class="lbl">功率</span>
              <span class="val">{{ focusedCircuit.power }} kW</span>
            </div>
            <div class="zg-circuitcontrol__stat">
              <span class="lbl">关联设备</span>
              <span class="val">{{ focusedCircuit.devices }} 台</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="circuitControlDrawerOpen = false">取消</el-button>
        <el-button type="primary" @click="onCommitCircuitControl">执行控制</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 管廊照明 · 隧道照明
 * 业务域：tubeLumen
 * 功能：隧道照明的调光控制与通断监测
 * @module tubeLumen/LumenControl
 * @author 智光云枢研发团队
 */
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

// ---- Tab 切换 ----
const activeTab = ref('dimming')

// ---- 视图密度切换 ----
const dimmingDensity = ref('card')
const circuitDensity = ref('card')

// ---- 初始 mock 数据池 - 调光配置 ----
const initialDimming = [
  {
    id: 1,
    no: 1,
    sectionType: '入口段-基本照明',
    lightingLevel: '基本照明',
    executeMode: '光感',
    sensorType: '照度探针',
    dawn: '-',
    day: '-',
    dusk: '-',
    night: '-',
    status: '未配置',
    enabled: true,
    remark: ''
  },
  {
    id: 2,
    no: 2,
    sectionType: '入口段-全部',
    lightingLevel: '加强照明',
    executeMode: '时序',
    sensorType: '照度探针',
    dawn: '-',
    day: '-',
    dusk: '-',
    night: '-',
    status: '未配置',
    enabled: true,
    remark: ''
  },
  {
    id: 3,
    no: 3,
    sectionType: '基本段-基本照明',
    lightingLevel: '基本照明',
    executeMode: '光感',
    sensorType: '照度探针',
    dawn: '10%',
    day: '30%',
    dusk: '20%',
    night: '15%',
    status: '已配置',
    enabled: true,
    remark: '主照明回路'
  }
]

// ---- 初始 mock 数据池 - 通断监测 ----
const initialCircuits = [
  {
    id: 'HL-001',
    no: 1,
    name: '照明链路1',
    status: '正常',
    load: 65,
    power: 12.5,
    devices: 24,
    remark: ''
  },
  {
    id: 'HL-002',
    no: 2,
    name: '照明链路2',
    status: '正常',
    load: 45,
    power: 8.8,
    devices: 18,
    remark: ''
  },
  {
    id: 'HL-003',
    no: 3,
    name: '照明链路3',
    status: '故障',
    load: 0,
    power: 0,
    devices: 20,
    remark: '待检修'
  },
  {
    id: 'HL-004',
    no: 4,
    name: '应急链路',
    status: '正常',
    load: 30,
    power: 5.2,
    devices: 10,
    remark: '备用回路'
  }
]

// ---- 调光表格数据容器 ----
const dimmingCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialDimming
})

// ---- 链路表格数据容器 ----
const circuitCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialCircuits
})

// ---- 概览指标派生 ----
const activeDimmingCount = computed(
  () => dimmingCtl.presetPlaybook.filter(d => d.status === '已配置').length
)
const faultCircuitCount = computed(
  () => circuitCtl.presetPlaybook.filter(c => c.status === '故障').length
)
const totalCircuitCount = computed(
  () => circuitCtl.presetPlaybook.length
)

// ---- 调光表单草稿容器 ----
const dimmingForm = useFormDraft(
  {
    sectionType: '入口段',
    lightingLevel: '基本照明',
    executeMode: '光感',
    sensorType: '照度探针',
    dawn: '',
    day: '',
    dusk: '',
    night: '',
    enabled: true,
    remark: ''
  },
  {
    validateFn: (draft) => {
      if (!draft.sectionType) {
        ElMessage.warning('请选择分段类型')
        return false
      }
      if (!draft.lightingLevel) {
        ElMessage.warning('请选择照明级别')
        return false
      }
      return true
    }
  }
)

// ---- 详情抽屉容器 ----
const lumenInspector = useDrawerInspector({ size: '600px', direction: 'rtl' })
const focusedRecord = computed(() => lumenInspector.focusedRecord)

// ---- 链路控制抽屉 ----
const circuitControlDrawerOpen = ref(false)
const focusedCircuit = ref(null)
const circuitControlForm = ref({
  brightness: 50
})

/**
 * 提交调光草稿：根据编排/修订模式写入数据池
 * 业务流包装：新建生成编号，修订同步配置字段
 */
const onCommitDimmingDraft = async () => {
  const snapshot = await dimmingForm.onDraftCommit()
  if (!snapshot) return

  const hasValue = snapshot.dawn || snapshot.day || snapshot.dusk || snapshot.night
  const status = hasValue ? '已配置' : '未配置'

  if (dimmingForm.editMode === 'compose') {
    dimmingCtl.appendRecord({
      ...snapshot,
      dawn: snapshot.dawn ? `${snapshot.dawn}%` : '-',
      day: snapshot.day ? `${snapshot.day}%` : '-',
      dusk: snapshot.dusk ? `${snapshot.dusk}%` : '-',
      night: snapshot.night ? `${snapshot.night}%` : '-',
      status,
      sectionType: `${snapshot.sectionType}-${snapshot.lightingLevel}`
    })
    ElMessage.success('调光配置新增成功，已并入照明台账')
  } else {
    const origin = dimmingForm.originRecord
    dimmingCtl.reviseRecord(origin.id, {
      ...snapshot,
      dawn: snapshot.dawn ? `${snapshot.dawn}%` : '-',
      day: snapshot.day ? `${snapshot.day}%` : '-',
      dusk: snapshot.dusk ? `${snapshot.dusk}%` : '-',
      night: snapshot.night ? `${snapshot.night}%` : '-',
      status,
      sectionType: `${snapshot.sectionType}-${snapshot.lightingLevel}`
    })
    ElMessage.success('调光配置已更新')
  }
}

/**
 * 链路控制：打开链路调光控制抽屉
 * @param {Object} circuit 目标链路
 */
const onCircuitControl = (circuit) => {
  focusedCircuit.value = circuit
  circuitControlForm.value = { brightness: 50 }
  circuitControlDrawerOpen.value = true
}

/**
 * 提交链路控制：执行调光指令，更新状态回执
 */
const onCommitCircuitControl = () => {
  if (!focusedCircuit.value) return

  ElMessageBox.confirm(
    `确认将「${focusedCircuit.value.name}」调至 ${circuitControlForm.value.brightness}% 亮度？`,
    '控制确认',
    { type: 'warning' }
  )
    .then(() => {
      circuitControlDrawerOpen.value = false
      ElMessage.success(`${focusedCircuit.value.name} 调光指令已下发，亮度: ${circuitControlForm.value.brightness}%`)
    })
    .catch(() => {})
}

/**
 * 废止调光配置：二次确认后从台账中移除
 * @param {Object} dimming 目标调光配置
 */
const onRetireDimming = (dimming) => {
  ElMessageBox.confirm(
    `确定要将「${dimming.sectionType}」从调光台账中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      dimmingCtl.retireRecord(dimming.id)
      ElMessage.success('调光配置已废止，台账已同步')
    })
    .catch(() => {})
}

/**
 * 废止链路：二次确认后从链路清单中移除
 * @param {Object} circuit 目标链路
 */
const onRetireCircuit = (circuit) => {
  ElMessageBox.confirm(
    `确定要将「${circuit.name}」从链路清单中废止吗？`,
    '废止确认',
    { type: 'warning' }
  )
    .then(() => {
      circuitCtl.retireRecord(circuit.id)
      ElMessage.success('链路已废止，清单已同步')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.zg-lumen {
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

  &__tabs {
    margin-bottom: 0;
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

.zg-lumencard {
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

  &.configured {
    border-left: 3px solid var(--zg-success);
  }
  &.unconfigured {
    border-left: 3px solid var(--zg-warning);
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
    gap: 8px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }

  &__timeline {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  &__timeitem {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
    color: var(--zg-ink-tertiary);
    text-align: center;

    em {
      font-style: normal;
      font-size: 10px;
      color: var(--zg-ink-placeholder);
    }
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
  }

  &__tag {
    font-size: 11px;
    color: var(--zg-brand-primary);
    background: var(--zg-brand-tint-50);
    padding: 2px 8px;
    border-radius: var(--zg-radius-pill);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }
}

.zg-circuitcard {
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

  &.normal {
    border-left: 3px solid var(--zg-success);
  }
  &.fault {
    border-left: 3px solid var(--zg-danger);
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

  &__id {
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
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px dashed var(--zg-line-soft);
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

.zg-circuitcontrol {
  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--zg-line-soft);
    margin-bottom: 16px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
  }

  &__id {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }

  &__section {
    margin-bottom: 18px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-secondary);
    margin: 0 0 12px;
    padding-left: 8px;
    border-left: 3px solid var(--zg-brand-primary);
  }

  &__sliderwrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__brightness-display {
    font-size: 20px;
    font-weight: 700;
    color: var(--zg-brand-primary);
    width: 60px;
    text-align: center;
  }

  &__presets {
    display: flex;
    gap: 6px;
    margin-top: 12px;
  }

  &__stats {
    display: flex;
    gap: 16px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    background: var(--zg-surface-muted);
    border-radius: var(--zg-radius-md);
    flex: 1;

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
}
</style>