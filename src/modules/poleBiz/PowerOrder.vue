<!--
  智光云枢 · 杆桩运营 · 扫码共享用电 · 订单中心
  业务域：poleBiz
  功能：申请 → 支付 → 监控 → 结束 → 结算 → 电子小票 全生命周期
-->
<template>
  <section class="zg-po">
    <!-- 页面头部 -->
    <header class="zg-po__head">
      <div class="zg-po__headline">
        <div class="zg-po__sigil">
          <el-icon :size="22"><Coin /></el-icon>
        </div>
        <div class="zg-po__copy">
          <h1 class="zg-po__title">扫码共享用电 · 订单中心</h1>
          <p class="zg-po__sub">
            申请 → 支付 → 合闸 → 监控 → 断电 → 结算 → 电子小票 全流程在线化 · 共 {{ allOrders.length }} 笔订单
          </p>
        </div>
      </div>
      <div class="zg-po__cta">
        <el-button type="primary" @click="openApplyDrawer">
          <el-icon><Plus /></el-icon>
          <span>申请新订单</span>
        </el-button>
        <el-button @click="simulateScan">
          <el-icon><Grid /></el-icon>
          <span>扫码模拟</span>
        </el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-po__kpis">
      <div class="zg-po__kpi zg-po__kpi--using">
        <div class="zg-po__kpi-ico"><el-icon :size="20"><DataLine /></el-icon></div>
        <div class="zg-po__kpi-body">
          <div class="zg-po__kpi-num">{{ kpi.using }}</div>
          <div class="zg-po__kpi-lbl">用电中订单</div>
        </div>
      </div>
      <div class="zg-po__kpi zg-po__kpi--income">
        <div class="zg-po__kpi-ico"><el-icon :size="20"><Coin /></el-icon></div>
        <div class="zg-po__kpi-body">
          <div class="zg-po__kpi-num">¥{{ kpi.todayIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</div>
          <div class="zg-po__kpi-lbl">今日收入</div>
        </div>
      </div>
      <div class="zg-po__kpi zg-po__kpi--month">
        <div class="zg-po__kpi-ico"><el-icon :size="20"><Timer /></el-icon></div>
        <div class="zg-po__kpi-body">
          <div class="zg-po__kpi-num">{{ kpi.monthOrders }}</div>
          <div class="zg-po__kpi-lbl">本月订单</div>
        </div>
      </div>
      <div class="zg-po__kpi zg-po__kpi--settle">
        <div class="zg-po__kpi-ico"><el-icon :size="20"><Warning /></el-icon></div>
        <div class="zg-po__kpi-body">
          <div class="zg-po__kpi-num">{{ kpi.pendingSettle }}</div>
          <div class="zg-po__kpi-lbl">待结算</div>
        </div>
      </div>
    </div>

    <!-- Tab 筛选 -->
    <div class="zg-po__tabs">
      <div class="zg-po__tabs-inner">
        <div
          v-for="t in tabs"
          :key="t.value"
          class="zg-po__tab"
          :class="{ 'is-active': activeTab === t.value }"
          @click="activeTab = t.value"
        >
          <span class="zg-po__tab-lbl">{{ t.label }}</span>
          <span class="zg-po__tab-badge" v-if="t.count">{{ t.count }}</span>
        </div>
      </div>
      <div class="zg-po__tabs-ops">
        <el-input
          v-model="keyword"
          placeholder="搜索订单号 / 终端 / 企业"
          :prefix-icon="Search"
          clearable
          size="default"
          style="width: 240px"
        />
        <el-select v-model="filterInvoice" placeholder="开票状态" size="default" style="width: 130px">
          <el-option label="全部" value="" />
          <el-option label="已开票" value="Y" />
          <el-option label="未开票" value="N" />
        </el-select>
        <el-button :icon="Refresh" size="default" @click="refreshAll">刷新</el-button>
      </div>
    </div>

    <!-- 订单卡片列表 -->
    <div class="zg-po__grid">
      <div
        v-for="order in pagedOrders"
        :key="order.id"
        class="zg-po__card"
        :class="cardClass(order)"
      >
        <div class="zg-po__card-head">
          <div class="zg-po__card-title">
            <span class="zg-po__card-dot"></span>
            <span class="zg-po__card-status">{{ statusLabel(order.status) }}</span>
            <span class="zg-po__card-tag">{{ order.customerType === 'ENTERPRISE' ? '企业' : '个人' }}</span>
            <span class="zg-po__card-no">{{ order.orderNo }}</span>
          </div>
          <el-tag v-if="order.invoiced" type="primary" effect="light" size="small">已开票</el-tag>
        </div>
        <div class="zg-po__card-body">
          <div class="zg-po__card-row">
            <span class="zg-po__card-ico">📍</span>
            <span class="zg-po__card-val">{{ order.terminalName }} #{{ order.terminalNo }}</span>
            <span class="zg-po__card-sub">{{ order.spec }}</span>
          </div>
          <div class="zg-po__card-row">
            <span class="zg-po__card-ico">👤</span>
            <span class="zg-po__card-val">{{ order.operator }}（{{ order.customerName }}）</span>
          </div>
          <div class="zg-po__card-row" v-if="order.status === 'USING'">
            <span class="zg-po__card-ico">⚡</span>
            <span class="zg-po__card-val">实时 {{ order.livePower.toFixed(1) }}kW / Ua={{ order.liveVoltage.toFixed(0) }}V</span>
          </div>
          <div class="zg-po__card-row">
            <span class="zg-po__card-ico">⏱️</span>
            <span class="zg-po__card-val">已用 {{ order.liveDuration }}</span>
            <span class="zg-po__card-sub">₵{{ order.startTime }}</span>
          </div>
          <div class="zg-po__card-row">
            <span class="zg-po__card-ico">💰</span>
            <span class="zg-po__card-val">已消费 ¥{{ order.liveConsumed.toFixed(2) }}</span>
            <span class="zg-po__card-sub" v-if="order.status === 'USING'">剩余 ¥{{ order.balance.toFixed(2) }}</span>
          </div>
          <div class="zg-po__card-row" v-if="order.status === 'ABNORMAL'">
            <span class="zg-po__card-ico">⚠️</span>
            <span class="zg-po__card-val zg-po__abnormal-text">{{ order.abnormalReason }}</span>
          </div>
        </div>
        <div class="zg-po__card-foot">
          <template v-if="order.status === 'USING'">
            <el-button type="danger" size="small" @click="confirmEnd(order)">结束用电</el-button>
            <el-button type="primary" size="small" plain @click="openMonitor(order)">查看详情</el-button>
            <el-button size="small" @click="remotePowerOff(order)">远程断电</el-button>
          </template>
          <template v-else-if="order.status === 'PENDING_SETTLE'">
            <el-button type="warning" size="small" @click="quickSettle(order)">一键结算</el-button>
            <el-button type="primary" size="small" plain @click="openMonitor(order)">查看详情</el-button>
          </template>
          <template v-else-if="order.status === 'DONE'">
            <el-button type="success" size="small" @click="openReceipt(order)">电子小票</el-button>
            <el-button size="small" @click="openMonitor(order)">查看详情</el-button>
          </template>
          <template v-else-if="order.status === 'ABNORMAL'">
            <el-button type="danger" size="small" @click="markHandled(order)">标记已处理</el-button>
            <el-button size="small" @click="createTicket(order)">生成工单</el-button>
            <el-button size="small" @click="remoteReset(order)">远程复位</el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 空态 -->
    <el-empty v-if="pagedOrders.length === 0" description="暂无订单" />

    <!-- 分页 -->
    <div class="zg-po__pager" v-if="filteredOrders.length > 0">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredOrders.length"
        background
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 申请新订单 Drawer -->
    <el-drawer
      v-model="applyVisible"
      title="申请新订单"
      size="520px"
      :with-header="true"
      class="zg-po__drawer"
    >
      <template #header>
        <div class="zg-po__drawer-title">
          <el-icon :size="20"><Plus /></el-icon>
          <span>申请新订单</span>
        </div>
      </template>

      <el-steps :active="applyStep" simple class="zg-po__steps">
        <el-step title="选终端" />
        <el-step title="计费" />
        <el-step title="用户" />
        <el-step title="支付" />
        <el-step title="合闸" />
      </el-steps>

      <!-- Step 1 -->
      <div v-show="applyStep === 0" class="zg-po__step">
        <el-input v-model="apply.termQuery" placeholder="搜索终端位置 / 编号" :prefix-icon="Search" clearable />
        <el-form label-position="top">
          <el-form-item label="所在区域">
            <el-select v-model="apply.termDistrict" placeholder="选择区域" style="width: 100%">
              <el-option label="先导路片区" value="先导路" />
              <el-option label="鹤山共和镇" value="鹤山" />
              <el-option label="开平市" value="开平" />
            </el-select>
          </el-form-item>
          <el-form-item label="选择终端">
            <el-select v-model="apply.terminalId" placeholder="请选择终端" style="width: 100%" filterable>
              <el-option
                v-for="t in filteredTerminals"
                :key="t.id"
                :label="`${t.name} #${t.no} · ${t.spec}`"
                :value="t.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2 -->
      <div v-show="applyStep === 1" class="zg-po__step">
        <div class="zg-po__billing-group">
          <div
            v-for="b in billingOptions"
            :key="b.value"
            class="zg-po__billing-option"
            :class="{ 'is-active': apply.billingMode === b.value }"
            @click="apply.billingMode = b.value"
          >
            <div class="zg-po__billing-card">
              <div class="zg-po__billing-ico">{{ b.icon }}</div>
              <div class="zg-po__billing-lbl">{{ b.label }}</div>
              <div class="zg-po__billing-desc">{{ b.desc }}</div>
            </div>
            <div class="zg-po__billing-check">
              <el-icon v-if="apply.billingMode === b.value" :size="16"><Check /></el-icon>
            </div>
          </div>
        </div>

        <div v-if="apply.billingMode === 'AMOUNT'" class="zg-po__billing-opts">
          <el-radio-group v-model="apply.prepayAmount">
            <el-radio-button :value="20">¥20</el-radio-button>
            <el-radio-button :value="50">¥50</el-radio-button>
            <el-radio-button :value="100">¥100</el-radio-button>
            <el-radio-button :value="500">¥500</el-radio-button>
          </el-radio-group>
          <el-input-number v-model="apply.prepayCustom" :min="1" :step="10" placeholder="自定义金额" style="margin-top: 12px" />
        </div>
        <div v-else-if="apply.billingMode === 'DURATION'" class="zg-po__billing-opts">
          <el-radio-group v-model="apply.durationHours">
            <el-radio-button :value="1">1 小时</el-radio-button>
            <el-radio-button :value="3">3 小时</el-radio-button>
            <el-radio-button :value="6">6 小时</el-radio-button>
            <el-radio-button :value="12">12 小时</el-radio-button>
            <el-radio-button :value="24">24 小时</el-radio-button>
          </el-radio-group>
        </div>
        <div v-else class="zg-po__billing-opts">
          <el-alert title="企业包月套餐" type="info" show-icon :closable="false">
            <p>• 月费：<strong>¥3,800</strong></p>
            <p>• 额定功率：<strong>100kW / 380V 三相</strong></p>
            <p>• 超出部分按 <strong>¥0.65/kWh</strong> 补收</p>
          </el-alert>
        </div>
      </div>

      <!-- Step 3 -->
      <div v-show="applyStep === 2" class="zg-po__step">
        <el-form label-position="top">
          <el-radio-group v-model="apply.customerType">
            <el-radio label="ENTERPRISE">企业</el-radio>
            <el-radio label="PERSONAL">个人</el-radio>
          </el-radio-group>
          <el-form-item v-if="apply.customerType === 'ENTERPRISE'" label="企业名称">
            <el-input v-model="apply.entName" placeholder="请输入企业全称" />
          </el-form-item>
          <el-form-item v-if="apply.customerType === 'ENTERPRISE'" label="统一社会信用代码（税号）">
            <el-input v-model="apply.entTaxNo" placeholder="18 位" />
          </el-form-item>
          <el-form-item v-if="apply.customerType === 'PERSONAL'" label="姓名">
            <el-input v-model="apply.perName" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item v-if="apply.customerType === 'PERSONAL'" label="手机号">
            <el-input v-model="apply.perPhone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="经办人">
            <el-input v-model="apply.operator" placeholder="请输入经办人姓名" />
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 4 -->
      <div v-show="applyStep === 3" class="zg-po__step">
        <h4 class="zg-po__confirm-title">订单确认</h4>
        <div class="zg-po__confirm-row"><span>终端：</span><b>{{ selectedTerminal?.name }} #{{ selectedTerminal?.no }}</b></div>
        <div class="zg-po__confirm-row"><span>计费模式：</span><b>{{ billingLabel }}</b></div>
        <div class="zg-po__confirm-row"><span>用户：</span><b>{{ apply.customerType === 'ENTERPRISE' ? apply.entName : apply.perName }}</b></div>
        <div class="zg-po__confirm-row"><span>应付金额：</span><b class="zg-po__confirm-amount">¥{{ applyAmount.toFixed(2) }}</b></div>

        <el-alert type="warning" show-icon :closable="false" title="五重安全提示" style="margin-top: 18px">
          <p>① 本终端已接入剩余电流 + 过流 + 过压 + 超温 + 短路保护</p>
          <p>② 合闸前将检测 3 次，异常自动拒合</p>
          <p>③ 剩余金额 / 时长耗尽自动断电结算</p>
          <p>④ 支持一键远程断电</p>
          <p>⑤ 电子小票可下载 PDF + 支持增值税专票</p>
        </el-alert>

        <el-button type="primary" size="large" style="width: 100%; margin-top: 18px" @click="doPay">
          立即支付 ¥{{ applyAmount.toFixed(2) }}
        </el-button>
      </div>

      <!-- Step 5 -->
      <div v-show="applyStep === 4" class="zg-po__step zg-po__closing">
        <div class="zg-po__bolt">⚡</div>
        <h3 class="zg-po__closing-title">合闸中... {{ closingProgress }}%</h3>
        <el-progress :percentage="closingProgress" :stroke-width="14" status="success" />
        <p class="zg-po__closing-tip">系统正在执行合闸前安全检测（3/3）· 即将通电</p>
      </div>

      <template #footer>
        <el-button v-if="applyStep > 0 && applyStep < 4" @click="applyStep--">上一步</el-button>
        <el-button
          v-if="applyStep < 3"
          type="primary"
          @click="applyStep++"
          :disabled="!canNext"
        >下一步</el-button>
        <el-button v-if="applyStep === 3" @click="applyStep--">返回修改</el-button>
      </template>
    </el-drawer>

    <!-- 实时监控 Drawer -->
    <el-drawer
      v-model="monitorVisible"
      size="560px"
      title="实时监控"
      class="zg-po__drawer"
    >
      <template v-if="monitorOrder">
        <!-- 大数字跳动 -->
        <div class="zg-po__monitor-grid">
          <div class="zg-po__monitor-cell">
            <div class="zg-po__monitor-num zg-po__monitor-num--power">{{ monitorOrder.livePower.toFixed(1) }}</div>
            <div class="zg-po__monitor-unit">kW</div>
            <div class="zg-po__monitor-lbl">实时功率</div>
          </div>
          <div class="zg-po__monitor-cell">
            <div class="zg-po__monitor-num">{{ monitorOrder.liveVoltage.toFixed(0) }}</div>
            <div class="zg-po__monitor-unit">V</div>
            <div class="zg-po__monitor-lbl">当前电压</div>
          </div>
          <div class="zg-po__monitor-cell">
            <div class="zg-po__monitor-num zg-po__monitor-num--timer">{{ monitorOrder.liveDuration }}</div>
            <div class="zg-po__monitor-lbl">已用时间</div>
          </div>
          <div class="zg-po__monitor-cell">
            <div class="zg-po__monitor-num zg-po__monitor-num--money">¥{{ monitorOrder.liveConsumed.toFixed(2) }}</div>
            <div class="zg-po__monitor-lbl">已消费金额</div>
          </div>
        </div>

        <!-- 三相仪表盘 -->
        <div class="zg-po__section-title">三相电压监测</div>
        <div class="zg-po__three-phase">
          <div v-for="p in threePhases" :key="p.key" class="zg-po__phase">
            <svg viewBox="0 0 40 40" class="zg-po__phase-svg">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#eef2f7" stroke-width="4" />
              <circle
                cx="20" cy="20" r="16" fill="none"
                :stroke="p.color" stroke-width="4" stroke-linecap="round"
                stroke-dasharray="100.53"
                :stroke-dashoffset="100.53 - (p.value / 260 * 100.53)"
                transform="rotate(-90 20 20)"
                class="zg-po__phase-ring"
              />
            </svg>
            <div class="zg-po__phase-key" :style="{ color: p.color }">{{ p.key }}</div>
            <div class="zg-po__phase-val">{{ p.value.toFixed(0) }}V</div>
          </div>
        </div>

        <!-- 今日用电曲线 -->
        <div class="zg-po__section-title">今日用电曲线（24h）</div>
        <div class="zg-po__bar-chart">
          <div
            v-for="(h, i) in chart24"
            :key="i"
            class="zg-po__bar"
            :class="{ 'is-live': i === nowHour }"
            :style="{ height: h + '%' }"
          >
            <span class="zg-po__bar-tip">{{ h }}%</span>
          </div>
        </div>
        <div class="zg-po__bar-labels">
          <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
        </div>

        <!-- 五重安全 -->
        <div class="zg-po__section-title">安全监测</div>
        <div class="zg-po__safety">
          <div v-for="s in safetyIndicators" :key="s.key" class="zg-po__safety-cell">
            <div class="zg-po__safety-dot" :class="'is-' + s.level"></div>
            <div class="zg-po__safety-lbl">{{ s.label }}</div>
            <div class="zg-po__safety-val" :class="'is-' + s.level">{{ s.value }}</div>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- 电子小票 Dialog -->
    <el-dialog
      v-model="receiptVisible"
      width="540px"
      title="电子小票"
      class="zg-po__dialog"
    >
      <div v-if="receiptOrder" class="zg-po__receipt">
        <div class="zg-po__receipt-head">
          <div class="zg-po__receipt-title">智光云枢 · 共享用电电子小票</div>
          <div class="zg-po__receipt-no">订单号：{{ receiptOrder.orderNo }}</div>
        </div>

        <div class="zg-po__receipt-section">
          <div class="zg-po__receipt-row"><span>企业抬头</span><b>{{ receiptOrder.customerName }}</b></div>
          <div class="zg-po__receipt-row"><span>税　　号</span><b>{{ receiptOrder.taxNo || '个人用户不适用' }}</b></div>
          <div class="zg-po__receipt-row"><span>终端位置</span><b>{{ receiptOrder.terminalName }} #{{ receiptOrder.terminalNo }}</b></div>
          <div class="zg-po__receipt-row"><span>额定功率</span><b>{{ receiptOrder.spec }}</b></div>
        </div>

        <div class="zg-po__receipt-section">
          <div class="zg-po__receipt-row"><span>起止时间</span><b>{{ receiptOrder.startTime }} ~ {{ receiptOrder.endTime }}</b></div>
          <div class="zg-po__receipt-row"><span>用电时长</span><b>{{ receiptOrder.durationText }}</b></div>
          <div class="zg-po__receipt-row"><span>用电量</span><b>{{ receiptOrder.totalKwh.toFixed(1) }} kWh</b></div>
        </div>

        <div class="zg-po__receipt-section">
          <div class="zg-po__receipt-row zg-po__receipt-row--sub">
            <span>峰时用电</span>
            <span>{{ receiptOrder.peakKwh.toFixed(1) }}kWh × ¥0.98 = <b>¥{{ receiptOrder.peakFee.toFixed(2) }}</b></span>
          </div>
          <div class="zg-po__receipt-row zg-po__receipt-row--sub">
            <span>平时用电</span>
            <span>{{ receiptOrder.flatKwh.toFixed(1) }}kWh × ¥0.65 = <b>¥{{ receiptOrder.flatFee.toFixed(2) }}</b></span>
          </div>
          <div class="zg-po__receipt-row zg-po__receipt-row--sub">
            <span>谷时用电</span>
            <span>{{ receiptOrder.valleyKwh.toFixed(1) }}kWh × ¥0.46 = <b>¥{{ receiptOrder.valleyFee.toFixed(2) }}</b></span>
          </div>
        </div>

        <div class="zg-po__receipt-total">
          <div class="zg-po__receipt-row"><span>总费用</span><b>¥{{ receiptOrder.totalFee.toFixed(2) }}</b></div>
          <div class="zg-po__receipt-row"><span>支付方式</span><b>{{ paymentLabel(receiptOrder.billingMode) }}</b></div>
          <div class="zg-po__receipt-row">
            <span>开票状态</span>
            <b :style="{ color: receiptOrder.invoiced ? '#16a34a' : '#f59e0b' }">
              {{ receiptOrder.invoiced ? '✅ 已开（增值税专票）' : '⏳ 待开票' }}
            </b>
          </div>
        </div>

        <div class="zg-po__receipt-foot">
          <p>感谢使用智光云枢共享用电服务</p>
          <p class="zg-po__receipt-sign">—— 智光云枢电力运营平台 ——</p>
        </div>
      </div>

      <template #footer>
        <el-button :icon="Download" @click="downloadReceipt">下载PDF</el-button>
        <el-button :icon="CopyDocument" @click="copyOrderNo">复制订单号</el-button>
        <el-button type="primary" @click="receiptVisible = false">返回列表</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Grid, Coin, Warning, View, Bell, Refresh, Close, Check,
  Download, Printer, Search, Filter, Timer, DataLine, Plus, CopyDocument
} from '@element-plus/icons-vue'

/* ---------- Mock 数据 ---------- */
const terminalPool = [
  { id: 'T001', name: '先导路工地', no: '23', spec: '100kW · 380V 三相', district: '先导路' },
  { id: 'T002', name: '鹤山共和镇工业园', no: '08', spec: '80kW · 380V 三相', district: '鹤山' },
  { id: 'T003', name: '开平市港口物流', no: '15', spec: '120kW · 380V 三相', district: '开平' },
  { id: 'T004', name: '先导路物流园', no: '12', spec: '60kW · 220V 单相', district: '先导路' },
  { id: 'T005', name: '鹤山碧桂园工地', no: '31', spec: '100kW · 380V 三相', district: '鹤山' },
  { id: 'T006', name: '开平市赤坎镇', no: '05', spec: '40kW · 220V 单相', district: '开平' }
]

const enterprisePool = [
  { name: '湖南建工集团有限公司', taxNo: '91430100MA4Q7XXXXXX' },
  { name: '广东省电力建设有限公司', taxNo: '91440000MA5XXXXXXX' },
  { name: '江门市蓬江区市政工程公司', taxNo: '91440703MA4XXXXXXX' },
  { name: '五矿二十三冶建设集团', taxNo: '91430100717XXXXXXX' },
  { name: '中建四局第六建设有限公司', taxNo: '91440101MA9XXXXXXX' }
]

const operatorPool = ['张工', '李师傅', '王经理', '赵工', '陈老板', '刘工']
const abnormalReasons = ['安全触发：剩余电流超标 30mA', '欠费：预存金额已耗尽', '设备离线：心跳超过 5 分钟', '用户投诉：供电电压不稳', '过温：模块温度 82℃']

const now = new Date()
function pad(n) { return n < 10 ? '0' + n : '' + n }
function fmtDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}` }
function orderNo() {
  const t = Date.now()
  const r = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return 'ZG' + t.toString().slice(-10) + r.slice(-4)
}
function rand(min, max) { return Math.random() * (max - min) + min }

function generateOrders() {
  const arr = []
  // 用电中 8 条
  for (let i = 0; i < 8; i++) arr.push(makeOrder('USING'))
  // 待结算 5 条
  for (let i = 0; i < 5; i++) arr.push(makeOrder('PENDING_SETTLE'))
  // 已完成 30 条（已开票 22，未开票 8）
  for (let i = 0; i < 22; i++) arr.push(makeOrder('DONE', true))
  for (let i = 0; i < 8; i++) arr.push(makeOrder('DONE', false))
  // 异常 5 条
  for (let i = 0; i < 5; i++) arr.push(makeOrder('ABNORMAL'))
  return arr
}

function makeOrder(status, invoiced = false) {
  const t = terminalPool[Math.floor(Math.random() * terminalPool.length)]
  const ent = enterprisePool[Math.floor(Math.random() * enterprisePool.length)]
  const isEnt = Math.random() > 0.25
  const startOffsetMin = Math.floor(rand(1, 600))
  const start = new Date(now.getTime() - startOffsetMin * 60 * 1000)
  const durationSec = Math.floor(rand(600, 7200))
  const end = status === 'USING' ? null : new Date(start.getTime() + durationSec * 1000)

  const livePower = status === 'USING' ? rand(25, 95) : 0
  const liveVoltage = rand(215, 235)
  const liveConsumed = status === 'USING' ? rand(20, 300) : rand(30, 500)
  const totalKwh = liveConsumed / 0.65

  // 分峰平谷
  const peakKwh = totalKwh * rand(0.3, 0.6)
  const flatKwh = totalKwh * rand(0.3, 0.6)
  const valleyKwh = Math.max(0, totalKwh - peakKwh - flatKwh)
  const peakFee = peakKwh * 0.98
  const flatFee = flatKwh * 0.65
  const valleyFee = valleyKwh * 0.46
  const totalFee = peakFee + flatFee + valleyFee

  return {
    id: 'O' + Math.random().toString(36).slice(2, 8),
    orderNo: orderNo(),
    status,
    customerType: isEnt ? 'ENTERPRISE' : 'PERSONAL',
    customerName: isEnt ? ent.name : operatorPool[Math.floor(Math.random() * operatorPool.length)],
    taxNo: isEnt ? ent.taxNo : '',
    operator: operatorPool[Math.floor(Math.random() * operatorPool.length)],
    terminalId: t.id,
    terminalName: t.name,
    terminalNo: t.no,
    spec: t.spec,
    district: t.district,
    startTime: fmtDate(start),
    endTime: end ? fmtDate(end) : '',
    liveDuration: status === 'USING' ? fmtDuration(startOffsetMin * 60) : fmtDuration(durationSec),
    livePower,
    liveVoltage,
    liveConsumed: status === 'USING' ? liveConsumed : totalFee,
    balance: rand(50, 800),
    totalKwh,
    peakKwh, flatKwh, valleyKwh,
    peakFee, flatFee, valleyFee,
    totalFee,
    billingMode: ['AMOUNT', 'DURATION', 'MONTHLY'][Math.floor(Math.random() * 3)],
    invoiced,
    abnormalReason: status === 'ABNORMAL' ? abnormalReasons[Math.floor(Math.random() * abnormalReasons.length)] : '',
    durationText: fmtDurationText(status === 'USING' ? startOffsetMin * 60 : durationSec),
    startTimeObj: start
  }
}

function fmtDuration(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
function fmtDurationText(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${h} 小时 ${m} 分`
}

