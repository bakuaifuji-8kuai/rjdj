<!--
  智光云枢 · 杆桩运营 · 扫码共享用电终端台账 + 二维码管理
  业务域：poleBiz
  对标：网上国网企业版"扫码共享用电终端台账 + 二维码中心"
  Tab1 终端台账（卡片网格 · 分页 · QR 缩略图 · 五重安全）
  Tab2 二维码张贴管理（时间线卡片 · 批量生成 · 打印）
  Tab3 终端安全配置（五重安全策略矩阵 · Drawer 阈值）
  Tab4 终端实时遥测（三相数据 · 24h 柱图 · 告警时间线）
-->
<template>
  <section class="zg-sp">
    <!-- ============ 头部 ============ -->
    <header class="zg-sp__head">
      <div class="zg-sp__headline">
        <div class="zg-sp__sigil">
          <el-icon :size="22"><Grid /></el-icon>
        </div>
        <div class="zg-sp__copy">
          <h1 class="zg-sp__title">扫码共享用电终端台账 · 二维码中心</h1>
          <p class="zg-sp__sub">
            在役 {{ totalCount }} 台 · 今日活跃 {{ usingCount }} 台 · 累计订单 {{ totalOrders.toLocaleString() }} 笔 ·
            岳麓区 5 大商圈 / 工地 / 园区 · 扫码即用即付
          </p>
        </div>
      </div>
      <div class="zg-sp__cta">
        <el-button type="primary" size="large" @click="registerVisible = true">
          <el-icon><Plus /></el-icon>
          <span>+ 登记终端</span>
        </el-button>
        <el-button size="large" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          <span>刷新</span>
        </el-button>
      </div>
    </header>

    <!-- ============ 5 KPI 卡 ============ -->
    <div class="zg-sp-kpi">
      <div class="zg-sp-kpi__cell">
        <div class="zg-sp-kpi__icon zg-sp-kpi__icon--grid"><el-icon :size="22"><Grid /></el-icon></div>
        <div class="zg-sp-kpi__body">
          <span class="zg-sp-kpi__num">{{ totalCount }}</span>
          <span class="zg-sp-kpi__lbl">终端总数</span>
        </div>
      </div>
      <div class="zg-sp-kpi__cell">
        <div class="zg-sp-kpi__icon zg-sp-kpi__icon--ok"><el-icon :size="22"><View /></el-icon></div>
        <div class="zg-sp-kpi__body">
          <span class="zg-sp-kpi__num zg-sp-kpi__num--ok">{{ usingCount }}</span>
          <span class="zg-sp-kpi__lbl">使用中</span>
        </div>
      </div>
      <div class="zg-sp-kpi__cell">
        <div class="zg-sp-kpi__icon zg-sp-kpi__icon--info"><el-icon :size="22"><Lock /></el-icon></div>
        <div class="zg-sp-kpi__body">
          <span class="zg-sp-kpi__num zg-sp-kpi__num--info">{{ idleCount }}</span>
          <span class="zg-sp-kpi__lbl">闲置</span>
        </div>
      </div>
      <div class="zg-sp-kpi__cell">
        <div class="zg-sp-kpi__icon zg-sp-kpi__icon--danger"><el-icon :size="22"><Warning /></el-icon></div>
        <div class="zg-sp-kpi__body">
          <span class="zg-sp-kpi__num zg-sp-kpi__num--danger">{{ faultCount }}</span>
          <span class="zg-sp-kpi__lbl">故障</span>
        </div>
      </div>
      <div class="zg-sp-kpi__cell zg-sp-kpi__cell--wide">
        <div class="zg-sp-kpi__icon zg-sp-kpi__icon--warn"><el-icon :size="22"><Histogram /></el-icon></div>
        <div class="zg-sp-kpi__body">
          <span class="zg-sp-kpi__num zg-sp-kpi__num--warn">¥{{ todayIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</span>
          <span class="zg-sp-kpi__lbl">今日收入</span>
        </div>
      </div>
    </div>

    <!-- ============ Tab 切换 ============ -->
    <el-tabs v-model="activeTab" class="zg-sp__tabs" tab-position="top">

      <!-- ========================================================= -->
      <!-- Tab 1: 终端台账（卡片网格 + 分页 + QR 缩略图 + 五重安全） -->
      <!-- ========================================================= -->
      <el-tab-pane label="📟 终端台账" name="ledger">
        <!-- 工具栏 -->
        <div class="zg-sp__toolbar">
          <el-select v-model="filterDistrict" placeholder="全部区域" style="width: 160px">
            <el-option label="全部区域" value="" />
            <el-option v-for="d in districtList" :key="d" :label="d" :value="d" />
          </el-select>
          <el-select v-model="filterModel" placeholder="全部型号" style="width: 160px">
            <el-option label="全部型号" value="" />
            <el-option label="ZG-SP-100 · 100kW 380V" value="ZG-SP-100" />
            <el-option label="ZG-SP-30  · 30kW  220V" value="ZG-SP-30" />
            <el-option label="ZG-SP-200 · 200kW 工业级" value="ZG-SP-200" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="全部状态" style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="通电中" value="USING" />
            <el-option label="空闲" value="IDLE" />
            <el-option label="故障" value="FAULT" />
            <el-option label="离线" value="OFFLINE" />
          </el-select>
          <el-input
            v-model="keyword"
            placeholder="搜索终端编号 / 位置 / 型号"
            clearable
            style="width: 260px"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <div class="zg-sp__toolbar-right">
            <el-tag size="large" effect="light" type="info">共 {{ filteredList.length }} / {{ totalCount }} 台</el-tag>
          </div>
        </div>

        <!-- 卡片网格（el-row + el-col 响应式） -->
        <el-row :gutter="14" class="zg-sp-card-grid">
          <el-col
            v-for="t in pagedList"
            :key="t.id"
            :xs="24" :sm="12" :md="8" :lg="6" :xl="6"
          >
            <div
              class="zg-sp-card"
              :class="{
                'zg-sp-card--using': t.status === 'USING',
                'zg-sp-card--fault': t.status === 'FAULT',
                'zg-sp-card--offline': t.status === 'OFFLINE'
              }"
            >
              <!-- 顶部：编号 + 型号 -->
              <div class="zg-sp-card__top">
                <div class="zg-sp-card__id">{{ t.id }}</div>
                <el-tag size="small" :type="statusTagType[t.status]" effect="dark" round>
                  {{ statusLabel[t.status] }}
                </el-tag>
              </div>

              <!-- 主体：位置 + 功率 + 电压 -->
              <div class="zg-sp-card__body">
                <div class="zg-sp-card__name"><el-icon><Location /></el-icon>{{ t.location }}</div>
                <div class="zg-sp-card__spec-row">
                  <span class="zg-sp-card__spec">{{ t.model }} · {{ t.powerKw }}kW</span>
                  <span class="zg-sp-card__spec zg-sp-card__spec--volt">{{ t.voltage }}</span>
                </div>
                <!-- 今日数据 -->
                <div class="zg-sp-card__today">
                  <div class="zg-sp-card__today-cell">
                    <span class="zg-sp-card__today-num">{{ t.todayOrders }}</span>
                    <span class="zg-sp-card__today-lbl">今日订单</span>
                  </div>
                  <div class="zg-sp-card__today-cell">
                    <span class="zg-sp-card__today-num zg-sp-card__today-num--warn">¥{{ t.todayIncome.toFixed(2) }}</span>
                    <span class="zg-sp-card__today-lbl">今日收入</span>
                  </div>
                </div>
              </div>

              <!-- QR 缩略图 + 五重安全 -->
              <div class="zg-sp-card__mid">
                <div class="zg-sp-card__qr" @click="showQrcodeDialog(t)">
                  <!-- 伪 QR 缩略图（48×48 基于 hash） -->
                  <svg viewBox="0 0 25 25" width="48" height="48" class="zg-sp-card__qr-svg">
                    <!-- 3 个定位角 -->
                    <g fill="#000">
                      <rect x="0" y="0" width="7" height="7" />
                      <rect x="1" y="1" width="5" height="5" fill="#fff" />
                      <rect x="2" y="2" width="3" height="3" />
                      <rect x="18" y="0" width="7" height="7" />
                      <rect x="19" y="1" width="5" height="5" fill="#fff" />
                      <rect x="20" y="2" width="3" height="3" />
                      <rect x="0" y="18" width="7" height="7" />
                      <rect x="1" y="19" width="5" height="5" fill="#fff" />
                      <rect x="2" y="20" width="3" height="3" />
                    </g>
                    <!-- 数据点（hash 驱动，保证一致） -->
                    <g v-for="(cell, idx) in getQrMatrix(t.id)" :key="idx" fill="#000">
                      <rect v-if="cell" :x="(idx % 25)" :y="Math.floor(idx / 25)" width="1" height="1" />
                    </g>
                    <!-- 中心 logo 占位 -->
                    <rect x="11" y="11" width="3" height="3" fill="#fff" />
                    <rect x="12" y="12" width="1" height="1" fill="#6366f1" />
                  </svg>
                  <span class="zg-sp-card__qr-tip">点击放大</span>
                </div>
                <div class="zg-sp-card__safety">
                  <div class="zg-sp-card__safety-title">🔒 五重安全</div>
                  <div class="zg-sp-card__safety-list">
                    <span class="ok" title="漏电保护"><el-icon><Lock /></el-icon>漏电</span>
                    <span class="ok" title="过载保护"><el-icon><Lock /></el-icon>过载</span>
                    <span class="ok" title="短路保护"><el-icon><Lock /></el-icon>短路</span>
                    <span class="ok" title="超时断电"><el-icon><Unlock /></el-icon>超时</span>
                    <span :class="t.safety.balanceThreshold <= 5 ? 'warn' : 'ok'" title="余额告警">
                      <el-icon><Lock /></el-icon>余额
                    </span>
                  </div>
                </div>
              </div>

              <!-- 底部操作 -->
              <div class="zg-sp-card__actions">
                <el-button link type="primary" size="small" @click="openDetailDrawer(t)">
                  <el-icon><View /></el-icon>详情
                </el-button>
                <el-button link type="primary" size="small" @click="showQrcodeDialog(t)">
                  <el-icon><Camera /></el-icon>生成二维码
                </el-button>
                <el-button link type="warning" size="small" @click="openSafetyDrawer(t)">
                  <el-icon><Setting /></el-icon>配置安全
                </el-button>
                <el-button link type="danger" size="small" :disabled="t.status !== 'USING'" @click="remoteCutoff(t)">
                  <el-icon><Warning /></el-icon>远程断电
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 分页器 -->
        <div class="zg-sp__pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :page-sizes="[16, 24, 32]"
            :total="filteredList.length"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </el-tab-pane>

      <!-- ========================================================= -->
      <!-- Tab 2: 二维码张贴管理                                      -->
      <!-- ========================================================= -->
      <el-tab-pane label="🖨 二维码张贴管理" name="posting">
        <div class="zg-sp__posting-wrap">
          <!-- 左侧终端列表 -->
          <div class="zg-sp__posting-list">
            <div class="zg-sp__posting-list-head">
              <strong>终端 QR 码生命周期</strong>
              <span class="zg-sp__posting-list-sub">共 {{ qrLifecycleList.length }} 台</span>
            </div>
            <div class="zg-sp__posting-list-body">
              <div
                v-for="t in qrLifecycleList"
                :key="t.id"
                class="zg-sp__posting-item"
                :class="{ active: selectedPostId === t.id }"
                @click="selectedPostId = t.id; showQrcodeDialog(t)"
              >
                <div class="zg-sp__posting-item-head">
                  <span class="zg-sp__posting-item-id">{{ t.id }}</span>
                  <el-tag
                    size="small"
                    :type="postingStatusMap[t.postingStatus].tag"
                    effect="dark"
                    round
                  >{{ postingStatusMap[t.postingStatus].label }}</el-tag>
                </div>
                <div class="zg-sp__posting-item-loc"><el-icon><Location /></el-icon>{{ t.location }}</div>
                <div class="zg-sp__posting-item-qr">
                  <svg viewBox="0 0 25 25" width="32" height="32">
                    <g fill="#000">
                      <rect x="0" y="0" width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#fff" /><rect x="2" y="2" width="3" height="3" />
                      <rect x="18" y="0" width="7" height="7" /><rect x="19" y="1" width="5" height="5" fill="#fff" /><rect x="20" y="2" width="3" height="3" />
                      <rect x="0" y="18" width="7" height="7" /><rect x="1" y="19" width="5" height="5" fill="#fff" /><rect x="2" y="20" width="3" height="3" />
                    </g>
                    <g v-for="(cell, idx) in getQrMatrix(t.id)" :key="idx" fill="#000">
                      <rect v-if="cell" :x="(idx % 25)" :y="Math.floor(idx / 25)" width="1" height="1" />
                    </g>
                  </svg>
                  <div class="zg-sp__posting-item-code">
                    <div>{{ t.qrToken }}</div>
                    <div class="zg-sp__posting-item-exp">过期：{{ t.qrExpire }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：时间线 + 批量操作 -->
          <div class="zg-sp__posting-main">
            <div class="zg-sp__posting-head">
              <div>
                <strong>QR 全生命周期</strong>
                <el-tag size="small" type="success" effect="light" style="margin-left: 8px">
                  当前选中：{{ selectedPostFocus?.id || '—' }}
                </el-tag>
                <span class="zg-sp__posting-loc">{{ selectedPostFocus?.location || '' }}</span>
              </div>
              <div class="zg-sp__batch">
                <el-button type="primary" @click="batchGenerate">
                  <el-icon><Camera /></el-icon>批量生成
                </el-button>
                <el-button type="success" @click="batchPrint">
                  <el-icon><Printer /></el-icon>批量打印
                </el-button>
                <el-button type="warning" plain @click="showQrcodeDialog(selectedPostFocus)">
                  <el-icon><Share /></el-icon>生成当前终端码
                </el-button>
              </div>
            </div>

            <div v-if="selectedPostFocus" class="zg-sp__posting-detail">
              <!-- 大 QR 预览 -->
              <div class="zg-sp__posting-preview">
                <div class="zg-sp__posting-qr-box">
                  <svg viewBox="0 0 25 25" width="200" height="200">
                    <g fill="#000">
                      <rect x="0" y="0" width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#fff" /><rect x="2" y="2" width="3" height="3" />
                      <rect x="18" y="0" width="7" height="7" /><rect x="19" y="1" width="5" height="5" fill="#fff" /><rect x="20" y="2" width="3" height="3" />
                      <rect x="0" y="18" width="7" height="7" /><rect x="1" y="19" width="5" height="5" fill="#fff" /><rect x="2" y="20" width="3" height="3" />
                    </g>
                    <g v-for="(cell, idx) in getQrMatrix(selectedPostFocus.id)" :key="idx" fill="#000">
                      <rect v-if="cell" :x="(idx % 25)" :y="Math.floor(idx / 25)" width="1" height="1" />
                    </g>
                    <rect x="10" y="10" width="5" height="5" fill="#fff" rx="1" />
                    <circle cx="12.5" cy="12.5" r="2" fill="url(#zg-gradient)" />
                    <defs><linearGradient id="zg-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#6366f1" /><stop offset="100%" stop-color="#8b5cf6" />
                    </linearGradient></defs>
                  </svg>
                </div>
                <div class="zg-sp__posting-qr-info">
                  <div class="zg-sp__posting-qr-row"><span>加密 Token</span><code>{{ selectedPostFocus.qrToken }}</code></div>
                  <div class="zg-sp__posting-qr-row"><span>生成时间</span><code>{{ selectedPostFocus.qrGeneratedAt }}</code></div>
                  <div class="zg-sp__posting-qr-row"><span>过期时间</span><code>{{ selectedPostFocus.qrExpire }}</code></div>
                  <div class="zg-sp__posting-qr-row"><span>防篡改校验</span><code>SHA256: {{ selectedPostFocus.qrChecksum }}</code></div>
                </div>
              </div>

              <!-- 生命周期时间线 -->
              <div class="zg-sp__posting-timeline">
                <div class="zg-sp__posting-tl-title">📜 生命周期时间线</div>
                <el-timeline>
                  <el-timeline-item
                    v-for="(ev, idx) in selectedPostFocus.qrLifecycle"
                    :key="idx"
                    :timestamp="ev.time"
                    :type="ev.type"
                    :hollow="ev.hollow || false"
                  >
                    <div class="zg-sp__posting-tl-content">
                      <strong>{{ ev.title }}</strong>
                      <span>{{ ev.detail }}</span>
                      <span v-if="ev.by" class="by">操作人：{{ ev.by }}</span>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
            <el-empty v-else description="请从左侧选择一个终端查看 QR 生命周期" />
          </div>
        </div>
      </el-tab-pane>

      <!-- ========================================================= -->
      <!-- Tab 3: 终端安全配置（矩阵 + Drawer 阈值 + 防护日志）     -->
      <!-- ========================================================= -->
      <el-tab-pane label="🛡 终端安全配置" name="safety">
        <div class="zg-sp__safety-head">
          <div class="zg-sp__safety-stat">
            <span>已配置终端</span><strong>{{ safetyConfiguredCount }}</strong>/<strong>{{ totalCount }}</strong>
          </div>
          <div class="zg-sp__safety-stat">
            <span>近 7 天防护触发</span><strong class="danger">{{ safetyTriggerCount }}</strong> 次
          </div>
          <div class="zg-sp__safety-stat">
            <span>安全合格率</span><strong class="ok">{{ safetyQualifiedRate }}%</strong>
          </div>
        </div>

        <el-table
          :data="safetyTableData"
          stripe
          border
          size="default"
          @row-click="openSafetyDrawer"
          highlight-current-row
        >
          <el-table-column label="终端" width="220">
            <template #default="{ row }">
              <div class="zg-sp__tminfo">
                <div class="zg-sp__tmid">{{ row.id }}</div>
                <div class="zg-sp__tmloc"><el-icon><Location /></el-icon>{{ row.location }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="漏电保护" align="center" width="120">
            <template #default="{ row }">
              <el-switch
                v-model="row.safety.leakageEnabled"
                active-text="开"
                inactive-text="关"
                size="default"
                @click.stop
              />
              <div class="zg-sp__safety-val">阈值 {{ row.safety.leakageTh }}mA</div>
            </template>
          </el-table-column>
          <el-table-column label="过载保护" align="center" width="120">
            <template #default="{ row }">
              <el-switch v-model="row.safety.overloadEnabled" size="default" @click.stop />
              <div class="zg-sp__safety-val">阈值 {{ row.safety.overloadPct }}% 额定</div>
            </template>
          </el-table-column>
          <el-table-column label="短路保护" align="center" width="120">
            <template #default="{ row }">
              <el-switch v-model="row.safety.shortCircuitEnabled" size="default" @click.stop />
              <div class="zg-sp__safety-val">响应 {{ row.safety.shortCircuitMs }}ms</div>
            </template>
          </el-table-column>
          <el-table-column label="超时断电" align="center" width="120">
            <template #default="{ row }">
              <el-switch v-model="row.safety.timeoutEnabled" size="default" @click.stop />
              <div class="zg-sp__safety-val">{{ row.safety.timeoutHours }}h 自动</div>
            </template>
          </el-table-column>
          <el-table-column label="余额告警" align="center" width="120">
            <template #default="{ row }">
              <el-switch v-model="row.safety.balanceEnabled" size="default" @click.stop />
              <div class="zg-sp__safety-val">≤ ¥{{ row.safety.balanceThreshold }} 告警</div>
            </template>
          </el-table-column>
          <el-table-column label="近 7 天触发" align="center" width="120">
            <template #default="{ row }">
              <el-tag
                :type="row.safety.trigger7d > 0 ? 'warning' : 'success'"
                effect="dark"
                round
              >{{ row.safety.trigger7d }} 次</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="openSafetyDrawer(row)">
                <el-icon><Setting /></el-icon>调参
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="zg-sp__pagination">
          <el-pagination
            v-model:current-page="safetyPage"
            v-model:page-size="safetyPageSize"
            :page-sizes="[10, 20, 50]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </el-tab-pane>

      <!-- ========================================================= -->
      <!-- Tab 4: 终端实时遥测（表格列表 → Drawer 详情）             -->
      <!-- ========================================================= -->
      <el-tab-pane label="📊 终端实时遥测" name="telemetry">
        <el-table
          :data="telemetryList"
          stripe
          size="default"
          @row-click="openTelemetryDrawer"
          highlight-current-row
        >
          <el-table-column label="终端" width="220">
            <template #default="{ row }">
              <div class="zg-sp__tminfo">
                <div class="zg-sp__tmid">{{ row.id }}</div>
                <div class="zg-sp__tmloc"><el-icon><Location /></el-icon>{{ row.location }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag
                :type="statusTagType[row.status]"
                effect="dark"
                round
                size="small"
              >{{ statusLabel[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Ua/V" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.Ua }}</template>
          </el-table-column>
          <el-table-column label="Ub/V" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.Ub }}</template>
          </el-table-column>
          <el-table-column label="Uc/V" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.Uc }}</template>
          </el-table-column>
          <el-table-column label="Ia/A" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.Ia }}</template>
          </el-table-column>
          <el-table-column label="Ib/A" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.Ib }}</template>
          </el-table-column>
          <el-table-column label="Ic/A" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.Ic }}</template>
          </el-table-column>
          <el-table-column label="总有功 kW" align="right" width="110">
            <template #default="{ row }">
              <strong class="ok">{{ row.telemetry.totalP }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="功率因数" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.powerFactor }}</template>
          </el-table-column>
          <el-table-column label="频率 Hz" align="right" width="90">
            <template #default="{ row }">{{ row.telemetry.freq }}</template>
          </el-table-column>
          <el-table-column label="告警" align="center" width="80" fixed="right">
            <template #default="{ row }">
              <el-badge :value="row.alarms?.length || 0" :max="9" type="danger">
                <el-icon :size="18"><Bell /></el-icon>
              </el-badge>
            </template>
          </el-table-column>
        </el-table>

        <div class="zg-sp__pagination">
          <el-pagination
            v-model:current-page="telemPage"
            v-model:page-size="telemPageSize"
            :page-sizes="[12, 24, 48]"
            :total="telemetryList.length"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ========================================================= -->
    <!-- Drawer: 终端详情（遥测 / 实时数据 / 告警）                 -->
    <!-- ========================================================= -->
    <el-drawer v-model="detailDrawerVisible" :title="detailFocus?.id + ' · ' + detailFocus?.location" size="720px">
      <div v-if="detailFocus" class="zg-sp-drawer">
        <!-- 基本档案 -->
        <section class="zg-sp-drawer__section">
          <h4 class="zg-sp-drawer__title">📋 基本档案</h4>
          <div class="zg-sp-drawer__grid">
            <div class="zg-sp-drawer__cell"><span class="lbl">终端编号</span><span class="val">{{ detailFocus.id }}</span></div>
            <div class="zg-sp-drawer__cell"><span class="lbl">终端型号</span><span class="val">{{ detailFocus.model }}</span></div>
            <div class="zg-sp-drawer__cell"><span class="lbl">额定功率</span><span class="val">{{ detailFocus.powerKw }} kW</span></div>
            <div class="zg-sp-drawer__cell"><span class="lbl">供电电压</span><span class="val">{{ detailFocus.voltage }}</span></div>
            <div class="zg-sp-drawer__cell"><span class="lbl">挂装灯杆</span><span class="val">{{ detailFocus.poleId }}</span></div>
            <div class="zg-sp-drawer__cell"><span class="lbl">投运日期</span><span class="val">{{ detailFocus.installDate }}</span></div>
            <div class="zg-sp-drawer__cell zg-sp-drawer__cell--full"><span class="lbl">安装位置</span><span class="val">{{ detailFocus.location }}</span></div>
            <div class="zg-sp-drawer__cell zg-sp-drawer__cell--full"><span class="lbl">二维码 Token</span><span class="val code">{{ detailFocus.qrToken }}</span></div>
          </div>
        </section>

        <!-- Tab：实时数据 / 今日曲线 / 历史告警 -->
        <el-tabs v-model="drawerTab">
          <el-tab-pane label="⚡ 实时数据" name="realtime">
            <div class="zg-sp-drawer__rt-grid">
              <div class="zg-sp-drawer__rt-card">
                <div class="zg-sp-drawer__rt-head">A 相 · 电压电流</div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Ua</span><span class="val">{{ detailFocus.telemetry.Ua }} V</span>
                  <el-progress :percentage="voltPct(detailFocus.telemetry.Ua)" :stroke-width="6" :show-text="false" />
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Ia</span><span class="val">{{ detailFocus.telemetry.Ia }} A</span>
                  <el-progress :percentage="ampPct(detailFocus.telemetry.Ia)" status="success" :stroke-width="6" :show-text="false" />
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Pa</span><span class="val">{{ detailFocus.telemetry.Pa }} kW</span>
                </div>
              </div>
              <div class="zg-sp-drawer__rt-card">
                <div class="zg-sp-drawer__rt-head">B 相 · 电压电流</div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Ub</span><span class="val">{{ detailFocus.telemetry.Ub }} V</span>
                  <el-progress :percentage="voltPct(detailFocus.telemetry.Ub)" :stroke-width="6" :show-text="false" />
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Ib</span><span class="val">{{ detailFocus.telemetry.Ib }} A</span>
                  <el-progress :percentage="ampPct(detailFocus.telemetry.Ib)" status="success" :stroke-width="6" :show-text="false" />
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Pb</span><span class="val">{{ detailFocus.telemetry.Pb }} kW</span>
                </div>
              </div>
              <div class="zg-sp-drawer__rt-card">
                <div class="zg-sp-drawer__rt-head">C 相 · 电压电流</div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Uc</span><span class="val">{{ detailFocus.telemetry.Uc }} V</span>
                  <el-progress :percentage="voltPct(detailFocus.telemetry.Uc)" :stroke-width="6" :show-text="false" />
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Ic</span><span class="val">{{ detailFocus.telemetry.Ic }} A</span>
                  <el-progress :percentage="ampPct(detailFocus.telemetry.Ic)" status="success" :stroke-width="6" :show-text="false" />
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">Pc</span><span class="val">{{ detailFocus.telemetry.Pc }} kW</span>
                </div>
              </div>
              <div class="zg-sp-drawer__rt-card zg-sp-drawer__rt-card--accent">
                <div class="zg-sp-drawer__rt-head">总览</div>
                <div class="zg-sp-drawer__rt-row big">
                  <span class="lbl">总有功</span>
                  <span class="val">{{ detailFocus.telemetry.totalP }} kW</span>
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">功率因数</span><span class="val">{{ detailFocus.telemetry.powerFactor }}</span>
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">频率</span><span class="val">{{ detailFocus.telemetry.freq }} Hz</span>
                </div>
                <div class="zg-sp-drawer__rt-row">
                  <span class="lbl">三相不平衡度</span>
                  <span class="val" :class="unbalancePct(detailFocus) > 5 ? 'warn' : 'ok'">
                    {{ unbalancePct(detailFocus) }}%
                  </span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="📈 今日用电曲线" name="curve">
            <div class="zg-sp-curve">
              <div class="zg-sp-curve__meta">
                <div><strong>今日累计</strong> {{ (detailFocus.todayOrders * 4.2).toFixed(1) }} kWh</div>
                <div><strong>峰值</strong> {{ Math.max(...detailFocus.hourly24).toFixed(1) }} kW</div>
                <div><strong>谷值</strong> {{ Math.min(...detailFocus.hourly24).toFixed(1) }} kW</div>
                <div><strong>平均</strong> {{ avg24(detailFocus.hourly24).toFixed(1) }} kW</div>
              </div>
              <div class="zg-sp-curve__bars">
                <div
                  v-for="(v, h) in detailFocus.hourly24"
                  :key="h"
                  class="zg-sp-curve__bar"
                  :title="h + ':00 · ' + v.toFixed(1) + ' kW'"
                >
                  <div
                    class="zg-sp-curve__bar-fill"
                    :style="{ height: (v / Math.max(...detailFocus.hourly24, 1) * 100) + '%' }"
                  ></div>
                  <span class="zg-sp-curve__bar-lbl">{{ h }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🔔 历史告警" name="alarms">
            <el-timeline v-if="detailFocus.alarms?.length">
              <el-timeline-item
                v-for="(a, idx) in detailFocus.alarms"
                :key="idx"
                :timestamp="a.time"
                :type="alarmTypeMap[a.level]"
              >
                <div class="zg-sp-alarm">
                  <div class="zg-sp-alarm__title">{{ a.title }}</div>
                  <div class="zg-sp-alarm__desc">{{ a.desc }}</div>
                  <el-tag size="small" :type="alarmTypeMap[a.level]" effect="light">{{ a.level }}</el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="近 30 天无告警" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <!-- ========================================================= -->
    <!-- Drawer: 安全配置详情（阈值 + 防护日志）                    -->
    <!-- ========================================================= -->
    <el-drawer v-model="safetyDrawerVisible" :title="'安全配置 · ' + safetyFocus?.id + ' · ' + safetyFocus?.location" size="620px">
      <div v-if="safetyFocus" class="zg-sp-safety-drawer">
        <section class="zg-sp-drawer__section">
          <h4 class="zg-sp-drawer__title">🔧 五重安全策略 · 阈值调整</h4>

          <!-- 1 漏电保护 -->
          <div class="zg-sp-safety-block">
            <div class="zg-sp-safety-block__head">
              <el-switch v-model="safetyFocus.safety.leakageEnabled" />
              <span><el-icon><Lock /></el-icon>漏电保护</span>
              <el-tag type="info" size="small" effect="light">默认 30mA</el-tag>
            </div>
            <el-slider
              v-if="safetyFocus.safety.leakageEnabled"
              v-model="safetyFocus.safety.leakageTh"
              :min="10" :max="100" :step="1"
              :marks="{ 10: '10mA', 30: '30mA', 50: '50mA', 100: '100mA' }"
            />
          </div>

          <!-- 2 过载保护 -->
          <div class="zg-sp-safety-block">
            <div class="zg-sp-safety-block__head">
              <el-switch v-model="safetyFocus.safety.overloadEnabled" />
              <span><el-icon><Lock /></el-icon>过载保护</span>
              <el-tag type="info" size="small" effect="light">默认 120% 额定</el-tag>
            </div>
            <el-slider
              v-if="safetyFocus.safety.overloadEnabled"
              v-model="safetyFocus.safety.overloadPct"
              :min="80" :max="150" :step="5"
              :marks="{ 80: '80%', 100: '100%', 120: '120%', 150: '150%' }"
            />
          </div>

          <!-- 3 短路保护 -->
          <div class="zg-sp-safety-block">
            <div class="zg-sp-safety-block__head">
              <el-switch v-model="safetyFocus.safety.shortCircuitEnabled" />
              <span><el-icon><Lock /></el-icon>短路保护</span>
              <el-tag type="danger" size="small" effect="light">μs 级响应</el-tag>
            </div>
            <div class="zg-sp-safety-block__radio">
              <el-radio-group v-if="safetyFocus.safety.shortCircuitEnabled" v-model="safetyFocus.safety.shortCircuitMs">
                <el-radio :value="50">50ms</el-radio>
                <el-radio :value="100">100ms（推荐）</el-radio>
                <el-radio :value="200">200ms</el-radio>
                <el-radio :value="500">500ms</el-radio>
              </el-radio-group>
            </div>
          </div>

          <!-- 4 超时断电 -->
          <div class="zg-sp-safety-block">
            <div class="zg-sp-safety-block__head">
              <el-switch v-model="safetyFocus.safety.timeoutEnabled" />
              <span><el-icon><Unlock /></el-icon>超时自动断电</span>
              <el-tag type="warning" size="small" effect="light">默认 24h</el-tag>
            </div>
            <el-slider
              v-if="safetyFocus.safety.timeoutEnabled"
              v-model="safetyFocus.safety.timeoutHours"
              :min="1" :max="72" :step="1"
              :marks="{ 1: '1h', 8: '8h', 24: '24h', 48: '48h', 72: '72h' }"
            />
          </div>

          <!-- 5 余额阈值 -->
          <div class="zg-sp-safety-block">
            <div class="zg-sp-safety-block__head">
              <el-switch v-model="safetyFocus.safety.balanceEnabled" />
              <span><el-icon><Lock /></el-icon>余额告警</span>
              <el-tag type="info" size="small" effect="light">≤ ¥5 推送告警</el-tag>
            </div>
            <div class="zg-sp-safety-block__radio" v-if="safetyFocus.safety.balanceEnabled">
              <span>阈值 ¥</span>
              <el-input-number
                v-model="safetyFocus.safety.balanceThreshold"
                :min="1" :max="50" :step="1"
                size="small"
              />
            </div>
          </div>
        </section>

        <section class="zg-sp-drawer__section">
          <h4 class="zg-sp-drawer__title">📑 防护日志 · 最近 50 条</h4>
          <el-table :data="safetyTriggerLogs" size="small" stripe max-height="320">
            <el-table-column label="时间" prop="time" width="170" />
            <el-table-column label="类型" prop="type" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="row.tag" effect="light">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="详情" prop="detail" min-width="220" />
            <el-table-column label="处理" prop="status" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === '已处理' ? 'success' : 'warning'" effect="plain">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </div>
      <template #footer>
        <el-button @click="safetyDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSafetyConfig">保存配置</el-button>
      </template>
    </el-drawer>

    <!-- ========================================================= -->
    <!-- Drawer: 登记终端                                           -->
    <!-- ========================================================= -->
    <el-drawer v-model="registerVisible" title="登记新终端" size="560px">
      <el-form :model="registerForm" label-width="110px">
        <el-form-item label="终端型号">
          <el-select v-model="registerForm.model" style="width: 100%">
            <el-option label="ZG-SP-100 · 100kW 380V" value="ZG-SP-100" />
            <el-option label="ZG-SP-30  · 30kW  220V" value="ZG-SP-30" />
            <el-option label="ZG-SP-200 · 200kW 工业级" value="ZG-SP-200" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在区域">
          <el-select v-model="registerForm.district" style="width: 100%">
            <el-option v-for="d in districtList" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细位置">
          <el-input v-model="registerForm.location" placeholder="如：先导路工地东侧 / 麓谷产业园 B3 栋" />
        </el-form-item>
        <el-form-item label="挂装灯杆">
          <el-input v-model="registerForm.poleId" placeholder="如：ZLS-P-2024-0382" />
        </el-form-item>
        <el-form-item label="投运日期">
          <el-date-picker v-model="registerForm.installDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="安全策略">
          <el-checkbox-group v-model="registerForm.safetyDefault">
            <el-checkbox label="leakage">漏电保护 30mA</el-checkbox>
            <el-checkbox label="overload">过载保护 120%</el-checkbox>
            <el-checkbox label="short">短路保护 100ms</el-checkbox>
            <el-checkbox label="timeout">超时 24h 断电</el-checkbox>
            <el-checkbox label="balance">余额 ≤ ¥5 告警</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registerVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRegister">提交登记</el-button>
      </template>
    </el-drawer>

    <!-- ========================================================= -->
    <!-- Dialog: QR 大码（SVG 25×25 + 中心 logo + 下载/打印）        -->
    <!-- ========================================================= -->
    <el-dialog
      v-model="qrcodeDialogVisible"
      :title="'终端扫码二维码 · ' + qrcodeFocus?.id"
      width="520px"
      center
    >
      <div class="zg-sp__qr-dialog" v-if="qrcodeFocus">
        <div class="zg-sp__qr-dialog-main">
          <!-- 25×25 伪 QR -->
          <div class="zg-sp__qr-box-large">
            <svg viewBox="0 0 25 25" width="200" height="200" class="zg-sp__qr-large">
              <!-- 3 定位角 -->
              <g fill="#000">
                <rect x="0" y="0" width="7" height="7" />
                <rect x="1" y="1" width="5" height="5" fill="#fff" />
                <rect x="2" y="2" width="3" height="3" />
                <rect x="18" y="0" width="7" height="7" />
                <rect x="19" y="1" width="5" height="5" fill="#fff" />
                <rect x="20" y="2" width="3" height="3" />
                <rect x="0" y="18" width="7" height="7" />
                <rect x="1" y="19" width="5" height="5" fill="#fff" />
                <rect x="2" y="20" width="3" height="3" />
              </g>
              <!-- 辅助定位 -->
              <g fill="#000">
                <rect x="18" y="18" width="7" height="7" />
                <rect x="19" y="19" width="5" height="5" fill="#fff" />
                <rect x="20" y="20" width="3" height="3" />
              </g>
              <!-- 数据点 -->
              <g v-for="(cell, idx) in getQrMatrix(qrcodeFocus.id)" :key="idx" fill="#000">
                <rect v-if="cell" :x="(idx % 25)" :y="Math.floor(idx / 25)" width="1" height="1" />
              </g>
              <!-- 中心 logo（渐变圆 + ZG） -->
              <rect x="10" y="10" width="5" height="5" fill="#fff" rx="1" />
              <circle cx="12.5" cy="12.5" r="2" fill="url(#zg-dialog-gradient)" />
              <defs><linearGradient id="zg-dialog-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient></defs>
              <text x="12.5" y="13" text-anchor="middle" font-size="1.6" fill="#fff" font-weight="700" font-family="sans-serif">ZG</text>
            </svg>
          </div>

          <!-- 终端信息 -->
          <div class="zg-sp__qr-info-panel">
            <div class="zg-sp__qr-info-title">{{ qrcodeFocus.location }}</div>
            <div class="zg-sp__qr-info-row"><span>型号</span><strong>{{ qrcodeFocus.model }}</strong></div>
            <div class="zg-sp__qr-info-row"><span>功率</span><strong>{{ qrcodeFocus.powerKw }}kW · {{ qrcodeFocus.voltage }}</strong></div>
            <div class="zg-sp__qr-info-row"><span>状态</span>
              <el-tag size="small" :type="statusTagType[qrcodeFocus.status]" effect="dark" round>
                {{ statusLabel[qrcodeFocus.status] }}
              </el-tag>
            </div>
            <div class="zg-sp__qr-security">
              <div class="zg-sp__qr-security-title">🔐 唯一二维码说明</div>
              <ul>
                <li>加密 Token：<code>{{ qrcodeFocus.qrToken }}</code></li>
                <li>过期时间：<code>{{ qrcodeFocus.qrExpire }}</code></li>
                <li>防篡改校验：<code>{{ qrcodeFocus.qrChecksum }}</code></li>
                <li>每台终端唯一，扫码直接下发用电合约</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="zg-sp__qr-actions">
          <el-button type="primary" size="large" @click="downloadQrPng(qrcodeFocus)">
            <el-icon><Download /></el-icon>下载 PNG
          </el-button>
          <el-button type="success" size="large" @click="printQrA4(qrcodeFocus)">
            <el-icon><Printer /></el-icon>打印 A4
          </el-button>
          <el-button size="large" @click="regenerateQr(qrcodeFocus)">
            <el-icon><Refresh /></el-icon>重新生成（新 Token）
          </el-button>
        </div>
      </div>
    </el-dialog>
  </section>
</template>

<script setup>
/**
 * 智光云枢 · 扫码共享用电终端台账 + 二维码中心
 * poleBiz 域
 * 4 Tab · 3 Drawer · 1 Dialog · 25×25 伪 QR（基于 hash 保证一致性）
 */
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Grid, Plus, Refresh, Location, Camera, Share, Download, Printer,
  Histogram, Bell, View, Setting, Warning, Lock, Unlock, Search
} from '@element-plus/icons-vue'

