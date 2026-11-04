<!--
  智光云枢 · 终端环境 · 微型气象站 + 空气质量
  业务域：envProbe
  功能：微型气象站 + 空气质量 + 噪音 + 太阳能辐照
        全链路环境感知 · 与灯网智能联动
-->
<template>
  <section class="zg-ws">
    <!-- 头部 -->
    <header class="zg-ws__head">
      <div class="zg-ws__headline">
        <div class="zg-ws__sigil">
          <el-icon :size="22"><Sunny /></el-icon>
        </div>
        <div class="zg-ws__copy">
          <h1 class="zg-ws__title">环境气象站 · 空气质量</h1>
          <p class="zg-ws__sub">
            全链路环境感知 · 气象 + 空气 + 噪音 + 辐照 · 与灯网智能联动
          </p>
        </div>
        <div class="zg-ws__head-meta">
          <span class="zg-ws__meta-chip">
            <span class="zg-ws__meta-dot live"></span>
            实时 · 每 10s 刷新
          </span>
          <span class="zg-ws__meta-chip">
            <el-icon><Monitor /></el-icon>
            岳麓区 5 商圈
          </span>
        </div>
      </div>
      <div class="zg-ws__head-actions">
        <el-select
          v-model="selectedStationId"
          placeholder="选择站点"
          size="default"
          style="width: 180px"
          @change="onSelectStation"
        >
          <el-option
            v-for="s in stations"
            :key="s.id"
            :label="s.code + ' · ' + s.location"
            :value="s.id"
          />
        </el-select>
        <el-button :icon="Refresh" @click="refreshData">
          刷新数据
        </el-button>
        <el-button type="primary" :icon="DataLine" @click="openTrendDrawer">
          打开趋势
        </el-button>
      </div>
    </header>

    <!-- KPI -->
    <div class="zg-metrics zg-metrics--quad">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ kpi.stations }}</span>
        <span class="zg-metrics__lbl">气象站总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ kpi.online }}</span>
        <span class="zg-metrics__lbl">在线运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ kpi.rain }}</span>
        <span class="zg-metrics__lbl">今日降雨 mm</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ kpi.noisePeak }}</span>
        <span class="zg-metrics__lbl">噪音峰值 dB</span>
      </div>
    </div>

    <!-- 三栏主体 -->
    <div class="zg-ws__body">
      <!-- 左：站点列表 -->
      <aside class="zg-ws__sidebar">
        <div class="zg-ws__sidebar-head">
          <el-input
            v-model="stationFilter"
            placeholder="搜索站点编号/位置"
            clearable
            size="small"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="zg-ws__station-list">
          <div
            v-for="s in filteredStations"
            :key="s.id"
            class="zg-ws__station-card"
            :class="{ active: s.id === selectedStationId }"
            @click="onSelectStation(s.id)"
          >
            <div class="zg-ws__station-top">
              <strong>{{ s.code }}</strong>
              <span
                class="zg-ws__station-status"
                :class="s.online ? 'online' : 'offline'"
              >
                {{ s.online ? '在线' : '离线' }}
              </span>
            </div>
            <div class="zg-ws__station-loc">
              <el-icon><Location /></el-icon>
              {{ s.location }}
            </div>
            <div class="zg-ws__station-params">
              <span class="zg-ws__p-temp">
                <el-icon><Sunny /></el-icon>
                {{ s.temp.toFixed(1) }}°C
              </span>
              <span class="zg-ws__p-pm">
                <el-icon><Cloudy /></el-icon>
                PM2.5 {{ s.pm25 }}
              </span>
            </div>
          </div>
        </div>
        <div class="zg-ws__sidebar-foot">
          <el-pagination
            v-model:current-page="stationPage"
            v-model:page-size="stationPageSize"
            :page-sizes="[6, 9, 12]"
            :total="filteredStations.length"
            layout="total, prev, pager, next"
            small
          />
        </div>
      </aside>

      <!-- 中：气象大屏 -->
      <section class="zg-ws__dashboard">
        <div class="zg-ws__dash-head">
          <div class="zg-ws__dash-title">
            <el-icon :size="22"><PartlyCloudy /></el-icon>
            <div>
              <strong>{{ currentStation.code }} · {{ currentStation.location }}</strong>
              <span>最后上报：{{ currentStation.lastReport }} · 海拔 {{ currentStation.elevation }}m</span>
            </div>
          </div>
          <div class="zg-ws__dash-weather">
            <el-icon :size="42"><Sunny /></el-icon>
            <div>
              <div class="zg-ws__dash-temp">{{ weather.temp.toFixed(1) }}°C</div>
              <div class="zg-ws__dash-weather-label">{{ weather.skyText }} · {{ weather.season }}</div>
            </div>
          </div>
        </div>

        <!-- 6 项核心气象大卡 -->
        <div class="zg-ws__dash-grid">
          <!-- 温度 -->
          <div class="zg-ws__dash-card zg-ws__dash-card--temp">
            <div class="zg-ws__dash-card-head">
              <el-icon><Sunny /></el-icon>
              <span>温度</span>
            </div>
            <div class="zg-ws__dash-card-body">
              <div class="zg-ws__dash-bigtemp">{{ weather.temp.toFixed(1) }}°C</div>
              <div class="zg-ws__dash-aux">
                <span>体感 {{ weather.feel.toFixed(1) }}°C</span>
                <span>今日 {{ weather.tempLow.toFixed(1) }} ~ {{ weather.tempHigh.toFixed(1) }}</span>
              </div>
              <div class="zg-ws__dash-season">
                季节色 · <span :style="{ background: seasonBg }">{{ weather.season }}</span>
              </div>
            </div>
          </div>

          <!-- 湿度 SVG 圆环 -->
          <div class="zg-ws__dash-card">
            <div class="zg-ws__dash-card-head">
              <el-icon><Cloudy /></el-icon>
              <span>相对湿度</span>
            </div>
            <div class="zg-ws__dash-card-body zg-ws__dash-card-body--ring">
              <div class="zg-ws__ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" class="ring-bg" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    class="ring-fg"
                    :stroke-dasharray="`${weather.humidity * 3.267}, 327`"
                  />
                </svg>
                <div class="zg-ws__ring-center">
                  <strong>{{ weather.humidity }}%</strong>
                  <span>湿度</span>
                </div>
              </div>
              <div class="zg-ws__dash-aux">
                <span>露点 {{ weather.dewPoint.toFixed(1) }}°C</span>
              </div>
            </div>
          </div>

          <!-- 风速风向标 -->
          <div class="zg-ws__dash-card">
            <div class="zg-ws__dash-card-head">
              <el-icon><WindPower /></el-icon>
              <span>风速 / 风向</span>
            </div>
            <div class="zg-ws__dash-card-body zg-ws__dash-card-body--wind">
              <div class="zg-ws__wind-vane">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" class="ring-bg" />
                  <text x="60" y="16" text-anchor="middle" fill="#94a3b8" font-size="10">N</text>
                  <text x="108" y="64" text-anchor="middle" fill="#94a3b8" font-size="10">E</text>
                  <text x="60" y="112" text-anchor="middle" fill="#94a3b8" font-size="10">S</text>
                  <text x="12" y="64" text-anchor="middle" fill="#94a3b8" font-size="10">W</text>
                  <g :transform="`rotate(${weather.windDir}, 60, 60)`">
                    <polygon points="60,18 64,60 60,54 56,60" fill="#ef4444" />
                    <polygon points="60,102 64,60 60,66 56,60" fill="#3b82f6" />
                    <circle cx="60" cy="60" r="4" fill="#0f172a" />
                  </g>
                </svg>
              </div>
              <div class="zg-ws__wind-meta">
                <div class="zg-ws__wind-speed">
                  <strong>{{ weather.windSpeed.toFixed(1) }}</strong>
                  <em>m/s</em>
                </div>
                <span>风向 {{ dirText }}</span>
                <span>阵风 {{ weather.windGust.toFixed(1) }} m/s</span>
              </div>
            </div>
          </div>

          <!-- 气压 -->
          <div class="zg-ws__dash-card">
            <div class="zg-ws__dash-card-head">
              <el-icon><Monitor /></el-icon>
              <span>大气压力</span>
            </div>
            <div class="zg-ws__dash-card-body">
              <div class="zg-ws__dash-big-num">
                {{ weather.pressure }}
                <em>hPa</em>
              </div>
              <div class="zg-ws__dash-aux">
                <span>海平面修正 {{ weather.seaLevel }} hPa</span>
                <span
                  class="zg-ws__trend"
                  :class="weather.pressureTrend > 0 ? 'up' : 'down'"
                >
                  {{ weather.pressureTrend > 0 ? '↑' : '↓' }}
                  {{ Math.abs(weather.pressureTrend) }} hPa / 3h
                </span>
              </div>
            </div>
          </div>

          <!-- 降雨 -->
          <div class="zg-ws__dash-card">
            <div class="zg-ws__dash-card-head">
              <el-icon><Drizzling /></el-icon>
              <span>降雨</span>
            </div>
            <div class="zg-ws__dash-card-body">
              <div class="zg-ws__rain">
                <div class="zg-ws__rain-today">
                  <em>今日累积</em>
                  <strong>{{ weather.rainToday.toFixed(1) }}</strong>
                  <span>mm</span>
                </div>
                <div class="zg-ws__rain-hour">
                  <em>最近 1 小时</em>
                  <strong>{{ weather.rainLastHour.toFixed(1) }}</strong>
                  <span>mm</span>
                </div>
              </div>
              <div class="zg-ws__dash-aux">
                <span>降雨强度 {{ weather.rainLevel }}</span>
                <span>月累计 {{ weather.rainMonth }} mm</span>
              </div>
            </div>
          </div>

          <!-- 能见度 -->
          <div class="zg-ws__dash-card">
            <div class="zg-ws__dash-card-head">
              <el-icon><Cloudy /></el-icon>
              <span>能见度</span>
            </div>
            <div class="zg-ws__dash-card-body">
              <div class="zg-ws__dash-big-num">
                {{ weather.visibility }}
                <em>km</em>
              </div>
              <div class="zg-ws__vis-bar">
                <div
                  class="zg-ws__vis-fill"
                  :style="{ width: Math.min(100, weather.visibility / 20 * 100) + '%' }"
                ></div>
              </div>
              <div class="zg-ws__dash-aux">
                <span>{{ visLevel }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 24h 气象曲线 -->
        <div class="zg-ws__chart-panel">
          <div class="zg-ws__chart-head">
            <strong>24 小时气象曲线</strong>
            <div class="zg-ws__legend">
              <span
                v-for="l in lineLegend"
                :key="l.key"
                class="zg-ws__legend-item"
              >
                <i :style="{ background: l.color }"></i>
                {{ l.label }}
              </span>
            </div>
          </div>
          <div class="zg-ws__chart-area">
            <div class="zg-ws__chart-grid">
              <span v-for="i in 5" :key="i"></span>
            </div>
            <svg class="zg-ws__chart-svg" viewBox="0 0 1000 260" preserveAspectRatio="none">
              <!-- 7 条折线 -->
              <path
                v-for="(ser, si) in lineSeries"
                :key="si"
                :d="ser.path"
                fill="none"
                :stroke="ser.color"
                stroke-width="1.8"
                stroke-linejoin="round"
                stroke-linecap="round"
                opacity="0.85"
              />
              <!-- X 轴 -->
              <line x1="0" y1="255" x2="1000" y2="255" stroke="#cbd5e1" stroke-width="1" />
              <g fill="#94a3b8" font-size="10" text-anchor="middle">
                <text x="0" y="272">00</text>
                <text x="125" y="272">04</text>
                <text x="250" y="272">08</text>
                <text x="375" y="272">12</text>
                <text x="500" y="272">16</text>
                <text x="625" y="272">20</text>
                <text x="750" y="272">24</text>
                <text x="875" y="272">现在</text>
                <text x="1000" y="272"></text>
              </g>
            </svg>
          </div>
        </div>

        <!-- 智能联动建议（亮点） -->
        <div class="zg-ws__linkage">
          <div class="zg-ws__linkage-head">
            <span class="zg-ws__linkage-dot live"></span>
            <el-icon><MagicStick /></el-icon>
            <strong>智能联动建议（与灯网）</strong>
            <span class="zg-ws__linkage-tip">基于当前气象数据自动触发</span>
          </div>
          <div class="zg-ws__linkage-list">
            <div
              v-for="(l, li) in linkageTips"
              :key="li"
              class="zg-ws__linkage-item"
              :class="l.executed ? 'executed' : 'pending'"
            >
              <div class="zg-ws__linkage-emoji">{{ l.icon }}</div>
              <div class="zg-ws__linkage-body">
                <strong>{{ l.title }}</strong>
                <p>{{ l.desc }}</p>
              </div>
              <div class="zg-ws__linkage-status">
                <el-tag :type="l.executed ? 'success' : 'warning'" effect="light">
                  {{ l.executed ? '✅ 已执行' : '⏳ 建议执行' }}
                </el-tag>
                <el-button
                  v-if="!l.executed"
                  size="small"
                  type="primary"
                  text
                  @click="executeLinkage(l)"
                >
                  立即执行
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右：空气质量 + AQI -->
      <aside class="zg-ws__aqipanel">
        <!-- AQI 仪表盘 -->
        <div class="zg-ws__aqi-card">
          <div class="zg-ws__aqi-title">
            <el-icon><Warning /></el-icon>
            <span>空气质量指数 AQI</span>
          </div>
          <div class="zg-ws__aqi-gauge">
            <svg viewBox="0 0 200 200">
              <!-- 5 段彩弧 -->
              <path d="M 30 150 A 70 70 0 0 1 170 150" fill="none" stroke="#10b981" stroke-width="16" />
              <path d="M 30 150 A 70 70 0 0 1 170 150" fill="none" stroke="#eab308" stroke-width="16"
                stroke-dasharray="110 340" stroke-dashoffset="-110" />
              <path d="M 30 150 A 70 70 0 0 1 170 150" fill="none" stroke="#f97316" stroke-width="16"
                stroke-dasharray="110 340" stroke-dashoffset="-220" />
              <path d="M 30 150 A 70 70 0 0 1 170 150" fill="none" stroke="#ef4444" stroke-width="16"
                stroke-dasharray="110 340" stroke-dashoffset="-330" />
              <path d="M 30 150 A 70 70 0 0 1 170 150" fill="none" stroke="#7f1d1d" stroke-width="16"
                stroke-dasharray="110 340" stroke-dashoffset="-440" />
              <!-- 指针 -->
              <g :transform="`rotate(${aqiAngle}, 100, 150)`">
                <line x1="100" y1="150" x2="100" y2="90" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
                <circle cx="100" cy="150" r="6" fill="#0f172a" />
              </g>
            </svg>
            <div class="zg-ws__aqi-center">
              <strong>{{ aqi.value }}</strong>
              <span :style="{ color: aqiColor }">{{ aqi.level }}</span>
            </div>
          </div>
        </div>

        <!-- 6 项指标 -->
        <div class="zg-ws__metric-card">
          <div class="zg-ws__metric-title">
            <el-icon><DataLine /></el-icon>
            <span>实时空气参数</span>
          </div>
          <div class="zg-ws__metric-list">
            <div
              v-for="m in airMetrics"
              :key="m.key"
              class="zg-ws__metric-row"
            >
              <div class="zg-ws__metric-left">
                <span class="zg-ws__metric-name">{{ m.name }}</span>
                <el-tag size="small" :type="m.tagType" effect="light">{{ m.level }}</el-tag>
              </div>
              <div class="zg-ws__metric-right">
                <strong>{{ m.value }}</strong>
                <em>{{ m.unit }}</em>
              </div>
              <div class="zg-ws__metric-bar">
                <div
                  class="zg-ws__metric-fill"
                  :style="{ width: m.pct + '%', background: m.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 24h AQI 柱图 -->
        <div class="zg-ws__aqi-chart">
          <div class="zg-ws__metric-title">
            <el-icon><DataLine /></el-icon>
            <span>今日 24h AQI</span>
          </div>
          <div class="zg-ws__aqi-bars">
            <div
              v-for="(v, vi) in aqi24h"
              :key="vi"
              class="zg-ws__aqi-bar-col"
            >
              <div
                class="zg-ws__aqi-bar"
                :style="{
                  height: Math.min(100, v.value / 3) + '%',
                  background: v.color,
                }"
                :title="v.hour + ':00  AQI ' + v.value"
              ></div>
              <span>{{ v.hour }}</span>
            </div>
          </div>
        </div>

        <!-- 噪音 + 辐照 -->
        <div class="zg-ws__dual-card">
          <div class="zg-ws__dual-item">
            <div class="zg-ws__dual-emoji">🔊</div>
            <div class="zg-ws__dual-body">
              <div class="zg-ws__dual-title">环境噪音</div>
              <div class="zg-ws__dual-value">{{ airMetrics[4].value }} <em>dB</em></div>
              <div class="zg-ws__dual-aux">峰值 78 dB · 均值 61 dB</div>
            </div>
          </div>
          <div class="zg-ws__dual-item">
            <div class="zg-ws__dual-emoji">☀️</div>
            <div class="zg-ws__dual-body">
              <div class="zg-ws__dual-title">太阳能辐照</div>
              <div class="zg-ws__dual-value">{{ airMetrics[5].value }} <em>W/m²</em></div>
              <div class="zg-ws__dual-aux">峰值 892 · 已日累计 4.2 kWh/m²</div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 底部：全站点表格 -->
    <div class="zg-ws__table-wrap">
      <div class="zg-ws__table-head">
        <strong>全部气象站（{{ stations.length }} 站）</strong>
        <div class="zg-ws__table-actions">
          <el-tag :type="isTableFullscreen ? 'success' : 'info'" effect="light">
            {{ isTableFullscreen ? '已展开' : '可展开' }}
          </el-tag>
          <el-button size="small" text @click="isTableFullscreen = !isTableFullscreen">
            {{ isTableFullscreen ? '收起' : '展开' }}
          </el-button>
        </div>
      </div>
      <el-table
        :data="pagedStations"
        stripe
        border
        height="360"
        :default-sort="{ prop: 'online', order: 'descending' }"
      >
        <el-table-column prop="code" label="编号" width="120" fixed />
        <el-table-column prop="location" label="位置" min-width="160" />
        <el-table-column prop="model" label="设备型号" width="150" />
        <el-table-column label="在线状态" width="100">
          <template #default="{ row }">
            <span
              class="zg-ws__tbl-dot"
              :class="row.online ? 'ok' : 'bad'"
            ></span>
            {{ row.online ? '在线' : '离线' }}
          </template>
        </el-table-column>
        <el-table-column prop="lastReport" label="最后上报" width="170" />
        <el-table-column label="温度" width="90">
          <template #default="{ row }">{{ row.temp.toFixed(1) }}°C</template>
        </el-table-column>
        <el-table-column label="湿度" width="90">
          <template #default="{ row }">{{ row.humidity }}%</template>
        </el-table-column>
        <el-table-column label="PM2.5" width="100">
          <template #default="{ row }">
            <span :style="{ color: pmColor(row.pm25) }">{{ row.pm25 }} μg/m³</span>
          </template>
        </el-table-column>
        <el-table-column label="降雨" width="100">
          <template #default="{ row }">{{ row.rainToday.toFixed(1) }} mm</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDrawer(row)">
              看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="zg-ws__table-pager">
        <el-pagination
          v-model:current-page="tablePage"
          v-model:page-size="tablePageSize"
          :page-sizes="[8, 12, 16]"
          :total="stations.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 详情 Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerStation ? drawerStation.code + ' · 站点详情' : '站点详情'"
      size="560px"
    >
      <div v-if="drawerStation" class="zg-ws__drawer">
        <div class="zg-ws__drawer-section">
          <div class="zg-ws__drawer-title">📁 站点档案</div>
          <div class="zg-ws__drawer-kv">
            <div><span>编号</span><strong>{{ drawerStation.code }}</strong></div>
            <div><span>位置</span><strong>{{ drawerStation.location }}</strong></div>
            <div><span>经纬度</span><strong>{{ drawerStation.lng }}, {{ drawerStation.lat }}</strong></div>
            <div><span>设备型号</span><strong>{{ drawerStation.model }}</strong></div>
            <div><span>安装日期</span><strong>{{ drawerStation.installDate }}</strong></div>
            <div><span>在线状态</span>
              <strong :style="{ color: drawerStation.online ? '#10b981' : '#ef4444' }">
                {{ drawerStation.online ? '在线' : '离线' }}
              </strong>
            </div>
          </div>
        </div>

        <div class="zg-ws__drawer-section">
          <div class="zg-ws__drawer-title">📊 全部实时参数（12 项）</div>
          <div class="zg-ws__drawer-params">
            <div
              v-for="p in drawerStation.params"
              :key="p.key"
              class="zg-ws__drawer-param"
            >
              <div class="zg-ws__drawer-param-label">{{ p.label }}</div>
              <div class="zg-ws__drawer-param-value">
                <strong>{{ p.value }}</strong>
                <em>{{ p.unit }}</em>
              </div>
            </div>
          </div>
        </div>

        <div class="zg-ws__drawer-section">
          <div class="zg-ws__drawer-title">📈 最近 24h 曲线（7 项）</div>
          <div class="zg-ws__drawer-mini">
            <div
              v-for="(mch, mi) in miniCharts"
              :key="mi"
              class="zg-ws__drawer-mini-item"
            >
              <span class="zg-ws__drawer-mini-label">{{ mch.label }}</span>
              <div class="zg-ws__drawer-mini-chart">
                <svg viewBox="0 0 240 40" preserveAspectRatio="none">
                  <path
                    :d="mch.path"
                    fill="none"
                    :stroke="mch.color"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="zg-ws__drawer-section">
          <div class="zg-ws__drawer-title">
            ⚠️ 告警历史（最近 30 天 · {{ drawerStation.alerts.length }} 条）
          </div>
          <el-table :data="drawerStation.alerts" size="small" stripe>
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="detail" label="详情" />
            <el-table-column label="级别" width="80">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="row.level === '严重' ? 'danger' : row.level === '一般' ? 'warning' : 'info'"
                >
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Sunny, Cloudy, Drizzling, WindPower, Moon, PartlyCloudy, Warning, Monitor, DataLine,
  Refresh, Search, Location, MagicStick,
} from '@element-plus/icons-vue'

