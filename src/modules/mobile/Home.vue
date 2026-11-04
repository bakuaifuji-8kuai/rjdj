<!--
  智光云枢 · 移动端运维助手首页
  业务域：mobile
  功能：模拟 375px iPhone 屏幕预览运维工程师随身端
-->
<template>
  <section class="zg-mobile">
    <!-- 手机外壳 -->
    <div class="zg-mobile__phone">
      <!-- 顶部状态栏 -->
      <div class="zg-mobile__statusbar">
        <span class="zg-mobile__time">{{ liveTime }}</span>
        <div class="zg-mobile__statusicons">
          <span class="zg-mobile__signal">
            <span v-for="i in 4" :key="i" class="zg-mobile__signalbar" :style="{ height: i * 3 + 'px' }"></span>
          </span>
          <el-icon :size="14"><Service /></el-icon>
          <span class="zg-mobile__battery">
            <span class="zg-mobile__batterylevel" :style="{ width: '78%' }"></span>
          </span>
        </div>
      </div>

      <!-- 头部：logo + 标题 -->
      <header class="zg-mobile__head">
        <div class="zg-mobile__sigil">
          <el-icon :size="22"><Iphone /></el-icon>
        </div>
        <div class="zg-mobile__copy">
          <h1 class="zg-mobile__title">智光云枢</h1>
          <p class="zg-mobile__sub">运维助手</p>
        </div>
        <div class="zg-mobile__avatar">
          <el-icon :size="18"><User /></el-icon>
        </div>
      </header>

      <!-- 快捷操作区 -->
      <div class="zg-mobile__quickgrid">
        <div
          v-for="card in quickCards"
          :key="card.id"
          class="zg-mobile__quickcard"
          @click="handleQuick(card)"
        >
          <div class="zg-mobile__quickicon" :style="{ background: card.grad }">
            <el-icon :size="22"><component :is="card.icon" /></el-icon>
          </div>
          <span class="zg-mobile__quicklabel">{{ card.label }}</span>
          <span v-if="card.badge" class="zg-mobile__quickbadge">{{ card.badge }}</span>
        </div>
      </div>

      <!-- 今日告警横向滚动 -->
      <section class="zg-mobile__alerthub">
        <div class="zg-mobile__alerthead">
          <el-icon :size="16" color="var(--zg-danger)"><WarningFilled /></el-icon>
          <span class="zg-mobile__alerttitle">今日告警</span>
          <span class="zg-mobile__alertcount">{{ alerts.length }}</span>
        </div>
        <div class="zg-mobile__alerttrack">
          <div
            v-for="a in alerts"
            :key="a.id"
            class="zg-mobile__alertcard"
            :class="`zg-mobile__alertcard--${a.level}`"
          >
            <span class="zg-mobile__alertlevel">{{ a.levelText }}</span>
            <span class="zg-mobile__alertpoi">{{ a.poi }}</span>
            <span class="zg-mobile__alertloc">{{ a.loc }}</span>
            <span class="zg-mobile__alerttime">{{ a.time }}</span>
          </div>
        </div>
      </section>

      <!-- 附近杆桩 -->
      <section class="zg-mobile__nearby">
        <div class="zg-mobile__nearbyhead">
          <el-icon :size="16"><LocationFilled /></el-icon>
          <span>附近杆桩</span>
          <span class="zg-mobile__nearbyhint">500m 范围</span>
        </div>
        <div class="zg-mobile__mapplaceholder">
          <svg viewBox="0 0 280 160" class="zg-mobile__mapsvg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99,102,241,0.15)" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="280" height="160" fill="url(#grid)" />
            <circle cx="60" cy="50" r="6" fill="#10b981" />
            <circle cx="120" cy="80" r="6" fill="#10b981" />
            <circle cx="190" cy="40" r="6" fill="#f59e0b" />
            <circle cx="230" cy="110" r="6" fill="#10b981" />
            <circle cx="140" cy="130" r="10" fill="rgba(99,102,241,0.2)" />
            <circle cx="140" cy="130" r="4" fill="#6366f1" />
          </svg>
        </div>
        <div class="zg-mobile__nearbystat">
          <div class="zg-mobile__stat">
            <span class="zg-mobile__statnum">4</span>
            <span class="zg-mobile__statlbl">杆桩</span>
          </div>
          <div class="zg-mobile__stat zg-mobile__stat--ok">
            <span class="zg-mobile__statnum">3</span>
            <span class="zg-mobile__statlbl">在线</span>
          </div>
          <div class="zg-mobile__stat zg-mobile__stat--warn">
            <span class="zg-mobile__statnum">1</span>
            <span class="zg-mobile__statlbl">告警</span>
          </div>
        </div>
      </section>

      <!-- 底部 Tab 栏 -->
      <nav class="zg-mobile__tabbar">
        <div
          v-for="t in tabs"
          :key="t.id"
          class="zg-mobile__tab"
          :class="{ 'zg-mobile__tab--active': t.id === activeTab }"
          @click="activeTab = t.id"
        >
          <el-icon :size="20"><component :is="t.icon" /></el-icon>
          <span class="zg-mobile__tablabel">{{ t.label }}</span>
        </div>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Iphone,
  User,
  Service,
  WarningFilled,
  LocationFilled,
  Sunset,
  Tickets,
  Grid,
  Cpu,
  Setting,
  Promotion,
  BrushFilled,
} from '@element-plus/icons-vue'

