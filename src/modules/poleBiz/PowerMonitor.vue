<!--
  智光云枢 · 杆桩运营 · 共享用电 · 实时监控中心
  业务域：poleBiz
  功能：三相 380V 实时监控 + 五重安全告警中心 + 远程断电
-->
<template>
  <section class="zg-pm">
    <!-- ============ 头部 ============ -->
    <header class="zg-pm__head">
      <div class="zg-pm__headline">
        <div class="zg-pm__sigil">
          <el-icon :size="22"><Monitor /></el-icon>
        </div>
        <div class="zg-pm__copy">
          <h1 class="zg-pm__title">共享用电 · 实时监控中心</h1>
          <p class="zg-pm__sub">
            三相 380V · 五重安全防护 · 在役终端 {{ totalCount }} 台 ·
            今日告警 {{ todayAlerts }} 条 · 安全触发 {{ safetyTriggers }} 次
          </p>
        </div>
      </div>
      <div class="zg-pm__head-meta">
        <span class="zg-pm__live-dot"></span>
        <span>实时刷新 · 1s</span>
        <span class="zg-pm__divider">|</span>
        <span>{{ currentTime }}</span>
      </div>
    </header>

    <!-- ============ KPI ============ -->
    <div class="zg-kpis">
      <div class="zg-kpis__cell zg-kpis__cell--ok">
        <div class="zg-kpis__icon">
          <el-icon :size="20"><Connection /></el-icon>
        </div>
        <div class="zg-kpis__body">
          <span class="zg-kpis__num">{{ usingCount }}</span>
          <span class="zg-kpis__lbl">用电中终端</span>
        </div>
      </div>
      <div class="zg-kpis__cell zg-kpis__cell--danger">
        <div class="zg-kpis__icon">
          <el-icon :size="20"><Bell /></el-icon>
        </div>
        <div class="zg-kpis__body">
          <span class="zg-kpis__num">{{ todayAlerts }}</span>
          <span class="zg-kpis__lbl">今日告警</span>
        </div>
      </div>
      <div class="zg-kpis__cell zg-kpis__cell--warn">
        <div class="zg-kpis__icon">
          <el-icon :size="20"><AlarmClock /></el-icon>
        </div>
        <div class="zg-kpis__body">
          <span class="zg-kpis__num">{{ safetyTriggers }}</span>
          <span class="zg-kpis__lbl">今日触发安全</span>
        </div>
      </div>
      <div class="zg-kpis__cell zg-kpis__cell--info">
        <div class="zg-kpis__icon">
          <el-icon :size="20"><Cpu /></el-icon>
        </div>
        <div class="zg-kpis__body">
          <span class="zg-kpis__num">{{ onlineRate }}%</span>
          <span class="zg-kpis__lbl">在线率</span>
        </div>
      </div>
      <div class="zg-kpis__cell">
        <div class="zg-kpis__icon">
          <el-icon :size="20"><MagicStick /></el-icon>
        </div>
        <div class="zg-kpis__body">
          <span class="zg-kpis__num">{{ totalPower.toFixed(2) }}</span>
          <span class="zg-kpis__lbl">当前总功率 kW</span>
        </div>
      </div>
    </div>

    <!-- ============ 三栏主体 ============ -->
    <div class="zg-pm__main">
      <!-- ====== 左栏：终端列表 ====== -->
      <aside class="zg-pm__side zg-pm__side--left">
        <div class="zg-pm__panel">
          <div class="zg-pm__panel-head">
            <h3 class="zg-pm__panel-title">
              <el-icon><Grid /></el-icon>
              终端台账（{{ totalCount }} 台）
            </h3>
            <el-select v-model="listFilter" size="small" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="用电中" value="using" />
              <el-option label="空闲" value="idle" />
              <el-option label="告警" value="alarm" />
              <el-option label="断电" value="offline" />
            </el-select>
          </div>

          <div class="zg-pm__terminal-list">
            <div
              v-for="t in pagedTerminals"
              :key="t.id"
              class="zg-pm__terminal-item"
              :class="{
                'is-using': t.status === 'using',
                'is-alarm': t.status === 'alarm',
                'is-offline': t.status === 'offline'
              }"
              @click="selectTerminal(t)"
            >
              <div class="zg-pm__term-dot" :data-status="t.status"></div>
              <div class="zg-pm__term-info">
                <div class="zg-pm__term-id">{{ t.id }} · {{ t.name }}</div>
                <div class="zg-pm__term-geo">{{ t.geoLabel }}</div>
              </div>
              <div class="zg-pm__term-power" v-if="t.status === 'using'">
                {{ t.totalPower?.toFixed(1) || '0.0' }} kW
              </div>
              <div class="zg-pm__term-tag">
                <el-tag
                  v-if="t.status === 'using'"
                  type="success"
                  effect="dark"
                  round
                  size="small"
                >通电</el-tag>
                <el-tag
                  v-else-if="t.status === 'alarm'"
                  type="danger"
                  effect="dark"
                  round
                  size="small"
                  class="is-pulse"
                >告警</el-tag>
                <el-tag
                  v-else-if="t.status === 'offline'"
                  type="info"
                  effect="dark"
                  round
                  size="small"
                >断电</el-tag>
                <el-tag
                  v-else
                  type="info"
                  round
                  size="small"
                >空闲</el-tag>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="zg-pm__pager">
            <el-pagination
              v-model:current-page="page"
              :page-size="pageSize"
              :total="filteredTerminals.length"
              layout="prev, pager, next"
              small
              background
            />
          </div>
        </div>

        <!-- 终端详情小卡 -->
        <div v-if="selectedTerminal" class="zg-pm__panel zg-pm__panel--detail">
          <div class="zg-pm__panel-head">
            <h3 class="zg-pm__panel-title">
              <el-icon><Monitor /></el-icon>
              {{ selectedTerminal.id }} 详情
            </h3>
            <el-button link type="primary" size="small" @click="showBreakDialog">
              <el-icon><SwitchButton /></el-icon>远程断电
            </el-button>
          </div>
          <div class="zg-pm__detail-grid">
            <div class="zg-pm__detail-cell">
              <span class="lbl">位置</span>
              <span class="val">{{ selectedTerminal.geoLabel }}</span>
            </div>
            <div class="zg-pm__detail-cell">
              <span class="lbl">状态</span>
              <span class="val" :class="'is-' + selectedTerminal.status">
                {{ statusText(selectedTerminal.status) }}
              </span>
            </div>
            <div class="zg-pm__detail-cell">
              <span class="lbl">Ua</span>
              <span class="val" :class="voltageClass(selectedTerminal.Ua)">{{ voltageFmt(selectedTerminal.Ua) }}V</span>
            </div>
            <div class="zg-pm__detail-cell">
              <span class="lbl">Ub</span>
              <span class="val" :class="voltageClass(selectedTerminal.Ub)">{{ voltageFmt(selectedTerminal.Ub) }}V</span>
            </div>
            <div class="zg-pm__detail-cell">
              <span class="lbl">Uc</span>
              <span class="val" :class="voltageClass(selectedTerminal.Uc)">{{ voltageFmt(selectedTerminal.Uc) }}V</span>
            </div>
            <div class="zg-pm__detail-cell">
              <span class="lbl">总功率</span>
              <span class="val is-warn">{{ (selectedTerminal.totalPower || 0).toFixed(2) }}kW</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- ====== 中央：三相实时仪表 ====== -->
      <main class="zg-pm__center">
        <div class="zg-pm__panel zg-pm__panel--dashboard">
          <div class="zg-pm__panel-head">
            <h3 class="zg-pm__panel-title">
              <el-icon><MagicStick /></el-icon>
              三相 380V 实时仪表盘
            </h3>
            <div class="zg-pm__phase-tabs">
              <span class="is-active">当前选中 · {{ selectedTerminal?.id || '先导路#23' }}</span>
            </div>
          </div>

          <!-- 三个电压圆环 -->
          <div class="zg-pm__gauges">
            <div
              v-for="phase in phases"
              :key="phase.key"
              class="zg-pm__gauge"
            >
              <svg viewBox="0 0 200 200" width="200" height="200" class="zg-pm__gauge-svg">
                <!-- 背景弧 -->
                <circle
                  cx="100" cy="100" r="85"
                  fill="none" stroke="#f0f0f0" stroke-width="14"
                  stroke-dasharray="534" stroke-dashoffset="0"
                />
                <!-- 进度弧（颜色动态） -->
                <circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  :stroke="phaseColor(phase.value)"
                  stroke-width="14"
                  stroke-linecap="round"
                  stroke-dasharray="534"
                  :stroke-dashoffset="phaseOffset(phase.value)"
                  transform="rotate(-90 100 100)"
                  class="zg-pm__gauge-progress"
                />
                <!-- 刻度 -->
                <g stroke="#d0d5dd" stroke-width="1">
                  <line
                    v-for="i in 13"
                    :key="i"
                    x1="100" y1="20" x2="100" y2="28"
                    :transform="`rotate(${(i - 1) * 30} 100 100)`"
                  />
                </g>
                <!-- 指针 -->
                <line
                  x1="100" y1="100" x2="100" y2="40"
                  stroke="#1f2d3d" stroke-width="3" stroke-linecap="round"
                  :transform="`rotate(${needleAngle(phase.value)} 100 100)`"
                />
                <circle cx="100" cy="100" r="8" fill="#1f2d3d" />
                <circle cx="100" cy="100" r="3" fill="#fff" />
              </svg>
              <div class="zg-pm__gauge-label">{{ phase.label }}</div>
              <div class="zg-pm__gauge-value" :class="voltageClass(phase.value)">
                {{ voltageFmt(phase.value) }}
                <span class="zg-pm__gauge-unit">V</span>
              </div>
            </div>
          </div>

          <!-- 大字跳动区 -->
          <div class="zg-pm__big-numbers">
            <div class="zg-pm__big-card">
              <span class="lbl">当前总有功功率</span>
              <span class="num">{{ selectedTotalPower.toFixed(2) }}</span>
              <span class="unit">kW</span>
            </div>
            <div class="zg-pm__big-card zg-pm__big-card--pf">
              <span class="lbl">功率因数 cosφ</span>
              <span class="num">{{ powerFactor.toFixed(2) }}</span>
              <span class="unit">目标 0.85</span>
            </div>
            <div class="zg-pm__big-card zg-pm__big-card--hz">
              <span class="lbl">电网频率</span>
              <span class="num">{{ frequency.toFixed(2) }}</span>
              <span class="unit">Hz</span>
            </div>
          </div>

          <!-- 三相分量表 -->
          <div class="zg-pm__phase-metrics">
            <div class="zg-pm__metric-row">
              <div
                v-for="m in powerMetrics"
                :key="m.key"
                class="zg-pm__metric-card"
              >
                <div class="zg-pm__metric-phase">{{ m.phaseLabel }}</div>
                <div class="zg-pm__metric-value" :class="m.alarm ? 'is-danger' : 'is-ok'">
                  {{ m.value.toFixed(2) }}
                </div>
                <div class="zg-pm__metric-unit">{{ m.unit }}</div>
              </div>
            </div>
            <div class="zg-pm__metric-row">
              <div
                v-for="m in currentMetrics"
                :key="m.key"
                class="zg-pm__metric-card zg-pm__metric-card--mini"
              >
                <div class="zg-pm__metric-phase">{{ m.phaseLabel }} 电流</div>
                <div class="zg-pm__metric-value">{{ m.value.toFixed(2) }}</div>
                <div class="zg-pm__metric-unit">A</div>
              </div>
            </div>
            <div class="zg-pm__metric-row">
              <div
                v-for="m in reactiveMetrics"
                :key="m.key"
                class="zg-pm__metric-card zg-pm__metric-card--mini"
              >
                <div class="zg-pm__metric-phase">{{ m.phaseLabel }} 无功</div>
                <div class="zg-pm__metric-value">{{ m.value.toFixed(2) }}</div>
                <div class="zg-pm__metric-unit">kVar</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 24h 趋势 -->
        <div class="zg-pm__panel">
          <div class="zg-pm__panel-head">
            <h3 class="zg-pm__panel-title">
              <el-icon><Grid /></el-icon>
              今日 24h 功率趋势
            </h3>
            <div class="zg-pm__peak-info">
              <span class="peak">峰值 <b>{{ peakPower.toFixed(1) }} kW</b> @ {{ peakTime }}</span>
              <span class="valley">谷值 <b>{{ valleyPower.toFixed(1) }} kW</b> @ {{ valleyTime }}</span>
            </div>
          </div>
          <div class="zg-pm__chart-wrap">
            <div class="zg-pm__bars">
              <div
                v-for="(v, i) in history24h"
                :key="i"
                class="zg-pm__bar"
                :style="{ height: (v / peakPower * 100) + '%' }"
                :title="`${hours24[i]}:00  ${v.toFixed(1)} kW`"
              ></div>
            </div>
            <div class="zg-pm__bar-labels">
              <span v-for="(h, i) in hours24" :key="i">{{ h }}</span>
            </div>
          </div>
        </div>
      </main>

      <!-- ====== 右栏：五重安全 + 实时告警流 ====== -->
      <aside class="zg-pm__side zg-pm__side--right">
        <!-- 实时告警流 -->
        <div class="zg-pm__panel zg-pm__panel--alert-stream">
          <div class="zg-pm__panel-head">
            <h3 class="zg-pm__panel-title">
              <el-icon><Warning /></el-icon>
              告警实时流
            </h3>
            <span class="zg-pm__stream-count">{{ alertStream.length }} 条</span>
          </div>

          <div class="zg-pm__stream-container">
            <div class="zg-pm__stream-track">
              <div
                v-for="(item, idx) in alertStream * 2"
                :key="idx"
                class="zg-pm__stream-item"
              >
                <span class="zg-pm__stream-dot" :data-level="item.level"></span>
                <div class="zg-pm__stream-body">
                  <div class="zg-pm__stream-head">
                    <el-tag
                      :type="item.level === 'high' ? 'danger' : 'warning'"
                      effect="dark"
                      round
                      size="small"
                    >{{ item.level === 'high' ? '🔴 紧急' : '🟡 警告' }}</el-tag>
                    <span class="zg-pm__stream-time">{{ item.time }}</span>
                  </div>
                  <div class="zg-pm__stream-title">{{ item.terminal }} {{ item.title }}</div>
                  <div class="zg-pm__stream-detail">{{ item.detail }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 五重安全仪表盘 -->
        <div class="zg-pm__panel">
          <div class="zg-pm__panel-head">
            <h3 class="zg-pm__panel-title">
              <el-icon><Cpu /></el-icon>
              五重安全防护
            </h3>
          </div>

          <div class="zg-pm__safety-grid">
            <div
              v-for="s in safetyItems"
              :key="s.key"
              class="zg-pm__safety-card"
              :class="{ 'is-triggered': s.status === 'danger', 'is-close': s.status === 'warn' }"
            >
              <div class="zg-pm__safety-gauge">
                <svg viewBox="0 0 80 80" width="70" height="70">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#f0f0f0" stroke-width="6" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    :stroke="s.status === 'danger' ? '#ef4444' : s.status === 'warn' ? '#f59e0b' : '#10b981'"
                    stroke-width="6"
                    stroke-linecap="round"
                    :stroke-dasharray="201"
                    :stroke-dashoffset="201 - (s.pct / 100) * 201"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div class="zg-pm__safety-pct">{{ s.pct }}%</div>
              </div>
              <div class="zg-pm__safety-info">
                <div class="zg-pm__safety-name">
                  {{ s.icon }} {{ s.label }}
                </div>
                <div class="zg-pm__safety-val">
                  当前 {{ s.current }} <span class="zg-pm__safety-sep">/</span>
                  阈值 {{ s.threshold }}
                </div>
                <div
                  class="zg-pm__safety-status"
                  :class="{
                    'is-ok': s.status === 'ok',
                    'is-warn': s.status === 'warn',
                    'is-danger': s.status === 'danger'
                  }"
                >
                  {{ s.statusText }}
                </div>
              </div>
            </div>
          </div>

          <!-- 触发历史时间线 -->
          <div class="zg-pm__timeline">
            <div class="zg-pm__timeline-title">🛡️ 触发历史</div>
            <div
              v-for="(t, i) in safetyHistory"
              :key="i"
              class="zg-pm__timeline-item"
            >
              <div class="zg-pm__timeline-dot" :data-level="t.level"></div>
              <div class="zg-pm__timeline-body">
                <div class="zg-pm__timeline-head">
                  <span class="zg-pm__timeline-name">{{ t.type }}</span>
                  <span class="zg-pm__timeline-time">{{ t.time }}</span>
                </div>
                <div class="zg-pm__timeline-detail">{{ t.detail }}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- ============ 底部三相数据表格 ============ -->
    <div class="zg-pm__panel zg-pm__table-panel">
      <div class="zg-pm__panel-head">
        <h3 class="zg-pm__panel-title">
          <el-icon><Grid /></el-icon>
          三相数据总览 · 每 1 秒自动刷新
          <span class="zg-pm__live-marker">
            <span class="zg-pm__live-dot"></span>LIVE
          </span>
        </h3>
        <div class="zg-pm__table-tools">
          <el-button size="small" :icon="Refresh" @click="resetData">重置</el-button>
          <el-button size="small" :icon="SwitchButton" type="danger" plain>批量断电</el-button>
        </div>
      </div>

      <el-table
        :data="tableTerminals"
        stripe
        size="default"
        class="zg-pm__table"
        highlight-current-row
      >
        <el-table-column label="终端编号" width="160">
          <template #default="{ row }">
            <div class="zg-pm__cell-id">
              <span class="zg-pm__term-dot" :data-status="row.status"></span>
              {{ row.id }}
            </div>
            <div class="zg-pm__cell-geo">{{ row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="位置" prop="geoLabel" min-width="200" />
        <el-table-column label="Ua (V)" width="110" align="center">
          <template #default="{ row }">
            <span class="zg-pm__td-val" :class="voltageClass(row.Ua)">{{ voltageFmt(row.Ua) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ub (V)" width="110" align="center">
          <template #default="{ row }">
            <span class="zg-pm__td-val" :class="voltageClass(row.Ub)">{{ voltageFmt(row.Ub) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Uc (V)" width="110" align="center">
          <template #default="{ row }">
            <span class="zg-pm__td-val" :class="voltageClass(row.Uc)">{{ voltageFmt(row.Uc) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ia (A)" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-pm__td-val">{{ (row.Ia || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ib (A)" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-pm__td-val">{{ (row.Ib || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ic (A)" width="100" align="center">
          <template #default="{ row }">
            <span class="zg-pm__td-val">{{ (row.Ic || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总功率 (kW)" width="130" align="right">
          <template #default="{ row }">
            <span class="zg-pm__td-val is-bold">{{ (row.totalPower || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.status === 'using'"
              type="success"
              effect="dark"
              round
              size="small"
            >通电</el-tag>
            <el-tag
              v-else-if="row.status === 'alarm'"
              type="danger"
              effect="dark"
              round
              size="small"
              class="is-pulse"
            >告警</el-tag>
            <el-tag
              v-else-if="row.status === 'offline'"
              type="info"
              round
              size="small"
            >断电</el-tag>
            <el-tag
              v-else
              type="info"
              round
              size="small"
            >空闲</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="selectFromTable(row)">查看详情</el-button>
            <el-button
              v-if="row.status !== 'offline'"
              link
              type="danger"
              size="small"
              @click="showBreakDialog(row)"
            >远程断电</el-button>
            <el-button
              v-if="row.status === 'offline'"
              link
              type="success"
              size="small"
              @click="resetTerminal(row)"
            >复位</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-pm__table-pager">
        <el-pagination
          v-model:current-page="tablePage"
          :page-size="8"
          :total="terminals.length"
          layout="total, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </div>

    <!-- ============ 远程断电确认 Dialog ============ -->
    <el-dialog v-model="breakVisible" :title="'远程断电 · ' + (breakTarget?.id || '')" width="440px" center>
      <div v-if="breakTarget" class="zg-pm__break-wrap">
        <div class="zg-pm__break-icon">
          <el-icon :size="48" color="#ef4444"><Warning /></el-icon>
        </div>
        <p class="zg-pm__break-tip">
          确认要对终端 <strong>{{ breakTarget.id }}</strong>（{{ breakTarget.name }}）执行<strong class="is-danger">远程断电</strong>吗？
        </p>
        <ul class="zg-pm__break-consequences">
          <li>断电后所有在用负载将立即停止</li>
          <li>正在进行中的共享用电会话将自动结算</li>
          <li>操作不可撤销，请谨慎确认</li>
        </ul>
        <div v-if="breakLoading" class="zg-pm__break-progress">
          <div class="zg-pm__break-progress-bar" :style="{ width: breakProgress + '%' }"></div>
          <span>{{ breakProgressTxt }}</span>
        </div>
      </div>
      <template #footer>
        <el-button :disabled="breakLoading" @click="breakVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="breakLoading"
          :disabled="breakLoading"
          @click="confirmBreak"
        >确认断电</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 共享用电 · 实时监控中心
 * 业务域：poleBiz
 */
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Grid, Warning, Monitor, Cpu, Connection,
  AlarmClock, Close, Check, Refresh, SwitchButton, MagicStick, Bell
} from '@element-plus/icons-vue'

// ========== Mock 终端数据 ==========
const mockTerminals = [
  { id: '先导路#23', name: '先导路夜市共享终端-A', geoLabel: '岳麓区·先导路夜市入口', status: 'using', Ua: 220.3, Ub: 219.8, Uc: 221.2, Ia: 12.5, Ib: 11.8, Ic: 12.9, Pa: 11.2, Pb: 10.8, Pc: 11.5, Qa: 2.1, Qb: 1.9, Qc: 2.3, totalPower: 33.5 },
  { id: '麓谷#87', name: '麓谷创业广场共享终端-B', geoLabel: '岳麓区·麓谷创业广场东', status: 'alarm', Ua: 258.6, Ub: 220.1, Uc: 219.5, Ia: 8.3, Ib: 7.9, Ic: 8.1, Pa: 7.8, Pb: 7.4, Pc: 7.6, Qa: 1.5, Qb: 1.3, Qc: 1.4, totalPower: 22.8 },
  { id: '梅溪湖#12', name: '梅溪湖公园舞台共享终端', geoLabel: '岳麓区·梅溪湖公园主舞台', status: 'using', Ua: 219.7, Ub: 220.5, Uc: 220.1, Ia: 15.2, Ib: 14.8, Ic: 15.5, Pa: 14.2, Pb: 13.8, Pc: 14.5, Qa: 2.8, Qb: 2.6, Qc: 2.9, totalPower: 42.5 },
  { id: '三一大道#03', name: '三一大道共享终端-1号', geoLabel: '开福区·三一大道北段', status: 'idle', Ua: 220.0, Ub: 220.2, Uc: 219.9, Ia: 0.0, Ib: 0.0, Ic: 0.0, Pa: 0, Pb: 0, Pc: 0, Qa: 0, Qb: 0, Qc: 0, totalPower: 0 },
  { id: '芙蓉广场#15', name: '芙蓉广场美食节共享终端', geoLabel: '芙蓉区·芙蓉广场南门', status: 'using', Ua: 220.1, Ub: 219.9, Uc: 220.3, Ia: 10.5, Ib: 10.2, Ic: 10.8, Pa: 9.5, Pb: 9.2, Pc: 9.8, Qa: 1.8, Qb: 1.6, Qc: 1.9, totalPower: 28.5 },
  { id: '万家丽路#07', name: '万家丽路共享终端-西2号', geoLabel: '雨花区·万家丽路西段', status: 'offline', Ua: 0, Ub: 0, Uc: 0, Ia: 0, Ib: 0, Ic: 0, Pa: 0, Pb: 0, Pc: 0, Qa: 0, Qb: 0, Qc: 0, totalPower: 0 },
  { id: '湘府路#22', name: '湘府路夜市共享终端-C', geoLabel: '天心区·湘府路夜市口', status: 'using', Ua: 219.8, Ub: 220.4, Uc: 220.0, Ia: 9.2, Ib: 9.5, Ic: 9.0, Pa: 8.8, Pb: 9.1, Pc: 8.6, Qa: 1.6, Qb: 1.7, Qc: 1.5, totalPower: 26.5 },
  { id: '洞井路#05', name: '洞井路共享终端-1号', geoLabel: '雨花区·洞井路中段', status: 'idle', Ua: 220.2, Ub: 219.8, Uc: 220.5, Ia: 0.0, Ib: 0.0, Ic: 0.0, Pa: 0, Pb: 0, Pc: 0, Qa: 0, Qb: 0, Qc: 0, totalPower: 0 },
  { id: '湘江新区#41', name: '湘江新区共享终端-广场', geoLabel: '岳麓区·湘江新区市民广场', status: 'using', Ua: 220.4, Ub: 219.6, Uc: 220.1, Ia: 11.8, Ib: 12.1, Ic: 11.5, Pa: 10.8, Pb: 11.2, Pc: 10.5, Qa: 2.0, Qb: 2.2, Qc: 1.9, totalPower: 32.5 },
  { id: '星沙#33', name: '星沙产业园共享终端', geoLabel: '长沙县·星沙产业园东门', status: 'idle', Ua: 219.9, Ub: 220.3, Uc: 220.0, Ia: 0.0, Ib: 0.0, Ic: 0.0, Pa: 0, Pb: 0, Pc: 0, Qa: 0, Qb: 0, Qc: 0, totalPower: 0 },
  { id: '开福寺#18', name: '开福寺庙会共享终端', geoLabel: '开福区·开福寺路', status: 'using', Ua: 220.0, Ub: 220.1, Uc: 219.8, Ia: 7.8, Ib: 8.2, Ic: 7.5, Pa: 7.2, Pb: 7.6, Pc: 6.9, Qa: 1.3, Qb: 1.4, Qc: 1.2, totalPower: 21.7 },
  { id: '橘子洲#09', name: '橘子洲烟花共享终端', geoLabel: '岳麓区·橘子洲头', status: 'offline', Ua: 0, Ub: 0, Uc: 0, Ia: 0, Ib: 0, Ic: 0, Pa: 0, Pb: 0, Pc: 0, Qa: 0, Qb: 0, Qc: 0, totalPower: 0 },
  { id: '红星#27', name: '红星会展中心共享终端', geoLabel: '雨花区·红星会展中心', status: 'using', Ua: 220.2, Ub: 219.9, Uc: 220.4, Ia: 13.5, Ib: 13.2, Ic: 13.8, Pa: 12.5, Pb: 12.2, Pc: 12.8, Qa: 2.4, Qb: 2.3, Qc: 2.5, totalPower: 37.5 },
  { id: '高桥#14', name: '高桥大市场共享终端', geoLabel: '雨花区·高桥大市场西', status: 'alarm', Ua: 212.5, Ub: 219.8, Uc: 220.1, Ia: 9.5, Ib: 9.1, Ic: 9.8, Pa: 8.5, Pb: 8.2, Pc: 8.8, Qa: 1.6, Qb: 1.5, Qc: 1.7, totalPower: 25.5 },
  { id: '马王堆#06', name: '马王堆菜市场共享终端', geoLabel: '芙蓉区·马王堆中路', status: 'using', Ua: 219.6, Ub: 220.3, Uc: 220.0, Ia: 6.5, Ib: 6.8, Ic: 6.2, Pa: 5.8, Pb: 6.1, Pc: 5.5, Qa: 1.0, Qb: 1.1, Qc: 0.9, totalPower: 17.4 },
  { id: '圭塘河#36', name: '圭塘河公园共享终端', geoLabel: '雨花区·圭塘河风光带', status: 'idle', Ua: 220.1, Ub: 220.0, Uc: 219.9, Ia: 0.0, Ib: 0.0, Ic: 0.0, Pa: 0, Pb: 0, Pc: 0, Qa: 0, Qb: 0, Qc: 0, totalPower: 0 }
]

// ========== 响应式状态 ==========
const terminals = ref(JSON.parse(JSON.stringify(mockTerminals)))
const selectedTerminal = ref(null)
const page = ref(1)
const pageSize = ref(6)
const tablePage = ref(1)
const listFilter = ref('')

// 头部时间
const currentTime = ref('')
let timeTimer = null

// 中央仪表盘：总有功 + 功率因数 + 频率
const totalPower = ref(0)
const powerFactor = ref(0.88)
const frequency = ref(50.02)

// 安全项
const safetyItems = ref([
  { key: 'overload', icon: '🔌', label: '过载保护', threshold: '120 kW', current: '35 kW', pct: 29, status: 'ok', statusText: '✅ 正常' },
  { key: 'leakage', icon: '💧', label: '漏电保护', threshold: '30 mA', current: '2 mA', pct: 7, status: 'ok', statusText: '✅ 正常' },
  { key: 'short', icon: '⚡', label: '短路保护', threshold: '毫秒级检测', current: '24h 在线', pct: 0, status: 'ok', statusText: '✅ 正常' },
  { key: 'timeout', icon: '⏰', label: '超时自动断电', threshold: '24h 设置', current: '已用 2h34m', pct: 11, status: 'ok', statusText: '✅ 正常' },
  { key: 'balance', icon: '💰', label: '余额不足', threshold: '¥5 阈值', current: '¥317', pct: 2, status: 'ok', statusText: '✅ 正常' }
])

// 告警历史
const alertStream = ref([
  { level: 'high', time: '09:42:18', terminal: '先导路#23', title: '过载告警', detail: '功率到达 118kW，接近阈值' },
  { level: 'warn', time: '08:15:32', terminal: '麓谷#87', title: '电压偏高', detail: 'Ua=262V，超出正常范围' },
  { level: 'high', time: '07:33:09', terminal: '梅溪湖#12', title: '漏电触发', detail: '电流 42mA > 30mA，立即断电' },
  { level: 'warn', time: '06:48:21', terminal: '高桥#14', title: '电压偏低', detail: 'Ua=208V，低于正常下限' },
  { level: 'warn', time: '05:22:14', terminal: '湘江新区#41', title: '功率因数偏低', detail: 'cosφ=0.78，低于 0.85 目标' },
  { level: 'high', time: '03:15:08', terminal: '橘子洲#09', title: '短路保护触发', detail: 'C 相电流瞬时尖峰 320A，毫秒级切断' },
  { level: 'warn', time: '02:41:55', terminal: '三一大道#03', title: '通信中断', detail: '心跳丢失 3 分钟，已自动重连' },
  { level: 'high', time: '01:12:30', terminal: '万家丽路#07', title: '运维手动断电', detail: '运维工单号 WO-2026-1027-003' }
])

// 安全触发历史时间线
const safetyHistory = ref([
  { level: 'high', type: '⚡ 漏电保护', time: '2026-10-27 07:33:09', detail: '梅溪湖#12 电流 42mA > 30mA，毫秒级切断，已通知用户' },
  { level: 'high', type: '⚡ 短路保护', time: '2026-10-26 14:28:52', detail: '芙蓉广场#15 C 相瞬时电流 280A 触发短路保护，已自动恢复' },
  { level: 'warn', type: '⏰ 超时断电', time: '2026-10-26 02:00:15', detail: '湘府路#22 连续用电满 24h，自动断电保护' },
  { level: 'warn', type: '💰 余额不足', time: '2026-10-25 21:45:00', detail: '先导路#05 用户余额 ¥4.87，触发 ¥5 阈值保护' }
])

// 今日告警 / 安全触发数
const todayAlerts = ref(2)
const safetyTriggers = ref(1)

// 24h 历史功率
const hours24 = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
const history24h = ref([8.5, 6.2, 5.1, 4.8, 4.5, 5.2, 12.8, 28.5, 42.3, 55.2, 62.8, 68.5, 72.1, 78.5, 85.2, 92.8, 98.5, 105.2, 118.5, 125.8, 112.3, 88.5, 62.8, 32.5])

// 断电 Dialog
const breakVisible = ref(false)
const breakTarget = ref(null)
const breakLoading = ref(false)
const breakProgress = ref(0)
const breakProgressTxt = ref('')

// ========== 计算属性 ==========
const filteredTerminals = computed(() => {
  if (!listFilter.value) return terminals.value
  return terminals.value.filter(t => t.status === listFilter.value)
})

const pagedTerminals = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredTerminals.value.slice(start, start + pageSize.value)
})

const tableTerminals = computed(() => {
  const start = (tablePage.value - 1) * 8
  return terminals.value.slice(start, start + 8)
})

const totalCount = computed(() => terminals.value.length)
const usingCount = computed(() => terminals.value.filter(t => t.status === 'using').length)
const onlineRate = computed(() => {
  const online = terminals.value.filter(t => t.status !== 'offline').length
  return ((online / totalCount.value) * 100).toFixed(1)
})

const selectedTerminalData = computed(() => {
  if (selectedTerminal.value) {
    return terminals.value.find(t => t.id === selectedTerminal.value.id)
  }
  return terminals.value.find(t => t.status === 'using') || terminals.value[0]
})

const selectedTotalPower = computed(() => {
  const t = selectedTerminalData.value
  if (!t || t.status === 'offline' || t.status === 'idle') return totalPower.value
  return t.totalPower || 0
})

const phases = computed(() => {
  const t = selectedTerminalData.value
  if (!t) return [
    { key: 'Ua', label: 'Ua (A相)', value: 220.0 },
    { key: 'Ub', label: 'Ub (B相)', value: 220.0 },
    { key: 'Uc', label: 'Uc (C相)', value: 220.0 }
  ]
  return [
    { key: 'Ua', label: 'Ua (A相)', value: t.Ua },
    { key: 'Ub', label: 'Ub (B相)', value: t.Ub },
    { key: 'Uc', label: 'Uc (C相)', value: t.Uc }
  ]
})

const powerMetrics = computed(() => {
  const t = selectedTerminalData.value
  const pa = t?.Pa || 11.2
  const pb = t?.Pb || 10.8
  const pc = t?.Pc || 11.5
  return [
    { key: 'Pa', phaseLabel: 'A相有功', value: pa, unit: 'kW', alarm: pa > 15 },
    { key: 'Pb', phaseLabel: 'B相有功', value: pb, unit: 'kW', alarm: pb > 15 },
    { key: 'Pc', phaseLabel: 'C相有功', value: pc, unit: 'kW', alarm: pc > 15 }
  ]
})

const currentMetrics = computed(() => {
  const t = selectedTerminalData.value
  return [
    { key: 'Ia', phaseLabel: 'A相', value: t?.Ia || 0 },
    { key: 'Ib', phaseLabel: 'B相', value: t?.Ib || 0 },
    { key: 'Ic', phaseLabel: 'C相', value: t?.Ic || 0 }
  ]
})

const reactiveMetrics = computed(() => {
  const t = selectedTerminalData.value
  return [
    { key: 'Qa', phaseLabel: 'A相', value: t?.Qa || 0 },
    { key: 'Qb', phaseLabel: 'B相', value: t?.Qb || 0 },
    { key: 'Qc', phaseLabel: 'C相', value: t?.Qc || 0 }
  ]
})

// 24h 峰谷
const peakPower = computed(() => Math.max(...history24h.value))
const valleyPower = computed(() => Math.min(...history24h.value))
const peakTime = computed(() => {
  const idx = history24h.value.indexOf(peakPower.value)
  return hours24[idx] + ':00'
})
const valleyTime = computed(() => {
  const idx = history24h.value.indexOf(valleyPower.value)
  return hours24[idx] + ':00'
})

// ========== 辅助方法 ==========
const statusText = (s) => ({ using: '通电中', alarm: '告警', offline: '断电', idle: '空闲' }[s] || s)
const voltageFmt = (v) => {
  if (v === null || v === undefined || v === 0) return '0.0'
  return Number(v).toFixed(1)
}
const voltageClass = (v) => {
  if (!v) return 'is-muted'
  if (v < 200 || v > 240) return 'is-danger'
  if (v < 210 || v > 230) return 'is-warn'
  return 'is-ok'
}
const phaseColor = (v) => {
  if (!v) return '#e5e7eb'
  if (v < 200 || v > 240) return '#ef4444'
  if (v < 210 || v > 230) return '#f59e0b'
  return '#10b981'
}
// 量程 0-300V 映射到 0-270°
const needleAngle = (v) => {
  if (!v) return -135
  const angle = (v / 300) * 270 - 135
  return Math.max(-135, Math.min(135, angle))
}
const phaseOffset = (v) => {
  if (!v) return 534
  const pct = Math.min(Math.max(v / 300, 0), 1)
  return 534 - pct * 534 * 0.75
}

const selectTerminal = (t) => {
  selectedTerminal.value = t
}
const selectFromTable = (t) => {
  selectedTerminal.value = t
}

const showBreakDialog = (t) => {
  breakTarget.value = t || selectedTerminalData.value
  breakProgress.value = 0
  breakLoading.value = false
  breakVisible.value = true
}

const confirmBreak = () => {
  breakLoading.value = true
  breakProgress.value = 0
  const steps = [
    { pct: 20, txt: '发送断电指令…' },
    { pct: 50, txt: '等待设备确认…' },
    { pct: 80, txt: '执行断电动作…' },
    { pct: 100, txt: '断电成功 ✓' }
  ]
  let i = 0
  const stepTimer = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(stepTimer)
      breakLoading.value = false
      breakVisible.value = false
      // 更新终端状态
      if (breakTarget.value) {
        const t = terminals.value.find(x => x.id === breakTarget.value.id)
        if (t) {
          t.status = 'offline'
          t.Ua = t.Ub = t.Uc = 0
          t.Ia = t.Ib = t.Ic = 0
          t.Pa = t.Pb = t.Pc = 0
          t.Qa = t.Qb = t.Qc = 0
          t.totalPower = 0
        }
        if (selectedTerminal.value && selectedTerminal.value.id === breakTarget.value.id) {
          selectedTerminal.value = null
        }
        // 新增告警流条目
        addAlertStream({
          level: 'warn',
          terminal: breakTarget.value.id,
          title: '运维手动断电',
          detail: '工单模拟远程断电操作'
        })
      }
      ElMessage.success(`终端 ${breakTarget.value?.id || ''} 已成功断电`)
      return
    }
    breakProgress.value = steps[i].pct
    breakProgressTxt.value = steps[i].txt
    i++
  }, 700)
}

const resetTerminal = (t) => {
  const target = terminals.value.find(x => x.id === t.id)
  if (target) {
    target.status = 'idle'
    target.Ua = 220.0
    target.Ub = 220.0
    target.Uc = 220.0
    ElMessage.success(`终端 ${t.id} 已复位`)
  }
}

const addAlertStream = (item) => {
  const d = new Date()
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  alertStream.value.unshift({ ...item, time })
  if (alertStream.value.length > 16) alertStream.value.pop()
}

const resetData = () => {
  terminals.value = JSON.parse(JSON.stringify(mockTerminals))
  ElMessage.success('数据已重置')
}

// ========== 三相数据跳动 ==========
let tickTimer = null
const startTick = () => {
  tickTimer = setInterval(() => {
    terminals.value.forEach(t => {
      if (t.status === 'using') {
        t.Ua = +(220 + (Math.random() * 10 - 5)).toFixed(1)
        t.Ub = +(220 + (Math.random() * 10 - 5)).toFixed(1)
        t.Uc = +(220 + (Math.random() * 10 - 5)).toFixed(1)
        t.Ia = +(10 + Math.random() * 5).toFixed(2)
        t.Ib = +(10 + Math.random() * 5).toFixed(2)
        t.Ic = +(10 + Math.random() * 5).toFixed(2)
        t.Pa = +(10 + Math.random() * 3).toFixed(2)
        t.Pb = +(10 + Math.random() * 3).toFixed(2)
        t.Pc = +(10 + Math.random() * 3).toFixed(2)
        t.Qa = +(1.5 + Math.random() * 1).toFixed(2)
        t.Qb = +(1.5 + Math.random() * 1).toFixed(2)
        t.Qc = +(1.5 + Math.random() * 1).toFixed(2)
        t.totalPower = +(t.Pa + t.Pb + t.Pc).toFixed(2)

        // 超阈值触发告警（5% 概率）
        if (Math.random() < 0.02) {
          t.Ua = +(245 + Math.random() * 10).toFixed(1)
          triggerVoltageAlert(t)
        }
      }
    })

    // 中央仪表：总有功 + 功率因数 + 频率
    totalPower.value = +usingTotalPower().toFixed(2)
    powerFactor.value = +(0.85 + Math.random() * 0.05).toFixed(2)
    frequency.value = +(50 + (Math.random() * 0.1 - 0.05)).toFixed(2)
  }, 1000)
}

const usingTotalPower = () => {
  return terminals.value
    .filter(t => t.status === 'using')
    .reduce((s, t) => s + (t.totalPower || 0), 0)
}

const triggerVoltageAlert = (t) => {
  t.status = 'alarm'
  todayAlerts.value += 1
  safetyTriggers.value += 1
  addAlertStream({
    level: 'high',
    terminal: t.id,
    title: '电压异常',
    detail: `Ua=${t.Ua}V，已标记告警状态`
  })
  ElMessage({
    message: `⚠️ 终端 ${t.id} 电压异常告警触发`,
    type: 'warning',
    duration: 3000
  })
}

const stopTick = () => {
  if (tickTimer) { clearInterval(tickTimer); tickTimer = null }
}

// 每秒更新头部时间
const updateTime = () => {
  const d = new Date()
  currentTime.value = d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  startTick()
  // 默认选中第一个 using 终端
  selectedTerminal.value = terminals.value.find(t => t.status === 'using') || terminals.value[0]
  totalPower.value = usingTotalPower()
})

onUnmounted(() => {
  stopTick()
  if (timeTimer) { clearInterval(timeTimer); timeTimer = null }
})
</script>

<style scoped lang="scss">
.zg-pm {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #f5f7fa;
  min-height: 100vh;
}

// ====== 头部 ======
.zg-pm__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.zg-pm__headline { display: flex; align-items: center; gap: 14px; }
.zg-pm__sigil {
  width: 44px; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.zg-pm__title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 3px; }
.zg-pm__sub { font-size: 12px; color: #6b7280; margin: 0; }
.zg-pm__head-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: #6b7280;
}
.zg-pm__divider { color: #d1d5db; }
.zg-pm__live-dot {
  display: inline-block;
  width: 8px; height: 8px; border-radius: 50%;
  background: #10b981;
  animation: zgPulse 1.5s infinite;
}
@keyframes zgPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

// ====== KPI ======
.zg-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.zg-kpis__cell {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 14px 18px;
  display: flex; align-items: center; gap: 12px;
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
}
.zg-kpis__icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  display: flex; align-items: center; justify-content: center;
}
.zg-kpis__cell--ok .zg-kpis__icon { background: #d1fae5; color: #059669; }
.zg-kpis__cell--danger .zg-kpis__icon { background: #fee2e2; color: #dc2626; }
.zg-kpis__cell--warn .zg-kpis__icon { background: #fef3c7; color: #d97706; }
.zg-kpis__cell--info .zg-kpis__icon { background: #dbeafe; color: #2563eb; }

.zg-kpis__num { font-size: 22px; font-weight: 700; color: #1f2937; }
.zg-kpis__lbl { font-size: 12px; color: #6b7280; }
.zg-kpis__body { display: flex; flex-direction: column; gap: 2px; }

// ====== 三栏主体 ======
.zg-pm__main {
  display: grid;
  grid-template-columns: 320px 1fr 380px;
  gap: 14px;
}

// ====== 通用面板 ======
.zg-pm__panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 14px 16px;
}
.zg-pm__panel + .zg-pm__panel { margin-top: 14px; }
.zg-pm__panel-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.zg-pm__panel-title {
  font-size: 14px; font-weight: 600; color: #1f2937;
  margin: 0; display: flex; align-items: center; gap: 6px;
}
.zg-pm__side--left { display: flex; flex-direction: column; gap: 14px; }
.zg-pm__side--right { display: flex; flex-direction: column; gap: 14px; }

// ====== 终端列表 ======
.zg-pm__terminal-list {
  display: flex; flex-direction: column; gap: 6px;
  max-height: 420px; overflow-y: auto;
}
.zg-pm__terminal-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: #f3f4f6; border-color: #d1d5db; }
  &.is-using { background: #ecfdf5; border-color: #a7f3d0; }
  &.is-alarm { background: #fef2f2; border-color: #fecaca; }
  &.is-offline { background: #f3f4f6; opacity: 0.7; }
}
.zg-pm__term-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #9ca3af; flex-shrink: 0;
  &[data-status='using'] { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.5); }
  &[data-status='alarm'] { background: #ef4444; animation: zgPulse 1s infinite; }
  &[data-status='offline'] { background: #9ca3af; }
}
.zg-pm__term-info { flex: 1; min-width: 0; }
.zg-pm__term-id { font-size: 13px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.zg-pm__term-geo { font-size: 11px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.zg-pm__term-power { font-size: 13px; font-weight: 700; color: #059669; font-family: 'JetBrains Mono', monospace; }
.zg-pm__term-tag { flex-shrink: 0; }

.zg-pm__pager {
  margin-top: 12px;
  display: flex; justify-content: center;
}

// ====== 详情卡 ======
.zg-pm__detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}
.zg-pm__detail-cell {
  background: #f9fafb; padding: 8px 10px; border-radius: 6px;
  display: flex; justify-content: space-between; align-items: center;
}
.zg-pm__detail-cell .lbl { font-size: 11px; color: #6b7280; }
.zg-pm__detail-cell .val { font-size: 13px; font-weight: 600; color: #1f2937;
  &.is-ok { color: #059669; }
  &.is-warn { color: #d97706; }
  &.is-danger { color: #dc2626; }
  &.is-muted { color: #9ca3af; }
}

// ====== 中央仪表 ======
.zg-pm__gauges {
  display: flex; justify-content: space-around; gap: 10px;
  margin: 10px 0;
}
.zg-pm__gauge {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px 10px;
}
.zg-pm__gauge-svg {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05))
}
.zg-pm__gauge-progress {
  transition: stroke-dashoffset 0.8s ease, stroke 0.4s;
}
.zg-pm__gauge-label {
  font-size: 12px; color: #6b7280; font-weight: 500;
}
.zg-pm__gauge-value {
  font-size: 28px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
  color: #059669;
  &.is-danger { color: #dc2626; }
  &.is-warn { color: #d97706; }
  &.is-muted { color: #9ca3af; }
}
.zg-pm__gauge-unit { font-size: 13px; color: #6b7280; margin-left: 2px; }

// 大字跳动
.zg-pm__big-numbers {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.zg-pm__big-card {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-radius: 12px;
  padding: 16px 18px;
  border: 1px solid #a7f3d0;
  display: flex; align-items: baseline; gap: 8px;
  &.zg-pm__big-card--pf { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-color: #bfdbfe; }
  &.zg-pm__big-card--hz { background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-color: #e9d5ff; }
  .lbl { font-size: 12px; color: #6b7280; }
  .num { font-size: 32px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #1f2937; }
  .unit { font-size: 13px; color: #6b7280; }
}

// 三相分量表
.zg-pm__phase-metrics {
  display: flex; flex-direction: column; gap: 8px;
}
.zg-pm__metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.zg-pm__metric-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px 14px;
  text-align: center;
  position: relative;
}
.zg-pm__metric-phase { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
.zg-pm__metric-value {
  font-size: 20px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #1f2937;
  &.is-ok { color: #059669; }
  &.is-danger { color: #dc2626; }
}
.zg-pm__metric-card--mini .zg-pm__metric-value { font-size: 16px; }
.zg-pm__metric-unit { font-size: 11px; color: #6b7280; }

// 24h 图表
.zg-pm__chart-wrap {
  background: #f9fafb;
  border-radius: 10px;
  padding: 14px;
}
.zg-pm__bars {
  height: 120px;
  display: flex; align-items: flex-end; gap: 3px;
}
.zg-pm__bar {
  flex: 1;
  background: linear-gradient(to top, #0ea5e9, #6366f1);
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.5s;
}
.zg-pm__bar-labels {
  display: flex; justify-content: space-between;
  margin-top: 6px;
  span { font-size: 10px; color: #9ca3af; }
}
.zg-pm__peak-info {
  font-size: 12px; color: #6b7280;
  .peak b { color: #ef4444; }
  .valley b { color: #059669; }
  display: flex; gap: 12px;
}

// ====== 实时告警流 ======
.zg-pm__stream-container {
  height: 320px;
  overflow: hidden;
  position: relative;
}
.zg-pm__stream-track {
  animation: zgStreamScroll 30s linear infinite;
}
@keyframes zgStreamScroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
.zg-pm__stream-item {
  padding: 10px 12px;
  display: flex; gap: 10px;
  border-bottom: 1px dashed #e5e7eb;
}
.zg-pm__stream-dot {
  width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0;
  &[data-level='high'] { background: #ef4444; animation: zgPulse 1s infinite; }
  &[data-level='warn'] { background: #f59e0b; }
}
.zg-pm__stream-body { flex: 1; min-width: 0; }
.zg-pm__stream-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
.zg-pm__stream-time { font-size: 11px; color: #9ca3af; font-family: monospace; }
.zg-pm__stream-title { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
.zg-pm__stream-detail { font-size: 12px; color: #6b7280; }
.zg-pm__stream-count { font-size: 12px; color: #6b7280; }

// ====== 五重安全 ======
.zg-pm__safety-grid {
  display: flex; flex-direction: column; gap: 10px;
}
.zg-pm__safety-card {
  display: flex; gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s;
  &.is-triggered {
    border-color: #ef4444;
    background: #fef2f2;
    animation: zgTriggerPulse 1.5s infinite;
  }
  &.is-close { border-color: #f59e0b; background: #fffbeb; }
}
@keyframes zgTriggerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
  50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
}
.zg-pm__safety-gauge {
  position: relative;
  flex-shrink: 0;
}
.zg-pm__safety-pct {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px; font-weight: 700; color: #1f2937;
}
.zg-pm__safety-info { flex: 1; min-width: 0; }
.zg-pm__safety-name { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
.zg-pm__safety-val { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
.zg-pm__safety-sep { color: #d1d5db; margin: 0 3px; }
.zg-pm__safety-status {
  font-size: 12px; font-weight: 600;
  &.is-ok { color: #059669; }
  &.is-warn { color: #d97706; }
  &.is-danger { color: #dc2626; }
}

// 时间线
.zg-pm__timeline {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}
.zg-pm__timeline-title {
  font-size: 13px; font-weight: 600; color: #1f2937;
  margin-bottom: 10px;
}
.zg-pm__timeline-item {
  display: flex; gap: 10px;
  padding: 8px 0;
  position: relative;
}
.zg-pm__timeline-dot {
  width: 10px; height: 10px; border-radius: 50%; margin-top: 4px;
  flex-shrink: 0; position: relative;
  &[data-level='high'] { background: #ef4444; }
  &[data-level='warn'] { background: #f59e0b; }
  &[data-level='ok'] { background: #10b981; }
}
.zg-pm__timeline-body { flex: 1; min-width: 0; }
.zg-pm__timeline-head { display: flex; justify-content: space-between; margin-bottom: 2px; }
.zg-pm__timeline-name { font-size: 12px; font-weight: 600; color: #1f2937; }
.zg-pm__timeline-time { font-size: 11px; color: #9ca3af; font-family: monospace; }
.zg-pm__timeline-detail { font-size: 11px; color: #6b7280; line-height: 1.4; }

// ====== 底部表格 ======
.zg-pm__table-panel {
  padding: 16px;
}
.zg-pm__table-tools { display: flex; gap: 8px; }
.zg-pm__live-marker {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; color: #059669; font-weight: 700; letter-spacing: 1px;
  margin-left: 10px;
  background: #d1fae5; padding: 2px 6px; border-radius: 4px;
}
.zg-pm__table {
  :deep(.el-table__body tr.is-using-row) {
    background: #ecfdf5 !important;
  }
}
.zg-pm__cell-id { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #1f2937; }
.zg-pm__cell-geo { font-size: 11px; color: #6b7280; margin-top: 2px; }
.zg-pm__td-val {
  font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500;
  color: #1f2937;
  &.is-ok { color: #059669; }
  &.is-warn { color: #d97706; }
  &.is-danger { color: #dc2626; }
  &.is-muted { color: #9ca3af; }
  &.is-bold { font-weight: 700; }
}
.zg-pm__table-pager {
  display: flex; justify-content: flex-end;
  margin-top: 12px;
}

// el-pulse
:deep(.el-tag.is-pulse) {
  animation: zgElPulse 1.2s infinite;
}
@keyframes zgElPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
  50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
}

// ====== 断电 Dialog ======
.zg-pm__break-wrap { text-align: center; padding: 10px 0; }
.zg-pm__break-icon { margin-bottom: 12px; }
.zg-pm__break-tip { font-size: 14px; color: #374151; margin-bottom: 12px; line-height: 1.6;
  strong.is-danger { color: #ef4444; }
}
.zg-pm__break-consequences {
  text-align: left;
  font-size: 12px; color: #6b7280;
  padding-left: 20px; margin-bottom: 16px; line-height: 1.8;
}
.zg-pm__break-progress {
  background: #f3f4f6; border-radius: 6px;
  height: 28px; padding: 4px;
  position: relative; overflow: hidden;
}
.zg-pm__break-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  border-radius: 4px;
  transition: width 0.4s;
}
.zg-pm__break-progress span {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px; font-weight: 600; color: #1f2937;
}

// 响应式：窄屏降级
@media (max-width: 1440px) {
  .zg-pm__main {
    grid-template-columns: 280px 1fr 340px;
  }
  .zg-kpis { grid-template-columns: repeat(5, 1fr); }
}
@media (max-width: 1200px) {
  .zg-pm__main {
    grid-template-columns: 1fr;
  }
  .zg-kpis { grid-template-columns: repeat(3, 1fr); }
}</style>