// =============== 常量 =================
const districtList = ['先导路工地', '麓谷产业园', '梅溪湖商业街', '金星大道农业合作社', '岳麓山景区露营地']
const statusLabel = { USING: '通电中', IDLE: '空闲', FAULT: '故障', OFFLINE: '离线' }
const statusTagType = { USING: 'success', IDLE: 'info', FAULT: 'danger', OFFLINE: 'info' }
const alarmTypeMap = {
  CRITICAL: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  OK: 'success'
}
const postingStatusMap = {
  NOT_POSTED: { label: '未张贴', tag: 'info' },
  POSTED_OK: { label: '已张贴', tag: 'success' },
  NEED_REPLACE: { label: '需更换', tag: 'warning' }
}

// =============== 状态 =================
const activeTab = ref('ledger')
const keyword = ref('')
const filterDistrict = ref('')
const filterModel = ref('')
const filterStatus = ref('')
const page = ref(1)
const pageSize = ref(16)
const safetyPage = ref(1)
const safetyPageSize = ref(10)
const telemPage = ref(1)
const telemPageSize = ref(12)

const selectedPostId = ref('ZG-SP-0001')
const drawerTab = ref('realtime')

// Drawers / Dialogs
const registerVisible = ref(false)
const detailDrawerVisible = ref(false)
const safetyDrawerVisible = ref(false)
const qrcodeDialogVisible = ref(false)

