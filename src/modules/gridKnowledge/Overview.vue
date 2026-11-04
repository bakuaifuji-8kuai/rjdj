<!--
  智光云枢 · 电网知识库 · 总览
  业务域：gridKnowledge
  功能：电路档案数字化 + 参数库 + 故障处置库 + 工艺库 + 薄弱点清单
  联动：lineTopo（拓扑节点关联）、assetManage（图纸附件迁移）、opsTicket（工单沉淀故障库）
-->
<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Setting, Warning, Files, DataAnalysis, Download, Plus, Search } from '@element-plus/icons-vue';

// 当前 Tab
const activeTab = ref('archives');

// ===== 电路档案（从 assetManage 迁移 + lineTopo 关联）=====
const archives = ref([
  { id: 1, name: '先导路 1# 箱变', type: '竣工图纸', category: '图纸', nodeType: '箱变', version: 'v2.3', updateTime: '2026-09-15', updateBy: '张工', status: 'current' },
  { id: 2, name: '先导路 K0+350 电缆井', type: '接线图', category: '图纸', nodeType: '电缆井', version: 'v1.0', updateTime: '2026-08-20', updateBy: '李工', status: 'current' },
  { id: 3, name: '麓谷 2# 回路', type: '接地图纸', category: '图纸', nodeType: '回路', version: 'v1.2', updateTime: '2026-10-01', updateBy: '王工', status: 'current' },
  { id: 4, name: '先导路 1# 箱变', type: '试验报告（绝缘/接地）', category: '试验', nodeType: '箱变', version: 'v2.1', updateTime: '2026-07-10', updateBy: '张工', status: 'history' },
  { id: 5, name: '梅溪湖 3# 箱变', type: '箱变一次/二次原理图', category: '图纸', nodeType: '箱变', version: 'v1.0', updateTime: '2026-06-01', updateBy: '赵工', status: 'current' },
  { id: 6, name: '金星大道主干馈线', type: '回路划分表', category: '台账', nodeType: '馈线', version: 'v1.3', updateTime: '2026-09-28', updateBy: '李工', status: 'current' },
]);
const archiveSearch = ref('');
const archiveFilter = ref('all');
const filteredArchives = computed(() => {
  return archives.value.filter(a => {
    const matchSearch = !archiveSearch.value || a.name.includes(archiveSearch.value);
    const matchType = archiveFilter.value === 'all' || a.category === archiveFilter.value;
    return matchSearch && matchType;
  });
});

// ===== 电路参数库 =====
const params = ref([
  { id: 1, node: '先导路 1# 箱变', param: '额定电流', value: '630A', standard: 'GB/T 14048.1', note: '380V 低压馈线' },
  { id: 2, node: '先导路 主干馈线', param: '电缆载流量', value: '485A (YJV22-4×185)', standard: 'GB/T 16895', note: '交联聚乙烯绝缘钢带铠装' },
  { id: 3, node: '麓谷 2# 回路', param: '保护定值', value: '过流 1200A / 短路 2400A', standard: 'GB/T 14048.2', note: '断路器脱扣曲线 C 型' },
  { id: 4, node: '梅溪湖 3# 箱变', param: '接地电阻', value: '≤ 4Ω', standard: 'GB/T 50065', note: 'TN-S 系统' },
  { id: 5, node: '金星大道分支', param: '供电半径', value: '320m', standard: 'CJJ 89', note: '超标！建议回路拆分' },
  { id: 6, node: '先导路 K0+350 电缆井', param: '相序', value: 'A-B-C 正相序', standard: 'GB 50052', note: '验收时实测确认' },
]);