/* ---------- KPI ---------- */
const kpi = reactive({
  stations: 18,
  online: 16,
  rain: 12,
  noisePeak: 78,
})

/* ---------- Mock 站点 18 个 ---------- */
const stationNames = [
  { code: 'WS-LL01', location: '先导路商圈·东广场', area: '先导路商圈', lng: '112.9382', lat: '28.1893' },
  { code: 'WS-LL02', location: '先导路商圈·西站', area: '先导路商圈', lng: '112.9451', lat: '28.1942' },
  { code: 'WS-LG01', location: '麓谷产业园·管委会', area: '麓谷产业园', lng: '112.8912', lat: '28.2215' },
  { code: 'WS-LG02', location: '麓谷产业园·C7 栋', area: '麓谷产业园', lng: '112.8967', lat: '28.2188' },
  { code: 'WS-LG03', location: '麓谷产业园·地铁口', area: '麓谷产业园', lng: '112.8845', lat: '28.2276' },
  { code: 'WS-MX01', location: '梅溪湖环湖路·桃花岭', area: '梅溪湖', lng: '112.9321', lat: '28.2113' },
  { code: 'WS-MX02', location: '梅溪湖环湖路·音乐喷泉', area: '梅溪湖', lng: '112.9376', lat: '28.2087' },
  { code: 'WS-MX03', location: '梅溪湖环湖路·节庆岛', area: '梅溪湖', lng: '112.9405', lat: '28.2045' },
  { code: 'WS-JX01', location: '金星大道·北二环', area: '金星大道', lng: '112.9634', lat: '28.2543' },
  { code: 'WS-JX02', location: '金星大道·市政府', area: '金星大道', lng: '112.9592', lat: '28.2289' },
  { code: 'WS-JX03', location: '金星大道·麦德龙', area: '金星大道', lng: '112.9543', lat: '28.2012' },
  { code: 'WS-XJ01', location: '咸嘉湖路·西湖公园', area: '咸嘉湖路', lng: '112.9432', lat: '28.2034' },
  { code: 'WS-XJ02', location: '咸嘉湖路·财专', area: '咸嘉湖路', lng: '112.9367', lat: '28.2108' },
  { code: 'WS-YL01', location: '岳麓山·南门', area: '岳麓山', lng: '112.9389', lat: '28.1798' },
  { code: 'WS-YL02', location: '岳麓山·东门', area: '岳麓山', lng: '112.9421', lat: '28.1834' },
  { code: 'WS-YL03', location: '岳麓山·山顶观景台', area: '岳麓山', lng: '112.9356', lat: '28.1876' },
  { code: 'WS-LL03', location: '先导路·西二环立交', area: '先导路商圈', lng: '112.9324', lat: '28.1967' },
  { code: 'WS-LG04', location: '麓谷产业园·尖山路', area: '麓谷产业园', lng: '112.8812', lat: '28.2156' },
]