const detailFocus = ref(null)
const safetyFocus = ref(null)
const qrcodeFocus = ref(null)

// =============== 伪 QR 生成（25×25 黑块矩阵） =================
// 用字符串 hash 生成确定值（同一终端每次生成的码一致）
function strHash(str) {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

function getQrMatrix(id) {
  const size = 25
  const seed = strHash(id + '::qr')
  const total = size * size
  // 0 白 / 1 黑
  const mat = new Array(total).fill(0)
  let rng = seed
  const rnd = () => {
    // Mulberry32
    rng = (rng + 0x6D2B79F5) >>> 0
    let t = rng
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = 0; i < total; i++) mat[i] = rnd() > 0.5 ? 1 : 0
  // 清掉三个定位角区域（让 SVG 中的三角占据这些位置）
  const clear = (x, y, w, h) => {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) {
        const cx = x + dx, cy = y + dy
        if (cx < size && cy < size) mat[cy * size + cx] = 0
      }
  }
  clear(0, 0, 7, 7)
  clear(18, 0, 7, 7)
  clear(0, 18, 7, 7)
  clear(18, 18, 7, 7)
  clear(10, 10, 5, 5) // 中心 logo
  return mat
}

// =============== Mock 数据生成（128 台终端） =================
function genTerminals() {
  const list = []
  const models = [
    { model: 'ZG-SP-100', powerKw: 100, voltage: '380V 三相' },
    { model: 'ZG-SP-30', powerKw: 30, voltage: '220V 单相' },
    { model: 'ZG-SP-200', powerKw: 200, voltage: '380V 三相工业级' }
  ]
  const statuses = ['USING', 'USING', 'USING', 'USING', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'FAULT', 'OFFLINE']
  const postingStatuses = ['POSTED_OK', 'POSTED_OK', 'POSTED_OK', 'NOT_POSTED', 'NEED_REPLACE']

  for (let i = 1; i <= 128; i++) {
    const m = models[i % 3]
    const district = districtList[i % districtList.length]
    const status = statuses[i % statuses.length]
    const posting = postingStatuses[i % postingStatuses.length]

    // 伪随机生成三相实时遥测（有一定波动）
    const jitter = (base, range) => Math.round((base + (Math.sin(i * 0.7 + base) * range)) * 10) / 10
    const Ua = jitter(220, 8), Ub = jitter(220, 8), Uc = jitter(220, 8)
    const Ia = jitter(5 + (i % 7) * 2, 2)
    const Ib = jitter(4 + (i % 6) * 2, 2)
    const Ic = jitter(4 + (i % 5) * 2, 2)
    const Pa = Math.round(Ua * Ia * 0.85 / 1000 * 10) / 10
    const Pb = Math.round(Ub * Ib * 0.85 / 1000 * 10) / 10
    const Pc = Math.round(Uc * Ic * 0.85 / 1000 * 10) / 10
    const totalP = Math.round((Pa + Pb + Pc) * 10) / 10

    // 24h 曲线
    const hourly24 = Array.from({ length: 24 }, (_, h) => {
      const base = Math.max(0, Math.sin((h - 6) / 24 * Math.PI * 2) * 60 + 30)
      return Math.round((base + (i % 10)) * 10) / 10
    })

    // 告警历史
    const alarmCount = i % 4 === 0 ? 2 : i % 7 === 0 ? 1 : 0
    const alarms = []
    if (alarmCount > 0) {
      const alarmPool = [
        { title: '电压偏差异常', level: 'WARNING', desc: 'Ua 达到 245V，超出标准 +10%' },
        { title: '过载保护触发', level: 'CRITICAL', desc: '电流达到 132% 额定，已自动断电' },
        { title: '通讯心跳超时', level: 'WARNING', desc: '平台 3 次未收到心跳，已恢复' },
        { title: '漏电告警', level: 'CRITICAL', desc: '检测到 42mA 漏电流，立即切断' }
      ]
      for (let a = 0; a < alarmCount; a++) {
        const p = alarmPool[(i + a) % alarmPool.length]
        alarms.push({
          ...p,
          time: `2026-10-${10 + (i % 17)} ${8 + a}:${(i * 7) % 60}`
        })
      }
    }

    // 今日数据
    const todayOrders = i % 11 + (status === 'USING' ? 5 : 0)
    const todayIncome = Math.round(todayOrders * (20 + (i % 30)) * 100) / 100

    // QR Token / 过期
    const qrToken = 'ZG' + strHash('token-' + i).toString(36).toUpperCase().slice(-10)
    const qrGeneratedAt = `2026-09-${15 + (i % 12)} 09:${(i * 3) % 60}`
    const qrExpire = `2027-09-${15 + (i % 12)} 09:${(i * 3) % 60}`
    const qrChecksum = '8f' + strHash('sha-' + i).toString(16).slice(-8) + 'c3'

    // QR 生命周期
    const qrLifecycle = [
      { time: qrGeneratedAt, title: '二维码生成', detail: `加密 Token · ${qrToken}`, type: 'primary' },
      { time: `2026-09-${20 + (i % 10)} 14:30`, title: '打印 A4 标签', detail: '小尺寸 120×120mm 亮面铜版纸', type: 'success' },
      { time: `2026-09-${25 + (i % 10)} 10:00`, title: '现场张贴', detail: '距地面 1.4m 灯杆侧面', by: '运维王工', type: 'success' }
    ]
    if (posting === 'NEED_REPLACE') {
      qrLifecycle.push({ time: `2026-10-2${i % 6} 08:30`, title: '二维码损坏告警', detail: '风吹日晒磨损，识别率 < 50%', type: 'warning' })
    }

    list.push({
      id: 'ZG-SP-' + String(i).padStart(4, '0'),
      model: m.model,
      powerKw: m.powerKw,
      voltage: m.voltage,
      poleId: 'ZLS-P-' + (20240000 + i),
      installDate: `2024-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 27 + 1).padStart(2, '0')}`,
      location: `${district} · ${['工地东区', '工地西区', '产业园 B' + (i % 5), '商业街中庭', '农业合作社东入口', '露营地主帐篷'][i % 6]}`,
      district,
      status,
      todayOrders,
      todayIncome,
      totalOrders: 1000 + i * 111,
      telemetry: { Ua, Ub, Uc, Ia, Ib, Ic, Pa, Pb, Pc, totalP, powerFactor: (0.85 + (i % 10) / 100).toFixed(2), freq: (49.9 + (i % 7) / 10).toFixed(2) },
      hourly24,
      alarms,
      postingStatus: posting,
      qrToken,
      qrGeneratedAt,
      qrExpire,
      qrChecksum,
      qrLifecycle,
      safety: {
        leakageEnabled: true,
        leakageTh: 30,
        overloadEnabled: true,
        overloadPct: 120,
        shortCircuitEnabled: true,
        shortCircuitMs: 100,
        timeoutEnabled: true,
        timeoutHours: 24,
        balanceEnabled: true,
        balanceThreshold: 5,
        trigger7d: i % 6 === 0 ? 1 + (i % 3) : 0
      }
    })
  }
  return list
}

