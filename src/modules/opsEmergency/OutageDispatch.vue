<!--
  智光云枢 · 抢修与停电研判 · 核心页面
  业务域：opsEmergency
  功能：故障溯源引擎 + 停电范围推演 + 抢修路径规划 + 临时照明自动调度
  依赖：lineTopo（拓扑上下游关联）、opsTicket（工单生成）、SceneLinkage（DAG执行引擎）
  联动：gridKnowledge（电路参数库）、digitalTwin（三维GIS地图）、terminalAtlas/LampControl（远程开灯）
-->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Warning, MapLocation, Timer, Tools, Bell, CircleCheck, VideoCamera, Share } from '@element-plus/icons-vue';

const currentMode = ref('outage'); // outage = 停电研判, patrol = 抢修调度

// ===== 模拟：批量灭灯告警触发 =====
const outageEvent = ref(null);
const faultTraceSteps = ref([]);

function simulateBatchBlackout() {
  // 模拟：先导路主干馈线短路 → 下游 128 盏灯全部灭灯
  outageEvent.value = {
    id: 'OUT-20261102-001',
    time: '2026-11-02 14:23:15',
    location: '先导路 K0+350 ~ K2+100',
    blackoutLamps: 128,
    blackoutCount: 6,
    faultType: '批量灭灯',
    suspectCause: '主干馈线短路（疑似电缆井进水）',
  };
  faultTraceSteps.value = [
    { step: 1, from: '灯具 L001~L128', to: '回路 先导路 1# ~ 6#', action: '向上溯源', result: '6 个回路电压骤降为 0V' },
    { step: 2, from: '回路 1#~6#', to: '集中器 JD-先导路', action: '继续向上溯源', result: '集中器出线电压 0V，进线 380V 正常' },
    { step: 3, from: '集中器 JD-先导路', to: '分支接头 K0+350', action: '定位分支故障点', result: '🔍 接头处温度 82℃（正常 ≤ 60℃），疑似接触不良或进水短路' },
    { step: 4, from: '分支接头 K0+350', to: '主干馈线 F-先导路', action: '确认上游主干', result: '主干馈线电压 380V 正常，故障点锁定在 K0+350 分支接头' },
  ];
  ElMessage.warning('⚠️ 检测到批量灭灯，自动触发故障溯源');
}

// ===== 停电范围推演结果 =====
const outageScope = computed(() => {
  if (!outageEvent.value) return null;
  return {
    faultNode: '先导路 K0+350 电缆井 · 分支接头',
    faultNodeType: 'branch_joint',
    affectedCount: 128,
    affectedLamps: 128,
    affectedLength: '1.75km',
    upstreamPath: ['先导路 1# 箱变 → 主干馈线 F-先导路'],
    downstreamPath: ['分支接头 K0+350 → 回路 1#~6# → 灯具 L001~L128'],
  };
});

// ===== 抢修方案 =====
const repairPlan = computed(() => {
  if (!outageEvent.value) return null;
  return {
    primary: '🔧 直接抢修 K0+350 分支接头（预计 2.5 小时）',
    fallback: ['方案B：临时搭接通旁路（45分钟恢复供电）', '方案C：临时照明 + 夜间抢修（避开高峰）'],
    safetyZone: '先导路 K0+300 ~ K0+400 需封锁，设置警示围挡',
    toolsNeeded: ['高压绝缘操作杆', '力矩扳手', '红外热像仪', '便携式发电机（备用）'],
    materialNeeded: ['电缆接头套件 × 1', '绝缘胶带 × 2', '导电膏 × 1'],
  };
});

// ===== 抢修路径 =====
const repairRoute = ref([
  { order: 1, point: '抢修车出发地（运维班）', coord: '28.219°N, 112.934°E', eta: '15 min' },
  { order: 2, point: '先导路 K0+350 故障点（首要）', coord: '28.221°N, 112.937°E', eta: '25 min', status: 'current' },
  { order: 3, point: '先导路 K0+500 电缆井（相邻排查）', coord: '28.223°N, 112.939°E', eta: '35 min', status: 'pending' },
  { order: 4, point: '先导路 K0+800 接线盒（相邻排查）', coord: '28.226°N, 112.942°E', eta: '48 min', status: 'pending' },
]);

// ===== 临时照明调度 =====
const tempLightPlan = computed(() => {
  if (!outageEvent.value) return null;
  return {
    targetLamps: 24,
    logic: '沿停电路段两侧相邻正常杆桩，按 50m 间隔启动临时全亮',
    brightness: 100,
    duration: '故障修复前持续开启',
    estimatedPower: '≈ 12kW（24 盏 × 500W）',
    triggerAction: '调用策略引擎 → actionType=lamp-on → 目标杆桩 = 相邻杆桩 ID 集合',
  };
});

// 执行临时照明
const tempLightActive = ref(false);
function executeTempLight() {
  tempLightActive.value = true;
  ElMessage.success('✅ 临时照明指令已下发（24 盏相邻杆桩 → 100% 亮度）');
}
function cancelTempLight() {
  tempLightActive.value = false;
  ElMessage.info('临时照明已取消');
}

