<!--
  智光云枢 · 线路拓扑 · 总览
  业务域：lineTopo
  功能：SVG 可视化馈电拓扑 + 点击真 Drawer + 故障定位真算法（多源电压骤降融合）
-->
<template>
  <section class="zg-lt-topo">
    <header class="zg-lt-topo__head">
      <div class="zg-lt-topo__headline">
        <div class="zg-lt-topo__sigil"><el-icon :size="22"><Connection /></el-icon></div>
        <div class="zg-lt-topo__copy">
          <h1 class="zg-lt-topo__title">线路拓扑</h1>
          <p class="zg-lt-topo__sub">3 条馈电线路 · 12 台配电箱 · 实时故障定位算法运行中</p>
        </div>
      </div>
      <div class="zg-lt-topo__head-meta">
        <el-tag type="success" effect="dark" round>运行中 {{ okCount }}</el-tag>
        <el-tag type="danger" effect="dark" round style="margin-left:6px" v-if="faultInfo">故障 1</el-tag>
        <el-tag type="warning" effect="dark" round style="margin-left:6px" v-if="overloadCount">过载 {{ overloadCount }}</el-tag>
      </div>
    </header>

    <!-- ===== 故障定位告警 ===== -->
    <el-alert
      v-if="faultInfo"
      type="error"
      show-icon
      :closable="false"
      title="⚠️ 线路故障定位"
      :description="faultDescription"
      class="zg-lt-topo__fault-alert"
    >
      <template #default>
        <div class="zg-lt-topo__fault-actions">
          <el-button type="danger" size="small">📋 自动派单</el-button>
          <el-button type="primary" size="small" @click="showFaultDetail">查看详情</el-button>
          <el-button size="small" @click="clearFault">清除模拟</el-button>
        </div>
      </template>
    </el-alert>

    <!-- ===== 拓扑 SVG ===== -->
    <div class="zg-lt-topo__wrap">
      <div class="zg-lt-topo__toolbar">
        <el-radio-group v-model="voltageMode" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="380">380V 主线</el-radio-button>
          <el-radio-button value="220">220V 支线</el-radio-button>
        </el-radio-group>
        <div class="zg-lt-topo__legend">
          <span class="lg-item"><span class="sw sw--380"></span>实线 380V</span>
          <span class="lg-item"><span class="sw sw--220"></span>虚线 220V</span>
          <span class="lg-item"><span class="dot dot--green"></span>正常</span>
          <span class="lg-item"><span class="dot dot--yellow"></span>过载</span>
          <span class="lg-item"><span class="dot dot--red"></span>故障</span>
          <span class="lg-item"><span class="dot dot--gray"></span>离线</span>
        </div>
        <div>
          <el-tag size="small" type="info" style="margin-right:8px">算法阈值: {{ (faultThreshold * 100).toFixed(0) }}%</el-tag>
          <el-button size="small" @click="simulateFault">🔧 触发故障注入</el-button>
        </div>
      </div>

      <div class="zg-lt-topo__canvas">
        <svg viewBox="0 0 1200 820" preserveAspectRatio="xMidYMid meet" class="zg-lt-topo__svg">
          <defs>
            <!-- 故障外发光 -->
            <filter id="zg-glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="zg-glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <!-- 故障线渐变 -->
            <linearGradient id="zg-fault-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#dc2626" stop-opacity="0.3" />
              <stop offset="50%" stop-color="#dc2626" stop-opacity="1" />
              <stop offset="100%" stop-color="#dc2626" stop-opacity="0.3" />
            </linearGradient>
            <!-- 箭头 -->
            <marker id="zg-arrow-blue" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
            </marker>
            <marker id="zg-arrow-purple" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
            </marker>
            <marker id="zg-arrow-orange" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
            </marker>
          </defs>

          <!-- 背景网格 -->
          <g opacity="0.3">
            <path v-for="i in 12" :key="'gx'+i" :d="`M ${i * 100} 0 L ${i * 100} 820`" stroke="#e5e7eb" stroke-width="1" />
            <path v-for="i in 9" :key="'gy'+i" :d="`M 0 ${i * 100} L 1200 ${i * 100}`" stroke="#e5e7eb" stroke-width="1" />
          </g>

          <!-- 馈电柜（顶部大矩形） -->
          <g
            v-for="cab in feedCabinet"
            :key="cab.id"
            class="zg-lt-topo__feed topo-node topo-node--feeder"
            @click="showFeederDetail(cab)"
          >
            <rect :x="cab.x - 70" :y="cab.y - 35" width="140" height="70" rx="8" :fill="cab.color" />
            <rect :x="cab.x - 70" :y="cab.y - 35" width="140" height="70" rx="8" fill="none" stroke="#fff" stroke-width="2" />
            <text :x="cab.x" :y="cab.y - 5" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">{{ cab.name }}</text>
            <text :x="cab.x" :y="cab.y + 15" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="11">380V · 进线</text>
            <!-- 状态灯 -->
            <circle :cx="cab.x + 55" :cy="cab.y - 25" r="5" fill="#059669" class="zg-lt-topo__status-led" />
          </g>

          <!-- ===== 线路段（主线） ===== -->
          <!-- 分支 A：蓝 380V -->
          <path
            d="M 230 65 L 230 120 L 300 120 L 300 180"
            stroke="#3b82f6" stroke-width="4" fill="none"
            class="zg-lt-topo__main-line topo-line"
            marker-end="url(#zg-arrow-blue)"
            @click="showLineDetail(getLineById('L-A0'))"
          />
          <path
            v-for="(seg, i) in lineSegments.filter(s => s.feederId === 'FC-01')"
            :key="seg.id"
            :d="seg.path"
            :class="['zg-lt-topo__seg', 'topo-line', { 'topo-line--fault': faultInfo && faultInfo.lineId === seg.id, 'topo-line--overload': seg.overload }]"
            :stroke="faultInfo && faultInfo.lineId === seg.id ? '#ef4444' : '#3b82f6'"
            :filter="faultInfo && faultInfo.lineId === seg.id ? 'url(#zg-glow-red)' : seg.overload ? 'url(#zg-glow-amber)' : null"
            @click="showLineDetail(seg)"
          />

          <!-- 分支 B：紫 380V -->
          <path
            d="M 600 65 L 600 180"
            stroke="#a855f7" stroke-width="4" fill="none"
            class="zg-lt-topo__main-line topo-line"
            marker-end="url(#zg-arrow-purple)"
            @click="showLineDetail(getLineById('L-B0'))"
          />
          <path
            v-for="seg in lineSegments.filter(s => s.feederId === 'FC-02')"
            :key="seg.id"
            :d="seg.path"
            :class="['zg-lt-topo__seg', 'topo-line', { 'topo-line--fault': faultInfo && faultInfo.lineId === seg.id, 'topo-line--overload': seg.overload }]"
            :stroke="faultInfo && faultInfo.lineId === seg.id ? '#ef4444' : '#a855f7'"
            :filter="faultInfo && faultInfo.lineId === seg.id ? 'url(#zg-glow-red)' : seg.overload ? 'url(#zg-glow-amber)' : null"
            @click="showLineDetail(seg)"
          />

          <!-- 分支 C：橙 380V -->
          <path
            d="M 970 65 L 970 120 L 900 120 L 900 180"
            stroke="#f97316" stroke-width="4" fill="none"
            class="zg-lt-topo__main-line topo-line"
            marker-end="url(#zg-arrow-orange)"
            @click="showLineDetail(getLineById('L-C0'))"
          />
          <path
            v-for="seg in lineSegments.filter(s => s.feederId === 'FC-03')"
            :key="seg.id"
            :d="seg.path"
            :class="['zg-lt-topo__seg', 'topo-line', { 'topo-line--fault': faultInfo && faultInfo.lineId === seg.id, 'topo-line--overload': seg.overload }]"
            :stroke="faultInfo && faultInfo.lineId === seg.id ? '#ef4444' : '#f97316'"
            :filter="faultInfo && faultInfo.lineId === seg.id ? 'url(#zg-glow-red)' : seg.overload ? 'url(#zg-glow-amber)' : null"
            @click="showLineDetail(seg)"
          />

          <!-- 配电箱（小矩形 + 内部图标） -->
          <g v-for="box in boxes" :key="box.id" class="zg-lt-topo__box topo-node topo-node--cabinet" @click="showCabinetDetail(box)">
            <!-- 状态脉冲光环 -->
            <circle v-if="box.status === 'fault'" :cx="box.x" :cy="box.y" r="38" fill="none" stroke="#dc2626" stroke-width="2" opacity="0.5" class="zg-lt-topo__pulse-ring" />
            <circle v-if="box.status === 'overload'" :cx="box.x" :cy="box.y" r="36" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.4" class="zg-lt-topo__pulse-ring" />
            <circle v-if="faultInfo && faultInfo.affectedCabinetIds.includes(box.id)" :cx="box.x" :cy="box.y" r="42" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.7" class="zg-lt-topo__fault-ring" />
            <!-- 矩形 -->
            <rect :x="box.x - 32" :y="box.y - 22" width="64" height="44" rx="6"
              :fill="box.status === 'offline' ? '#e5e7eb' : '#fff'"
              :stroke="statusColor(box.status)"
              stroke-width="2.5" />
            <!-- 小图标（配电箱内部） -->
            <g :transform="`translate(${box.x - 10}, ${box.y - 12})`" fill="none" :stroke="statusColor(box.status)" stroke-width="1.8">
              <rect x="0" y="0" width="8" height="10" rx="1" />
              <rect x="12" y="0" width="8" height="10" rx="1" />
              <circle cx="4" cy="15" r="2.5" />
              <circle cx="16" cy="15" r="2.5" />
            </g>
            <!-- 文本 -->
            <text :x="box.x" :y="box.y + 24" text-anchor="middle" :fill="statusColor(box.status)" font-size="11" font-weight="700">{{ box.id }}</text>
            <text :x="box.x" :y="box.y + 38" text-anchor="middle" fill="#64748b" font-size="9">{{ box.name }}</text>
          </g>

          <!-- 220V 支线（点划线）从配电箱分出去到灯杆簇 -->
          <g v-for="branch in branches" :key="branch.id">
            <path
              :d="branch.path"
              stroke="#a855f7"
              stroke-width="1.5"
              fill="none"
              stroke-dasharray="4 3"
              opacity="0.7"
              class="zg-lt-topo__sub-line topo-line"
              @click="showLineDetail(branch)"
            />
            <!-- 灯杆小圆点簇 -->
            <g v-for="(lamp, li) in branch.lamps" :key="li">
              <circle :cx="lamp.x" :cy="lamp.y" r="4" :fill="lamp.status === 'fault' ? '#dc2626' : lamp.status === 'offline' ? '#94a3b8' : '#059669'" class="zg-lt-topo__lamp" />
            </g>
          </g>
        </svg>
      </div>
    </div>

    <!-- ===== 详情 Drawer ===== -->
    <el-drawer v-model="detailVisible" :title="detailTitle" size="480px">
      <template v-if="detailObj">
        <!-- 馈电柜详情 -->
        <div v-if="detailType === 'feeder'" class="zg-lt-topo__detail">
          <div class="zg-lt-topo__detail-head">
            <span class="id">{{ detailObj.id }}</span>
            <el-tag type="success" effect="dark" round size="small">运行中</el-tag>
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="名称">{{ detailObj.name }}</el-descriptions-item>
            <el-descriptions-item label="资产编码">{{ detailObj.assetId }}</el-descriptions-item>
            <el-descriptions-item label="规格">{{ detailObj.spec }}</el-descriptions-item>
            <el-descriptions-item label="额定电流">
              <strong>{{ detailObj.maxLoad }} A</strong>（当前 <span style="color:var(--zg-amber-glow)">{{ detailObj.currentLoad }} A</span> · 负载率 {{ (detailObj.currentLoad / detailObj.maxLoad * 100).toFixed(1) }}%）
            </el-descriptions-item>
            <el-descriptions-item label="上次测试">{{ detailObj.lastTestDate }}</el-descriptions-item>
            <el-descriptions-item label="下次测试">
              <span :style="{ color: daysTo(detailObj.nextTestDate) < 30 ? 'var(--zg-rose-danger)' : '' }">
                {{ detailObj.nextTestDate }}（剩 {{ daysTo(detailObj.nextTestDate) }} 天）
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="测试结果">{{ detailObj.testResult }}</el-descriptions-item>
            <el-descriptions-item label="关联线路">{{ detailObj.connectedLines }} 条 · 下游配电箱 {{ detailObj.connectedCabinets }} 台</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 支线详情 -->
        <div v-else-if="detailType === 'line'" class="zg-lt-topo__detail">
          <div class="zg-lt-topo__detail-head">
            <span class="id">{{ detailObj.id }}</span>
            <el-tag :type="detailObj.status === 'fault' ? 'danger' : detailObj.status === 'overload' ? 'warning' : 'success'" effect="dark" round size="small">{{ statusText(detailObj.status) }}</el-tag>
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="名称">{{ detailObj.name }}</el-descriptions-item>
            <el-descriptions-item label="规格">{{ detailObj.spec }}</el-descriptions-item>
            <el-descriptions-item label="长度">{{ detailObj.length }} m</el-descriptions-item>
            <el-descriptions-item label="类型">{{ detailObj.type === 'cable_trench' ? '电缆沟' : '架空' }}</el-descriptions-item>
            <el-descriptions-item label="载流量">{{ detailObj.carrier }} A</el-descriptions-item>
            <el-descriptions-item label="上次测试">{{ detailObj.lastTestDate }}</el-descriptions-item>
            <el-descriptions-item label="下次测试">
              <span :style="{ color: daysTo(detailObj.nextTestDate) < 30 ? 'var(--zg-rose-danger)' : '' }">
                {{ detailObj.nextTestDate }}（剩 {{ daysTo(detailObj.nextTestDate) }} 天）
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="连接关系">
              上游: {{ detailObj.connectedTo?.feeder || detailObj.connectedTo?.fromCabinet || '-' }} → 下游: {{ detailObj.connectedTo?.toCabinet || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="杆基数">{{ detailObj.polesCount || '-' }} 基</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 配电箱详情 -->
        <div v-else-if="detailType === 'cabinet'" class="zg-lt-topo__detail">
          <div class="zg-lt-topo__detail-head">
            <span class="id">{{ detailObj.id }}</span>
            <el-tag :type="detailObj.status === 'fault' ? 'danger' : detailObj.status === 'overload' ? 'warning' : 'success'" effect="dark" round size="small">{{ statusText(detailObj.status) }}</el-tag>
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="名称">{{ detailObj.name }}</el-descriptions-item>
            <el-descriptions-item label="资产编码">{{ detailObj.asset || 'ZG-ASSET-CAB' }}</el-descriptions-item>
            <el-descriptions-item label="规格">{{ detailObj.spec }}</el-descriptions-item>
            <el-descriptions-item label="电压等级">{{ detailObj.voltage }}</el-descriptions-item>
            <el-descriptions-item label="所在支线">{{ detailObj.lineName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="上级馈电柜">{{ detailObj.feederName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="关联灯杆">{{ detailObj.lampCount }} 盏</el-descriptions-item>
            <el-descriptions-item label="三相电压">
              <span style="font-family:monospace">
                Ua={{ detailObj.ua?.toFixed(1) }}V · Ub={{ detailObj.ub?.toFixed(1) }}V · Uc={{ detailObj.uc?.toFixed(1) }}V
              </span>
            </el-descriptions-item>
          </el-descriptions>
          <div class="zg-lt-topo__detail-actions">
            <el-button type="primary" size="small" @click="$router.push('/lineTopo/cabinet')">进入详情页 →</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { ElAlert } from 'element-plus'

// ===== 故障检测阈值 =====
const faultThreshold = ref(0.7) // 电压降到正常值 70% 以下判为骤降

// ===== 基础数据：馈电柜 =====
const feedCabinet = ref([
  {
    id: 'FC-01',
    name: '先导路南馈电柜 A-01',
    x: 230, y: 30,
    color: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
    assetId: 'ASSET-2024-0312',
    spec: 'YJV-4×240 · 380V',
    maxLoad: 630,
    currentLoad: 245,
    lastTestDate: '2026-08-15',
    nextTestDate: '2027-02-15',
    testResult: '接地 0.8Ω ✓ · 绝缘 500MΩ ✓ · 三相平衡 ±1.2% ✓',
    connectedLines: 3,
    connectedCabinets: 4
  },
  {
    id: 'FC-02',
    name: '麓谷馈电柜 B-01',
    x: 600, y: 30,
    color: 'linear-gradient(135deg,#a855f7,#c084fc)',
    assetId: 'ASSET-2024-0313',
    spec: 'YJV-4×240 · 380V',
    maxLoad: 630,
    currentLoad: 312,
    lastTestDate: '2026-07-20',
    nextTestDate: '2027-01-20',
    testResult: '接地 1.1Ω ✓ · 绝缘 480MΩ ✓ · 三相平衡 ±0.9% ✓',
    connectedLines: 3,
    connectedCabinets: 4
  },
  {
    id: 'FC-03',
    name: '梅溪湖馈电柜 C-01',
    x: 970, y: 30,
    color: 'linear-gradient(135deg,#f97316,#fb923c)',
    assetId: 'ASSET-2024-0314',
    spec: 'YJV-4×240 · 380V',
    maxLoad: 630,
    currentLoad: 198,
    lastTestDate: '2026-09-01',
    nextTestDate: '2027-03-01',
    testResult: '接地 0.6Ω ✓ · 绝缘 520MΩ ✓ · 三相平衡 ±0.7% ✓',
    connectedLines: 3,
    connectedCabinets: 4
  }
])

// ===== 配电箱（每台都有实时电压 ua/ub/uc）=====
const boxes = ref([
  // 蓝色支线（先导路）4 个
  { id: 'D-11', name: '先导路-1', x: 300, y: 240, status: 'ok', feederId: 'FC-01', feederName: '先导路南馈电柜 A-01', lineId: 'L-A1', lineName: '先导路 L1 支线', spec: 'YJV-4×70', length: '120m', carry: '210A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-017', lampCount: 42, ua: 220.2, ub: 219.8, uc: 220.5 },
  { id: 'D-12', name: '先导路-2', x: 300, y: 390, status: 'ok', feederId: 'FC-01', feederName: '先导路南馈电柜 A-01', lineId: 'L-A2', lineName: '先导路 L2 支线', spec: 'YJV-4×50', length: '95m', carry: '175A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-018', lampCount: 38, ua: 219.5, ub: 220.1, uc: 219.9 },
  { id: 'D-13', name: '先导路-3', x: 300, y: 540, status: 'overload', feederId: 'FC-01', feederName: '先导路南馈电柜 A-01', lineId: 'L-A3', lineName: '先导路 L3 支线', spec: 'YJV-4×70', length: '150m', carry: '210A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-019', lampCount: 52, ua: 218.8, ub: 219.2, uc: 218.5 },
  { id: 'D-14', name: '先导路-4', x: 300, y: 690, status: 'ok', feederId: 'FC-01', feederName: '先导路南馈电柜 A-01', lineId: 'L-A4', lineName: '先导路 L4 支线', spec: 'YJV-4×50', length: '110m', carry: '175A', voltage: '220V', asset: 'ZG-ASSET-CAB-2025-020', lampCount: 45, ua: 220.0, ub: 219.6, uc: 220.3 },

  // 紫色支线（麓谷）4 个
  { id: 'D-21', name: '麓谷-1', x: 600, y: 240, status: 'ok', feederId: 'FC-02', feederName: '麓谷馈电柜 B-01', lineId: 'L-B1', lineName: '麓谷 L1 支线', spec: 'YJV-4×70', length: '130m', carry: '210A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-021', lampCount: 48, ua: 220.1, ub: 220.3, uc: 219.8 },
  { id: 'D-22', name: '麓谷-2', x: 600, y: 390, status: 'ok', feederId: 'FC-02', feederName: '麓谷馈电柜 B-01', lineId: 'L-B2', lineName: '麓谷 L2 支线', spec: 'YJV-4×50', length: '85m', carry: '175A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-022', lampCount: 40, ua: 219.9, ub: 220.0, uc: 220.2 },
  { id: 'D-23', name: '麓谷-3', x: 600, y: 540, status: 'ok', feederId: 'FC-02', feederName: '麓谷馈电柜 B-01', lineId: 'L-B3', lineName: '麓谷 L3 支线', spec: 'YJV-4×70', length: '140m', carry: '210A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-023', lampCount: 50, ua: 220.4, ub: 219.7, uc: 220.1 },
  { id: 'D-24', name: '麓谷-4', x: 600, y: 690, status: 'offline', feederId: 'FC-02', feederName: '麓谷馈电柜 B-01', lineId: 'L-B4', lineName: '麓谷 L4 支线', spec: 'YJV-4×50', length: '100m', carry: '175A', voltage: '220V', asset: 'ZG-ASSET-CAB-2025-024', lampCount: 38, ua: 0, ub: 0, uc: 0 },

  // 橙色支线（梅溪湖）4 个
  { id: 'D-31', name: '梅溪湖-1', x: 900, y: 240, status: 'ok', feederId: 'FC-03', feederName: '梅溪湖馈电柜 C-01', lineId: 'L-C1', lineName: '梅溪湖 L1 支线', spec: 'YJV-4×70', length: '115m', carry: '210A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-025', lampCount: 46, ua: 220.3, ub: 220.1, uc: 219.9 },
  { id: 'D-32', name: '梅溪湖-2', x: 900, y: 390, status: 'ok', feederId: 'FC-03', feederName: '梅溪湖馈电柜 C-01', lineId: 'L-C2', lineName: '梅溪湖 L2 支线', spec: 'YJV-4×50', length: '90m', carry: '175A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-026', lampCount: 42, ua: 219.7, ub: 220.2, uc: 220.0 },
  { id: 'D-33', name: '梅溪湖-3', x: 900, y: 540, status: 'ok', feederId: 'FC-03', feederName: '梅溪湖馈电柜 C-01', lineId: 'L-C3', lineName: '梅溪湖 L3 支线', spec: 'YJV-4×70', length: '160m', carry: '210A', voltage: '380V', asset: 'ZG-ASSET-CAB-2025-027', lampCount: 54, ua: 220.0, ub: 219.8, uc: 220.4 },
  { id: 'D-34', name: '梅溪湖-4', x: 900, y: 690, status: 'ok', feederId: 'FC-03', feederName: '梅溪湖馈电柜 C-01', lineId: 'L-C4', lineName: '梅溪湖 L4 支线', spec: 'YJV-4×50', length: '105m', carry: '175A', voltage: '220V', asset: 'ZG-ASSET-CAB-2025-028', lampCount: 52, ua: 219.6, ub: 220.1, uc: 219.8 }
])

// ===== 线路段（主线从馈电柜到各配电箱的段）=====
// 每条线路对应上游配电箱 id (或 feeder) 和 下游配电箱 id
const lineSegments = computed(() => {
  const segs = []
  // 按 feeder 分组
  const feeders = feedCabinet.value.map(f => f.id)
  const feederXMap = { 'FC-01': 300, 'FC-02': 600, 'FC-03': 900 }
  for (const fid of feeders) {
    const feederBoxes = boxes.value.filter(b => b.feederId === fid && b.status !== 'offline')
    feederBoxes.sort((a, b) => a.y - b.y)
    const fx = feederXMap[fid]
    // 第一段：馈电柜 → 第一个配电箱
    if (feederBoxes.length > 0) {
      const first = feederBoxes[0]
      segs.push({
        id: first.lineId,
        name: first.lineName,
        feederId: fid,
        spec: first.spec,
        length: 120,
        type: 'cable_trench',
        carrier: parseInt(first.carry),
        lastTestDate: '2026-09-10',
        nextTestDate: '2027-03-10',
        connectedTo: { feeder: fid, fromCabinet: null, toCabinet: first.id },
        polesCount: 8,
        status: 'ok',
        overload: false,
        path: `M ${fx} 180 L ${first.x} ${first.y - 22}`
      })
    }
    // 后续段：配电箱 i → 配电箱 i+1
    for (let i = 0; i < feederBoxes.length - 1; i++) {
      const from = feederBoxes[i]
      const to = feederBoxes[i + 1]
      segs.push({
        id: to.lineId,
        name: to.lineName,
        feederId: fid,
        spec: to.spec,
        length: 150,
        type: 'cable_trench',
        carrier: parseInt(to.carry),
        lastTestDate: '2026-08-05',
        nextTestDate: '2027-02-05',
        connectedTo: { feeder: fid, fromCabinet: from.id, toCabinet: to.id },
        polesCount: 6,
        status: 'ok',
        overload: to.status === 'overload',
        path: `M ${from.x} ${from.y + 22} L ${to.x} ${to.y - 22}`
      })
    }
  }
  return segs
})

function getLineById(id) {
  return lineSegments.value.find(s => s.id === id) || {
    id, name: '主线', feederId: null, spec: 'YJV-4×240', length: 300,
    type: 'cable_trench', carrier: 400, lastTestDate: '2026-09-01', nextTestDate: '2027-03-01',
    connectedTo: { feeder: null, fromCabinet: null, toCabinet: null }, polesCount: 12, status: 'ok'
  }
}

// 220V 支线 + 灯杆簇
const branches = computed(() => {
  const arr = []
  boxes.value.forEach((box, bi) => {
    const lamps = []
    const leftLamps = 5 + (bi % 3)
    const rightLamps = 4 + (bi % 2)
    for (let i = 0; i < leftLamps; i++) {
      lamps.push({ x: box.x - 70 - i * 22, y: box.y - 10 + (i % 2) * 12, status: box.status === 'fault' && i === 2 ? 'fault' : box.status === 'offline' && i === 1 ? 'offline' : 'ok' })
    }
    for (let i = 0; i < rightLamps; i++) {
      lamps.push({ x: box.x + 70 + i * 22, y: box.y + 10 - (i % 2) * 12, status: box.status === 'overload' && i === 1 ? 'fault' : 'ok' })
    }
    arr.push({
      id: 'b-' + box.id,
      name: box.name + ' 左 220V 支线',
      spec: 'YJV-4×16',
      length: 120,
      type: box.status === 'offline' ? 'overhead' : 'cable_trench',
      carrier: 80,
      lastTestDate: '2026-06-15',
      nextTestDate: '2027-06-15',
      connectedTo: { feeder: box.feederId, fromCabinet: box.id, toCabinet: null },
      polesCount: leftLamps,
      status: box.status === 'fault' ? 'fault' : 'ok',
      path: `M ${box.x - 32} ${box.y - 22} Q ${box.x - 80} ${box.y - 40} ${box.x - 150} ${box.y - 20}`,
      lamps: lamps.slice(0, 5)
    })
    arr.push({
      id: 'b2-' + box.id,
      name: box.name + ' 右 220V 支线',
      spec: 'YJV-4×16',
      length: 120,
      type: 'cable_trench',
      carrier: 80,
      lastTestDate: '2026-06-15',
      nextTestDate: '2027-06-15',
      connectedTo: { feeder: box.feederId, fromCabinet: box.id, toCabinet: null },
      polesCount: rightLamps,
      status: box.status === 'fault' ? 'fault' : 'ok',
      path: `M ${box.x + 32} ${box.y + 22} Q ${box.x + 80} ${box.y + 40} ${box.x + 150} ${box.y + 20}`,
      lamps: lamps.slice(5, 10)
    })
  })
  return arr
})

// ===== 状态计算 =====
const okCount = computed(() => boxes.value.filter(b => b.status === 'ok').length)
const overloadCount = computed(() => boxes.value.filter(b => b.status === 'overload').length)
const faultInfo = ref(null)
const voltageMode = ref('all')

// ===== 详情 Drawer =====
const detailVisible = ref(false)
const detailObj = ref(null)
const detailType = ref('')

const detailTitle = computed(() => {
  if (!detailObj.value) return ''
  const prefix = { feeder: '馈电柜详情', line: '支线详情', cabinet: '配电箱详情' }[detailType.value] || '详情'
  return `${detailObj.value.id} · ${prefix}`
})

function showFeederDetail(f) {
  detailType.value = 'feeder'
  detailObj.value = f
  detailVisible.value = true
}
function showLineDetail(l) {
  detailType.value = 'line'
  detailObj.value = l
  detailVisible.value = true
}
function showCabinetDetail(b) {
  detailType.value = 'cabinet'
  detailObj.value = b
  detailVisible.value = true
}

function daysTo(dateStr) {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target - now) / 86400000)
}

function statusColor(s) {
  return { ok: '#059669', overload: '#f59e0b', fault: '#dc2626', offline: '#94a3b8' }[s] || '#059669'
}
function statusText(s) {
  return { ok: '正常', overload: '过载', fault: '故障', offline: '离线' }[s] || s
}

// ===== 故障定位真算法 =====
// 每台配电箱每 1 秒上传 Ua/Ub/Uc
// 某段支线故障时：该支线所有下游配电箱的某相电压骤降（降幅 > 30%）
// 找到所有电压低于正常值 70% 的配电箱
// 这些配电箱共享的最近支线 = 故障支线
// 故障点估计：该支线的中点
function detectFaultLine(cabinets, threshold = 0.7) {
  const NOMINAL = 220
  // 过滤掉离线的
  const online = cabinets.filter(c => c.status !== 'offline' && c.ua > 0)
  // 找到所有至少有一相电压低于阈值的配电箱
  const lowVoltageCabs = online.filter(c => {
    const minV = Math.min(c.ua, c.ub, c.uc)
    return minV < NOMINAL * threshold
  })
  if (lowVoltageCabs.length === 0) return null

  // 按 feeder 分组：同一馈电线下游的才是共享支线故障
  const byFeeder = {}
  lowVoltageCabs.forEach(c => {
    if (!byFeeder[c.feederId]) byFeeder[c.feederId] = []
    byFeeder[c.feederId].push(c)
  })

  // 找到数量最多的一组 —— 就是故障馈电线下游
  let maxGroup = null
  let maxLen = 0
  for (const fid in byFeeder) {
    if (byFeeder[fid].length > maxLen) {
      maxLen = byFeeder[fid].length
      maxGroup = byFeeder[fid]
    }
  }

  if (!maxGroup || maxGroup.length < 1) return null

  // 这一组共享的"最近支线"：找到最靠上（y 最小）的配电箱的 lineId 作为故障支线起点
  // 但算法：取这组中最上游的配电箱的 lineId —— 它就是故障支线，因为下游的都被它影响了
  maxGroup.sort((a, b) => a.y - b.y)
  const faultLineId = maxGroup[0].lineId

  const commonLine = lineSegments.value.find(s => s.id === faultLineId)

  // 故障点估计：该支线段的中点位置
  const faultCabinet = maxGroup[0]
  const prevCabinet = boxes.value.find(b => b.id === faultCabinet.id && lineSegments.value.some(s => s.id === faultCabinet.lineId && s.connectedTo?.fromCabinet))
  let distanceFromFeeder = 180 // 默认
  if (commonLine) {
    // 粗略按 Y 轴比例算
    const feederY = 180
    const cabY = faultCabinet.y
    distanceFromFeeder = Math.round((cabY - feederY) * 0.6)
  }

  return {
    lineId: faultLineId,
    line: commonLine,
    affectedCabinets: maxGroup,
    affectedCabinetIds: maxGroup.map(c => c.id),
    faultDistance: distanceFromFeeder,
    between: commonLine?.connectedTo?.fromCabinet ? `${commonLine.connectedTo.fromCabinet} 与 ${commonLine.connectedTo.toCabinet}` : `馈电柜出口 ${commonLine?.connectedTo?.feeder} 与 ${commonLine?.connectedTo?.toCabinet}`,
    suggestion: pickStaff()
  }
}

function pickStaff() {
  // 模拟推荐运维人员
  const staffList = [
    { name: '张建国', skill: '接 380V', distance: 300 },
    { name: '李明', skill: '电缆头制作', distance: 520 },
    { name: '王芳', skill: '绝缘测试', distance: 680 }
  ]
  return staffList[0]
}

const faultDescription = computed(() => {
  if (!faultInfo.value) return ''
  const f = faultInfo.value
  const lineName = f.line?.name || f.lineId
  const lineSpec = f.line?.spec || 'YJV-4×70'
  const lineLen = f.line?.length || 320
  const affectedCount = f.affectedCabinets.length
  const staff = f.suggestion
  return `${lineName}（${lineSpec} · ${lineLen}m） · 故障点估计：距离馈电柜约 ${f.faultDistance}m（在配电箱 ${f.between} 之间） · 影响 ${affectedCount} 个配电箱 / ${affectedCount * 8} 根灯杆 · 推荐运维：${staff.name}（${staff.skill} · 距离 ${staff.distance}m）`
})

function showFaultDetail() {
  if (!faultInfo.value) return
  ElAlert({
    title: '🔍 故障定位详情',
    message: `故障支线: ${faultInfo.value.lineId}\n影响配电箱: ${faultInfo.value.affectedCabinetIds.join(', ')}\n故障估计: ${faultInfo.value.faultDistance}m 处`,
    confirmButtonText: '知道了'
  })
}

// ===== 故障注入（模拟） =====
function simulateFault() {
  // 先清除旧故障
  clearFault()
  // 随机选一条支线段（对应某个配电箱）
  const candidates = boxes.value.filter(b => b.status !== 'offline')
  const target = candidates[Math.floor(Math.random() * candidates.length)]
  // 让该配电箱及其下游配电箱的电压骤降
  const feederBoxes = boxes.value.filter(b => b.feederId === target.feederId && b.status !== 'offline')
  const targetIdx = feederBoxes.findIndex(b => b.id === target.id)
  for (let i = targetIdx; i < feederBoxes.length; i++) {
    const cab = feederBoxes[i]
    const drop = 0.25 + Math.random() * 0.2 // 下降 25%-45%
    const whichPhase = ['ua', 'ub', 'uc'][Math.floor(Math.random() * 3)]
    cab[whichPhase] = Math.max(30, 220 * (1 - drop))
    cab.status = 'fault'
  }
  // 运行算法
  runDetection()
}

function clearFault() {
  faultInfo.value = null
  // 恢复所有配电箱状态和电压
  boxes.value.forEach(b => {
    if (b.status === 'fault') b.status = 'ok'
    if (b.status !== 'offline') {
      b.ua = 220 + (Math.random() - 0.5) * 2
      b.ub = 220 + (Math.random() - 0.5) * 2
      b.uc = 220 + (Math.random() - 0.5) * 2
    }
  })
}

function runDetection() {
  const result = detectFaultLine(boxes.value, faultThreshold.value)
  if (result) {
    faultInfo.value = result
  }
}

// ===== setInterval: 每 1 秒跳动三相电压 + 每 5 秒自动检测一次故障 =====
let voltageTimer = null
let detectTimer = null
const autoInjectTimer = null // 保留，暂不自动注入避免干扰

onMounted(() => {
  voltageTimer = setInterval(() => {
    boxes.value.forEach(b => {
      if (b.status === 'offline' || b.status === 'fault') return
      b.ua = Math.max(210, Math.min(230, b.ua + (Math.random() - 0.5) * 0.6))
      b.ub = Math.max(210, Math.min(230, b.ub + (Math.random() - 0.5) * 0.6))
      b.uc = Math.max(210, Math.min(230, b.uc + (Math.random() - 0.5) * 0.6))
    })
  }, 1000)
  detectTimer = setInterval(() => {
    // 每 5 秒自动运行一次故障算法（持续监测）
    runDetection()
  }, 5000)
})

onUnmounted(() => {
  if (voltageTimer) clearInterval(voltageTimer)
  if (detectTimer) clearInterval(detectTimer)
})
</script>

<style lang="scss" scoped>
.zg-lt-topo {
  padding: var(--zg-space-6);
  background: var(--zg-gradient-surface);
  min-height: calc(100vh - 120px);

  &__head {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: var(--zg-space-5); margin-bottom: var(--zg-space-4);
    border-bottom: 1px solid var(--zg-line-soft);
    &line { display: flex; gap: var(--zg-space-4); align-items: center; }
    &__sigil {
      width: 44px; height: 44px; border-radius: var(--zg-radius-md);
      background: linear-gradient(135deg, #3b82f6, #a855f7);
      color: #fff; display: flex; align-items: center; justify-content: center;
    }
    &__title { margin: 0; font-size: var(--zg-text-display-md); font-weight: 700; }
    &__sub { margin: 2px 0 0; font-size: var(--zg-text-body-sm); color: var(--zg-ink-tertiary); }
    &__head-meta { display: flex; align-items: center; }
  }

  // 故障告警
  &__fault-alert { margin-bottom: var(--zg-space-4); }
  &__fault-actions { display: flex; gap: var(--zg-space-2); margin-top: var(--zg-space-2); }

  // 画布包裹
  &__wrap {
    background: var(--zg-surface-card); border: 1px solid var(--zg-line-strong);
    border-radius: var(--zg-radius-lg); padding: var(--zg-space-5);
    box-shadow: var(--zg-shadow-card);
  }

  &__toolbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: var(--zg-space-4); padding-bottom: var(--zg-space-3);
    border-bottom: 1px solid var(--zg-line-soft); flex-wrap: wrap; gap: var(--zg-space-3);
  }

  &__legend { display: flex; gap: var(--zg-space-3); flex-wrap: wrap; }
  .lg-item { display: inline-flex; align-items: center; gap: 6px; font-size: var(--zg-text-caption); color: var(--zg-ink-secondary); }
  .sw {
    width: 22px; height: 3px; display: inline-block;
    &--380 { background: #3b82f6; border-radius: 2px; }
    &--220 { background: #a855f7; border-radius: 2px; background-image: repeating-linear-gradient(90deg, #a855f7 0, #a855f7 6px, transparent 6px, transparent 10px); background-size: 100% 100%; }
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .dot--green { background: #059669; }
  .dot--yellow { background: #f59e0b; }
  .dot--red { background: #dc2626; }
  .dot--gray { background: #94a3b8; }

  &__canvas {
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    border-radius: var(--zg-radius-md); border: 1px solid var(--zg-line-soft);
    overflow: hidden;
  }

  &__svg { width: 100%; height: auto; display: block; }

  // 馈电柜
  &__feed { cursor: pointer; transition: transform var(--zg-transition-fast); &:hover { transform: scale(1.05); } }
  &__status-led { animation: pulse 1.8s ease-in-out infinite; }

  // 配电箱
  &__box { cursor: pointer; transition: transform var(--zg-transition-fast); &:hover { transform: scale(1.08); } }

  // 线路段
  &__seg { cursor: pointer; transition: stroke-width var(--zg-transition-fast); stroke-width: 3; }
  &__seg:hover { stroke-width: 5; }

  // 脉冲光环
  &__pulse-ring { transform-origin: center; animation: breathe 2s ease-out infinite; }
  &__fault-ring { transform-origin: center; animation: breathe 1.2s ease-out infinite; }

  // 故障段样式
  .topo-line--fault {
    stroke: #ef4444 !important;
    stroke-width: 5 !important;
    stroke-dasharray: 12 6;
    animation: faultPulse 1s infinite, faultFlow 1.5s linear infinite;
  }
  .topo-line--overload {
    stroke: #f59e0b !important;
    stroke-width: 4 !important;
  }

  @keyframes faultPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  @keyframes faultFlow {
    0% { stroke-dashoffset: 36; }
    100% { stroke-dashoffset: 0; }
  }

  // 灯杆
  &__lamp { transition: r var(--zg-transition-fast); cursor: pointer; &:hover { r: 6; } }

  // 主线/支线
  &__main-line { transition: stroke-width var(--zg-transition-fast); cursor: pointer; }
  &__main-line:hover { stroke-width: 6; }
  &__sub-line { transition: stroke-width var(--zg-transition-fast); }
  &__sub-line:hover { stroke-width: 3; }

  // 详情
  &__detail {
    &-head {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: var(--zg-space-3); margin-bottom: var(--zg-space-4);
      border-bottom: 1px solid var(--zg-line-soft);
      .id { font-family: var(--zg-font-mono); font-size: var(--zg-text-display-sm); font-weight: 800; color: var(--zg-amber-glow); }
    }
  }
  &__detail-actions { margin-top: var(--zg-space-4); display: flex; gap: var(--zg-space-2); }
}
</style>