const rawList = ref(genTerminals())

// =============== 登记表单 =================
const registerForm = reactive({
  model: 'ZG-SP-100',
  district: '先导路工地',
  location: '',
  poleId: '',
  installDate: '',
  safetyDefault: ['leakage', 'overload', 'short', 'timeout', 'balance']
})

// =============== 计算属性 =================
const totalCount = computed(() => rawList.value.length)
const usingCount = computed(() => rawList.value.filter(r => r.status === 'USING').length)
const idleCount = computed(() => rawList.value.filter(r => r.status === 'IDLE').length)
const faultCount = computed(() => rawList.value.filter(r => r.status === 'FAULT').length)
const todayIncome = computed(() => rawList.value.reduce((s, r) => s + r.todayIncome, 0).toFixed(2))
const totalOrders = computed(() => rawList.value.reduce((s, r) => s + r.totalOrders, 0))

const filteredList = computed(() => rawList.value.filter(r => {
  if (filterDistrict.value && r.district !== filterDistrict.value) return false
  if (filterModel.value && r.model !== filterModel.value) return false
  if (filterStatus.value && r.status !== filterStatus.value) return false
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    if (!r.id.toLowerCase().includes(kw) && !r.location.includes(kw) && !r.model.includes(kw)) return false
  }
  return true
}))

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