// ===== 联动 lineTopo / SceneLinkage =====
function viewInTopo() { ElMessage.info('跳转线路拓扑 → 高亮故障链路'); }
function viewInScene() { ElMessage.info('跳转场景联动 → 查看/编辑临时照明策略'); }
function autoCreateTicket() {
  ElMessage.success('✅ 抢修工单已自动创建：WO-20261102-0032，已派单给抢修班张工');
}
function videoSurvey() { ElMessage.info('调用 AI 视觉 → 调度先导路摄像头查看现场情况'); }

// ===== 自动生成预案 =====
const autoPreset = computed(() => {
  if (!outageEvent.value) return null;
  return {
    name: '先导路 K0+350 电缆井进水短路抢修预案',
    steps: [
      '1. 到达故障点 → 设置安全警戒区（50m 范围）',
      '2. 停电验电挂牌 → 断开上游 1# 回路开关',
      '3. 红外测温定位具体故障接头 → 排除进水',
      '4. 清理氧化层 → 涂导电膏 → 重新紧固螺栓（40N·m）',
      '5. 绝缘电阻复测 ≥ 10MΩ（500V 兆欧表）',
      '6. 合闸送电 → 确认下游 128 盏灯恢复亮灯',
      '7. 临时照明自动关闭 → 归档处置报告',
    ],
    attachments: ['gridKnowledge#2 中低压电缆接头制作工艺', 'gridKnowledge#4 箱变检修安全规程'],
  };
});

onMounted(() => {
  // 自动触发故障模拟（演示用）
  setTimeout(() => simulateBatchBlackout(), 800);
});
</script>

