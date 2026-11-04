<template>
  <section class="zg-gw">
    <!-- 顶部标题栏 + KPI -->
    <header class="zg-gw__head">
      <div class="zg-gw__headline">
        <div class="zg-gw__sigil">
          <el-icon :size="22"><Connection /></el-icon>
        </div>
        <div class="zg-gw__copy">
          <h1 class="zg-gw__title">开放 API 网关</h1>
          <p class="zg-gw__sub">
            为雪亮工程 · 智慧园区 · 物业平台 · 能源平台提供标准化 RESTful 接入通道
          </p>
        </div>
      </div>
      <div class="zg-gw__kpis">
        <div class="zg-gw__kpi">
          <span class="zg-gw__kpi-num">28</span>
          <span class="zg-gw__kpi-lbl">注册应用</span>
        </div>
        <div class="zg-gw__kpi zg-gw__kpi--ok">
          <span class="zg-gw__kpi-num">84,732</span>
          <span class="zg-gw__kpi-lbl">API 日调用</span>
        </div>
        <div class="zg-gw__kpi zg-gw__kpi--warn">
          <span class="zg-gw__kpi-num">12</span>
          <span class="zg-gw__kpi-lbl">今日错误</span>
        </div>
        <div class="zg-gw__kpi zg-gw__kpi--info">
          <span class="zg-gw__kpi-num">56</span>
          <span class="zg-gw__kpi-lbl">活跃密钥</span>
        </div>
      </div>
    </header>

    <!-- 主体：三栏布局 -->
    <main class="zg-gw__body">
      <!-- 左侧 API 目录 -->
      <aside class="zg-gw__catalog">
        <div class="zg-gw__catalog-head">
          <el-icon><Menu /></el-icon>
          <span>API 目录</span>
        </div>
        <el-menu
          :default-active="activeEndpoint"
          class="zg-gw__menu"
          @select="onSelectEndpoint"
        >
          <template v-for="group in apiGroups" :key="group.name">
            <el-sub-menu :index="group.name">
              <template #title>
                <el-icon><component :is="group.icon" /></el-icon>
                <span>{{ group.label }}</span>
              </template>
              <el-menu-item
                v-for="ep in group.endpoints"
                :key="ep.key"
                :index="ep.key"
                class="zg-gw__menu-item"
              >
                <el-tag
                  :type="methodTagType(ep.method)"
                  size="small"
                  class="zg-gw__method-tag"
                >{{ ep.method }}</el-tag>
                <span class="zg-gw__ep-path">{{ ep.path }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </aside>

      <!-- 中间 API 详情 -->
      <section class="zg-gw__detail">
        <div v-if="currentEndpoint" class="zg-gw__detail-inner">
          <div class="zg-gw__detail-head">
            <el-tag
              :type="methodTagType(currentEndpoint.method)"
              size="large"
              effect="dark"
            >{{ currentEndpoint.method }}</el-tag>
            <code class="zg-gw__ep-full">
              https://api.zhiguangyunshu.com/v1{{ currentEndpoint.path }}
            </code>
            <el-button type="primary" @click="openTestDialog">
              <el-icon><MagicStick /></el-icon>
              <span>在线测试</span>
            </el-button>
          </div>

          <div class="zg-gw__detail-desc">
            {{ currentEndpoint.desc }}
          </div>

          <!-- cURL 示例 -->
          <div class="zg-gw__panel">
            <div class="zg-gw__panel-title">
              <el-icon><Setting /></el-icon>
              <span>请求示例 (cURL)</span>
              <el-button text size="small" @click="copyCurl">
                <el-icon><CopyDocument /></el-icon>复制
              </el-button>
            </div>
            <pre class="zg-gw__code">{{ curlExample }}</pre>
          </div>

          <!-- 参数表 -->
          <div class="zg-gw__panel">
            <div class="zg-gw__panel-title">
              <el-icon><Operation /></el-icon>
              <span>请求参数</span>
            </div>
            <el-table
              :data="currentEndpoint.params"
              stripe
              border
              size="small"
              class="zg-gw__tbl"
            >
              <el-table-column prop="name" label="名称" width="160" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <span class="zg-gw__type">{{ row.type }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag
                    v-if="row.required"
                    type="danger"
                    size="small"
                    effect="light"
                  >是</el-tag>
                  <span v-else class="zg-gw__muted">否</span>
                </template>
              </el-table-column>
              <el-table-column prop="default" label="默认值" width="120">
                <template #default="{ row }">
                  <span class="zg-gw__muted">{{ row.default || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>
          </div>

          <!-- 返回示例 -->
          <div class="zg-gw__panel">
            <div class="zg-gw__panel-title">
              <el-icon><Monitor /></el-icon>
              <span>返回示例</span>
            </div>
            <pre class="zg-gw__code zg-gw__code--json">{{ jsonResponse }}</pre>
          </div>

          <!-- 响应码 -->
          <div class="zg-gw__panel">
            <div class="zg-gw__panel-title">
              <el-icon><Warning /></el-icon>
              <span>响应码说明</span>
            </div>
            <div class="zg-gw__codes">
              <div
                v-for="code in responseCodes"
                :key="code.code"
                class="zg-gw__code-item"
                :class="`zg-gw__code-item--${code.level}`"
              >
                <span class="zg-gw__code-num">{{ code.code }}</span>
                <span class="zg-gw__code-msg">{{ code.msg }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="请从左侧目录选择一个接口" />
      </section>

      <!-- 右侧调用统计 -->
      <aside class="zg-gw__stats">
        <div class="zg-gw__panel">
          <div class="zg-gw__panel-title">
            <el-icon><TrendCharts /></el-icon>
            <span>7 日调用趋势</span>
          </div>
          <div class="zg-gw__chart">
            <!-- 柱状 + 折线叠加 -->
            <svg
              class="zg-gw__line"
              viewBox="0 0 280 120"
              preserveAspectRatio="none"
            >
              <polyline
                :points="trendPoints"
                fill="none"
                stroke="#409eff"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </svg>
            <div class="zg-gw__bars">
              <div
                v-for="(v, i) in trendData"
                :key="i"
                class="zg-gw__bar-col"
              >
                <div
                  class="zg-gw__bar"
                  :style="{ height: `${(v / trendMax) * 100}%` }"
                />
                <span class="zg-gw__bar-lbl">{{ trendLabels[i] }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="zg-gw__panel">
          <div class="zg-gw__panel-title">
            <el-icon><CircleCheck /></el-icon>
            <span>今日成功率</span>
          </div>
          <div class="zg-gw__ring">
            <svg viewBox="0 0 100 100" class="zg-gw__ring-svg">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#ebeef5"
                stroke-width="10"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#67c23a"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="`${(successRate / 100) * 264} 264`"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="zg-gw__ring-num">{{ successRate }}%</div>
          </div>
        </div>

        <div class="zg-gw__panel">
          <div class="zg-gw__panel-title">
            <el-icon><PieChart /></el-icon>
            <span>错误码分布</span>
          </div>
          <div class="zg-gw__pie-wrap">
            <svg viewBox="0 0 120 120" class="zg-gw__pie">
              <circle cx="60" cy="60" r="40" :stroke="['#f56c6c','#e6a23c','#909399'][0]" :stroke-dasharray="pieSegments[0]" :stroke-dashoffset="0" fill="none" stroke-width="30" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="40" :stroke="['#f56c6c','#e6a23c','#909399'][1]" :stroke-dasharray="pieSegments[1]" :stroke-dashoffset="-pieTotals[0]" fill="none" stroke-width="30" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="40" :stroke="['#f56c6c','#e6a23c','#909399'][2]" :stroke-dasharray="pieSegments[2]" :stroke-dashoffset="-pieTotals[1]" fill="none" stroke-width="30" transform="rotate(-90 60 60)" />
            </svg>
            <ul class="zg-gw__legend">
              <li v-for="(item, i) in errorCodeDist" :key="item.code">
                <span
                  class="zg-gw__legend-dot"
                  :style="{ background: ['#f56c6c','#e6a23c','#909399'][i] }"
                />
                <span>{{ item.code }}</span>
                <span class="zg-gw__muted">{{ item.count }}</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </main>

    <!-- 底部 API Key 管理 -->
    <footer class="zg-gw__foot">
      <div class="zg-gw__foot-head">
        <div class="zg-gw__foot-title">
          <el-icon><Key /></el-icon>
          <span>API Key 管理</span>
        </div>
        <el-button type="primary" @click="openCreateKey">
          <el-icon><Plus /></el-icon>
          <span>创建 Key</span>
        </el-button>
      </div>

      <el-table :data="apiKeys" stripe size="default" class="zg-gw__keytbl">
        <el-table-column prop="keyId" label="Key ID" width="200">
          <template #default="{ row }">
            <code class="zg-gw__key-code">{{ row.keyId }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="appName" label="应用名称" width="140" />
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="scope" label="权限范围">
          <template #default="{ row }">
            <el-tag
              v-for="s in row.scope"
              :key="s"
              size="small"
              effect="light"
              class="zg-gw__scope-tag"
            >{{ s }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created" label="创建时间" width="170" />
        <el-table-column prop="lastCall" label="最后调用" width="170" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '正常' : '已废弃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small">查看</el-button>
            <el-button link type="primary" size="small">复制</el-button>
            <el-popconfirm
              title="确定废弃此 Key？"
              confirm-button-text="废弃"
              cancel-button-text="取消"
              @confirm="revokeKey(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">废弃</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="zg-gw__resource">
        <a class="zg-gw__resource-link" href="#" @click.prevent>
          <el-icon><Document /></el-icon>
          <span>API 文档</span>
        </a>
        <a class="zg-gw__resource-link" href="#" @click.prevent>
          <el-icon><Download /></el-icon>
          <span>Java SDK</span>
        </a>
        <a class="zg-gw__resource-link" href="#" @click.prevent>
          <el-icon><Download /></el-icon>
          <span>Python SDK</span>
        </a>
        <a class="zg-gw__resource-link" href="#" @click.prevent>
          <el-icon><Collection /></el-icon>
          <span>Postman Collection</span>
        </a>
        <a class="zg-gw__resource-link" href="#" @click.prevent>
          <el-icon><ChatDotRound /></el-icon>
          <span>接入工单</span>
        </a>
      </div>
    </footer>

    <!-- 在线测试 Dialog -->
    <el-dialog
      v-model="testDialog.visible"
      :title="`在线测试 - ${testDialog.method} ${testDialog.path}`"
      width="680px"
    >
      <div class="zg-gw__test-toolbar">
        <el-input
          v-model="testDialog.auth"
          placeholder="Authorization Header"
          class="zg-gw__test-auth"
        >
          <template #prepend>Bearer</template>
        </el-input>
        <el-button type="primary" :loading="testDialog.loading" @click="runTest">
          <el-icon><Promotion /></el-icon>
          发送请求
        </el-button>
      </div>

      <div class="zg-gw__test-result" v-if="testDialog.resp">
        <div class="zg-gw__test-meta">
          <el-tag type="success" effect="light">200 OK</el-tag>
          <span>耗时 {{ testDialog.respMs }} ms</span>
          <span>大小 {{ testDialog.respSize }} B</span>
        </div>
        <pre class="zg-gw__code zg-gw__code--json">{{ testDialog.resp }}</pre>
      </div>
      <el-empty v-else description="点击发送请求查看响应" />
    </el-dialog>

    <!-- 创建 Key Drawer -->
    <el-drawer
      v-model="keyDrawer.visible"
      title="创建 API Key"
      size="460px"
      direction="rtl"
    >
      <el-form :model="keyDrawer.form" label-width="110px" label-position="top">
        <el-form-item label="应用名称" required>
          <el-input v-model="keyDrawer.form.appName" placeholder="如：雪亮工程-智慧路灯" />
        </el-form-item>
        <el-form-item label="权限范围" required>
          <el-select
            v-model="keyDrawer.form.scopes"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择允许访问的 API"
          >
            <el-option v-for="s in scopeOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP 白名单">
          <el-input
            v-model="keyDrawer.form.ipWhitelist"
            type="textarea"
            :rows="3"
            placeholder="每行一个 IP 或 CIDR，留空表示不限"
          />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="keyDrawer.form.expires"
            type="datetime"
            placeholder="选择过期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="zg-gw__date"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="keyDrawer.form.owner" placeholder="姓名 / 邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="keyDrawer.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateKey">确认创建</el-button>
      </template>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Connection, Menu, MagicStick, Setting, Operation, Monitor,
  Warning, TrendCharts, CircleCheck, PieChart, Key, Document,
  Download, Collection, ChatDotRound, Promotion, CopyDocument,
  Cpu, Refresh, ReadingLamp, Bell, Timer, PartlyCloudy, Coin
} from '@element-plus/icons-vue';

/* ============ API 目录数据 ============ */
const apiGroups = [
  {
    name: 'light',
    label: '灯网监控 API',
    icon: ReadingLamp,
    endpoints: [
      { key: 'lights-list', method: 'GET', path: '/lights/list', desc: '分页查询灯杆灯具列表，支持按区域、在线状态、亮度过滤', params: [
        { name: 'page', type: 'int', required: false, default: '1', desc: '页码' },
        { name: 'pageSize', type: 'int', required: false, default: '20', desc: '每页数量（最大 100）' },
        { name: 'areaCode', type: 'string', required: false, default: '-', desc: '区域编码' },
        { name: 'online', type: 'bool', required: false, default: '-', desc: '在线状态筛选' },
        { name: 'keyword', type: 'string', required: false, default: '-', desc: '设备编号模糊搜索' },
      ]},
      { key: 'lights-detail', method: 'GET', path: '/lights/{id}', desc: '获取单盏灯具详情，包含遥测、告警、最后控制时间', params: [
        { name: 'id', type: 'string', required: true, default: '-', desc: '灯具唯一 ID（路径参数）' },
      ]},
      { key: 'lights-onoff', method: 'POST', path: '/lights/{id}/onoff', desc: '远程开关灯 / 设置亮度', params: [
        { name: 'id', type: 'string', required: true, default: '-', desc: '灯具 ID' },
        { name: 'action', type: 'enum', required: true, default: '-', desc: 'on / off / set' },
        { name: 'brightness', type: 'int', required: false, default: '100', desc: '亮度值 0-100' },
      ]},
    ],
  },
  {
    name: 'energy',
    label: '能耗 API',
    icon: Coin,
    endpoints: [
      { key: 'energy-rt', method: 'GET', path: '/energy/realtime', desc: '实时功率、电压、电流、功率因数快照', params: [
        { name: 'scope', type: 'enum', required: true, default: 'pole', desc: 'pole / area / whole' },
        { name: 'id', type: 'string', required: false, default: '-', desc: '杆桩 ID 或区域编码' },
      ]},
      { key: 'energy-agg', method: 'GET', path: '/energy/aggregated', desc: '日/周/月 能耗汇总，含同比环比', params: [
        { name: 'granularity', type: 'enum', required: true, default: 'day', desc: 'day / week / month' },
        { name: 'start', type: 'date', required: true, default: '-', desc: '起始时间' },
        { name: 'end', type: 'date', required: true, default: '-', desc: '结束时间' },
      ]},
      { key: 'energy-sync', method: 'POST', path: '/energy/sync', desc: '从第三方计费平台同步账单', params: [
        { name: 'biller', type: 'string', required: true, default: '-', desc: '计费平台标识' },
        { name: 'period', type: 'string', required: true, default: '-', desc: '账期 YYYY-MM' },
      ]},
    ],
  },
  {
    name: 'device',
    label: '终端 API',
    icon: Cpu,
    endpoints: [
      { key: 'dev-list', method: 'GET', path: '/devices/list', desc: '列出网关、摄像头、环境探头等终端', params: [
        { name: 'type', type: 'string', required: false, default: '-', desc: '终端类型过滤' },
        { name: 'pageSize', type: 'int', required: false, default: '20', desc: '每页数量' },
      ]},
      { key: 'dev-telemetry', method: 'GET', path: '/devices/{id}/telemetry', desc: '拉取指定终端最近一条遥测报文', params: [
        { name: 'id', type: 'string', required: true, default: '-', desc: '终端 ID' },
        { name: 'fields', type: 'string', required: false, default: 'all', desc: '指定字段逗号分隔' },
      ]},
    ],
  },
  {
    name: 'alerts',
    label: '告警 API',
    icon: Bell,
    endpoints: [
      { key: 'alerts-list', method: 'GET', path: '/alerts/list', desc: '查询告警列表，支持等级 / 状态 / 时间过滤', params: [
        { name: 'level', type: 'enum', required: false, default: '-', desc: 'critical / major / minor / info' },
        { name: 'status', type: 'enum', required: false, default: '-', desc: 'open / ack / closed' },
        { name: 'since', type: 'datetime', required: false, default: '-', desc: '起始时间' },
      ]},
      { key: 'alerts-ack', method: 'POST', path: '/alerts/acknowledge', desc: '确认 / 处置告警', params: [
        { name: 'alertIds', type: 'array', required: true, default: '-', desc: '告警 ID 列表' },
        { name: 'operator', type: 'string', required: true, default: '-', desc: '处置人' },
        { name: 'remark', type: 'string', required: false, default: '-', desc: '处置备注' },
      ]},
    ],
  },
  {
    name: 'pole',
    label: '杆桩运营 API',
    icon: Setting,
    endpoints: [
      { key: 'pole-order', method: 'GET', path: '/poleBiz/powerOrder', desc: '查询共享电力订单（充电桩 / 广告屏供电）', params: [
        { name: 'orderId', type: 'string', required: false, default: '-', desc: '订单号' },
        { name: 'status', type: 'enum', required: false, default: '-', desc: 'pending / running / done' },
      ]},
      { key: 'pole-ctrl', method: 'POST', path: '/poleBiz/powerControl', desc: '下发杆桩供电控制（合闸 / 分闸 / 限功率）', params: [
        { name: 'poleId', type: 'string', required: true, default: '-', desc: '杆桩 ID' },
        { name: 'port', type: 'int', required: true, default: '-', desc: '供电端口号 1-4' },
        { name: 'action', type: 'enum', required: true, default: '-', desc: 'on / off / limit' },
        { name: 'limitW', type: 'int', required: false, default: '-', desc: '限功率值（W）' },
      ]},
    ],
  },
  {
    name: 'scene',
    label: '场景联动 API',
    icon: PartlyCloudy,
    endpoints: [
      { key: 'scene-list', method: 'GET', path: '/scene/list', desc: '查询场景规则列表', params: [
        { name: 'status', type: 'enum', required: false, default: '-', desc: 'enabled / disabled' },
      ]},
      { key: 'scene-exec', method: 'POST', path: '/scene/execute', desc: '手动触发场景执行（用于调试或第三方编排）', params: [
        { name: 'sceneId', type: 'string', required: true, default: '-', desc: '场景 ID' },
        { name: 'dryRun', type: 'bool', required: false, default: 'false', desc: '是否仅模拟不实际执行' },
      ]},
    ],
  },
];

const endpointMap = {};
apiGroups.forEach(g => g.endpoints.forEach(ep => { endpointMap[ep.key] = { ...ep, group: g.name, groupLabel: g.label }; }))

const activeEndpoint = ref('lights-list');
const currentEndpoint = computed(() => endpointMap[activeEndpoint.value] || null);

function onSelectEndpoint(key) {
  activeEndpoint.value = key;
}

function methodTagType(m) {
  return { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }[m] || 'info';
}

const curlExample = computed(() => {
  const ep = currentEndpoint.value;
  if (!ep) return '';
  const params = ep.params.filter(p => p.required).map(p => `-d "${p.name}=<${p.type}>"`).join(' \\\n  ');
  return `curl -X ${ep.method} https://api.zhiguangyunshu.com/v1${ep.path} \\\n  -H "Authorization: Bearer zgs_xxxxxxxxxxxxxxxxxxxx" \\\n  -H "Content-Type: application/json"${params ? ' \\\n  ' + params : ''}`;
});

const jsonResponse = computed(() => {
  const ep = currentEndpoint.value;
  if (!ep) return '';
  if (ep.path.includes('/lights/list')) {
    return JSON.stringify({
      code: 0, message: 'ok', data: { total: 1248, page: 1, pageSize: 20,
        items: [
          { id: 'L001', name: '人民路-01号灯杆', online: true, brightness: 80, power: 28.5, lastSeen: '2026-10-27 10:22:11' },
          { id: 'L002', name: '人民路-02号灯杆', online: true, brightness: 80, power: 27.9, lastSeen: '2026-10-27 10:22:09' },
          { id: 'L003', name: '人民路-03号灯杆', online: false, brightness: 0, power: 0, lastSeen: '2026-10-25 22:01:33' },
        ] }
    }, null, 2);
  }
  if (ep.path.includes('/telemetry')) {
    return JSON.stringify({
      code: 0, data: { temp: 32.1, humi: 64, lux: 0, power: 124.6, pf: 0.93, ts: 1761567731 }
    }, null, 2);
  }
  if (ep.path.includes('/energy/realtime')) {
    return JSON.stringify({
      code: 0, data: { voltage: 220.4, current: 412.7, power: 90.96, pf: 0.95, today_kwh: 1284.6 }
    }, null, 2);
  }
  if (ep.method === 'POST') {
    return JSON.stringify({
      code: 0, message: 'ok', data: { taskId: 'TASK_' + Date.now(), status: 'accepted' }
    }, null, 2);
  }
  return JSON.stringify({ code: 0, message: 'ok', data: {} }, null, 2);
});

const responseCodes = [
  { code: 200, msg: '请求成功', level: 'ok' },
  { code: 400, msg: '请求参数错误', level: 'warn' },
  { code: 401, msg: '未授权 / Token 过期', level: 'warn' },
  { code: 403, msg: '无权限访问该资源', level: 'warn' },
  { code: 429, msg: '请求过于频繁，触发限流', level: 'bad' },
  { code: 500, msg: '服务端内部错误', level: 'bad' },
];

function copyCurl() {
  navigator.clipboard?.writeText(curlExample.value).then(() => ElMessage.success('已复制 cURL 示例'))
}

/* ============ 统计 ============ */
const trendLabels = ['10-21', '10-22', '10-23', '10-24', '10-25', '10-26', '今日'];
const trendData = [72410, 78115, 82501, 79832, 81244, 83029, 84732];
const trendMax = Math.max(...trendData);
const trendPoints = computed(() => {
  const W = 280, H = 120, pad = 8;
  return trendData.map((v, i) => {
    const x = pad + (i / (trendData.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / trendMax) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
});

const successRate = 99.86;
const errorCodeDist = [
  { code: '429', count: 6 },
  { code: '401', count: 4 },
  { code: '500', count: 2 },
];
const pieTotals = errorCodeDist.map((e, i) => errorCodeDist.slice(0, i + 1).reduce((s, x) => s + x.count, 0) * (264 / 12))
const pieSegments = errorCodeDist.map(e => `${e.count * (264 / 12)} 264`);

/* ============ 测试 Dialog ============ */
const testDialog = reactive({
  visible: false,
  loading: false,
  method: 'GET',
  path: '',
  auth: '',
  resp: null,
  respMs: 0,
  respSize: 0,
});
function openTestDialog() {
  if (!currentEndpoint.value) return;
  testDialog.method = currentEndpoint.value.method;
  testDialog.path = currentEndpoint.value.path;
  testDialog.visible = true;
  testDialog.resp = null;
}
function runTest() {
  testDialog.loading = true;
  setTimeout(() => {
    testDialog.resp = jsonResponse.value;
    testDialog.respMs = Math.round(38 + Math.random() * 120);
    testDialog.respSize = testDialog.resp.length;
    testDialog.loading = false;
    ElMessage.success('模拟请求成功');
  }, 700);
}

/* ============ API Key 管理 ============ */
const apiKeys = ref([
  { keyId: 'zgs_7a3c9f2b1e4d5a6c', appName: '雪亮工程·智慧园区', owner: '张明', scope: ['灯网读', '告警订阅', '终端遥测'], created: '2026-08-12 09:31:02', lastCall: '2026-10-27 10:21:55', status: 'active' },
  { keyId: 'zgs_2f5d8c9b7a1e3f4c', appName: '物业平台-物业云', owner: '李华', scope: ['灯网读写', '能耗读'], created: '2026-07-03 14:22:10', lastCall: '2026-10-27 10:15:08', status: 'active' },
  { keyId: 'zgs_9e1b7c3d5f2a4b6c', appName: '能源平台-绿能物联', owner: '王芳', scope: ['能耗读', '终端遥测', '杆桩运营读写'], created: '2026-05-20 08:00:00', lastCall: '2026-10-27 10:08:44', status: 'active' },
  { keyId: 'zgs_4c2e6d8b0a1f3c5d', appName: '智慧城市大脑', owner: '陈刚', scope: ['全部权限'], created: '2026-04-11 16:45:30', lastCall: '2026-10-26 23:59:02', status: 'active' },
  { keyId: 'zgs_1a3b5c7d9e0f2a4b', appName: '旧版本测试应用', owner: '赵磊', scope: ['灯网读'], created: '2025-11-01 10:00:00', lastCall: '2026-03-15 12:30:00', status: 'revoked' },
]);
function revokeKey(row) {
  row.status = 'revoked';
  ElMessage.success('已废弃');
}

const scopeOptions = [
  { value: '灯网读', label: '灯网读' },
  { value: '灯网写', label: '灯网写' },
  { value: '能耗读', label: '能耗读' },
  { value: '终端遥测', label: '终端遥测' },
  { value: '告警订阅', label: '告警订阅' },
  { value: '杆桩运营读写', label: '杆桩运营读写' },
  { value: '场景执行', label: '场景执行' },
];

const keyDrawer = reactive({
  visible: false,
  form: { appName: '', scopes: [], ipWhitelist: '', expires: '', owner: '' },
});
function openCreateKey() {
  keyDrawer.form = { appName: '', scopes: [], ipWhitelist: '', expires: '', owner: '' };
  keyDrawer.visible = true;
}
function confirmCreateKey() {
  if (!keyDrawer.form.appName || keyDrawer.form.scopes.length === 0) {
    ElMessage.warning('请填写应用名称并选择至少一项权限');
    return;
  }
  const newKey = {
    keyId: 'zgs_' + Math.random().toString(16).slice(2, 18),
    appName: keyDrawer.form.appName,
    owner: keyDrawer.form.owner || '未填写',
    scope: [...keyDrawer.form.scopes],
    created: new Date().toISOString().slice(0, 19).replace('T', ' '),
    lastCall: '-',
    status: 'active',
  };
  apiKeys.value.unshift(newKey);
  keyDrawer.visible = false;
  ElMessage.success('创建成功');
}

onMounted(() => {});
</script>

<style lang="scss" scoped>
.zg-gw {
  padding: 16px 20px 24px;
  background: #f4f6fa;
  min-height: calc(100vh - 0px);
  color: #1f2d3d;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    border-radius: 12px;
    padding: 20px 24px;
    color: #fff;
    margin-bottom: 16px;
    box-shadow: 0 4px 18px rgba(37, 99, 235, .25);
  }
  &__headline { display: flex; gap: 14px; align-items: center; }
  &__sigil {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center;
  }
  &__title { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: .5px; }
  &__sub { margin: 4px 0 0; font-size: 13px; opacity: .8; }
  &__kpis { display: flex; gap: 16px; }
  &__kpi {
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.2);
    border-radius: 10px;
    padding: 10px 18px;
    text-align: center;
    min-width: 110px;
    &-num { display: block; font-size: 22px; font-weight: 700; line-height: 1.1; }
    &-lbl { display: block; font-size: 12px; opacity: .82; margin-top: 4px; }
  }

  /* 三栏 */
  &__body {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr) 320px;
    gap: 14px;
    margin-bottom: 14px;
  }
  &__catalog, &__detail, &__stats {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e8ecf3;
    overflow: hidden;
  }
  &__catalog {
    display: flex; flex-direction: column; max-height: calc(100vh - 260px);
  }
  &__catalog-head {
    display: flex; align-items: center; gap: 6px;
    padding: 12px 16px; font-weight: 600; font-size: 14px;
    border-bottom: 1px solid #eef1f6; background: #f8fafc;
  }
  &__menu { border-right: none; flex: 1; overflow-y: auto; }
  &__menu-item {
    display: flex; align-items: center; gap: 6px;
    padding-left: 10px !important;
  }
  &__method-tag { flex-shrink: 0; width: 52px; text-align: center; font-weight: 600; }
  &__ep-path { font-size: 12.5px; font-family: ui-monospace, Menlo, monospace; color: #4b5563; }

  /* 详情 */
  &__detail-inner { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  &__detail-head {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding-bottom: 12px; border-bottom: 1px dashed #e5e7eb;
  }
  &__ep-full {
    font-family: ui-monospace, Menlo, monospace; font-size: 13px;
    color: #0f172a; background: #f1f5f9; padding: 6px 12px; border-radius: 6px;
    border: 1px solid #e2e8f0; flex: 1;
  }
  &__detail-desc { color: #6b7280; font-size: 13px; line-height: 1.6; }

  &__panel {
    border: 1px solid #eef1f6; border-radius: 8px; padding: 12px 14px; background: #fcfcfd;
  }
  &__panel-title {
    display: flex; align-items: center; gap: 6px;
    font-size: 13.5px; font-weight: 600; color: #374151; margin-bottom: 10px;
    justify-content: space-between;
  }
  &__panel-title > span { flex: 1; }
  &__code {
    background: #0f172a; color: #e2e8f0; padding: 12px 14px;
    border-radius: 8px; font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 12.5px; line-height: 1.55; margin: 0; overflow-x: auto;
    white-space: pre-wrap; word-break: break-all;
    &--json { color: #a7f3d0; }
  }
  &__tbl { font-size: 12.5px; }
  &__type { font-family: ui-monospace, Menlo, monospace; color: #7c3aed; font-weight: 500; }
  &__muted { color: #9ca3af; font-size: 12px; }

  &__codes { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
  &__code-item {
    padding: 8px 10px; border-radius: 6px; text-align: center; background: #f9fafb;
    border: 1px solid #e5e7eb;
    &-num { display: block; font-size: 16px; font-weight: 700; }
    &-msg { display: block; font-size: 11.5px; color: #6b7280; margin-top: 2px; }
    &--ok { background: #ecfdf5; border-color: #a7f3d0; .zg-gw__code-num { color: #059669; } }
    &--warn { background: #fffbeb; border-color: #fde68a; .zg-gw__code-num { color: #d97706; } }
    &--bad { background: #fef2f2; border-color: #fecaca; .zg-gw__code-num { color: #dc2626; } }
  }

  /* 统计 */
  &__stats { padding: 14px; display: flex; flex-direction: column; gap: 14px; }
  &__chart { position: relative; height: 140px; }
  &__line { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; }
  &__bars { display: flex; justify-content: space-between; align-items: flex-end; height: 100%; gap: 4px; padding-bottom: 20px; }
  &__bar-col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; position: relative; }
  &__bar {
    width: 60%; max-width: 24px;
    background: linear-gradient(180deg, rgba(64,158,255,.55), rgba(64,158,255,.15));
        border-radius: 4px 4px 0 0;
    min-height: 2px;
  }
  &__bar-lbl {
    position: absolute; bottom: -2px; font-size: 10px; color: #9ca3af;
    transform: translateY(100%);
  }

  &__ring { position: relative; width: 140px; height: 140px; margin: 6px auto; }
  &__ring-svg { width: 100%; height: 100%; transform: scaleX(1); }
  &__ring-num {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 700; color: #67c23a;
  }

  &__pie-wrap { display: flex; gap: 12px; align-items: center; padding: 4px; }
  &__pie { width: 120px; height: 120px; transform: rotate(0deg); }
  &__legend { list-style: none; margin: 0; padding: 0; flex: 1; font-size: 12.5px; }
  &__legend li { display: flex; gap: 8px; align-items: center; padding: 4px 0; }
  &__legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

  /* 底部 */
  &__foot {
    background: #fff; border-radius: 10px; border: 1px solid #e8ecf3; padding: 16px;
  }
  &__foot-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  &__foot-title { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 14px; color: #374151; }
  &__keytbl { :deep(td) { font-size: 12.5px; } }
  &__key-code {
    font-family: ui-monospace, Menlo, monospace; font-size: 12px;
    color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;
  }
  &__scope-tag { margin-right: 4px; margin-bottom: 2px; }

  &__resource {
    display: flex; gap: 20px; margin-top: 14px; padding-top: 14px;
    border-top: 1px dashed #e5e7eb;
  }
  &__resource-link {
    display: inline-flex; align-items: center; gap: 6px; font-size: 13px;
    color: #4b5563; text-decoration: none;
    &:hover { color: #2563eb; }
  }

  &__test-toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
  &__test-auth { flex: 1; }
  &__test-result { }
  &__test-meta { display: flex; gap: 14px; font-size: 12.5px; color: #6b7280; margin-bottom: 10px; }
  &__date { width: 100%; }
}</style>