function buildStation(row, idx) {
  const seed = 20 + idx * 0.3
  const online = idx !== 10 && idx !== 17
  return reactive({
    id: idx + 1,
    code: row.code,
    location: row.location,
    area: row.area,
    lng: row.lng,
    lat: row.lat,
    model: idx % 2 === 0 ? 'WH-ENS-MK3 微型气象站' : 'GZM-ENV-2000 环境感知终端',
    online,
    lastReport: online ? '2026-10-27 10:42:18' : '2026-10-27 08:15:02',
    elevation: 50 + idx * 3,
    installDate: '2024-0' + ((idx % 9) + 1) + '-15',
    temp: seed + (Math.random() * 2 - 1),
    humidity: 55 + (idx % 10),
    pm25: 28 + (idx % 15),
    rainToday: (idx % 4 === 0 ? 0 : 3 + idx * 0.5),
    windSpeed: 2 + (idx % 5) * 0.3,
    pressure: 1008 + (idx % 8),
    visibility: 6 + (idx % 5),
    // 12 项全量参数
    params: [
      { key: 'temp', label: '空气温度', value: (seed + 0.5).toFixed(1), unit: '°C' },
      { key: 'humidity', label: '相对湿度', value: 55 + idx % 10, unit: '%' },
      { key: 'pressure', label: '大气压', value: 1008 + idx % 8, unit: 'hPa' },
      { key: 'windSpeed', label: '风速', value: (2 + idx % 5 * 0.3).toFixed(1), unit: 'm/s' },
      { key: 'windDir', label: '风向', value: ['东北', '东', '东南', '南', '西南', '西', '西北', '北'][idx % 8], unit: '' },
      { key: 'rain', label: '今日累计降雨', value: (idx % 4 === 0 ? 0 : 3 + idx * 0.5).toFixed(1), unit: 'mm' },
      { key: 'vis', label: '能见度', value: 6 + idx % 5, unit: 'km' },
      { key: 'pm25', label: 'PM2.5', value: 28 + idx % 15, unit: 'μg/m³' },
      { key: 'pm10', label: 'PM10', value: 45 + idx % 20, unit: 'μg/m³' },
      { key: 'noise', label: '环境噪音', value: 58 + idx % 10, unit: 'dB' },
      { key: 'solar', label: '太阳能辐照', value: 420 + idx * 8, unit: 'W/m²' },
      { key: 'o3', label: 'O₃ 臭氧', value: 85 + idx % 40, unit: 'μg/m³' },
    ],
    alerts: buildAlerts(idx),
  })
}