/* ---------- 状态 ---------- */
const allOrders = ref(generateOrders())

const tabs = computed(() => [
  { label: '全部订单', value: 'ALL', count: allOrders.value.length },
  { label: '用电中', value: 'USING', count: allOrders.value.filter(o => o.status === 'USING').length },
  { label: '待结算', value: 'PENDING_SETTLE', count: allOrders.value.filter(o => o.status === 'PENDING_SETTLE').length },
  { label: '已完成', value: 'DONE', count: allOrders.value.filter(o => o.status === 'DONE').length },
  { label: '异常', value: 'ABNORMAL', count: allOrders.value.filter(o => o.status === 'ABNORMAL').length }
])
const activeTab = ref('ALL')
const keyword = ref('')
const filterInvoice = ref('')
const page = ref(1)
const pageSize = ref(10)

const filteredOrders = computed(() => {
  let list = allOrders.value
  if (activeTab.value !== 'ALL') list = list.filter(o => o.status === activeTab.value)
  if (keyword.value.trim()) {
    const k = keyword.value.trim().toLowerCase()
    list = list.filter(o =>
      o.orderNo.toLowerCase().includes(k) ||
      o.terminalName.toLowerCase().includes(k) ||
      o.customerName.toLowerCase().includes(k)
    )
  }
  if (filterInvoice.value) list = list.filter(o => filterInvoice.value === 'Y' ? o.invoiced : !o.invoiced)
  return list
})