<template>
  <section class="zg-oe-root min-h-screen bg-slate-50">
    <!-- 顶部标题 -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white">
          <el-icon :size="22"><Warning /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800">抢修与停电研判中心</h1>
          <p class="text-sm text-slate-500">批量灭灯自动溯源 → 停电范围推演 → 抢修路径规划 → 临时照明自动调度</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <el-button @click="viewInTopo">🔗 跳转线路拓扑</el-button>
        <el-button @click="viewInScene">🔗 跳转场景联动</el-button>
        <el-button type="primary" :icon="VideoCamera" @click="videoSurvey">📹 AI 视频勘查</el-button>
        <el-button type="danger" :icon="Bell" @click="simulateBatchBlackout">🔧 模拟批量灭灯</el-button>
      </div>
    </header>

    <div class="p-6 grid grid-cols-12 gap-6">
      <!-- ===== 左侧：故障溯源 + 停电推演 ===== -->
      <div class="col-span-7 space-y-6">
        <!-- 故障告警卡片 -->
        <div v-if="outageEvent" class="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-xl p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white animate-pulse">
              <el-icon :size="28"><Warning /></el-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold text-red-700">⚡ 批量灭灯告警 #{{ outageEvent.id }}</h2>
              <p class="text-sm text-slate-600">{{ outageEvent.time }} · {{ outageEvent.location }}</p>
            </div>
          </div>
          <div class="grid grid-cols-4 gap-3 text-center">
            <div class="bg-white rounded-lg p-3"><div class="text-2xl font-bold text-red-600">{{ outageEvent.blackoutLamps }}</div><div class="text-xs text-slate-500">影响灯具</div></div>
            <div class="bg-white rounded-lg p-3"><div class="text-2xl font-bold text-amber-600">{{ outageEvent.blackoutCount }}</div><div class="text-xs text-slate-500">影响回路</div></div>
            <div class="bg-white rounded-lg p-3"><div class="text-sm text-slate-700 font-medium">{{ outageEvent.suspectCause }}</div><div class="text-xs text-slate-500 mt-1">初步研判</div></div>
            <div class="bg-white rounded-lg p-3"><div class="text-sm text-slate-700 font-medium">🔍 自动溯源中</div><div class="text-xs text-slate-500 mt-1">AI 算法运行中</div></div>
          </div>
        </div>

        <!-- 故障溯源链路图 -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><el-icon class="text-indigo-500"><Share /></el-icon>故障溯源链路（自动推演）</h3>
          <div v-if="faultTraceSteps.length" class="space-y-3">
            <div v-for="(s, i) in faultTraceSteps" :key="i" class="flex items-start gap-3">
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">{{ i+1 }}</div>
                <div v-if="i < faultTraceSteps.length - 1" class="w-0.5 h-8 bg-slate-200 my-1" />
              </div>
              <div class="flex-1 bg-slate-50 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 font-medium">{{ s.action }}</span>
                  <span class="text-xs text-slate-400">{{ s.step }}</span>
                </div>
                <div class="text-sm text-slate-700">
                  <span class="font-medium">{{ s.from }}</span>
                  <el-icon class="mx-1 text-slate-400"><Share /></el-icon>
                  <span class="font-medium">{{ s.to }}</span>
                </div>
                <p class="text-xs text-slate-500 mt-1">📊 {{ s.result }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-400">等待批量灭灯告警触发...</div>
        </div>

        <!-- 停电范围推演结果 -->
        <div v-if="outageScope" class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><el-icon class="text-red-500"><MapLocation /></el-icon>停电范围推演结果</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gradient-to-br from-red-50 to-amber-50 rounded-lg p-4 border border-red-100">
              <div class="text-xs text-slate-500 mb-1">🔍 推演定位故障点</div>
              <div class="text-sm font-bold text-red-700">{{ outageScope.faultNode }}</div>
            </div>
            <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-100">
              <div class="text-xs text-slate-500 mb-1">⬆️ 上游供电链路</div>
              <div class="text-sm text-slate-700">{{ outageScope.upstreamPath }}</div>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-100">
              <div class="text-xs text-slate-500 mb-1">⬇️ 下游影响范围</div>
              <div class="text-sm text-red-700 font-medium">{{ outageScope.affectedLamps }} 盏灯 · {{ outageScope.affectedLength }}</div>
            </div>
          </div>
          <!-- 拓扑链路可视化 -->
          <div class="mt-4 bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300">
            <div class="flex items-center gap-1 mb-2">
              <span class="text-green-400">●</span>
              <span class="text-green-400">{{ outageScope.upstreamPath[0] }}</span>
              <span class="text-slate-500 mx-1">→</span>
              <span class="text-red-400">● {{ outageScope.faultNode }}</span>
              <span class="text-slate-500 mx-1">→</span>
              <span class="text-red-400">● {{ outageScope.downstreamPath }}</span>
            </div>
            <div class="text-slate-500">↓ 🔴 整段下游离线，红色高亮于线路拓扑 / GIS 地图</div>
          </div>
        </div>
      </div>

      <!-- ===== 右侧：抢修调度 + 临时照明 ===== -->
      <div class="col-span-5 space-y-6">
        <!-- 抢修路径规划 -->
        <div v-if="repairPlan" class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 class="text-base font-bold text-slate-800 mb-3 flex items-center gap-2"><el-icon class="text-indigo-500"><Timer /></el-icon>抢修路径规划</h3>
          <div class="space-y-2">
            <div v-for="r in repairRoute" :key="r.order" class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                   :class="r.status === 'current' ? 'bg-red-500 text-white animate-pulse' : r.status === 'pending' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-500 text-white'">
                {{ r.order }}
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium text-slate-700">{{ r.point }}</div>
                <div class="text-xs text-slate-400 flex gap-2">
                  <span>⏱ {{ r.eta }}</span>
                  <span>📍 {{ r.coord }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100">
            <div class="text-sm text-slate-700 font-medium mb-1">🎯 抢修方案：</div>
            <div class="text-sm text-indigo-600 font-semibold">{{ repairPlan.primary }}</div>
            <div class="mt-2 text-xs text-slate-500">
              <p>🛡 安全警戒区：{{ repairPlan.safetyZone }}</p>
              <p>🛠 所需工具：{{ repairPlan.toolsNeeded.join('、') }}</p>
              <p>📦 所需材料：{{ repairPlan.materialNeeded.join('、') }}</p>
            </div>
          </div>
        </div>

        <!-- 临时照明调度 -->
        <div v-if="tempLightPlan" class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-5">
          <h3 class="text-base font-bold text-indigo-700 mb-3 flex items-center gap-2"><el-icon class="text-indigo-500"><Bell /></el-icon>临时照明自动调度</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-slate-600">目标杆桩</span><span class="font-bold text-indigo-700">{{ tempLightPlan.targetLamps }} 盏</span></div>
            <div class="flex justify-between"><span class="text-slate-600">执行逻辑</span><span class="text-slate-700">{{ tempLightPlan.logic }}</span></div>
            <div class="flex justify-between"><span class="text-slate-600">目标亮度</span><span class="font-bold text-indigo-700">{{ tempLightPlan.brightness }}%</span></div>
            <div class="flex justify-between"><span class="text-slate-600">预估功率</span><span class="text-slate-700">{{ tempLightPlan.estimatedPower }}</span></div>
          </div>
          <div class="mt-4 flex gap-2">
            <el-button v-if="!tempLightActive" type="primary" @click="executeTempLight">⚡ 执行临时照明</el-button>
            <el-button v-else type="success" :icon="CircleCheck" disabled>✅ 已下发（24 盏 → 100%）</el-button>
            <el-button v-if="tempLightActive" @click="cancelTempLight">取消</el-button>
          </div>
        </div>

        <!-- 自动生成抢修预案 -->
        <div v-if="autoPreset" class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2"><el-icon class="text-emerald-500"><Tools /></el-icon>自动生成抢修预案</h3>
            <el-button size="small" type="success" @click="autoCreateTicket">📋 一键创建工单</el-button>
          </div>
          <p class="text-sm text-slate-700 font-medium mb-2">📄 {{ autoPreset.name }}</p>
          <ol class="text-xs text-slate-600 space-y-1 pl-4 list-decimal">
            <li v-for="(s, i) in autoPreset.steps" :key="i">{{ s.replace(/^\d+\.\s*/, '') }}</li>
          </ol>
          <div class="mt-3 pt-3 border-t border-slate-100">
            <div class="text-xs text-slate-500">📎 关联知识库：{{ autoPreset.attachments.join('、') }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