function buildAlerts(idx) {
  const types = ['PM2.5 超标', '设备离线', '温度过高', '箱变告警', '噪音超限']
  const out = []
  const n = idx % 5
  for (let i = 0; i < n; i++) {
    out.push({
      time: `2026-10-${20 + (i + idx) % 7} ${String(6 + i * 2).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}`,
      type: types[(i + idx) % types.length],
      detail: '触发 15 分钟持续告警阈值',
      level: i % 3 === 0 ? '严重' : i % 3 === 1 ? '一般' : '提示',
    })
  }
  return out
}

const stations = ref(stationNames.map((r, i) => buildStation(r, i)))

/* ---------- 选中站点 ---------- */
const selectedStationId = ref(1)
const currentStation = computed(() => {
  return stations.value.find((s) => s.id === selectedStationId.value) || stations.value[0]
})
function onSelectStation(id) {
  selectedStationId.value = id
}
function refreshData() {
  tickData()
  ElMessage.success('已刷新')
}

/* ---------- 天气 Mock ---------- */
const weather = reactive({
  temp: 22.4,
  feel: 21.8,
  tempLow: 17.2,
  tempHigh: 25.6,
  humidity: 68,
  dewPoint: 15.2,
  windSpeed: 3.2,
  windDir: 135,
  windGust: 5.8,
  pressure: 1013,
  seaLevel: 1018,
  pressureTrend: -2,
  rainToday: 12.4,
  rainLastHour: 0.8,
  rainLevel: '小雨',
  rainMonth: 168,
  visibility: 8,
  skyText: '多云',
  season: '秋',
})