const pagedOrders = computed(() => {
  const s = (page.value - 1) * pageSize.value
  return filteredOrders.value.slice(s, s + pageSize.value)
})

const kpi = computed(() => ({
  using: allOrders.value.filter(o => o.status === 'USING').length,
  todayIncome: allOrders.value.reduce((s, o) => s + (o.status === 'DONE' ? o.totalFee : o.liveConsumed), 0) / 2,
  monthOrders: allOrders.value.filter(o => {
    const d = new Date(o.startTimeObj)
    return d.getMonth() === now.getMonth()
  }).length,
  pendingSettle: allOrders.value.filter(o => o.status === 'PENDING_SETTLE').length
}))

/* ---------- 实时跳动 ---------- */
let liveTimer = null
onMounted(() => {
  liveTimer = setInterval(() => {
    allOrders.value.forEach(o => {
      if (o.status === 'USING') {
        o.livePower = Math.max(5, o.livePower + rand(-0.5, 0.5))
        o.liveVoltage = Math.max(210, Math.min(240, o.liveVoltage + rand(-1, 1)))
        o.liveConsumed = +(o.liveConsumed + rand(0.03, 0.08)).toFixed(2)
        // 更新时长
        const sec = o.startTimeObj ? Math.floor((Date.now() - o.startTimeObj.getTime()) / 1000) : 0
        o.liveDuration = fmtDuration(sec)
        o.balance = Math.max(0, 500 - o.liveConsumed)
        // 自动断电：余额耗尽
        if (o.balance <= 0) autoSettle(o, '余额耗尽自动断电')
      }
    })
    // 更新监控抽屉
    if (monitorOrder.value && monitorOrder.value.status === 'USING') {
      threePhases.value[0].value = monitorOrder.value.liveVoltage + rand(-3, 3)
      threePhases.value[1].value = monitorOrder.value.liveVoltage + rand(-3, 3)
      threePhases.value[2].value = monitorOrder.value.liveVoltage + rand(-3, 3)
    }
  }, 800)
})
onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer)
})

