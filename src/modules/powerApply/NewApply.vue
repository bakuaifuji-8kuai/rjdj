<!--
  智光云枢 · 用电申请服务 · 核心页面
  业务域：powerApply
  功能：用电申请全流程（申报→AI研判→审批→档案归档）
  依赖：lineTopo/CabinetDetail（箱变负载数据）、gridKnowledge（载流量参数）、openApi（接口）
-->
<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElSteps, ElStep, ElTag, ElButton, ElForm, ElFormItem, ElInput, ElSelect, ElOption, 
         ElDatePicker, ElUpload, ElDialog, ElMessageBox, ElStatistic, ElDescriptions, ElDescriptionsItem,
         ElTable, ElTableRow, ElTableCell, ElCard, ElDivider, ElAlert } from 'element-plus';
import { Document, Edit, Camera, Location, Check, Connection, SuccessFilled } from '@element-plus/icons-vue';

// ===== Tab 切换：新建申请 / 审批管理 / 历史档案 =====
const activeTab = ref('new');

// ===== 业务类型 =====
const bizTypes = [
  { value: 'new_install', label: '新建路灯用电报装', color: 'primary' },
  { value: 'temp_lighting', label: '临时亮化用电（节庆/活动）', color: 'warning' },
  { value: 'increase', label: '增容', color: 'success' },
  { value: 'reduce', label: '减容', color: 'info' },
  { value: 'transfer', label: '过户', color: '' },
  { value: 'rename', label: '更名', color: 'info' },
  { value: 'close', label: '销户', color: 'danger' },
  { value: 'pause', label: '暂停用电', color: 'warning' },
  { value: 'resume', label: '恢复用电', color: 'success' },
];

// ===== 用电申请表单 =====
const applyForm = ref({
  bizType: 'new_install',
  projectName: '',
  applicant: '',
  phone: '',
  org: '',
  address: '',
  powerNeeded: '',      // 预估负荷 kW
  gpsCoord: '',
  supplyPoint: '',       // 接入点（AI推荐后可手动调整）
  attachments: [],
});

// ===== AI 辅助研判结果 =====
const aiAnalysis = ref(null);
const aiLoading = ref(false);

function runAiAnalysis() {
  if (!applyForm.value.powerNeeded) { ElMessage.warning('请填写预估负荷'); return; }
  aiLoading.value = true;
  setTimeout(() => {
    // 模拟 AI 研判：调用 gridKnowledge 的载流量 + lineTopo 的箱变负载
    aiAnalysis.value = {
      supplyPoint: '先导路 2# 箱变 · 馈线 F-先导路（推荐）',
      cabinetLoad: 62,           // 当前负载率 %
      cableCapacity: 185,         // 电缆载流量 A
      newLoad: Number(applyForm.value.powerNeeded) / 0.38 * 0.8, // kW→A 估算
      marginPercent: 28,          // 裕度 %
      overloadRisk: false,
      suggestions: [
        '✅ 推荐接入点 2# 箱变，裕度充足，可直接供电',
        '📊 建议容量：' + Number(applyForm.value.powerNeeded) + 'kW，电缆 YJV22-4×70 载流量 205A 足够',
        '⚠️ 提醒：建议预留 20% 扩容余量，避免后续增容麻烦',
      ],
      autoStep: '初审',
      estimatedDays: '3-5 个工作日完成审批',
    };
    aiLoading.value = false;
    ElMessage.success('✅ AI 研判完成');
  }, 1500);
}

// ===== 提交申请 =====
const showSubmitDialog = ref(false);
function submitApplication() {
  ElMessageBox.confirm('确认提交用电申请？AI 推荐接入点将作为审批参考，可手动调整。', '提交申请', {
    type: 'info',
  }).then(() => {
    showSubmitDialog.value = true;
    setTimeout(() => showSubmitDialog.value = false, 2000);
    ElMessage.success('申请已提交，单号：POW-' + Date.now().toString().slice(-8));
  });
}

// ===== 审批流 =====
const approvalSteps = [
  { title: '申请提交', name: 'applicant' },
  { title: '照明主管部门初审', name: 'reviewer' },
  { title: '供电方案会审', name: 'council' },
  { title: '现场勘查派单', name: 'survey' },
  { title: '方案答复', name: 'reply' },
  { title: '施工备案', name: 'construction' },
  { title: '竣工报验', name: 'accept' },
  { title: '送电验收', name: 'power_on' },
];