// Tab2：QR 生命周期（取前 24 台）
const qrLifecycleList = computed(() => rawList.value.slice(0, 24))
const selectedPostFocus = computed(() => rawList.value.find(t => t.id === selectedPostId.value))

// Tab3：安全配置表格
const safetyTableData = computed(() => {
  const start = (safetyPage.value - 1) * safetyPageSize.value
  return rawList.value.slice(start, start + safetyPageSize.value)
})
const safetyConfiguredCount = computed(() => rawList.value.filter(r =>
  r.safety.leakageEnabled && r.safety.overloadEnabled && r.safety.shortCircuitEnabled
).length)
const safetyTriggerCount = computed(() => rawList.value.reduce((s, r) => s + (r.safety.trigger7d || 0), 0))
const safetyQualifiedRate = computed(() => Math.round(safetyConfiguredCount.value / totalCount.value * 100))

// Tab4：遥测列表
const telemetryList = computed(() => {
  const start = (telemPage.value - 1) * telemPageSize.value
  return rawList.value.slice(start, start + telemPageSize.value)
})

// 抽屉：防护日志 mock
const safetyTriggerLogs = computed(() => {
  if (!safetyFocus.value) return []
  const types = ['漏电保护', '过载保护', '短路保护', '超时断电', '余额告警']
  const tags = ['danger', 'warning', 'danger', 'info', 'warning']
  const logs = []
  const count = safetyFocus.value.safety.trigger7d || 3
  for (let i = 0; i < count; i++) {
    logs.push({
      time: `2026-10-${20 - i} ${10 + i}:${((i * 13) % 60).toString().padStart(2, '0')}:12`,
      type: types[(i + safetyFocus.value.id.charCodeAt(6)) % 5],
      detail: '阈值触发，自动断电并推送告警至运维 APP',
      status: i < count - 1 ? '已处理' : '待核实',
      tag: tags[(i + 2) % 5]
    })
  }
  return logs
})