/* ---------- 卡片样式 ---------- */
function cardClass(o) {
  return {
    'is-using': o.status === 'USING',
    'is-pending': o.status === 'PENDING_SETTLE',
    'is-done': o.status === 'DONE',
    'is-abnormal': o.status === 'ABNORMAL'
  }
}
function statusLabel(s) {
  return { USING: '用电中', PENDING_SETTLE: '待结算', DONE: '已完成', ABNORMAL: '异常' }[s]
}
function paymentLabel(m) {
  return { AMOUNT: '预存扣款', DURATION: '时长套餐', MONTHLY: '企业月结' }[m] || m
}

/* ---------- 监控 ---------- */
const monitorVisible = ref(false)
const monitorOrder = ref(null)
const threePhases = ref([
  { key: 'Ua', value: 220, color: '#16a34a' },
  { key: 'Ub', value: 221, color: '#2563eb' },
  { key: 'Uc', value: 219, color: '#9333ea' }
])
const chart24 = ref(Array.from({ length: 24 }, () => Math.floor(rand(10, 85))))
const nowHour = new Date().getHours()
const safetyIndicators = ref([
  { key: 'residual', label: '剩余电流', value: '8mA', level: 'ok' },
  { key: 'overcurrent', label: '过流保护', value: '未触发', level: 'ok' },
  { key: 'overvoltage', label: '过压保护', value: '未触发', level: 'ok' },
  { key: 'overtemp', label: '超温保护', value: '42℃', level: 'ok' },
  { key: 'short', label: '短路保护', value: '未触发', level: 'ok' }
])