const dirText = computed(() => {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  return dirs[Math.round(weather.windDir / 45) % 8]
})
const visLevel = computed(() => {
  if (weather.visibility >= 10) return '良好'
  if (weather.visibility >= 5) return '中等'
  if (weather.visibility >= 1) return '一般'
  return '差（雾）'
})
const seasonBg = computed(() => {
  if (weather.season === '春') return 'linear-gradient(90deg,#86efac,#fde68a)'
  if (weather.season === '夏') return 'linear-gradient(90deg,#f97316,#ef4444)'
  if (weather.season === '秋') return 'linear-gradient(90deg,#f59e0b,#fb7185)'
  return 'linear-gradient(90deg,#60a5fa,#a5b4fc)'
})

/* ---------- AQI ---------- */
const aqi = reactive({ value: 72, level: '良', idx: 1 })
const aqiLevelMap = [
  { max: 50, level: '优', color: '#10b981' },
  { max: 100, level: '良', color: '#eab308' },
  { max: 150, level: '轻度污染', color: '#f97316' },
  { max: 200, level: '中度污染', color: '#ef4444' },
  { max: 300, level: '重度污染', color: '#7f1d1d' },
  { max: 500, level: '严重污染', color: '#450a0a' },
]
const aqiColor = computed(() => aqiLevelMap[aqi.idx]?.color || '#10b981')
const aqiAngle = computed(() => {
  // 500 -> 270deg
  return (aqi.value / 500) * 270 - 135
})

const airMetrics = computed(() => [
  buildAirMetric('pm25', 'PM2.5', `${Math.round(28 + (weather.temp % 5))}`, 'μg/m³', 75),
  buildAirMetric('pm10', 'PM10', `${Math.round(52 + (weather.humidity % 10))}`, 'μg/m³', 100),
  buildAirMetric('o3', 'O₃ 臭氧', `${Math.round(118 + (weather.temp % 8))}`, 'μg/m³', 160),
  buildAirMetric('no2', 'NO₂ 二氧化氮', '28', 'μg/m³', 100),
  buildAirMetric('noise', '噪音', '62', 'dB', 100),
  buildAirMetric('solar', '太阳能辐照', '482', 'W/m²', 1000),
])

function buildAirMetric(key, name, value, unit, limit) {
  const n = parseFloat(value)
  const pct = Math.min(100, (n / limit) * 100)
  let level = '优', tagType = 'success', color = '#10b981'
  if (pct > 80) { level = '差'; tagType = 'danger'; color = '#ef4444' }
  else if (pct > 55) { level = '一般'; tagType = 'warning'; color = '#f59e0b' }
  else if (pct > 30) { level = '良'; tagType = 'info'; color = '#3b82f6' }
  return { key, name, value, unit, pct, level, tagType, color }
}

/* ---------- 24h AQI 柱 ---------- */
const aqi24h = computed(() => {
  const arr = []
  for (let h = 0; h < 24; h++) {
    const base = 55 + Math.sin((h - 6) / 24 * Math.PI * 2) * 20 + Math.random() * 10
    const v = Math.round(base)
    const seg = aqiLevelMap.findIndex((x) => v <= x.max)
    arr.push({
      hour: h,
      value: v,
      color: aqiLevelMap[Math.max(0, seg)].color,
    })
  }
  // 把当前指向最新点
  arr[23].value = aqi.value
  const seg = aqiLevelMap.findIndex((x) => aqi.value <= x.max)
  arr[23].color = aqiLevelMap[Math.max(0, seg)].color
  return arr
})