// ===== 故障处置库（从 opsTicket 工单自动沉淀）=====
const faults = ref([
  { id: 1, code: 'ELEC-001', name: '电缆接头发热', cause: '接触电阻过大 / 螺栓松动', steps: ['1. 红外测温定位发热接头', '2. 停电后拆开检查螺栓力矩', '3. 打磨氧化层、涂导电膏', '4. 重新紧固（力矩 40N·m）', '5. 复测接触电阻 ≤ 20μΩ'], tools: ['红外热像仪', '力矩扳手', '导电膏'], cases: 12, success: 12 },
  { id: 2, code: 'ELEC-002', name: '单相接地故障', cause: '电缆绝缘损坏 / 碰外壳', steps: ['1. 摇表测绝缘电阻（500V 档）', '2. 用跨步电压法定位破损点', '3. 确认破损电缆段后隔离', '4. 电缆接头制作 + 绝缘恢复', '5. 工频耐压试验 2.5kV/5min'], tools: ['兆欧表', '跨步电压探测器', '电缆故障测试仪'], cases: 8, success: 7 },
  { id: 3, code: 'ELEC-003', name: '缺相 / 零线异常', cause: '中性线断线 / 端子松脱', steps: ['1. 万用表测三相电压是否平衡', '2. 沿零线走向逐段检查接头', '3. 重点排查配电箱、电缆井内零线端子', '4. 紧固或更换故障接头', '5. 复测三相电压偏差 ≤ 5%'], tools: ['万用表', '相序表'], cases: 5, success: 5 },
  { id: 4, code: 'ELEC-004', name: '漏电保护器跳闸', cause: '线路绝缘下降 / 设备漏电 / 保护器误动', steps: ['1. 分合闸验证是否能合上', '2. 摇表测各回路对地绝缘', '3. 分段排除法定位漏电点', '4. 修复绝缘 / 更换损坏设备', '5. 合闸后观察 30 分钟不跳闸'], tools: ['兆欧表', '钳形漏电流表'], cases: 15, success: 14 },
]);

// ===== 施工工艺库 =====
const processes = ref([
  { id: 1, name: '电缆敷设（直埋）', version: 'v3.2', lastUpdate: '2026-08-15', safetyLevel: 'high', keyPoints: ['深度 ≥ 0.7m（车行道 ≥ 0.8m）', '上下铺 10cm 细沙', '加盖混凝土保护板', '预留检查井间距 50m', '竣工后测绘归档'] },
  { id: 2, name: '中低压电缆接头制作', version: 'v2.1', lastUpdate: '2026-07-22', safetyLevel: 'high', keyPoints: ['导体压接钳 + 六角模', '热缩管加热均匀无气泡', '绝缘电阻 ≥ 10MΩ（1kV 档）', '防水处理：自粘带 + 热缩护套', '制作完成后工频耐压试验'] },
  { id: 3, name: '接地装置施工', version: 'v1.5', lastUpdate: '2026-05-10', safetyLevel: 'medium', keyPoints: ['接地极垂直接地体 2.5m', '水平接地体埋深 ≥ 0.6m', '焊接面 ≥ 3 倍扁钢宽度', '防腐处理：沥青漆', '接地电阻 ≤ 4Ω（TN-S 系统）'] },
  { id: 4, name: '箱变检修安全规程', version: 'v4.0', lastUpdate: '2026-09-01', safetyLevel: 'high', keyPoints: ['停电→验电→挂牌上锁', '高压侧安全距离 ≥ 0.7m', 'SF6 气体检测合格', '专人监护、一人操作', '工作票制度严格执行'] },
]);

// ===== 薄弱点清单 =====
const weaknesses = ref([
  { id: 1, type: '电缆老化', location: '先导路 K0+500 ~ K1+200', detail: 'YJV22-4×150 已运行 18 年（2008 年投运）', risk: 'high', suggestion: '建议 2027 年大修计划更换' },
  { id: 2, type: '接地故障高发', location: '麓谷 2# 回路', detail: '近 6 个月发生 3 次单相接地故障', risk: 'high', suggestion: '排查绝缘下降段 + 局部换缆' },
  { id: 3, type: '供电半径超标', location: '金星大道 3# 分支', detail: '实测供电半径 380m（CJJ 89 标准 ≤ 300m）', risk: 'medium', suggestion: '建议增设中间箱变，拆分回路' },
  { id: 4, type: '过载运行', location: '梅溪湖 1# 箱变', detail: '夏季高峰负载率达 92%（额定 800kVA）', risk: 'medium', suggestion: '建议临时增容 + 长期回路拆分' },
  { id: 5, type: '电缆沟积水', location: '隧道 B 区电缆井群', detail: '汛期积水深度 30cm，威胁电缆绝缘', risk: 'high', suggestion: '强制排水 + 电缆外护套检测' },
]);