function openMonitor(order) {
  monitorOrder.value = order
  threePhases.value[0].value = order.liveVoltage
  threePhases.value[1].value = order.liveVoltage + 1
  threePhases.value[2].value = order.liveVoltage - 1
  chart24.value = Array.from({ length: 24 }, () => Math.floor(rand(15, 90)))
  monitorVisible.value = true
}

/* ---------- 申请 Drawer ---------- */
const applyVisible = ref(false)
const applyStep = ref(0)
const apply = reactive({
  termQuery: '',
  termDistrict: '',
  terminalId: '',
  billingMode: 'AMOUNT',
  prepayAmount: 100,
  prepayCustom: null,
  durationHours: 3,
  customerType: 'ENTERPRISE',
  entName: '',
  entTaxNo: '',
  perName: '',
  perPhone: '',
  operator: ''
})

const billingOptions = [
  { value: 'AMOUNT', icon: '💰', label: '按金额预存', desc: '用多少扣多少，余额可退' },
  { value: 'DURATION', icon: '⏰', label: '按时长', desc: '包时套餐，时长到自动断电' },
  { value: 'MONTHLY', icon: '🏢', label: '企业包月', desc: '¥3,800/月，固定 100kW' }
]

const filteredTerminals = computed(() => {
  let list = terminalPool
  if (apply.termDistrict) list = list.filter(t => t.district === apply.termDistrict)
  if (apply.termQuery) {
    const q = apply.termQuery.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(q) || t.no.includes(q))
  }
  return list
})
const selectedTerminal = computed(() => terminalPool.find(t => t.id === apply.terminalId))
const applyAmount = computed(() => {
  if (apply.billingMode === 'AMOUNT') return apply.prepayCustom || apply.prepayAmount
  if (apply.billingMode === 'DURATION') return apply.durationHours * 12.5
  return 3800
})
const billingLabel = computed(() => ({ AMOUNT: `按金额预存 ¥${applyAmount.value}`, DURATION: `按时长 ${apply.durationHours} 小时`, MONTHLY: '企业包月 ¥3,800/月' }[apply.billingMode]))
const canNext = computed(() => {
  if (applyStep.value === 0) return !!apply.terminalId
  if (applyStep.value === 2) {
    if (apply.customerType === 'ENTERPRISE') return !!apply.entName && !!apply.entTaxNo
    return !!apply.perName && !!apply.perPhone
  }
  return true
})