/* ---------- 24h 曲线 ---------- */
const lineLegend = [
  { key: 'temp', label: '温度', color: '#f97316' },
  { key: 'hum', label: '湿度', color: '#3b82f6' },
  { key: 'wind', label: '风速', color: '#10b981' },
  { key: 'pres', label: '气压/10', color: '#8b5cf6' },
  { key: 'solar', label: '辐照/20', color: '#eab308' },
  { key: 'noise', label: '噪音', color: '#f43f5e' },
  { key: 'pm25', label: 'PM2.5', color: '#0ea5e9' },
]
const lineSeries = computed(() => {
  // 生成 24 个点
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const mkPath = (getter, min, max, baseline) => {
    const pts = hours.map((h) => {
      const v = getter(h)
      const y = 240 - ((v - min) / (max - min)) * 210
      return `${(h / 23) * 1000},${y.toFixed(1)}`
    })
    return `M ${pts.join(' L ')}`
  }
  return [
    { key: 'temp', color: '#f97316', path: mkPath((h) => 18 + Math.sin((h - 6) / 24 * Math.PI * 2) * 6, 15, 30) },
    { key: 'hum', color: '#3b82f6', path: mkPath((h) => 55 + Math.sin((h - 10) / 24 * Math.PI * 2) * 15, 40, 90) },
    { key: 'wind', color: '#10b981', path: mkPath((h) => 2 + Math.abs(Math.sin(h / 4)) * 3, 0, 6) },
    { key: 'pres', color: '#8b5cf6', path: mkPath((h) => 1000 + Math.sin(h / 8) * 15, 990, 1020) },
    { key: 'solar', color: '#eab308', path: mkPath((h) => (h >= 6 && h <= 18) ? Math.sin(((h - 6) / 12) * Math.PI) * 800 : 0, 0, 900) },
    { key: 'noise', color: '#f43f5e', path: mkPath((h) => 45 + Math.sin((h - 8) / 24 * Math.PI * 2) * 20 + (h >= 7 && h <= 19 ? 15 : 0), 35, 90) },
    { key: 'pm25', color: '#0ea5e9', path: mkPath((h) => 30 + Math.sin((h - 4) / 24 * Math.PI * 2) * 15 + (h >= 8 && h <= 20 ? 10 : 0), 15, 90) },
  ]
})

/* ---------- 迷你曲线（Drawer 内） ---------- */
const miniCharts = computed(() => {
  const labels = [
    { label: '温度', color: '#f97316', fn: (h) => 18 + Math.sin((h - 6) / 24 * Math.PI * 2) * 6 },
    { label: '湿度', color: '#3b82f6', fn: (h) => 55 + Math.sin((h - 10) / 24 * Math.PI * 2) * 15 },
    { label: '风速', color: '#10b981', fn: (h) => 2 + Math.abs(Math.sin(h / 4)) * 3 },
    { label: '气压', color: '#8b5cf6', fn: (h) => 1000 + Math.sin(h / 8) * 15 },
    { label: '辐照', color: '#eab308', fn: (h) => (h >= 6 && h <= 18) ? Math.sin(((h - 6) / 12) * Math.PI) * 800 : 0 },
    { label: '噪音', color: '#f43f5e', fn: (h) => 45 + Math.sin((h - 8) / 24 * Math.PI * 2) * 20 },
    { label: 'PM2.5', color: '#0ea5e9', fn: (h) => 30 + Math.sin((h - 4) / 24 * Math.PI * 2) * 15 },
  ]
  return labels.map((l) => {
    const pts = []
    const vals = []
    for (let h = 0; h < 24; h++) vals.push(l.fn(h))
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    vals.forEach((v, i) => {
      const y = 36 - ((v - min) / Math.max(1, max - min)) * 32
      pts.push(`${(i / 23) * 240},${y.toFixed(1)}`)
    })
    return { label: l.label, color: l.color, path: `M ${pts.join(' L ')}` }
  })
})

/* ---------- 联动建议 ---------- */
const linkageTips = ref([
  {
    icon: '☀️',
    title: '辐照偏低 → 提前开灯',
    desc: '辐照 482 W/m²（< 200 阈值），建议先导路商圈路灯提前 15 分钟开启',
    executed: true,
  },
  {
    icon: '🌧️',
    title: '小雨 → 亮度上调 +15%',
    desc: '今日累计降雨 12mm，能见度 8km，建议雨灯下 6 座商圈整体亮度 +15%',
    executed: true,
  },
  {
    icon: '🌫️',
    title: '能见度降低 → 雾灯模式',
    desc: '能见度 8km（< 5km 为浓雾预警），当前中等；若降至 5km 以下自动切雾灯',
    executed: false,
  },
  {
    icon: '🌙',
    title: '深夜 + 低噪音 → 节能调光',
    desc: '当前 10:42 尚非深夜；00:00 后噪音 < 40 dB 时，建议亮度 -10%',
    executed: false,
  },
])
function executeLinkage(l) {
  l.executed = true
  ElMessage.success('已执行联动：' + l.title)
}

/* ---------- 站点筛选 + 分页（左栏） ---------- */
const stationFilter = ref('')
const stationPage = ref(1)
const stationPageSize = ref(6)
const filteredStations = computed(() => {
  const q = stationFilter.value.trim()
  if (!q) return stations.value
  return stations.value.filter(
    (s) =>
      s.code.toLowerCase().includes(q.toLowerCase()) ||
      s.location.includes(q) ||
      s.area.includes(q),
  )
})
const pagedSidebar = computed(() => {
  const start = (stationPage.value - 1) * stationPageSize.value
  return filteredStations.value.slice(start, start + stationPageSize.value)
})

/* ---------- 表格分页（底栏） ---------- */
const tablePage = ref(1)
const tablePageSize = ref(8)
const pagedStations = computed(() => {
  const start = (tablePage.value - 1) * tablePageSize.value
  return stations.value.slice(start, start + tablePageSize.value)
})

/* ---------- Drawer ---------- */
const drawerVisible = ref(false)
const drawerStation = ref(null)
function openDrawer(s) {
  drawerStation.value = s
  drawerVisible.value = true
}
function openTrendDrawer() {
  drawerStation.value = currentStation.value
  drawerVisible.value = true
}

/* ---------- 辅助 ---------- */
function pmColor(v) {
  if (v <= 35) return '#10b981'
  if (v <= 75) return '#f59e0b'
  return '#ef4444'
}