// ===== 审批管理：待审批列表 =====
const pendingList = ref([
  { id: 'POW-20261101-0042', bizType: '新建路灯用电报装', name: '先导路延长线亮化工程', applicant: '张工', submitTime: '2026-11-01 10:23', currentStep: 'reviewer', progress: 12.5, status: '待初审' },
  { id: 'POW-20261031-0038', bizType: '临时亮化用电', name: '2026 湘江马拉松临时灯组', applicant: '李主任', submitTime: '2026-10-31 16:08', currentStep: 'survey', progress: 37.5, status: '勘查中' },
  { id: 'POW-20261028-0035', bizType: '增容', name: '梅溪湖 3# 箱变增容 500kVA → 800kVA', applicant: '王工', submitTime: '2026-10-28 09:15', currentStep: 'reply', progress: 50, status: '等待方案答复' },
  { id: 'POW-20261025-0030', bizType: '销户', name: '金星大道老旧路灯改造销户', applicant: '赵工', submitTime: '2026-10-25 14:42', currentStep: 'construction', progress: 62.5, status: '施工备案中' },
]);

function viewApplication(app) {
  ElMessage.info('查看申请详情：' + app.id);
}

// ===== 历史档案 =====
const historyList = ref([
  { id: 'POW-20260915-0015', bizType: '新建路灯用电报装', name: '麓谷西延段 86 杆路灯', status: '已送电', submitTime: '2026-09-15', power_on: '2026-10-20', duration: 35 },
  { id: 'POW-20260820-0010', bizType: '临时亮化用电', name: '2026 中秋橘子洲头临时灯组', status: '已归档', submitTime: '2026-08-20', power_on: '2026-09-15', duration: 26 },
  { id: 'POW-20260710-0005', bizType: '增容', name: '隧道口 2# 箱变增容', status: '已送电', submitTime: '2026-07-10', power_on: '2026-08-05', duration: 26 },
]);

// ===== 电费台账（模拟） =====
const billStats = ref({
  totalPower: '1,128,345 kWh',
  totalAmount: '¥ 798,432.50',
  settlementRate: '98.2%',
  unpaidCount: 2,
});
</script>