function openApplyDrawer() {
  applyStep.value = 0
  apply.termQuery = ''
  apply.termDistrict = ''
  apply.terminalId = ''
  apply.billingMode = 'AMOUNT'
  apply.prepayAmount = 100
  apply.prepayCustom = null
  apply.durationHours = 3
  apply.customerType = 'ENTERPRISE'
  apply.entName = ''
  apply.entTaxNo = ''
  apply.perName = ''
  apply.perPhone = ''
  apply.operator = ''
  applyVisible.value = true
}

const closingProgress = ref(0)
function doPay() {
  applyStep.value = 4
  closingProgress.value = 0
  const t = setInterval(() => {
    closingProgress.value += 10
    if (closingProgress.value >= 100) {
      clearInterval(t)
      ElMessage.success('支付成功 · 合闸完成')
      // 生成新订单
      const term = selectedTerminal.value
      const newOrder = {
        id: 'O' + Math.random().toString(36).slice(2, 8),
        orderNo: orderNo(),
        status: 'USING',
        customerType: apply.customerType,
        customerName: apply.customerType === 'ENTERPRISE' ? apply.entName : apply.perName,
        taxNo: apply.entTaxNo,
        operator: apply.operator || (apply.customerType === 'PERSONAL' ? apply.perName : '经办人'),
        terminalId: term.id,
        terminalName: term.name,
        terminalNo: term.no,
        spec: term.spec,
        district: term.district,
        startTime: fmtDate(new Date()),
        endTime: '',
        liveDuration: '00:00:00',
        livePower: 0,
        liveVoltage: 220,
        liveConsumed: 0,
        balance: applyAmount.value,
        totalKwh: 0,
        peakKwh: 0, flatKwh: 0, valleyKwh: 0,
        peakFee: 0, flatFee: 0, valleyFee: 0,
        totalFee: 0,
        billingMode: apply.billingMode,
        invoiced: false,
        abnormalReason: '',
        durationText: '刚刚启动',
        startTimeObj: new Date()
      }
      allOrders.value.unshift(newOrder)
      applyVisible.value = false
      activeTab.value = 'USING'
    }
  }, 200)
}

function simulateScan() {
  openApplyDrawer()
  apply.termDistrict = '先导路'
  apply.terminalId = 'T001'
  apply.billingMode = 'AMOUNT'
  apply.prepayAmount = 100
  apply.customerType = 'ENTERPRISE'
  apply.entName = '湖南建工集团有限公司'
  apply.entTaxNo = '91430100MA4Q7XXXXXX'
  apply.operator = '张工'
  ElMessage.info('已自动填充扫码信息')
}

/* ---------- 结束 / 断电 ---------- */
function confirmEnd(order) {
  ElMessageBox.confirm(
    `确认对订单 ${order.orderNo} 执行手动断电？断电后将自动结算。`,
    '结束用电',
    { type: 'warning', confirmButtonText: '确认断电', cancelButtonText: '取消' }
  ).then(() => endOrder(order, '手动结束'))
    .catch(() => {})
}