/* ---------- 实时数据跳动 setInterval ---------- */
let timer = null
function tickData() {
  // 天气
  weather.temp += (Math.random() * 0.4 - 0.2)
  weather.humidity = Math.max(30, Math.min(95, weather.humidity + (Math.random() * 4 - 2)))
  weather.windSpeed = Math.max(0, weather.windSpeed + (Math.random() * 0.6 - 0.3))
  weather.windDir = (weather.windDir + (Math.random() * 8 - 4) + 360) % 360
  weather.pressure += Math.round(Math.random() * 2 - 1)
  weather.visibility = Math.max(0.5, weather.visibility + (Math.random() * 1 - 0.5))
  // AQI
  aqi.value = Math.max(10, Math.min(300, aqi.value + Math.round(Math.random() * 10 - 5)))
  const seg = aqiLevelMap.findIndex((x) => aqi.value <= x.max)
  aqi.idx = seg
  aqi.level = aqiLevelMap[seg].level
  // 站点
  stations.value.forEach((s) => {
    if (s.online) {
      s.temp += Math.random() * 0.4 - 0.2
      s.humidity = Math.max(30, Math.min(95, s.humidity + Math.round(Math.random() * 4 - 2)))
      s.pm25 = Math.max(5, s.pm25 + Math.round(Math.random() * 6 - 3))
      s.params[0].value = s.temp.toFixed(1)
      s.params[1].value = s.humidity
      s.params[7].value = s.pm25
    }
  })
}