// =============== 事件 =================
const refreshData = () => {
  rawList.value = genTerminals()
  ElMessage.success('128 台终端数据已刷新')
}

const openDetailDrawer = (t) => {
  detailFocus.value = t
  drawerTab.value = 'realtime'
  detailDrawerVisible.value = true
}

const openSafetyDrawer = (t) => {
  safetyFocus.value = t
  safetyDrawerVisible.value = true
}

const openTelemetryDrawer = (row) => openDetailDrawer(row)

const showQrcodeDialog = (t) => {
  qrcodeFocus.value = t
  qrcodeDialogVisible.value = true
}

const remoteCutoff = (t) => {
  ElMessageBox.confirm(
    `确认对终端 ${t.id} 执行远程断电吗？这将立即切断该终端的供电。`,
    '远程断电 · 二次确认',
    { type: 'warning', confirmButtonText: '立即断电', cancelButtonText: '取消' }
  ).then(() => {
    t.status = 'IDLE'
    ElMessage.success(`${t.id} 已执行远程断电，电流归零`)
  }).catch(() => {})
}

const batchGenerate = () => ElMessage.success(`已批量生成 ${qrLifecycleList.value.length} 台终端的 QR 码`)
const batchPrint = () => ElMessage.info('已发送批量打印任务至 A4 打印机（含唯一 token 水印）')
const saveSafetyConfig = () => {
  safetyDrawerVisible.value = false
  ElMessage.success(`已保存 ${safetyFocus.value?.id} 安全配置`)
}