function remotePowerOff(order) {
  ElMessage.warning(`已向订单 ${order.orderNo} 发送远程断电指令`)
  setTimeout(() => endOrder(order, '远程断电'), 1200)
}

function autoSettle(order, reason) {
  endOrder(order, reason)
}

function endOrder(order, reason) {
  const sec = Math.max(60, Math.floor((Date.now() - order.startTimeObj.getTime()) / 1000))
  order.liveDuration = fmtDuration(sec)
  order.endTime = fmtDate(new Date())
  order.durationText = fmtDurationText(sec)
  order.totalKwh = order.liveConsumed / 0.65
  order.peakKwh = order.totalKwh * 0.4
  order.flatKwh = order.totalKwh * 0.5
  order.valleyKwh = order.totalKwh - order.peakKwh - order.flatKwh
  order.peakFee = order.peakKwh * 0.98
  order.flatFee = order.flatKwh * 0.65
  order.valleyFee = order.valleyKwh * 0.46
  order.totalFee = order.peakFee + order.flatFee + order.valleyFee
  order.liveConsumed = order.totalFee
  order.status = 'PENDING_SETTLE'
  ElMessage.success(`订单 ${order.orderNo} 已结束（${reason}），进入待结算`)
}

function quickSettle(order) {
  order.status = 'DONE'
  order.invoiced = true
  ElMessage.success(`订单 ${order.orderNo} 已完成结算`)
}

function markHandled(order) {
  order.status = 'DONE'
  order.invoiced = true
  ElMessage.success(`异常订单 ${order.orderNo} 已标记处理完成`)
}
function createTicket(order) {
  ElMessage.info(`已为订单 ${order.orderNo} 生成工单 WO${Date.now().toString().slice(-6)}`)
}
function remoteReset(order) {
  order.status = 'USING'
  order.abnormalReason = ''
  ElMessage.success(`订单 ${order.orderNo} 已远程复位，恢复用电`)
}

function refreshAll() {
  allOrders.value = generateOrders()
  ElMessage.success('已刷新')
}

/* ---------- 小票 ---------- */
const receiptVisible = ref(false)
const receiptOrder = ref(null)
function openReceipt(order) {
  receiptOrder.value = order
  receiptVisible.value = true
}
function downloadReceipt() {
  ElMessage.success(`电子小票下载中：${receiptOrder.value.orderNo}.pdf`)
}
function copyOrderNo() {
  navigator.clipboard?.writeText(receiptOrder.value.orderNo).then(() => {
    ElMessage.success('订单号已复制')
  }).catch(() => ElMessage.info(receiptOrder.value.orderNo))
}
</script>