const liveTime = ref('')
let timer = null

const quickCards = [
  { id: 'scan', label: '扫码派单', icon: BrushFilled, grad: 'linear-gradient(135deg,#6366f1,#a855f7)', badge: '' },
  { id: 'alert', label: '今日告警', icon: WarningFilled, grad: 'linear-gradient(135deg,#ef4444,#f97316)', badge: '3' },
  { id: 'ticket', label: '我的工单', icon: Tickets, grad: 'linear-gradient(135deg,#10b981,#06b6d4)', badge: '3' },
  { id: 'patrol', label: '巡检签到', icon: LocationFilled, grad: 'linear-gradient(135deg,#f59e0b,#ec4899)', badge: '' },
]

const alerts = [
  { id: 1, level: 'danger', levelText: '紧急', poi: '先导路#23', loc: '岳麓区·先导路', time: '08:12' },
  { id: 2, level: 'warn', levelText: '一般', poi: '麓谷#87', loc: '高新区·麓谷大道', time: '08:36' },
  { id: 3, level: 'danger', levelText: '紧急', poi: '梅溪湖#12', loc: '岳麓区·梅溪湖', time: '09:01' },
  { id: 4, level: 'warn', levelText: '一般', poi: '橘子洲头#05', loc: '岳麓区·橘洲路', time: '09:15' },
]

const tabs = [
  { id: 'net', label: '灯网', icon: Sunset },
  { id: 'ticket', label: '工单', icon: Tickets },
  { id: 'scan', label: '扫码', icon: Grid },
  { id: 'sec', label: '安防', icon: Cpu },
  { id: 'me', label: '我的', icon: User },
]
const activeTab = ref('net')

function handleQuick(card: { label: string }) {
  ElMessage.info(`点击了「${card.label}」`)
}