onMounted(() => {
  timer = setInterval(tickData, 10000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

/* 导出给模板 */
const isTableFullscreen = ref(false)

watch(stationFilter, () => { stationPage.value = 1 })
</script>

<style lang="scss" scoped>
.zg-ws {
  min-height: 100%;
  padding: 16px;
  background: linear-gradient(180deg, #f0f9ff 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 头部 */
.zg-ws__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
  color: #fff;
  padding: 14px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.2);
}
.zg-ws__headline {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.zg-ws__sigil {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}
.zg-ws__copy h1 { margin: 0; font-size: 18px; font-weight: 600; }
.zg-ws__copy p { margin: 2px 0 0; font-size: 12px; opacity: 0.85; }
.zg-ws__head-meta { margin-left: 14px; display: flex; gap: 8px; }
.zg-ws__meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
}
.zg-ws__meta-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #fff;
  &.live { animation: zgLive 1.5s infinite ease-in-out; }
}
@keyframes zgLive {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
}
.zg-ws__head-actions { display: flex; gap: 8px; }

/* KPI */
.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.zg-metrics__cell {
  background: #fff;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  position: relative;
  overflow: hidden;
}
.zg-metrics__cell::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0; width: 3px;
  background: #0ea5e9;
}
.zg-metrics__cell--ok::before { background: #10b981; }
.zg-metrics__cell--warn::before { background: #f59e0b; }
.zg-metrics__cell--info::before { background: #8b5cf6; }
.zg-metrics__num { display: block; font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.1; }
.zg-metrics__lbl { font-size: 12px; color: #64748b; margin-top: 4px; display: block; }

/* 三栏主体 */
.zg-ws__body {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 340px;
  gap: 14px;
  min-height: 0;
}

/* 左栏 */
.zg-ws__sidebar {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.zg-ws__sidebar-head { padding: 10px 12px; border-bottom: 1px solid #eef2f7; }
.zg-ws__station-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.zg-ws__station-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #0ea5e9; transform: translateY(-1px); }
  &.active {
    border-color: #0ea5e9;
    background: linear-gradient(135deg, #f0f9ff, #eff6ff);
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.18);
  }
}
.zg-ws__station-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  strong { font-size: 13px; color: #0f172a; }
}
.zg-ws__station-status {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
  &.online { background: rgba(16, 185, 129, 0.15); color: #047857; }
  &.offline { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
}
.zg-ws__station-loc {
  margin-top: 4px;
  font-size: 12px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}
.zg-ws__station-params {
  margin-top: 6px;
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #64748b;
  span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
}
.zg-ws__sidebar-foot {
  padding: 8px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: center;
}

/* 中栏大屏 */
.zg-ws__dashboard {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  min-height: 0;
}
.zg-ws__dash-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.zg-ws__dash-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  strong { font-size: 15px; color: #0f172a; }
  span { font-size: 12px; color: #64748b; display: block; margin-top: 2px; }
}
.zg-ws__dash-weather {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}
.zg-ws__dash-temp {
  font-size: 28px;
  font-weight: 700;
  color: #b45309;
  line-height: 1;
}
.zg-ws__dash-weather-label {
  font-size: 12px;
  color: #78350f;
  margin-top: 2px;
}

.zg-ws__dash-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.zg-ws__dash-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fafbfd, #fff);
  position: relative;
  overflow: hidden;
}
.zg-ws__dash-card--temp {
  background: linear-gradient(135deg, #fff7ed, #fff1f2);
  border-color: rgba(249, 115, 22, 0.25);
}
.zg-ws__dash-card-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}
.zg-ws__dash-bigtemp {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #f97316, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  letter-spacing: -1px;
}
.zg-ws__dash-big-num {
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  em {
    font-size: 14px;
    font-weight: 400;
    color: #94a3b8;
    margin-left: 4px;
  }
}
.zg-ws__dash-aux {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 10px;
  .zg-ws__trend {
    font-weight: 600;
    &.up { color: #ef4444; }
    &.down { color: #10b981; }
  }
}
.zg-ws__dash-season {
  margin-top: 10px;
  font-size: 11px;
  color: #78350f;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  span {
    padding: 2px 8px;
    border-radius: 999px;
    color: #fff;
    font-weight: 600;
  }
}

/* 圆环 */
.zg-ws__dash-card-body--ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.zg-ws__ring {
  width: 120px;
  height: 120px;
  position: relative;
  svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .ring-bg { fill: none; stroke: #e2e8f0; stroke-width: 10; }
  .ring-fg {
    fill: none;
    stroke: url(#zgHumGrad);
    stroke: #3b82f6;
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dasharray 0.8s ease;
  }
}
.zg-ws__ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  strong { font-size: 22px; font-weight: 700; color: #0f172a; }
  span { font-size: 11px; color: #64748b; }
}

/* 风向标 */
.zg-ws__dash-card-body--wind {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  align-items: center;
}
.zg-ws__wind-vane svg { width: 110px; height: 110px; }
.zg-ws__wind-vane .ring-bg { fill: none; stroke: #e2e8f0; stroke-width: 2; }
.zg-ws__wind-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #475569;
}
.zg-ws__wind-speed {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  strong { font-size: 26px; font-weight: 800; color: #0f172a; }
  em { font-size: 12px; color: #94a3b8; font-style: normal; }
}

/* 降雨 */
.zg-ws__rain {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.zg-ws__rain-today, .zg-ws__rain-hour {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 10px;
  padding: 8px 10px;
  em {
    font-style: normal;
    font-size: 11px;
    color: #64748b;
    display: block;
  }
  strong {
    font-size: 22px;
    font-weight: 700;
    color: #1e40af;
    margin-top: 2px;
  }
  span { font-size: 11px; color: #94a3b8; }
}

/* 能见度 */
.zg-ws__vis-bar {
  margin-top: 10px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.zg-ws__vis-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #0ea5e9);
  border-radius: 999px;
  transition: width 0.6s ease;
}

/* 24h 曲线 */
.zg-ws__chart-panel {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
}
.zg-ws__chart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  strong { color: #0f172a; font-size: 13px; }
}
.zg-ws__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;
  color: #475569;
}
.zg-ws__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  i {
    width: 12px; height: 3px; border-radius: 2px; display: inline-block;
  }
}
.zg-ws__chart-area {
  position: relative;
  height: 270px;
}
.zg-ws__chart-grid {
  position: absolute;
  inset: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  span {
    height: 1px;
    background: #f1f5f9;
  }
}
.zg-ws__chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* 联动建议 */
.zg-ws__linkage {
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f3ff, #eef2ff);
  padding: 12px 14px;
}
.zg-ws__linkage-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 10px;
  strong { color: #4338ca; font-size: 14px; }
  .zg-ws__linkage-tip { font-size: 11px; color: #6366f1; margin-left: 6px; }
}
.zg-ws__linkage-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #6366f1;
  &.live { animation: zgLive 1.5s infinite ease-in-out; }
}
.zg-ws__linkage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.zg-ws__linkage-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  &.executed { border-left: 4px solid #10b981; }
  &.pending { border-left: 4px solid #f59e0b; }
}
.zg-ws__linkage-emoji {
  font-size: 22px;
  text-align: center;
}
.zg-ws__linkage-body {
  strong { color: #0f172a; font-size: 13px; display: block; }
  p { margin: 3px 0 0; font-size: 12px; color: #475569; line-height: 1.55; }
}
.zg-ws__linkage-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

/* 右栏 */
.zg-ws__aqipanel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}
.zg-ws__aqi-card,
.zg-ws__metric-card,
.zg-ws__aqi-chart {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  padding: 12px 14px;
}
.zg-ws__aqi-title, .zg-ws__metric-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.zg-ws__aqi-gauge {
  position: relative;
  width: 100%;
  aspect-ratio: 1.3;
  svg { width: 100%; height: 100%; overflow: visible; }
}
.zg-ws__aqi-center {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  strong { font-size: 36px; font-weight: 800; color: #0f172a; display: block; }
  span { font-size: 13px; font-weight: 600; }
}

/* 空气参数 */
.zg-ws__metric-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.zg-ws__metric-row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  row-gap: 4px;
  column-gap: 8px;
}
.zg-ws__metric-left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.zg-ws__metric-name {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}
.zg-ws__metric-right {
  text-align: right;
  strong { font-size: 14px; font-weight: 700; color: #0f172a; }
  em { font-size: 11px; color: #94a3b8; margin-left: 2px; font-style: normal; }
}
.zg-ws__metric-bar {
  grid-column: 1 / span 2;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.zg-ws__metric-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease, background 0.6s ease;
}

/* AQI 24h 柱图 */
.zg-ws__aqi-bars {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 2px;
  height: 140px;
  align-items: end;
}
.zg-ws__aqi-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  .zg-ws__aqi-bar {
    width: 100%;
    min-height: 2px;
    border-radius: 2px 2px 0 0;
    transition: height 0.4s ease;
  }
  span { font-size: 9px; color: #94a3b8; }
}

/* 双指标 */
.zg-ws__dual-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.zg-ws__dual-item {
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 8px;
}
.zg-ws__dual-emoji {
  font-size: 22px;
  text-align: center;
}
.zg-ws__dual-title {
  font-size: 11px;
  color: #64748b;
}
.zg-ws__dual-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  em { font-size: 12px; color: #94a3b8; font-weight: 400; font-style: normal; margin-left: 2px; }
}
.zg-ws__dual-aux { font-size: 10px; color: #94a3b8; margin-top: 2px; }

/* 底栏表格 */
.zg-ws__table-wrap {
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}
.zg-ws__table-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  strong { font-size: 14px; color: #0f172a; }
}
.zg-ws__table-actions { display: flex; gap: 6px; align-items: center; }
.zg-ws__tbl-dot {
  display: inline-block;
  width: 7px; height: 7px; border-radius: 50%;
  margin-right: 4px;
  &.ok { background: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15); }
  &.bad { background: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15); }
}
.zg-ws__table-pager {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

/* Drawer */
.zg-ws__drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.zg-ws__drawer-section {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  background: #fafbfd;
}
.zg-ws__drawer-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
}
.zg-ws__drawer-kv {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  div {
    font-size: 12px;
    span { color: #64748b; display: block; }
    strong { color: #0f172a; display: block; margin-top: 2px; }
  }
}
.zg-ws__drawer-params {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.zg-ws__drawer-param {
  background: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.zg-ws__drawer-param-label {
  font-size: 12px;
  color: #64748b;
}
.zg-ws__drawer-param-value {
  strong { font-size: 15px; font-weight: 700; color: #0f172a; }
  em { font-size: 11px; color: #94a3b8; font-style: normal; margin-left: 2px; }
}
.zg-ws__drawer-mini {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.zg-ws__drawer-mini-item {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 10px;
  align-items: center;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.zg-ws__drawer-mini-label {
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}
.zg-ws__drawer-mini-chart svg { width: 100%; height: 40px; display: block; }

/* 滚动条 */
.zg-ws__station-list::-webkit-scrollbar,
.zg-ws__dashboard::-webkit-scrollbar,
.zg-ws__aqipanel::-webkit-scrollbar {
  width: 6px;
}
.zg-ws__station-list::-webkit-scrollbar-thumb,
.zg-ws__dashboard::-webkit-scrollbar-thumb,
.zg-ws__aqipanel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* 响应式 */
@media (max-width: 1600px) {
  .zg-ws__body { grid-template-columns: 260px 1fr 320px; }
}
@media (max-width: 1280px) {
  .zg-ws__body { grid-template-columns: 1fr 320px; }
  .zg-ws__sidebar { display: none; }
  .zg-ws__dash-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .zg-ws__body { grid-template-columns: 1fr; }
  .zg-metrics { grid-template-columns: repeat(2, 1fr); }
  .zg-ws__dash-grid { grid-template-columns: 1fr; }
}
</style>