// 新增档案
const showArchiveDialog = ref(false);
const newArchive = ref({});
function openAddArchive() { showArchiveDialog.value = true; }
function submitArchive() {
  archives.value.unshift({ id: Date.now(), ...newArchive.value, updateTime: new Date().toISOString().slice(0,10), updateBy: '当前用户', status: 'current' });
  showArchiveDialog.value = false;
  ElMessage.success('档案已入库');
}

// 新增参数
const showParamDialog = ref(false);
const newParam = ref({});
function openAddParam() { showParamDialog.value = true; }
function submitParam() {
  params.value.push({ id: Date.now(), ...newParam.value });
  showParamDialog.value = false;
  ElMessage.success('参数已保存');
}

// 关联拓扑节点（从 lineTopo 联动过来）
function locateInTopo(nodeType, nodeName) {
  ElMessage.info('跳转线路拓扑 → ' + nodeType + ': ' + nodeName);
}

// 导出薄弱点清单
function exportWeakness() {
  ElMessage.success('薄弱点清单已导出 PDF');
}
</script>

<template>
  <section class="zg-gk-root min-h-screen bg-slate-50">
    <!-- 顶部标题 -->
    <header class="zg-gk-head bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
          <el-icon :size="22"><Files /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800">电网/电路知识库</h1>
          <p class="text-sm text-slate-500">图纸数字化 · 参数标准化 · 经验可检索 · 支撑研判/检修/改造/用电评审</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <el-tag type="success" effect="dark" round class="!bg-emerald-500">档案 {{ archives.length }}</el-tag>
        <el-tag type="primary" effect="dark" round class="!bg-indigo-500">参数 {{ params.length }}</el-tag>
        <el-tag type="warning" effect="dark" round class="!bg-amber-500">故障 {{ faults.length }}</el-tag>
      </div>
    </header>

    <!-- Tab 导航 -->
    <div class="px-6 bg-white border-b border-slate-200">
      <el-tabs v-model="activeTab" class="zg-gk-tabs">
        <el-tab-pane label="📁 电路档案" name="archives" />
        <el-tab-pane label="⚙️ 电路参数库" name="params" />
        <el-tab-pane label="🔧 故障处置知识库" name="faults" />
        <el-tab-pane label="📋 施工工艺库" name="processes" />
        <el-tab-pane label="⚠️ 电网薄弱点" name="weaknesses" />
      </el-tabs>
    </div>

    <div class="p-6">
      <!-- ======== Tab 1：电路档案 ======== -->
      <div v-if="activeTab === 'archives'" class="space-y-4">
        <div class="flex items-center gap-3">
          <el-input v-model="archiveSearch" placeholder="搜索档案名称（如：先导路、箱变、回路）" prefix-icon="Search" class="w-80" />
          <el-select v-model="archiveFilter" placeholder="类型" class="w-36">
            <el-option label="全部" value="all" />
            <el-option label="图纸" value="图纸" />
            <el-option label="试验" value="试验" />
            <el-option label="台账" value="台账" />
          </el-select>
          <div class="flex-1" />
          <el-button type="primary" :icon="Plus" @click="openAddArchive">上传档案</el-button>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr><th class="text-left px-4 py-3 font-medium">档案名称</th><th class="text-left px-4 py-3 font-medium">类型</th><th class="text-left px-4 py-3 font-medium">关联节点</th><th class="text-left px-4 py-3 font-medium">版本</th><th class="text-left px-4 py-3 font-medium">更新时间</th><th class="text-left px-4 py-3 font-medium">操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="a in filteredArchives" :key="a.id" class="border-b border-slate-50 hover:bg-slate-50/50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <el-icon class="text-indigo-500"><Document /></el-icon>
                    <span class="font-medium text-slate-800">{{ a.name }}</span>
                    <el-tag v-if="a.status === 'history'" size="small" type="info" round>历史版</el-tag>
                  </div>
                </td>
                <td class="px-4 py-3"><el-tag size="small" :type="a.category === '图纸' ? 'primary' : a.category === '试验' ? 'success' : 'info'">{{ a.type }}</el-tag></td>
                <td class="px-4 py-3">
                  <el-button link type="primary" @click="locateInTopo(a.nodeType, a.name.split(' ')[0])">
                    {{ a.nodeType }} · 跳转拓扑
                  </el-button>
                </td>
                <td class="px-4 py-3 text-slate-600 font-mono text-xs">{{ a.version }}</td>
                <td class="px-4 py-3 text-slate-500">{{ a.updateTime }} · {{ a.updateBy }}</td>
                <td class="px-4 py-3">
                  <el-button link type="primary" size="small">预览</el-button>
                  <el-button link type="primary" size="small">下载</el-button>
                  <el-button link type="info" size="small">版本历史</el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======== Tab 2：电路参数库 ======== -->
      <div v-if="activeTab === 'params'" class="space-y-4">
        <div class="flex items-center gap-3">
          <p class="text-sm text-slate-500">统一管理回路额定电流、电缆载流量、保护定值、接地标准、相序等，新增接入时自动校验过载风险</p>
          <div class="flex-1" />
          <el-button type="primary" :icon="Plus" @click="openAddParam">新增参数</el-button>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr><th class="text-left px-4 py-3 font-medium">关联节点</th><th class="text-left px-4 py-3 font-medium">参数名称</th><th class="text-left px-4 py-3 font-medium">参数值</th><th class="text-left px-4 py-3 font-medium">执行标准</th><th class="text-left px-4 py-3 font-medium">备注</th><th class="text-left px-4 py-3 font-medium">校验</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in params" :key="p.id" class="border-b border-slate-50 hover:bg-slate-50/50">
                <td class="px-4 py-3 font-medium text-slate-800">{{ p.node }}</td>
                <td class="px-4 py-3 text-slate-600">{{ p.param }}</td>
                <td class="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{{ p.value }}</td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ p.standard }}</td>
                <td class="px-4 py-3 text-slate-500">{{ p.note }}</td>
                <td class="px-4 py-3">
                  <el-tag v-if="p.note && p.note.includes('超标')" type="danger" size="small" round>⚠ 超标</el-tag>
                  <el-tag v-else type="success" size="small" round>✓ 合规</el-tag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======== Tab 3：故障处置知识库 ======== -->
      <div v-if="activeTab === 'faults'" class="grid grid-cols-2 gap-4">
        <div v-for="f in faults" :key="f.id" class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <el-icon class="text-amber-500"><Warning /></el-icon>
                <h3 class="font-bold text-slate-800">{{ f.name }}</h3>
                <el-tag size="small" class="!ml-2">{{ f.code }}</el-tag>
              </div>
              <p class="text-xs text-slate-500">根因：{{ f.cause }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-emerald-500">{{ f.success }}/{{ f.cases }}</div>
              <div class="text-xs text-slate-400">已处置案例</div>
            </div>
          </div>
          <el-divider class="!my-2" />
          <div class="space-y-2">
            <p class="text-xs font-medium text-slate-600">🔍 排查步骤：</p>
            <ul class="text-xs text-slate-600 space-y-0.5">
              <li v-for="(s, i) in f.steps" :key="i">· {{ s }}</li>
            </ul>
            <p class="text-xs font-medium text-slate-600 mt-2">🛠 所需工具：<span class="text-slate-500">{{ f.tools.join('、') }}</span></p>
          </div>
        </div>
      </div>

      <!-- ======== Tab 4：施工工艺库 ======== -->
      <div v-if="activeTab === 'processes'" class="space-y-4">
        <div v-for="p in processes" :key="p.id" class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <el-icon :size="16"><Setting /></el-icon>
              </div>
              <div>
                <h3 class="font-bold text-slate-800">{{ p.name }}</h3>
                <p class="text-xs text-slate-500">版本 {{ p.version }} · 最后更新 {{ p.lastUpdate }}</p>
              </div>
            </div>
            <div>
              <el-tag v-if="p.safetyLevel === 'high'" type="danger" round size="small">高风险工艺</el-tag>
              <el-tag v-else type="warning" round size="small">一般风险</el-tag>
            </div>
          </div>
          <div class="bg-slate-50 rounded-lg p-3">
            <p class="text-xs font-medium text-slate-600 mb-2">📌 关键控制点：</p>
            <ul class="text-xs text-slate-700 space-y-1">
              <li v-for="(k, i) in p.keyPoints" :key="i" class="flex items-start gap-2">
                <span class="text-indigo-500 font-bold">✓</span>
                <span>{{ k }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ======== Tab 5：薄弱点清单 ======== -->
      <div v-if="activeTab === 'weaknesses'" class="space-y-4">
        <div class="flex items-center gap-3">
          <p class="text-sm text-slate-500">自动统计电缆年限、故障高发回路、供电半径超标路段，输出年度改造依据</p>
          <div class="flex-1" />
          <el-button :icon="Download" @click="exportWeakness">📥 导出年度薄弱点报告</el-button>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr><th class="text-left px-4 py-3 font-medium">风险等级</th><th class="text-left px-4 py-3 font-medium">薄弱点类型</th><th class="text-left px-4 py-3 font-medium">位置</th><th class="text-left px-4 py-3 font-medium">详细说明</th><th class="text-left px-4 py-3 font-medium">建议</th></tr>
            </thead>
            <tbody>
              <tr v-for="w in weaknesses" :key="w.id" class="border-b border-slate-50 hover:bg-slate-50/50">
                <td class="px-4 py-3">
                  <el-tag :type="w.risk === 'high' ? 'danger' : 'warning'" round size="small">
                    {{ w.risk === 'high' ? '🔴 高风险' : '🟡 中风险' }}
                  </el-tag>
                </td>
                <td class="px-4 py-3 font-medium text-slate-800">{{ w.type }}</td>
                <td class="px-4 py-3 text-slate-600">{{ w.location }}</td>
                <td class="px-4 py-3 text-slate-500 text-xs">{{ w.detail }}</td>
                <td class="px-4 py-3 text-emerald-600 text-xs font-medium">{{ w.suggestion }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 新增档案弹窗 -->
    <el-dialog v-model="showArchiveDialog" title="上传电路档案" width="480px">
      <el-form :model="newArchive" label-width="100px" class="space-y-3">
        <el-form-item label="档案名称"><el-input v-model="newArchive.name" placeholder="如：先导路 1# 箱变" /></el-form-item>
        <el-form-item label="档案类型">
          <el-select v-model="newArchive.type" placeholder="选择类型"><el-option label="竣工图纸" value="竣工图纸" /><el-option label="接线图" value="接线图" /><el-option label="接地图纸" value="接地图纸" /><el-option label="原理图" value="原理图" /><el-option label="试验报告" value="试验报告" /><el-option label="回路划分表" value="回路划分表" /></el-select>
        </el-form-item>
        <el-form-item label="关联节点">
          <el-select v-model="newArchive.nodeType" placeholder="选择节点类型"><el-option label="箱变" value="箱变" /><el-option label="电缆井" value="电缆井" /><el-option label="回路" value="回路" /><el-option label="馈线" value="馈线" /></el-select>
        </el-form-item>
        <el-form-item label="版本号"><el-input v-model="newArchive.version" placeholder="如：v1.0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showArchiveDialog = false">取消</el-button>
        <el-button type="primary" @click="submitArchive">确认入库</el-button>
      </template>
    </el-dialog>

    <!-- 新增参数弹窗 -->
    <el-dialog v-model="showParamDialog" title="新增电路参数" width="480px">
      <el-form :model="newParam" label-width="100px" class="space-y-3">
        <el-form-item label="关联节点"><el-input v-model="newParam.node" /></el-form-item>
        <el-form-item label="参数名称">
          <el-select v-model="newParam.param" placeholder="选择参数"><el-option label="额定电流" value="额定电流" /><el-option label="电缆载流量" value="电缆载流量" /><el-option label="保护定值" value="保护定值" /><el-option label="接地电阻" value="接地电阻" /><el-option label="供电半径" value="供电半径" /><el-option label="相序" value="相序" /></el-select>
        </el-form-item>
        <el-form-item label="参数值"><el-input v-model="newParam.value" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="newParam.note" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showParamDialog = false">取消</el-button>
        <el-button type="primary" @click="submitParam">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.zg-gk-tabs :deep(.el-tabs__item) { font-weight: 500; }
.zg-gk-tabs :deep(.el-tabs__item.is-active) { color: #4f46e5; }
</style>