const submitRegister = () => {
  if (!registerForm.location) return ElMessage.warning('请填写详细位置')
  registerVisible.value = false
  ElMessage.success('终端登记成功，已分配 QR 码并纳入台账')
}

const downloadQrPng = (t) => {
  ElMessage.success(`${t.id} QR 码下载中 · 200×200 PNG`)
}
const printQrA4 = (t) => {
  ElMessage.success(`已发送 ${t.id} QR 至 A4 打印机（120×120mm 贴纸模板）`)
}
const regenerateQr = (t) => {
  ElMessageBox.confirm(`重新生成 ${t.id} 的 QR 码将废弃旧 Token，继续？`, '确认重新生成').then(() => {
    t.qrToken = 'ZG' + Math.random().toString(36).slice(2, 12).toUpperCase()
    ElMessage.success('新 QR 已生成，旧码已失效')
  }).catch(() => {})
}

// =============== 辅助工具 =================
const voltPct = (v) => Math.min(100, Math.max(0, (v - 180) / 80 * 100))
const ampPct = (a) => Math.min(100, Math.max(0, a * 5))
const unbalancePct = (t) => {
  const { Ua, Ub, Uc } = t.telemetry
  const avg = (Ua + Ub + Uc) / 3
  const maxDiff = Math.max(Math.abs(Ua - avg), Math.abs(Ub - avg), Math.abs(Uc - avg))
  return Math.round(maxDiff / avg * 1000) / 10
}
const avg24 = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length

onMounted(() => {})
</script>

<style scoped lang="scss">
/* ==================== 容器 ==================== */
.zg-sp {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #f6f8fb;
  min-height: calc(100vh - 40px);
}