function tick() {
  const d = new Date()
  liveTime.value = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
onMounted(() => {
  tick()
  timer = window.setInterval(tick, 30000)
})
onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.zg-mobile {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: linear-gradient(135deg, #eef2ff, #f3e8ff);

  // 手机外壳
  &__phone {
    width: 375px;
    min-height: 760px;
    background: #0f172a;
    border-radius: 32px;
    border: 2px solid #333;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 10px 10px 0;
    display: flex;
    flex-direction: column;
    color: var(--zg-ink-primary, #1e293b);
  }

  // 状态栏
  &__statusbar {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }
  &__statusicons { display: flex; gap: 6px; align-items: center; }
  &__signal { display: flex; align-items: flex-end; gap: 1px; height: 10px; }
  &__signalbar { width: 3px; background: #fff; border-radius: 1px; }
  &__battery { width: 22px; height: 10px; border: 1px solid #fff; border-radius: 3px; padding: 1px; position: relative;
    &level { display: block; height: 100%; background: #fff; border-radius: 2px; }
  }

  // 头部
  &__head {
    background: linear-gradient(135deg, #6366f1, #a855f7);
    margin: 6px;
    border-radius: 18px;
    padding: 16px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__sigil {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
  }
  &__copy { flex: 1; }
  &__title { font-size: 20px; font-weight: 700; margin: 0; line-height: 1.2; }
  &__sub { font-size: 13px; margin: 2px 0 0; opacity: 0.85; }
  &__avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    display: flex; align-items: center; justify-content: center;
  }

  // 快捷操作
  &__quickgrid {
    background: #fff;
    margin: 6px;
    border-radius: 18px;
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
  }
  &__quickcard {
        position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  &__quickicon {
    width: 44px; height: 44px;
    border-radius: 12px;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
  }
  &__quicklabel { font-size: 12px; color: var(--zg-ink-primary, #1e293b); }
  &__quickbadge {
    position: absolute;
    top: -2px; right: 2px;
    min-width: 18px; height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--zg-danger, #ef4444);
    color: #fff; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
  }

  // 告警滚动区
  &__alerthub {
    background: #fff;
    margin: 6px;
    border-radius: 18px;
    padding: 14px 16px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
  }
  &__alerthead {
        display: flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 600; color: var(--zg-ink-primary, #1e293b);
    margin-bottom: 12px;
  }
  &__alertcount {
    margin-left: auto;
    font-size: 12px;
    background: rgba(239, 68, 68, 0.1);
    color: var(--zg-danger, #ef4444);
    padding: 2px 8px;
    border-radius: 8px;
    font-weight: 700;
  }
  &__alerttrack {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }
  &__alertcard {
    flex: 0 0 170px;
    border-radius: 12px;
    padding: 10px 12px;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 12px;
    &--danger { background: linear-gradient(135deg, #ef4444, #f97316); }
    &--warn   { background: linear-gradient(135deg, #f59e0b, #eab308); }
  }
  &__alertlevel { font-size: 11px; opacity: 0.9; }
  &__alertpoi  { font-weight: 700; font-size: 14px; }
  &__alertloc  { font-size: 11px; opacity: 0.9; }
  &__alerttime { font-size: 11px; opacity: 0.8; text-align: right; }

  // 附近杆桩
  &__nearby {
    background: #fff;
    margin: 6px;
    border-radius: 18px;
    padding: 14px 16px;
    box-shadow: var(--zg-shadow-card, 0 4px 16px rgba(0,0,0,0.04));
        flex: 1;
  }
  &__nearbyhead {
    display: flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 600;
    margin-bottom: 10px;
  }
  &__nearbyhint {
    margin-left: auto;
    font-size: 11px; font-weight: 400;
    color: var(--zg-ink-tertiary, #94a3b8);
  }
  &__mapplaceholder {
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  }
  &__mapsvg { display: block; width: 100%; height: 140px; }
  &__nearbystat {
    display: flex;
    justify-content: space-around;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  &__stat {
    display: flex; flex-direction: column; align-items: center;
    &num { font-size: 20px; font-weight: 700; color: var(--zg-ink-primary, #1e293b); }
    &lbl { font-size: 11px; color: var(--zg-ink-tertiary, #94a3b8); margin-top: 2px; }
    &--ok .zg-mobile__statnum { color: var(--zg-success, #10b981); }
    &--warn .zg-mobile__statnum { color: var(--zg-warning, #f59e0b); }
  }

  // Tab 栏
  &__tabbar {
    display: flex;
    justify-content: space-around;
    padding: 10px 6px 14px;
    color: var(--zg-ink-tertiary, #94a3b8);
    background: #fff;
    margin-top: 6px;
    border-radius: 18px 18px 12px 12px;
  }
  &__tab {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    cursor: pointer;
    transition: color 0.2s;
    &--active { color: #6366f1; }
  }
  &__tablabel { font-size: 11px; }
}
</style>