<template>
  <section class="zg-pa-root min-h-screen bg-slate-50">
    <!-- 顶部标题 -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
          <el-icon :size="22"><Connection /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800">用电申请服务中心</h1>
          <p class="text-sm text-slate-500">照明专项用电报装子系统 · 对接供电公司 · 打通照明管理方、供电、施工方三方流程</p>
        </div>
      </div>
      <el-tag type="success" effect="dark" round class="!bg-emerald-500">已对接供电系统 API</el-tag>
    </header>

    <div class="px-6 pt-4">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="📝 新建用电申请" name="new" />
        <el-tab-pane label="📋 审批管理（待办 {{ pendingList.length }}）" name="approval" />
        <el-tab-pane label="📁 历史档案" name="history" />
        <el-tab-pane label="💳 电费台账" name="bill" />
      </el-tabs>
    </div>

    <div class="p-6">
      <!-- ===== Tab 1：新建用电申请 ===== -->
      <div v-if="activeTab === 'new'" class="grid grid-cols-12 gap-6">
        <!-- 左侧：申请表单 -->
        <div class="col-span-7">
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <el-icon class="text-indigo-500"><Document /></el-icon>
              用电申请 · 填写表单
              <span class="text-xs text-slate-400 ml-2">（带 <span class="text-red-500">*</span> 为必填项）</span>
            </h3>
            <el-form :model="applyForm" label-width="140px" class="space-y-4">
              <el-form-item label="业务类型" required>
                <el-select v-model="applyForm.bizType" class="w-full">
                  <el-option v-for="b in bizTypes" :key="b.value" :label="b.label" :value="b.value">
                    <el-tag :type="b.color" size="small" round class="!mr-2">{{ b.label }}</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
              <div class="grid grid-cols-2 gap-4">
                <el-form-item label="项目名称" required><el-input v-model="applyForm.projectName" placeholder="如：先导路延长线亮化工程" /></el-form-item>
                <el-form-item label="预估负荷 (kW)" required><el-input v-model="applyForm.powerNeeded" placeholder="如：120" /></el-form-item>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <el-form-item label="申请人" required><el-input v-model="applyForm.applicant" /></el-form-item>
                <el-form-item label="联系电话" required><el-input v-model="applyForm.phone" /></el-form-item>
                <el-form-item label="所属单位"><el-input v-model="applyForm.org" /></el-form-item>
              </div>
              <el-form-item label="供电地址" required><el-input v-model="applyForm.address" placeholder="具体位置描述" /></el-form-item>
              <el-form-item label="GPS 坐标">
                <div class="flex gap-2 w-full">
                  <el-input v-model="applyForm.gpsCoord" placeholder="点击地图自动获取" />
                  <el-button :icon="Location">📍 地图定位</el-button>
                </div>
              </el-form-item>
              <el-form-item label="接入点（AI 推荐）">
                <div class="flex gap-2 w-full">
                  <el-input v-if="aiAnalysis" v-model="applyForm.supplyPoint" :placeholder="aiAnalysis.supplyPoint" />
                  <el-input v-else v-model="applyForm.supplyPoint" placeholder="请先运行 AI 辅助研判" />
                  <el-button type="primary" :loading="aiLoading" @click="runAiAnalysis">🤖 AI 辅助研判</el-button>
                </div>
              </el-form-item>
              <el-form-item label="材料附件">
                <el-upload multiple :auto-upload="false" :on-change="(f) => applyForm.attachments.push(f)">
                  <el-button :icon="Upload"><el-icon><Camera /></el-icon> 上传施工图纸/权属证明/现场照片</el-button>
                </el-upload>
                <p class="text-xs text-slate-400 mt-1">支持 PDF/JPG/ZIP，单文件 ≤ 50MB</p>
              </el-form-item>
            </el-form>
            <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <el-button>保存草稿</el-button>
              <el-button type="success" :icon="Check" :disabled="!aiAnalysis" @click="submitApplication">提交申请</el-button>
            </div>
          </div>
        </div>

        <!-- 右侧：AI 研判 + 审批流预览 -->
        <div class="col-span-5 space-y-6">
          <!-- AI 研判结果 -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
            <h3 class="text-base font-bold text-indigo-700 mb-3 flex items-center gap-2"><el-icon class="text-indigo-500"><SuccessFilled /></el-icon>AI 辅助供电方案研判</h3>
            <div v-if="!aiAnalysis && !aiLoading" class="text-center py-8 text-slate-400">
              <el-icon :size="32"><Document /></el-icon>
              <p class="mt-2 text-sm">填写预估负荷后点击 🤖 AI 辅助研判<br>自动调用电网知识库 + 线路拓扑负载数据</p>
            </div>
            <div v-else-if="aiLoading" class="text-center py-8">
              <el-icon class="animate-spin text-indigo-500" :size="32"><Connection /></el-icon>
              <p class="mt-2 text-sm text-indigo-600">AI 正在调用电网知识库计算裕度...</p>
            </div>
            <div v-else class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-slate-600">✅ AI 推荐接入点</span><span class="font-bold text-indigo-700">{{ aiAnalysis.supplyPoint }}</span></div>
              <div class="flex justify-between"><span class="text-slate-600">📊 箱变当前负载率</span><span class="font-mono">{{ aiAnalysis.cabinetLoad }}%</span></div>
              <div class="flex justify-between"><span class="text-slate-600">📈 新增负荷估算</span><span class="font-mono text-indigo-600">{{ aiAnalysis.newLoad.toFixed(1) }}A</span></div>
              <div class="flex justify-between"><span class="text-slate-600">🧮 裕度</span>
                <span :class="aiAnalysis.overloadRisk ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'">
                  {{ aiAnalysis.marginPercent }}%
                  <span v-if="aiAnalysis.overloadRisk">（⚠️ 过载风险！建议增容）</span>
                  <span v-else>（✓ 安全）</span>
                </span>
              </div>
              <el-alert v-for="(s, i) in aiAnalysis.suggestions" :key="i" :title="s" :closable="false" type="info" class="!py-1 !text-xs" />
            </div>
          </div>

          <!-- 审批流预览 -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 class="text-base font-bold text-slate-800 mb-3">📋 标准审批流程（7 步）</h3>
            <el-steps :active="0" align-center simple>
              <el-step v-for="s in approvalSteps" :key="s.name" :title="s.title" />
            </el-steps>
            <p class="text-xs text-slate-500 mt-3 flex items-center gap-1"><el-icon><Edit /></el-icon>每一步可退回补材料，短信 + 小程序消息自动推送</p>
          </div>

          <!-- 提交成功弹窗模拟 -->
          <el-dialog v-model="showSubmitDialog" title="" width="360px" :show-close="false" :center="true">
            <div class="text-center py-4">
              <el-icon :size="48" class="text-emerald-500"><SuccessFilled /></el-icon>
              <h3 class="text-lg font-bold text-slate-800 mt-3">申请提交成功！</h3>
              <p class="text-sm text-slate-500">单号：POW-{{ Date.now().toString().slice(-8) }}</p>
            </div>
          </el-dialog>
        </div>
      </div>

      <!-- ===== Tab 2：审批管理 ===== -->
      <div v-if="activeTab === 'approval'" class="space-y-3">
        <div v-for="app in pendingList" :key="app.id" class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <el-tag :type="{reviewer:'warning',survey:'warning',reply:'primary',construction:'info'}[app.currentStep] || 'success'" round>
                {{ app.status }}
              </el-tag>
              <div>
                <div class="font-bold text-slate-800">{{ app.name }}</div>
                <div class="text-xs text-slate-500 mt-0.5">
                  {{ app.id }} · {{ app.bizType }} · 申请人 {{ app.applicant }} · 提交于 {{ app.submitTime }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-40">
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" :style="{width: app.progress + '%'}"></div>
                </div>
                <div class="text-xs text-slate-400 mt-1 text-right">进度 {{ app.progress }}%</div>
              </div>
              <el-button type="primary" size="small" @click="viewApplication(app)">处理</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Tab 3：历史档案 ===== -->
      <div v-if="activeTab === 'history'" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr><th class="text-left px-4 py-3 font-medium">申请单号</th><th class="text-left px-4 py-3 font-medium">类型</th><th class="text-left px-4 py-3 font-medium">项目名称</th><th class="text-left px-4 py-3 font-medium">状态</th><th class="text-left px-4 py-3 font-medium">提交日期</th><th class="text-left px-4 py-3 font-medium">送电日期</th><th class="text-left px-4 py-3 font-medium">耗时</th></tr>
          </thead>
          <tbody>
            <tr v-for="h in historyList" :key="h.id" class="border-b border-slate-50 hover:bg-slate-50/50">
              <td class="px-4 py-3 font-mono text-xs text-slate-600">{{ h.id }}</td>
              <td class="px-4 py-3 text-slate-600">{{ h.bizType }}</td>
              <td class="px-4 py-3 font-medium text-slate-800">{{ h.name }}</td>
              <td class="px-4 py-3"><el-tag :type="h.status === '已送电' ? 'success' : 'info'" round size="small">{{ h.status }}</el-tag></td>
              <td class="px-4 py-3 text-slate-500">{{ h.submitTime }}</td>
              <td class="px-4 py-3 text-slate-500">{{ h.power_on }}</td>
              <td class="px-4 py-3 text-slate-500">{{ h.duration }} 天</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===== Tab 4：电费台账 ===== -->
      <div v-if="activeTab === 'bill'" class="grid grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-5 shadow-md">
          <div class="text-xs opacity-80">年度累计用电量</div>
          <div class="text-3xl font-bold mt-2">{{ billStats.totalPower }}</div>
        </div>
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-5 shadow-md">
          <div class="text-xs opacity-80">年度累计电费</div>
          <div class="text-3xl font-bold mt-2">{{ billStats.totalAmount }}</div>
        </div>
        <div class="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl p-5 shadow-md">
          <div class="text-xs opacity-80">电费收缴率</div>
          <div class="text-3xl font-bold mt-2">{{ billStats.settlementRate }}</div>
        </div>
        <div class="bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-xl p-5 shadow-md">
          <div class="text-xs opacity-80">欠费户数量</div>
          <div class="text-3xl font-bold mt-2">{{ billStats.unpaidCount }}</div>
        </div>
        <div class="col-span-4 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 class="font-bold text-slate-800 mb-2">电费结算说明</h3>
          <p class="text-sm text-slate-500">区分公表/分表，按回路/箱变归集账单，自动计算分摊比例。支持对接财政支付系统、城投结算系统，自动导出发票与结算台账。</p>
        </div>
      </div>
    </div>
  </section>
</template>