/* ==================== 头部 ==================== */
.zg-sp__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  padding: 16px 22px;
  border: 1px solid #eef0f4;
}
.zg-sp__headline { display: flex; align-items: center; gap: 14px; }
.zg-sp__sigil {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #1e3a8a, #6366f1, #8b5cf6);
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}
.zg-sp__title { font-size: 20px; font-weight: 700; color: #1f2d3d; margin: 0 0 4px; letter-spacing: 0.3px; }
.zg-sp__sub { font-size: 13px; color: #909399; margin: 0; }
.zg-sp__cta { display: flex; gap: 10px; }

/* ==================== KPI ==================== */
.zg-sp-kpi {
  display: flex; gap: 12px;
  background: #fff; border-radius: 14px; padding: 14px;
  border: 1px solid #eef0f4;
}
.zg-sp-kpi__cell {
  flex: 1; min-width: 160px;
  display: flex; align-items: center; gap: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: all 0.2s;
}
.zg-sp-kpi__cell--wide { flex: 1.2; }
.zg-sp-kpi__cell:hover { background: #f8fafc; }
.zg-sp-kpi__icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.zg-sp-kpi__icon--grid { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.zg-sp-kpi__icon--ok   { background: linear-gradient(135deg, #10b981, #34d399); }
.zg-sp-kpi__icon--info { background: linear-gradient(135deg, #0ea5e9, #22d3ee); }
.zg-sp-kpi__icon--warn { background: linear-gradient(135deg, #f59e0b, #f97316); }
.zg-sp-kpi__icon--danger { background: linear-gradient(135deg, #ef4444, #f43f5e); }
.zg-sp-kpi__body { display: flex; flex-direction: column; gap: 2px; }
.zg-sp-kpi__num { font-size: 22px; font-weight: 700; color: #1f2d3d; font-family: 'JetBrains Mono', monospace; }
.zg-sp-kpi__num--ok   { color: #059669; }
.zg-sp-kpi__num--info { color: #0284c7; }
.zg-sp-kpi__num--warn { color: #d97706; font-size: 20px; }
.zg-sp-kpi__num--danger { color: #dc2626; }
.zg-sp-kpi__lbl { font-size: 12px; color: #909399; }

/* ==================== Tab ==================== */
.zg-sp__tabs {
  background: #fff; border-radius: 14px;
  padding: 14px 18px 18px;
  border: 1px solid #eef0f4;
}
.zg-sp__tabs :deep(.el-tabs__item) { font-size: 14px; font-weight: 500; }

/* ==================== 工具栏 ==================== */
.zg-sp__toolbar {
  display: flex; gap: 10px; align-items: center;
  background: #f8fafc; border-radius: 10px; padding: 10px 12px;
  margin-bottom: 14px; flex-wrap: wrap;
}
.zg-sp__toolbar-right { margin-left: auto; }

/* ==================== 卡片网格 ==================== */
.zg-sp-card-grid { margin-bottom: 14px; }
.zg-sp-card {
  background: #fff; border-radius: 12px; border: 1px solid #eef0f4;
  padding: 14px; margin-bottom: 14px;
  transition: all 0.2s;
  display: flex; flex-direction: column; gap: 8px;
  position: relative; overflow: hidden;
}
.zg-sp-card:hover {
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
  transform: translateY(-3px);
  border-color: #c7d2fe;
}
.zg-sp-card--using { border-top: 3px solid #10b981; }
.zg-sp-card--fault { border-top: 3px solid #ef4444; background: #fefaf8; }
.zg-sp-card--offline { border-top: 3px solid #a855f7; }

.zg-sp-card__top { display: flex; justify-content: space-between; align-items: center; }
.zg-sp-card__id { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #1f2d3d; }

.zg-sp-card__body { display: flex; flex-direction: column; gap: 6px; }
.zg-sp-card__name {
  font-size: 13px; color: #4b5563; display: flex; align-items: center; gap: 4px;
  line-height: 1.3;
}
.zg-sp-card__spec-row { display: flex; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
.zg-sp-card__spec { font-size: 12px; color: #6366f1; font-family: monospace; }
.zg-sp-card__spec--volt { color: #f59e0b; }

.zg-sp-card__today { display: flex; gap: 8px; background: #f8fafc; border-radius: 8px; padding: 8px; }
.zg-sp-card__today-cell { flex: 1; text-align: center; display: flex; flex-direction: column; gap: 2px; }
.zg-sp-card__today-num { font-size: 16px; font-weight: 700; color: #1f2d3d; font-family: monospace; }
.zg-sp-card__today-num--warn { color: #d97706; }
.zg-sp-card__today-lbl { font-size: 11px; color: #909399; }

.zg-sp-card__mid { display: flex; gap: 10px; align-items: center; }
.zg-sp-card__qr {
  width: 64px; height: 64px; border-radius: 8px; border: 1px dashed #cbd5e1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; background: #fff; flex-shrink: 0;
  transition: all 0.2s;
}
.zg-sp-card__qr:hover { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15); }
.zg-sp-card__qr-tip { font-size: 9px; color: #6366f1; margin-top: 2px; }
.zg-sp-card__qr-svg { background: #fff; display: block; }

.zg-sp-card__safety { flex: 1; }
.zg-sp-card__safety-title { font-size: 11px; color: #606266; margin-bottom: 4px; }
.zg-sp-card__safety-list { display: flex; flex-wrap: wrap; gap: 4px 8px; font-size: 10px; }
.zg-sp-card__safety-list span {
  display: inline-flex; align-items: center; gap: 2px; color: #10b981;
}
.zg-sp-card__safety-list span.warn { color: #f59e0b; }
.zg-sp-card__safety-list .el-icon { font-size: 11px; }

.zg-sp-card__actions {
  border-top: 1px solid #f1f5f9; padding-top: 8px;
  display: flex; gap: 4px; justify-content: space-between; flex-wrap: wrap;
}

/* ==================== 分页 ==================== */
.zg-sp__pagination {
  display: flex; justify-content: flex-end; padding: 4px 0;
}

/* ==================== Tab2 张贴管理 ==================== */
.zg-sp__posting-wrap { display: flex; gap: 14px; min-height: 520px; }
.zg-sp__posting-list {
  width: 340px; background: #f8fafc; border-radius: 12px; padding: 12px;
  display: flex; flex-direction: column; gap: 10px;
  flex-shrink: 0;
}
.zg-sp__posting-list-head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;
}
.zg-sp__posting-list-head strong { font-size: 14px; color: #1f2d3d; }
.zg-sp__posting-list-sub { font-size: 12px; color: #909399; }
.zg-sp__posting-list-body { overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.zg-sp__posting-item {
  background: #fff; border-radius: 10px; padding: 10px; cursor: pointer;
  border: 1px solid #e2e8f0; transition: all 0.2s;
}
.zg-sp__posting-item:hover { border-color: #c7d2fe; }
.zg-sp__posting-item.active { border-color: #6366f1; background: #eef2ff; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.zg-sp__posting-item-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.zg-sp__posting-item-id { font-family: monospace; font-size: 12px; color: #1f2d3d; font-weight: 700; }
.zg-sp__posting-item-loc { font-size: 11px; color: #606266; display: flex; align-items: center; gap: 2px; margin-bottom: 6px; }
.zg-sp__posting-item-qr { display: flex; gap: 8px; align-items: center; }
.zg-sp__posting-item-qr svg { border-radius: 4px; border: 1px solid #e2e8f0; }
.zg-sp__posting-item-code { font-size: 10px; color: #909399; font-family: monospace; }
.zg-sp__posting-item-exp { color: #c0c4cc; font-size: 9px; }

.zg-sp__posting-main { flex: 1; display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.zg-sp__posting-head {
  background: #fff; border-radius: 12px; padding: 14px 16px;
  display: flex; justify-content: space-between; align-items: center;
  border: 1px solid #e2e8f0;
}
.zg-sp__posting-head strong { font-size: 15px; color: #1f2d3d; }
.zg-sp__posting-loc { font-size: 12px; color: #606266; margin-left: 6px; }
.zg-sp__batch { display: flex; gap: 8px; }

.zg-sp__posting-detail { display: flex; flex-direction: column; gap: 14px; }
.zg-sp__posting-preview {
  background: #fff; border-radius: 12px; padding: 18px;
  display: flex; gap: 20px; border: 1px solid #e2e8f0;
}
.zg-sp__posting-qr-box {
  flex-shrink: 0; background: #fff; border: 2px solid #6366f1; border-radius: 12px; padding: 14px;
}
.zg-sp__posting-qr-info { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.zg-sp__posting-qr-row {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; border-radius: 8px; padding: 8px 12px;
}
.zg-sp__posting-qr-row span { font-size: 12px; color: #909399; }
.zg-sp__posting-qr-row code { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #1f2d3d; }

.zg-sp__posting-timeline {
  background: #fff; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;
}
.zg-sp__posting-tl-title { font-size: 14px; font-weight: 600; color: #1f2d3d; margin-bottom: 14px; }
.zg-sp__posting-tl-content { display: flex; flex-direction: column; gap: 2px; }
.zg-sp__posting-tl-content strong { font-size: 13px; color: #1f2d3d; }
.zg-sp__posting-tl-content span { font-size: 12px; color: #606266; }
.zg-sp__posting-tl-content .by { color: #909399; font-size: 11px; }

/* ==================== Tab3 安全配置 ==================== */
.zg-sp__safety-head {
  display: flex; gap: 14px; margin-bottom: 14px;
}
.zg-sp__safety-stat {
  background: #fff; border-radius: 10px; padding: 14px 18px;
  border: 1px solid #eef0f4;
  display: flex; flex-direction: column; gap: 4px; flex: 1;
}
.zg-sp__safety-stat span { font-size: 12px; color: #909399; }
.zg-sp__safety-stat strong { font-size: 20px; font-weight: 700; color: #1f2d3d; font-family: 'JetBrains Mono', monospace; margin-right: 2px; }
.zg-sp__safety-stat strong.ok { color: #10b981; }
.zg-sp__safety-stat strong.danger { color: #ef4444; }
.zg-sp__tminfo { display: flex; flex-direction: column; gap: 2px; }
.zg-sp__tmid { font-family: monospace; font-weight: 700; color: #1f2d3d; }
.zg-sp__tmloc { font-size: 12px; color: #909399; display: flex; align-items: center; gap: 2px; }
.zg-sp__safety-val { font-size: 10px; color: #909399; margin-top: 2px; }

/* ==================== Drawer 通用 ==================== */
.zg-sp-drawer__section { margin-bottom: 22px; }
.zg-sp-drawer__title {
  font-size: 14px; font-weight: 700; color: #1f2d3d;
  margin: 0 0 14px; padding-left: 10px; border-left: 3px solid #6366f1;
}
.zg-sp-drawer__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.zg-sp-drawer__cell {
  background: #f8fafc; border-radius: 8px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 2px;
}
.zg-sp-drawer__cell--full { grid-column: 1 / -1; }
.zg-sp-drawer__cell .lbl { font-size: 11px; color: #909399; }
.zg-sp-drawer__cell .val { font-size: 14px; color: #1f2d3d; font-weight: 500; }
.zg-sp-drawer__cell .val.code { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #6366f1; }

/* Drawer 实时遥测 */
.zg-sp-drawer__rt-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.zg-sp-drawer__rt-card {
  background: #f8fafc; border-radius: 10px; padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
  border: 1px solid #e2e8f0;
}
.zg-sp-drawer__rt-card--accent {
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  border-color: #c7d2fe;
}
.zg-sp-drawer__rt-head { font-size: 13px; font-weight: 700; color: #1f2d3d; padding-bottom: 6px; border-bottom: 1px dashed #cbd5e1; }
.zg-sp-drawer__rt-row {
  display: grid; grid-template-columns: 50px 1fr 1.4fr; gap: 8px; align-items: center;
  font-size: 12px;
}
.zg-sp-drawer__rt-row.big { grid-template-columns: 70px 1fr; }
.zg-sp-drawer__rt-row.big .val { font-size: 22px; color: #4338ca; font-weight: 700; }
.zg-sp-drawer__rt-row .lbl { color: #909399; }
.zg-sp-drawer__rt-row .val { color: #1f2d3d; font-family: 'JetBrains Mono', monospace; }
.zg-sp-drawer__rt-row .val.warn { color: #ef4444; }
.zg-sp-drawer__rt-row .val.ok { color: #10b981; }

/* 告警 */
.zg-sp-alarm { display: flex; flex-direction: column; gap: 4px; }
.zg-sp-alarm__title { font-weight: 700; color: #1f2d3d; }
.zg-sp-alarm__desc { font-size: 12px; color: #606266; }

/* 24h 柱图（纯 CSS） */
.zg-sp-curve {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;
}
.zg-sp-curve__meta {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  margin-bottom: 14px;
}
.zg-sp-curve__meta div {
  background: #f8fafc; border-radius: 8px; padding: 10px 12px;
  font-size: 12px; color: #606266;
  display: flex; justify-content: space-between; align-items: center;
}
.zg-sp-curve__meta strong { font-size: 16px; color: #1f2d3d; font-family: 'JetBrains Mono', monospace; }
.zg-sp-curve__bars {
  display: flex; align-items: flex-end; justify-content: space-between;
  height: 200px; gap: 3px; padding: 6px;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
  border-radius: 6px;
  border-bottom: 2px solid #cbd5e1;
}
.zg-sp-curve__bar {
  flex: 1; height: 100%;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
  gap: 2px;
}
.zg-sp-curve__bar-fill {
  width: 70%;
  background: linear-gradient(180deg, #818cf8, #6366f1, #4f46e5);
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zg-sp-curve__bar:hover .zg-sp-curve__bar-fill {
  background: linear-gradient(180deg, #a5b4fc, #818cf8, #6366f1);
  transform: scaleY(1.03);
}
.zg-sp-curve__bar-lbl { font-size: 10px; color: #909399; font-family: monospace; }

/* ==================== 安全 Drawer ==================== */
.zg-sp-safety-drawer { }
.zg-sp-safety-block {
  background: #f8fafc; border-radius: 10px; padding: 14px;
  margin-bottom: 10px; border: 1px solid #e2e8f0;
}
.zg-sp-safety-block__head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  font-size: 14px; font-weight: 600; color: #1f2d3d;
}
.zg-sp-safety-block__head .el-icon { color: #6366f1; }
.zg-sp-safety-block__radio {
  display: flex; align-items: center; gap: 10px; font-size: 13px; color: #606266;
}

/* ==================== QR Dialog ==================== */
.zg-sp__qr-dialog { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
.zg-sp__qr-dialog-main { display: flex; gap: 24px; align-items: flex-start; }
.zg-sp__qr-box-large {
  background: #fff; border: 2px solid #6366f1; border-radius: 12px;
  padding: 14px; box-shadow: 0 8px 20px rgba(99,102,241,0.15);
  flex-shrink: 0;
}
.zg-sp__qr-large { background: #fff; display: block; }
.zg-sp__qr-info-panel { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.zg-sp__qr-info-title { font-size: 15px; font-weight: 700; color: #1f2d3d; margin-bottom: 4px; }
.zg-sp__qr-info-row {
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; border-radius: 8px; padding: 8px 12px; font-size: 12px;
}
.zg-sp__qr-info-row span { color: #909399; }
.zg-sp__qr-info-row strong { font-family: 'JetBrains Mono', monospace; color: #1f2d3d; }
.zg-sp__qr-security {
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px;
}
.zg-sp__qr-security-title { font-size: 13px; font-weight: 700; color: #1e40af; margin-bottom: 6px; }
.zg-sp__qr-security ul { margin: 0; padding-left: 18px; font-size: 12px; color: #1f2d3d; line-height: 1.8; }
.zg-sp__qr-security code { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4338ca; }
.zg-sp__qr-actions {
  display: flex; gap: 10px; justify-content: center; padding-top: 8px;
}
</style>