<style lang="scss" scoped>
.zg-po {
  padding: 20px;
  background: #f5f7fb;
  min-height: calc(100vh - 40px);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;

  /* 头部 */
  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    border-radius: 12px;
    color: #fff;
    margin-bottom: 16px;
  }
  &__headline { display: flex; align-items: center; gap: 16px; }
  &__sigil {
    width: 44px; height: 44px;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  &__title { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 1px; }
  &__sub { margin: 4px 0 0; font-size: 13px; opacity: 0.75; }
  &__cta { display: flex; gap: 10px; }

  /* KPI */
  &__kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 16px;
  }
  &__kpi {
    background: #fff;
    border-radius: 10px;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-left: 4px solid #3b82f6;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  }
  &__kpi-ico {
    width: 44px; height: 44px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }
  &__kpi--using { border-left-color: #16a34a; .zg-po__kpi-ico { background: #16a34a; } }
  &__kpi--income { border-left-color: #f59e0b; .zg-po__kpi-ico { background: #f59e0b; } }
  &__kpi--month { border-left-color: #3b82f6; .zg-po__kpi-ico { background: #3b82f6; } }
  &__kpi--settle { border-left-color: #ef4444; .zg-po__kpi-ico { background: #ef4444; } }
  &__kpi-num { font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.2; }
  &__kpi-lbl { font-size: 12px; color: #64748b; margin-top: 2px; }

  /* Tabs */
  &__tabs {
    background: #fff;
    border-radius: 10px;
    padding: 12px 18px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  }
  &__tabs-inner { display: flex; gap: 6px; }
  &__tabs-ops { display: flex; gap: 10px; align-items: center; }
  &__tab {
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    color: #64748b;
    display: flex; gap: 6px; align-items: center;
    transition: all 0.2s;
    &:hover { background: #f1f5f9; color: #0f172a; }
    &.is-active { background: #1e3a8a; color: #fff; }
  }
  &__tab-badge {
    background: rgba(59,130,246,0.15);
    color: #3b82f6;
    border-radius: 10px;
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 600;
  }
  &__tab.is-active .zg-po__tab-badge {
    background: rgba(255,255,255,0.2); color: #fff;
  }

  /* Grid */
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }

  /* 卡片 */
  &__card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    border: 2px solid #e2e8f0;
    transition: all 0.2s;
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
    position: relative;
    overflow: hidden;

    &:hover { box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08); transform: translateY(-2px); }

    &.is-using {
      border-color: #16a34a;
      .zg-po__card-dot { background: #16a34a; box-shadow: 0 0 8px #16a34a; animation: pulse 1s ease-in-out infinite; }
    }
    &.is-pending {
      border-color: #f59e0b;
      .zg-po__card-dot { background: #f59e0b; }
    }
    &.is-done {
      border-color: #94a3b8;
      opacity: 0.85;
      .zg-po__card-dot { background: #94a3b8; }
    }
    &.is-abnormal {
      border-color: #ef4444;
      animation: pulse-border 1.6s ease-in-out infinite;
      .zg-po__card-dot { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
    }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.6; }
  }
  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
    50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
  }

  &__card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e2e8f0;
  }
  &__card-title { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #334155; }
  &__card-dot {
    width: 10px; height: 10px; border-radius: 50%;
  }
  &__card-status { font-weight: 600; color: #0f172a; }
  &__card-tag {
    background: #e0e7ff;
    color: #4338ca;
    padding: 1px 8px;
    border-radius: 8px;
    font-size: 11px;
  }
  &__card-no { color: #94a3b8; font-size: 12px; font-family: 'Menlo', monospace; }

  &__card-body { display: flex; flex-direction: column; gap: 6px; }
  &__card-row {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px;
  }
  &__card-ico { flex-shrink: 0; font-size: 14px; }
  &__card-val { color: #0f172a; flex: 1; }
  &__card-sub { color: #94a3b8; font-size: 11px; }
  &__abnormal-text { color: #ef4444; font-weight: 600; }

  &__card-foot {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* Pager */
  &__pager {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  /* Drawer */
  &__drawer-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }
  &__steps { margin-bottom: 20px; }
  &__step { padding: 8px 4px; }
  &__billing-group { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  &__billing-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    background: #fff;
    &:hover { border-color: #3b82f6; background: #f8fafc; }
    &.is-active {
      border-color: #1e3a8a;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      box-shadow: 0 2px 10px rgba(30, 58, 138, 0.15);
    }
  }
  &__billing-card {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__billing-check {
    width: 24px; height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #cbd5e1;
    display: flex; align-items: center; justify-content: center;
    color: #1e3a8a;
    font-weight: 700;
  }
  .is-active .zg-po__billing-check {
    background: #1e3a8a;
    border-color: #1e3a8a;
    color: #fff;
  }
  &__billing-ico { font-size: 28px; }
  &__billing-lbl { font-weight: 600; color: #0f172a; font-size: 14px; }
  &__billing-desc { font-size: 12px; color: #64748b; margin-top: 3px; }
  &__billing-opts { margin-top: 20px; }

  &__confirm-title { margin: 0 0 14px; font-size: 15px; color: #0f172a; }
  &__confirm-row {
    display: flex; justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
    span { color: #64748b; }
    b { color: #0f172a; font-weight: 600; }
  }
  &__confirm-amount { color: #ef4444; font-size: 18px; }

  &__closing { text-align: center; padding: 40px 10px; }
  &__bolt {
    font-size: 60px;
    animation: bolt-shake 0.6s ease-in-out infinite;
    color: #f59e0b;
  }
  @keyframes bolt-shake {
    0%, 100% { transform: rotate(0) scale(1); }
    25% { transform: rotate(-10deg) scale(1.1); }
    75% { transform: rotate(10deg) scale(1.1); }
  }
  &__closing-title { margin: 14px 0; color: #0f172a; }
  &__closing-tip { color: #94a3b8; font-size: 12px; margin-top: 10px; }

  /* 监控 Drawer */
  &__monitor-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  &__monitor-cell {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 10px;
    padding: 16px;
    text-align: center;
  }
  &__monitor-num {
    font-size: 28px; font-weight: 700; color: #0f172a;
    font-family: 'Menlo', monospace;
  }
  &__monitor-num--power { color: #16a34a; }
  &__monitor-num--timer { color: #f59e0b; font-size: 22px; }
  &__monitor-num--money { color: #ef4444; }
  &__monitor-unit { font-size: 13px; color: #64748b; }
  &__monitor-lbl { font-size: 12px; color: #64748b; margin-top: 4px; }

  &__section-title {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    margin: 20px 0 10px;
    padding-left: 10px;
    border-left: 3px solid #1e3a8a;
  }

  /* 三相 */
  &__three-phase { display: flex; justify-content: space-around; padding: 12px 0; }
  &__phase { text-align: center; }
  &__phase-svg { width: 72px; height: 72px; }
  &__phase-ring { transition: stroke-dashoffset 0.4s ease; }
  &__phase-key { font-weight: 600; font-size: 14px; margin-top: 4px; }
  &__phase-val { font-size: 18px; font-weight: 700; color: #0f172a; font-family: Menlo, monospace; }

  /* 柱状图 */
  &__bar-chart {
    display: flex; align-items: flex-end; gap: 3px;
    height: 120px;
    padding: 0 4px;
    background: #f8fafc;
    border-radius: 6px;
  }
  &__bar {
    flex: 1;
    background: linear-gradient(to top, #3b82f6, #93c5fd);
    border-radius: 2px 2px 0 0;
    position: relative;
    min-height: 4px;
    transition: height 0.4s ease;
    &.is-live {
      background: linear-gradient(to top, #ef4444, #fca5a5);
      animation: bar-flash 0.8s ease-in-out infinite;
    }
    &:hover {.zg-po__bar-tip { display: block; }
  }
  &__bar-tip {
    display: none;
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }
  @keyframes bar-flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  &__bar-labels {
    display: flex; justify-content: space-between;
    font-size: 11px; color: #94a3b8;
    padding: 4px 6px;
  }
  }

  /* 安全 */
  &__safety {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  &__safety-cell { text-align: center; padding: 10px 4px; background: #f8fafc; border-radius: 6px; }
  &__safety-dot {
    width: 10px; height: 10px; border-radius: 50%;
    margin: 0 auto 6px;
    &.is-ok { background: #16a34a; box-shadow: 0 0 6px #16a34a; }
    &.is-warn { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; animation: pulse 1s infinite; }
    &.is-danger { background: #ef4444; box-shadow: 0 0 6px #ef4444; animation: pulse 0.6s infinite; }
  }
  &__safety-lbl { font-size: 11px; color: #64748b; }
  &__safety-val { font-size: 12px; font-weight: 600; color: #0f172a; margin-top: 2px;
    &.is-warn { color: #f59e0b; }
    &.is-danger { color: #ef4444; }
  }

  /* 小票 */
  &__receipt {
    border: 2px solid #0f172a;
    border-radius: 6px;
    padding: 18px 22px;
    background: #fff;
    font-family: 'Menlo', 'PingFang SC', monospace;
  }
  &__receipt-head { text-align: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 2px dashed #0f172a; }
  &__receipt-title { font-size: 16px; font-weight: 700; letter-spacing: 1px; }
  &__receipt-no { font-size: 12px; color: #64748b; margin-top: 6px; }
  &__receipt-section { padding: 10px 0; border-bottom: 1px dashed #cbd5e1; }
  &__receipt-total { padding: 12px 0; border-top: 2px solid #0f172a; border-bottom: 2px dashed #0f172a; margin-top: 12px; }
  &__receipt-row {
    display: flex; justify-content: space-between;
    padding: 4px 0; font-size: 13px;
    span { color: #64748b; }
    b { color: #0f172a; font-weight: 600; }
  }
  &__receipt-row--sub b { font-size: 12px; color: #3b82f6; }
  &__receipt-foot { text-align: center; margin-top: 14px; font-size: 12px; color: #64748b;
    p { margin: 2px 0; }
  }
  &__receipt-sign { font-style: italic; color: #0f172a; }
}</style>
