<template>
  <section class="zg-vf">
    <!-- 顶部工具栏 -->
    <header class="zg-vf__topbar">
      <div class="zg-vf__scene">
        <el-icon class="zg-vf__scene-icon"><Connection /></el-icon>
        <el-input
          v-model="sceneName"
          class="zg-vf__scene-name"
          size="large"
          placeholder="请输入场景名称"
        />
        <el-tag effect="plain" class="zg-vf__ver">v{{ version }}</el-tag>

        <!-- ============ 运行状态徽章 ============ -->
        <div class="zg-vf__status" :class="'zg-vf__status--' + sceneStatus">
          <span class="zg-vf__status-dot" />
          <span class="zg-vf__status-label">{{ sceneStatusText }}</span>
          <el-tooltip :content="statusTooltip" placement="bottom">
            <el-icon class="zg-vf__status-help"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>

        <!-- ============ 绑定 & 触发 KPI ============ -->
        <div class="zg-vf__kpis">
          <div class="zg-vf__kpi">
            <span class="zg-vf__kpi-num">{{ bindingPoleCount }}</span>
            <span class="zg-vf__kpi-lbl">绑定杆桩</span>
          </div>
          <div class="zg-vf__kpi">
            <span class="zg-vf__kpi-num">{{ hitCount }}</span>
            <span class="zg-vf__kpi-lbl">累计触发</span>
          </div>
          <div class="zg-vf__kpi zg-vf__kpi--sm">
            <span class="zg-vf__kpi-lbl">上次触发</span>
            <span class="zg-vf__kpi-num zg-vf__kpi-num--sm">{{ lastTriggerLabel }}</span>
          </div>
        </div>
      </div>

      <div class="zg-vf__actions">
        <!-- 场景配置（绑定/时间/冲突） -->
        <el-button size="default" plain @click="bindingDrawer = true">
          <el-icon><Setting /></el-icon>场景配置
        </el-button>
        <el-button size="default" @click="showHelp">
          <el-icon><QuestionFilled /></el-icon>帮助
        </el-button>
        <el-button size="default" @click="exportFlow">
          <el-icon><Download /></el-icon>导出 JSON
        </el-button>
        <el-button size="default" @click="clearCanvas">
          <el-icon><Delete /></el-icon>清空画布
        </el-button>

        <el-divider direction="vertical" />

        <!-- 测试运行：真模拟执行 + 日志流 -->
        <el-button type="primary" plain size="default" @click="testRun">
          <el-icon><VideoPlay /></el-icon>测试运行
        </el-button>

        <el-divider direction="vertical" />

        <!-- 保存 / 发布 / 运行态 -->
        <el-button type="primary" size="default" @click="saveScene">
          <el-icon><Promotion /></el-icon>保存
        </el-button>
        <el-button
          v-if="sceneStatus !== 'published'"
          type="warning"
          plain
          size="default"
          :disabled="sceneStatus === 'draft' && !savedAt"
          @click="publishScene"
        >
          <el-icon><Upload /></el-icon>发布
        </el-button>

        <el-button
          v-if="sceneStatus === 'published' || sceneStatus === 'stopped'"
          type="success"
          size="default"
          @click="runScene"
        >
          <el-icon><VideoPlay /></el-icon>▶ 启动场景
        </el-button>
        <el-button
          v-if="sceneStatus === 'running'"
          type="warning"
          size="default"
          @click="pauseScene"
        >
          <el-icon><VideoPause /></el-icon>⏸ 暂停
        </el-button>
        <el-button
          v-if="sceneStatus === 'running' || sceneStatus === 'paused'"
          type="danger"
          plain
          size="default"
          @click="stopScene"
        >
          <el-icon><SwitchButton /></el-icon>停止
        </el-button>
      </div>
    </header>

    <!-- 主体 -->
    <main class="zg-vf__main">
      <!-- 左侧节点面板 -->
      <aside class="zg-vf__palette">
        <div class="zg-vf__palette-head">
          <el-icon><MagicStick /></el-icon>
          <span>节点面板</span>
          <el-tag size="small" effect="light">拖拽到画布</el-tag>
        </div>

        <!-- 触发器 -->
        <div class="zg-vf__group">
          <div class="zg-vf__group-title zg-vf__group-title--trig">
            <span class="zg-vf__dot zg-vf__dot--trig" />
            触发器 · Trigger
          </div>
          <div
            v-for="t in triggerNodes"
            :key="t.type"
            class="zg-vf__palette-node zg-vf__palette-node--trig"
            :draggable="true"
            @dragstart="onPaletteDragStart($event, t.type)"
          >
            <el-icon class="zg-vf__palette-ico"><component :is="t.icon" /></el-icon>
            <span class="zg-vf__palette-name">{{ t.label }}</span>
          </div>
        </div>

        <!-- 条件 -->
        <div class="zg-vf__group">
          <div class="zg-vf__group-title zg-vf__group-title--cond">
            <span class="zg-vf__dot zg-vf__dot--cond" />
            条件判断 · Condition
          </div>
          <div
            v-for="c in conditionNodes"
            :key="c.type"
            class="zg-vf__palette-node zg-vf__palette-node--cond"
            :draggable="true"
            @dragstart="onPaletteDragStart($event, c.type)"
          >
            <el-icon class="zg-vf__palette-ico"><component :is="c.icon" /></el-icon>
            <span class="zg-vf__palette-name">{{ c.label }}</span>
          </div>
        </div>

        <!-- 动作 -->
        <div class="zg-vf__group">
          <div class="zg-vf__group-title zg-vf__group-title--act">
            <span class="zg-vf__dot zg-vf__dot--act" />
            执行动作 · Action
          </div>
          <div
            v-for="a in actionNodes"
            :key="a.type"
            class="zg-vf__palette-node zg-vf__palette-node--act"
            :draggable="true"
            @dragstart="onPaletteDragStart($event, a.type)"
          >
            <el-icon class="zg-vf__palette-ico"><component :is="a.icon" /></el-icon>
            <span class="zg-vf__palette-name">{{ a.label }}</span>
          </div>
        </div>

        <div class="zg-vf__hint">
          <el-icon><InfoFilled /></el-icon>
          <p>拖拽节点到画布，从右侧圆点连线。双击节点编辑属性。</p>
        </div>
      </aside>

      <!-- 中央画布 -->
      <section class="zg-vf__canvas-wrap">
        <div class="zg-vf__canvas-toolbar">
          <el-slider
            v-model="scale"
            :min="0.5"
            :max="2"
            :step="0.1"
            :marks="{ 0.5: '50%', 1: '100%', 1.5: '150%', 2: '200%' }"
            class="zg-vf__slider"
          />
          <el-button-group size="small">
            <el-button @click="scale = Math.max(0.5, scale - 0.1)">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button @click="scale = 1">100%</el-button>
            <el-button @click="scale = Math.min(2, scale + 0.1)">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
          </el-button-group>
          <el-tag type="info" effect="plain" size="small">
            节点 {{ nodes.length }} · 连线 {{ connections.length }}
          </el-tag>
        </div>

        <div
          ref="canvasRef"
          class="zg-vf__canvas"
          :style="canvasStyle"
          @dragover.prevent
          @drop="onCanvasDrop"
          @mousedown.self="onCanvasBackgroundClick"
        >
          <!-- 背景网格 -->
          <div class="zg-vf__grid-bg" aria-hidden="true" />

          <!-- SVG 连线层 -->
          <svg class="zg-vf__svg-layer">
            <defs>
              <marker
                id="zg-vf-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker
                id="zg-vf-arrow-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#409eff" />
              </marker>
            </defs>

            <!-- 已有连线 -->
            <path
              v-for="c in connections"
              :key="c.id"
              :d="computeConnectionPath(c)"
              fill="none"
              :stroke="selectedConnection?.id === c.id ? '#409eff' : '#64748b'"
              :stroke-width="selectedConnection?.id === c.id ? 2.5 : 2"
              marker-end="url(#zg-vf-arrow)"
              class="zg-vf__conn-path"
              @click.stop="selectConnection(c)"
            />

            <!-- 正在拖拽的临时连线 -->
            <path
              v-if="dragLine.active"
              :d="dragLine.path"
              fill="none"
              stroke="#409eff"
              stroke-width="2"
              stroke-dasharray="5 4"
              marker-end="url(#zg-vf-arrow-active)"
            />
          </svg>

          <!-- 节点 -->
          <div
            v-for="n in nodes"
            :key="n.id"
            class="zg-vf__node"
            :class="[
              `zg-vf__node--${n.type}`,
              { 'zg-vf__node--selected': selectedNode?.id === n.id }
            ]"
            :style="{ left: `${n.x}px`, top: `${n.y}px` }"
            @mousedown.stop="startNodeDrag($event, n)"
            @dblclick.stop="openNodeEditor(n)"
          >
            <!-- 节点头部（颜色区分类型） -->
            <div class="zg-vf__node-head">
              <el-icon class="zg-vf__node-icon"><component :is="nodeMeta[n.type].icon" /></el-icon>
              <span class="zg-vf__node-title">{{ nodeMeta[n.type].label }}</span>
              <span v-if="selectedNode?.id === n.id" class="zg-vf__node-del" @click.stop="deleteNode(n)">
                <el-icon><Close /></el-icon>
              </span>
            </div>
            <!-- 节点正文（显示配置概要） -->
            <div class="zg-vf__node-body">
              <span class="zg-vf__node-sub">{{ nodeSummary(n) }}</span>
            </div>
            <!-- in port -->
            <div
              v-if="n.type !== 'timer' && n.type !== 'alarm' && n.type !== 'device-event'"
              class="zg-vf__port zg-vf__port--in"
              :data-node="n.id"
              @mouseup.stop="onPortMouseUp(n)"
            />
            <!-- out port -->
            <div
              v-if="n.type !== 'lamp-on' && n.type !== 'lamp-off' && n.type !== 'dim' && n.type !== 'ticket' && n.type !== 'message' && n.type !== 'pole-power'"
              class="zg-vf__port zg-vf__port--out"
              :data-node="n.id"
              @mousedown.stop="startConnectionDrag($event, n)"
            />
          </div>

          <!-- 空画布提示 -->
          <div v-if="nodes.length === 0" class="zg-vf__empty">
            <el-icon :size="48" color="#cbd5e1"><MagicStick /></el-icon>
            <p>从左侧拖拽节点到这里开始编排你的场景</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部：场景模板 + 属性编辑抽屉 -->
    <footer class="zg-vf__foot">
      <el-tabs v-model="activeTemplateTab" class="zg-vf__tabs">
        <el-tab-pane label="预设场景模板" name="presets">
          <div class="zg-vf__preset-grid">
            <div
              v-for="p in scenePresets"
              :key="p.id"
              class="zg-vf__preset"
              @click="applyPreset(p)"
            >
              <div class="zg-vf__preset-ico" :style="{ background: p.color }">
                <el-icon :size="22"><component :is="p.icon" /></el-icon>
              </div>
              <div class="zg-vf__preset-info">
                <div class="zg-vf__preset-title">{{ p.title }}</div>
                <div class="zg-vf__preset-desc">{{ p.desc }}</div>
                <div class="zg-vf__preset-flow">{{ p.flow }}</div>
              </div>
              <el-button type="primary" link size="small">应用</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="我的场景历史" name="history">
          <div class="zg-vf__history">
            <div
              v-for="h in historyList"
              :key="h.version"
              class="zg-vf__history-item"
            >
              <div class="zg-vf__history-title">
                <span>{{ h.name }}</span>
                <el-tag size="small" effect="light">v{{ h.version }}</el-tag>
              </div>
              <div class="zg-vf__history-meta">
                <span>{{ h.updated }}</span>
                <span>节点 {{ h.nodeCount }}</span>
                <el-button link type="primary" size="small">加载</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </footer>

    <!-- 节点属性编辑 Drawer -->
    <el-drawer
      v-model="editorVisible"
      :title="editorTitle"
      size="420px"
      direction="rtl"
    >
      <div v-if="selectedNode" class="zg-vf__editor">
        <!-- 触发器编辑 -->
        <template v-if="nodeMeta[selectedNode.type].cat === 'trig'">
          <el-form label-position="top">
            <el-form-item label="触发类型">
              <el-select
                v-model="selectedNode.type"
                class="zg-vf__full"
                @change="onTriggerTypeChange"
              >
                <el-option-group label="触发方式">
                  <el-option v-for="t in triggerNodes" :key="t.type"
                    :label="t.label" :value="t.type">
                    <div style="display:flex;align-items:center;gap:6px">
                      <el-icon><component :is="t.icon" /></el-icon>
                      <span>{{ t.label }}</span>
                    </div>
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>

            <el-form-item label="触发名称">
              <el-input v-model="selectedNode.title" placeholder="给这个触发起个名字" />
            </el-form-item>

            <!-- ============ ⏱ 定时触发专属 ============ -->
            <template v-if="selectedNode.type === 'timer'">
              <el-form-item label="快捷预设">
                <div class="zg-vf__preset-row">
                  <el-button v-for="p in timerPresets" :key="p.label" size="small"
                    :type="selectedNode.props.cron === p.cron ? 'primary' : 'default'"
                    @click="applyTimerPreset(p)">
                    {{ p.icon }} {{ p.label }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item label="Cron 表达式">
                <el-input v-model="selectedNode.props.cron" placeholder="分 时 日 月 周">
                  <template #append>
                    <el-button @click="openCronHelper = true">🧩 生成器</el-button>
                  </template>
                </el-input>
                <div class="zg-vf__help-text">
                  <span style="color:#6366f1;font-family:monospace">分</span>
                  <span style="color:#6366f1"> · </span>
                  <span style="color:#8b5cf6;font-family:monospace">时</span>
                  <span style="color:#6366f1"> · </span>
                  <span style="color:#10b981;font-family:monospace">日</span>
                  <span style="color:#6366f1"> · </span>
                  <span style="color:#f59e0b;font-family:monospace">月</span>
                  <span style="color:#6366f1"> · </span>
                  <span style="color:#ef4444;font-family:monospace">周</span>
                  <span style="color:#64748b;margin-left:8px">· 示例 <code>30 18 * * *</code> 每天 18:30</span>
                </div>
              </el-form-item>
              <el-form-item label="生效时区">
                <el-select v-model="selectedNode.props.timezone" class="zg-vf__full">
                  <el-option label="Asia/Shanghai (UTC+8) — 中国标准时间" value="Asia/Shanghai" />
                  <el-option label="Asia/Hong_Kong (UTC+8)" value="Asia/Hong_Kong" />
                  <el-option label="Asia/Tokyo (UTC+9)" value="Asia/Tokyo" />
                </el-select>
              </el-form-item>
              <el-form-item label="节假日跳过">
                <el-switch v-model="selectedNode.props.skipHoliday"
                  active-text="节假日不触发" inactive-text="节假日照常触发" />
              </el-form-item>
            </template>

            <!-- ============ 🚨 告警产生专属 ============ -->
            <template v-if="selectedNode.type === 'alarm'">
              <el-form-item label="告警等级（多选）">
                <el-checkbox-group v-model="selectedNode.props.level">
                  <el-checkbox value="critical">🔴 紧急</el-checkbox>
                  <el-checkbox value="major">🟠 重要</el-checkbox>
                  <el-checkbox value="minor">🟡 一般</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="告警类型（多选）">
                <el-select v-model="selectedNode.props.alarmTypes" multiple collapse-tags
                  class="zg-vf__full" placeholder="选一个或多个告警类型">
                  <el-option label="🔌 灯杆倾斜/倒塌" value="pole_tilt" />
                  <el-option label="💡 灯具故障（不亮/闪烁）" value="lamp_fault" />
                  <el-option label="🧰 配电箱冒烟/被撬" value="cabinet_smoke" />
                  <el-option label="⚡ 能耗超阈值" value="energy_over" />
                  <el-option label="💰 杆桩欠费" value="pole_debt" />
                  <el-option label="🔩 控制模块离线" value="ctrl_offline" />
                  <el-option label="⚠️ 隧道烟雾" value="tunnel_smoke" />
                </el-select>
              </el-form-item>
              <el-form-item label="作用范围">
                <el-select v-model="selectedNode.props.scope" class="zg-vf__full">
                  <el-option label="全部设备" value="all" />
                  <el-option label="按区域分组" value="group" />
                  <el-option label="指定杆桩编号" value="specific" />
                </el-select>
              </el-form-item>
              <el-form-item label="指定分组/杆桩" v-if="selectedNode.props.scope !== 'all'">
                <el-input v-model="selectedNode.props.scopeValue"
                  :placeholder="selectedNode.props.scope === 'group'
                    ? '如：先导路 / 麓谷产业园 / 梅溪湖'
                    : '如：YD-LG-023, YD-LG-024'" />
              </el-form-item>
              <el-form-item label="去重策略（防重复触发）">
                <el-radio-group v-model="selectedNode.props.dedupe">
                  <el-radio :label="0">不去重</el-radio>
                  <el-radio :label="5">同告警 5 分钟内只触发 1 次</el-radio>
                  <el-radio :label="30">同告警 30 分钟内只触发 1 次</el-radio>
                  <el-radio :label="1440">同告警 1 天内只触发 1 次</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>

            <!-- ============ 📡 设备事件专属 ============ -->
            <template v-if="selectedNode.type === 'device-event'">
              <el-form-item label="事件类型">
                <el-select v-model="selectedNode.props.eventType" class="zg-vf__full">
                  <el-option-group label="控制模块（gateway）">
                    <el-option label="✅ 设备上线（网关启动）" value="gw_online" />
                    <el-option label="❌ 设备离线（心跳超时）" value="gw_offline" />
                    <el-option label="💓 心跳异常（延迟>10s）" value="gw_heartbeat_abnormal" />
                  </el-option-group>
                  <el-option-group label="灯具（lamp）">
                    <el-option label="💡 灯具遥测突变（功率 Δσ>2）" value="lamp_sudden_change" />
                    <el-option label="⚡ 灯具功率超上限" value="lamp_over_power" />
                  </el-option-group>
                  <el-option-group label="杆桩运营">
                    <el-option label="📱 扫码用电（有用户启动）" value="pole_power_start" />
                    <el-option label="💰 杆桩余额不足" value="pole_balance_low" />
                    <el-option label="🔌 充电桩启动充电" value="charger_start" />
                  </el-option-group>
                </el-select>
              </el-form-item>
              <el-form-item label="设备范围">
                <el-select v-model="selectedNode.props.scope" class="zg-vf__full">
                  <el-option label="全部" value="all" />
                  <el-option label="按设备类型筛选" value="by_type" />
                  <el-option label="指定杆桩编号" value="specific" />
                </el-select>
              </el-form-item>
              <el-form-item label="设备类型过滤" v-if="selectedNode.props.scope === 'by_type'">
                <el-select v-model="selectedNode.props.deviceType" class="zg-vf__full" placeholder="如 gateway / lamp / pole">
                  <el-option label="控制模块 gateway" value="gateway" />
                  <el-option label="灯具 lamp" value="lamp" />
                  <el-option label="杆桩 pole" value="pole" />
                  <el-option label="充电桩 charger" value="charger" />
                  <el-option label="配电箱 cabinet" value="cabinet" />
                </el-select>
              </el-form-item>
              <el-form-item label="具体杆桩" v-if="selectedNode.props.scope === 'specific'">
                <el-input v-model="selectedNode.props.scopeValue"
                  placeholder="如：YD-LG-023 / 支持逗号分隔多个" />
              </el-form-item>
              <el-form-item label="触发条件（连续 N 次才触发）">
                <el-input-number v-model="selectedNode.props.consecutiveTimes" :min="1" :max="10" />
                <span class="zg-vf__muted" style="margin-left:8px">次</span>
                <div class="zg-vf__help-text">默认 1 次即触发；设为 3 表示连续 3 次心跳异常才触发（防抖）</div>
              </el-form-item>
            </template>

            <!-- ============ 🔌 API 调用专属 ============ -->
            <template v-if="selectedNode.type === 'api-call'">
              <el-form-item label="请求方法">
                <el-radio-group v-model="selectedNode.props.method">
                  <el-radio-button label="GET">GET</el-radio-button>
                  <el-radio-button label="POST">POST</el-radio-button>
                  <el-radio-button label="PUT">PUT</el-radio-button>
                  <el-radio-button label="DELETE">DELETE</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Endpoint URL">
                <el-input v-model="selectedNode.props.endpoint" placeholder="https://example.com/api/callback" />
              </el-form-item>
              <el-form-item label="鉴权方式">
                <el-radio-group v-model="selectedNode.props.authType">
                  <el-radio :label="'none'">无鉴权</el-radio>
                  <el-radio :label="'bearer'">Bearer Token</el-radio>
                  <el-radio :label="'apiKey'">API Key（Header）</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Token / Key" v-if="selectedNode.props.authType !== 'none'">
                <el-input v-model="selectedNode.props.authValue"
                  :placeholder="selectedNode.props.authType === 'bearer'
                    ? 'Bearer eyJhbGciOi...'
                    : 'Header: X-Api-Key, Value: xxx'"
                  show-password />
              </el-form-item>
              <el-form-item label="请求体 JSON（POST/PUT）" v-if="['POST','PUT'].includes(selectedNode.props.method)">
                <el-input v-model="selectedNode.props.bodyJson" type="textarea" :rows="4"
                  placeholder='{"scene":"sunset","trigger":"timer","lamp_group":"all"}' />
              </el-form-item>
              <el-form-item label="触发频率限制">
                <el-input-number v-model="selectedNode.props.rateLimit" :min="1" :max="60" />
                <span class="zg-vf__muted" style="margin-left:8px">次 / 分钟</span>
                <div class="zg-vf__help-text">超出频率的请求会被丢弃，防回调风暴</div>
              </el-form-item>
            </template>

            <el-form-item label="启用开关">
              <el-switch v-model="selectedNode.props.enabled"
                active-text="启用" inactive-text="禁用" />
            </el-form-item>
          </el-form>
        </template>

        <!-- 条件编辑 -->
        <template v-else-if="nodeMeta[selectedNode.type].cat === 'cond'">
          <el-form label-position="top">
            <el-form-item label="变量">
              <el-select v-model="selectedNode.props.variable" class="zg-vf__full">
                <el-option label="环境亮度 (lux)" value="lux" />
                <el-option label="环境温度 (°C)" value="temp" />
                <el-option label="实时功率 (W)" value="power" />
                <el-option label="在线率 (%)" value="online_rate" />
                <el-option label="杆桩余额 (¥)" value="balance" />
              </el-select>
            </el-form-item>
            <el-form-item label="运算符">
              <el-select v-model="selectedNode.props.operator" class="zg-vf__full">
                <el-option label="大于 >" value=">" />
                <el-option label="小于 <" value="<" />
                <el-option label="等于 =" value="=" />
                <el-option label="大于等于 >=" value=">=" />
                <el-option label="小于等于 <=" value="<=" />
                <el-option label="区间 [a,b]" value="between" />
              </el-select>
            </el-form-item>
            <el-form-item label="阈值">
              <el-input-number
                v-model="selectedNode.props.threshold"
                :min="0"
                class="zg-vf__full"
              />
            </el-form-item>
            <el-form-item label="为真时执行">
              <el-tag type="success" effect="light" size="small">继续下游</el-tag>
              <span class="zg-vf__muted" style="margin-left: 8px;">(条件节点为 Yes/No 分流)</span>
            </el-form-item>
          </el-form>
        </template>

        <!-- 动作编辑 -->
        <template v-else>
          <el-form label-position="top">
            <el-form-item label="动作名称">
              <el-input v-model="selectedNode.title" />
            </el-form-item>

            <el-form-item label="目标灯具 / 分组" v-if="['lamp-on','lamp-off','dim'].includes(selectedNode.type)">
              <el-select v-model="selectedNode.props.target" class="zg-vf__full" multiple collapse-tags>
                <el-option label="全部灯具" value="all" />
                <el-option label="A 区路灯组" value="group-a" />
                <el-option label="B 区路灯组" value="group-b" />
                <el-option label="人民路-01" value="L001" />
              </el-select>
            </el-form-item>

            <el-form-item label="亮度 %" v-if="selectedNode.type === 'dim'">
              <el-slider v-model="selectedNode.props.brightness" :min="0" :max="100" />
            </el-form-item>

            <el-form-item label="派工单类型" v-if="selectedNode.type === 'ticket'">
              <el-select v-model="selectedNode.props.ticketType" class="zg-vf__full">
                <el-option label="紧急故障" value="urgent" />
                <el-option label="日常巡检" value="routine" />
                <el-option label="杆桩维护" value="pole" />
              </el-select>
            </el-form-item>

            <el-form-item label="接收渠道" v-if="selectedNode.type === 'message'">
              <el-checkbox-group v-model="selectedNode.props.channels">
                <el-checkbox value="wecom">企业微信</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="dingtalk">钉钉</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="执行延时" v-if="selectedNode.type === 'pole-power'">
              <el-input-number v-model="selectedNode.props.delayMin" :min="0" :max="1440" />
              <span class="zg-vf__muted" style="margin-left: 8px;">分钟</span>
            </el-form-item>
          </el-form>
        </template>

        <el-divider />
        <div class="zg-vf__node-meta">
          <span>节点 ID</span>
          <code>{{ selectedNode.id }}</code>
          <el-button link type="danger" size="small" @click="deleteNode(selectedNode)">
            删除节点
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- ============ 场景绑定配置 Drawer ============ -->
    <el-drawer
      v-model="bindingDrawer"
      title="📐 场景配置 · 生效范围与运行规则"
      size="520px"
      direction="rtl"
    >
      <el-form label-position="top" label-width="120px">
        <el-form-item label="生效范围（绑定）">
          <div class="zg-vf__bind-box">
            <el-radio-group v-model="bindConfig.scopeMode">
              <el-radio :label="'area'">按区域分组（推荐）</el-radio>
              <el-radio :label="'specific'">指定杆桩编号</el-radio>
              <el-radio :label="'lamp-type'">按灯具类型</el-radio>
            </el-radio-group>

            <!-- 按区域 -->
            <div v-if="bindConfig.scopeMode === 'area'" class="zg-vf__bind-groups">
              <el-checkbox-group v-model="bindConfig.areas">
                <el-checkbox value="先导路">先导路（30 杆 · 90 盏）</el-checkbox>
                <el-checkbox value="麓谷产业园">麓谷产业园（64 杆 · 192 盏）</el-checkbox>
                <el-checkbox value="梅溪湖环湖路">梅溪湖环湖路（72 杆 · 216 盏）</el-checkbox>
                <el-checkbox value="金星大道">金星大道（86 杆 · 258 盏）</el-checkbox>
                <el-checkbox value="咸嘉湖路">咸嘉湖路（54 杆 · 162 盏）</el-checkbox>
                <el-checkbox value="岳麓山景区">岳麓山景区（60 杆 · 180 盏）</el-checkbox>
                <el-checkbox value="隧道 L-01/02/03">隧道（3 座 · 1280 盏）</el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 指定杆桩 -->
            <div v-if="bindConfig.scopeMode === 'specific'">
              <el-input v-model="bindConfig.specificPoles"
                placeholder="如：YD-LG-023, YD-LG-024, YD-LG-050（逗号分隔）" />
              <div class="zg-vf__help-text">共匹配 <b style="color:#6366f1">{{ specificPoleMatchCount }}</b> 根杆桩</div>
            </div>

            <!-- 按灯具类型 -->
            <div v-if="bindConfig.scopeMode === 'lamp-type'">
              <el-select v-model="bindConfig.lampTypes" multiple collapse-tags class="zg-vf__full">
                <el-option label="道路路灯 100W LED" value="ZG-LD-100W" />
                <el-option label="道路路灯 80W LED" value="ZG-LD-80W" />
                <el-option label="景观灯 40W" value="ZG-JG-40W" />
                <el-option label="隧道灯 150W" value="ZG-SD-150W" />
                <el-option label="庭院灯 30W" value="ZG-TY-30W" />
              </el-select>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="生效时间窗口">
          <el-radio-group v-model="bindConfig.timeMode">
            <el-radio :label="'all'">全时段</el-radio>
            <el-radio :label="'night-only'">仅夜间（18:00-06:00）</el-radio>
            <el-radio :label="'weeknight'">工作日夜间</el-radio>
            <el-radio :label="'custom'">自定义时段</el-radio>
          </el-radio-group>
          <div v-if="bindConfig.timeMode === 'custom'" class="zg-vf__custom-time">
            <el-time-picker v-model="bindConfig.customStart" placeholder="开始" />
            <span>→</span>
            <el-time-picker v-model="bindConfig.customEnd" placeholder="结束" />
            <el-checkbox-group v-model="bindConfig.customDays" style="margin-left:12px">
              <el-checkbox :label="1">一</el-checkbox>
              <el-checkbox :label="2">二</el-checkbox>
              <el-checkbox :label="3">三</el-checkbox>
              <el-checkbox :label="4">四</el-checkbox>
              <el-checkbox :label="5">五</el-checkbox>
              <el-checkbox :label="6">六</el-checkbox>
              <el-checkbox :label="0">日</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="优先级">
          <el-slider v-model="bindConfig.priority" :min="1" :max="100"
            :marks="{ 1: '最低', 50: '中', 100: '最高' }"
            show-input input-size="small" />
          <div class="zg-vf__help-text">多个场景同时控制同一杆时，优先级高的生效（数值大优先）</div>
        </el-form-item>

        <el-form-item label="冲突处理策略">
          <el-radio-group v-model="bindConfig.conflictPolicy">
            <el-radio :label="'override'">高优先级覆盖（推荐）</el-radio>
            <el-radio :label="'merge'">合并执行</el-radio>
            <el-radio :label="'reject'">拒绝触发并告警</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="场景描述">
          <el-input v-model="bindConfig.description" type="textarea" :rows="3"
            placeholder="描述这个场景的用途，供运维同事查阅" />
        </el-form-item>

        <el-divider />

        <!-- 绑定杆桩实时预览 -->
        <div class="zg-vf__bind-preview">
          <div class="zg-vf__bind-preview-head">
            <el-icon><Location /></el-icon>
            <span>将生效于 <b>{{ bindingPoleCount }}</b> 根杆桩 / <b>{{ bindingLampCount }}</b> 盏灯</span>
          </div>
          <div class="zg-vf__bind-preview-bars">
            <div v-for="(area, idx) in bindSummary" :key="idx" class="zg-vf__bind-bar">
              <span class="zg-vf__bind-bar-lbl">{{ area.label }}</span>
              <div class="zg-vf__bind-bar-track">
                <div class="zg-vf__bind-bar-fill" :style="{ width: area.pct + '%', background: area.color }" />
              </div>
              <span class="zg-vf__bind-bar-num">{{ area.poles }}杆</span>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="bindingDrawer = false">取消</el-button>
        <el-button type="primary" @click="saveBinding">保存配置</el-button>
      </template>
    </el-drawer>

    <!-- ============ 测试运行日志 Drawer ============ -->
    <el-drawer
      v-model="runLogDrawer"
      title="🧪 测试运行 · 执行日志"
      size="560px"
      direction="rtl"
    >
      <div class="zg-vf__run-log">
        <!-- 头部 -->
        <div class="zg-vf__run-head">
          <div class="zg-vf__run-status" :class="'zg-vf__run-status--' + runLogState">
            <span class="zg-vf__run-pulse" />
            <span>{{ runLogStateLabel }}</span>
          </div>
          <div class="zg-vf__run-meta">
            <el-tag size="small">节点 {{ nodes.length }}</el-tag>
            <el-tag size="small" effect="light">绑定杆 {{ bindingPoleCount }}</el-tag>
            <el-tag size="small" type="success">成功 {{ runLogSuccessCount }}</el-tag>
            <el-tag size="small" type="danger">失败 {{ runLogFailCount }}</el-tag>
          </div>
        </div>

        <!-- 日志流 -->
        <div class="zg-vf__run-stream" ref="runLogScrollRef">
          <div v-for="(log, i) in runLogs" :key="i" class="zg-vf__run-line" :class="'zg-vf__run-line--' + log.type">
            <span class="zg-vf__run-time">{{ log.time }}</span>
            <span class="zg-vf__run-ico">{{ log.icon }}</span>
            <span class="zg-vf__run-text">{{ log.text }}</span>
          </div>
          <div v-if="runLogs.length === 0" class="zg-vf__run-empty">
            点击画布上的"测试运行"按钮开始模拟执行
          </div>
        </div>

        <!-- 底部动作 -->
        <div class="zg-vf__run-foot">
          <el-button size="small" @click="clearRunLogs">清空日志</el-button>
          <el-button size="small" plain @click="replayRun">🔁 重新模拟</el-button>
          <el-button size="small" type="primary" :disabled="runLogState !== 'done'"
            @click="applyRunAsBinding">
            ✅ 应用为正式执行规则
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 连线时操作提示 -->
    <div v-if="selectedConnection" class="zg-vf__conn-actions">
      <span>已选中连线</span>
      <el-button link type="danger" size="small" @click="deleteConnection(selectedConnection)">
        <el-icon><Delete /></el-icon>删除
      </el-button>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Connection, MagicStick, Refresh, Setting, Operation, Monitor,
  Warning, Timer, PartlyCloudy, Coin, ReadingLamp, Bell,
  QuestionFilled, Download, Delete, VideoPlay, Promotion, Upload,
  ZoomIn, ZoomOut, Close, InfoFilled, Sunny, Moon, ChatLineRound,
  Cpu, Lightning, CircleCheck, Share
} from '@element-plus/icons-vue';

/* ============ 常量 / 元数据 ============ */
const version = '1.2';
const sceneName = ref('智慧路灯·日落自动开灯场景');
const scale = ref(1);

/* 节点元数据 */
const nodeMeta = {
  timer:        { label: '定时触发',   icon: Timer,              cat: 'trig' },
  alarm:        { label: '告警产生',   icon: Warning,            cat: 'trig' },
  'device-event': { label: '设备事件', icon: Cpu,                cat: 'trig' },
  'api-call':   { label: 'API 调用',   icon: Share,              cat: 'trig' },

  'cond-lux':   { label: '亮度条件',   icon: Sunny,              cat: 'cond' },
  'cond-power': { label: '功率条件',   icon: Lightning,          cat: 'cond' },
  'cond-online':{ label: '在线率',     icon: CircleCheck,        cat: 'cond' },
  'cond-balance': { label: '余额条件', icon: Coin,              cat: 'cond' },

  'lamp-on':    { label: '开灯',       icon: ReadingLamp,       cat: 'act' },
  'lamp-off':   { label: '关灯',       icon: ReadingLamp,       cat: 'act' },
  dim:          { label: '调节亮度',   icon: Monitor,            cat: 'act' },
  ticket:       { label: '派工单',      icon: Operation,          cat: 'act' },
  message:      { label: '发送消息',    icon: ChatLineRound,      cat: 'act' },
  'pole-power': { label: '杆桩供电',    icon: Setting,            cat: 'act' },
};

/* 节点面板分组 */
const triggerNodes = [
  { type: 'timer',         label: '定时触发', icon: Timer },
  { type: 'alarm',         label: '告警产生', icon: Warning },
  { type: 'device-event',  label: '设备事件', icon: Cpu },
  { type: 'api-call',      label: 'API 调用', icon: Share },
];
const conditionNodes = [
  { type: 'cond-lux',    label: '亮度 < 80',   icon: Sunny },
  { type: 'cond-power',  label: '功率 > 10',   icon: Lightning },
  { type: 'cond-online', label: '在线率',       icon: CircleCheck },
  { type: 'cond-balance',label: '余额条件',     icon: Coin },
];
const actionNodes = [
  { type: 'lamp-on',    label: '开灯',       icon: ReadingLamp },
  { type: 'lamp-off',   label: '关灯',       icon: ReadingLamp },
  { type: 'dim',        label: '调节亮度',   icon: Monitor },
  { type: 'ticket',     label: '派工单',     icon: Operation },
  { type: 'message',    label: '发送消息',   icon: ChatLineRound },
  { type: 'pole-power', label: '杆桩供电',   icon: Setting },
];

/* 预设场景模板 */
const scenePresets = [
  {
    id: 'sunset', title: '🌅 日落自动开灯',
    desc: '每天日落时分自动开灯并设置亮度',
    flow: '定时 18:30 → 亮度<60 → 开灯+亮度80%',
    color: '#f97316', icon: Sunny,
  },
  {
    id: 'alarm-dispatch', title: '🚨 告警自动派单',
    desc: '紧急告警自动派单并通知运营人员',
    flow: '告警产生 → 等级=紧急 → 派工单+发消息',
    color: '#ef4444', icon: Bell,
  },
  {
    id: 'midnight', title: '🌙 深夜节能模式',
    desc: '深夜自动降亮度、关闭次要设备',
    flow: '定时 23:00 → 在线率>95% → 亮度40%',
    color: '#6366f1', icon: Moon,
  },
  {
    id: 'rain', title: '💧 雨天增强照明',
    desc: '检测到降雨时整体亮度提升',
    flow: '气象降雨 → 降雨强度>中雨 → 亮度+20%',
    color: '#0ea5e9', icon: PartlyCloudy,
  },
  {
    id: 'poweroff', title: '⚡ 欠费自动断电',
    desc: '杆桩欠费后延时断电保护',
    flow: '余额<¥5 → 已通知 → 延时24h断电',
    color: '#8b5cf6', icon: Coin,
  },
];
const activeTemplateTab = ref('presets');
const historyList = [
  { name: '日落自动开灯', version: '1.2', updated: '2026-10-27 10:15', nodeCount: 5 },
  { name: '紧急告警派单', version: '2.1', updated: '2026-10-26 16:40', nodeCount: 6 },
  { name: '深夜节能模式', version: '1.0', updated: '2026-10-24 22:00', nodeCount: 4 },
];

/* ============ 状态 ============ */
const nodes = ref([]);
const connections = ref([]);
const selectedNode = ref(null);
const selectedConnection = ref(null);
const editorVisible = ref(false);
const editorTitle = computed(() => {
  if (!selectedNode.value) return '节点属性';
  return `编辑 - ${nodeMeta[selectedNode.value.type].label}`;
});
const editorTagType = computed(() => {
  const cat = nodeMeta[selectedNode.value?.type]?.cat;
  return cat === 'trig' ? 'danger' : cat === 'cond' ? 'warning' : 'success';
});

/* ============ 场景生命周期状态 ============ */
const sceneStatus = ref('draft'); // draft -> saved -> published -> running -> paused -> stopped
const savedAt = ref(null);
const hitCount = ref(0);
const lastTriggerAt = ref(null);
const sceneRunTimer = ref(null);

const sceneStatusText = computed(() => ({
  draft: '📝 草稿', saved: '💾 已保存', published: '📢 已发布',
  running: '🟢 运行中', paused: '🟡 已暂停', stopped: '🔴 已停止',
}[sceneStatus.value]));
const statusTooltip = computed(() => ({
  draft: '还没保存，不能发布',
  saved: '已保存，点"发布"后可生效',
  published: '已发布，但未启动',
  running: '正在运行中，场景绑定的杆桩会按规则自动执行',
  paused: '已暂停，触发器不再触发但保留配置',
  stopped: '已停止，不执行任何动作但场景仍保留',
}[sceneStatus.value]));

/* ============ 场景绑定配置 ============ */
const bindingDrawer = ref(false);
const runLogDrawer = ref(false);
const runLogScrollRef = ref(null);

const AREA_MAPPING = {
  '先导路':         { poles: 30, lamps: 90,  color: '#6366f1' },
  '麓谷产业园':     { poles: 64, lamps: 192, color: '#8b5cf6' },
  '梅溪湖环湖路':   { poles: 72, lamps: 216, color: '#06b6d4' },
  '金星大道':       { poles: 86, lamps: 258, color: '#f59e0b' },
  '咸嘉湖路':       { poles: 54, lamps: 162, color: '#10b981' },
  '岳麓山景区':     { poles: 60, lamps: 180, color: '#ec4899' },
  '隧道 L-01/02/03':{ poles: 12, lamps: 1280, color: '#ef4444' },
};
const bindConfig = ref({
  scopeMode: 'area',
  areas: ['先导路'],
  specificPoles: '',
  lampTypes: [],
  timeMode: 'all',
  customStart: null,
  customEnd: null,
  customDays: [1,2,3,4,5],
  priority: 50,
  conflictPolicy: 'override',
  description: '日落自动开灯场景 · 先导路区域专用',
});

const specificPoleMatchCount = computed(() => {
  if (!bindConfig.value.specificPoles) return 0;
  return bindConfig.value.specificPoles.split(/[,，\s]+/).filter(Boolean).length;
});
const bindingPoleCount = computed(() => {
  const b = bindConfig.value;
  if (b.scopeMode === 'area') {
    return b.areas.reduce((s, a) => s + (AREA_MAPPING[a]?.poles || 0), 0);
  }
  if (b.scopeMode === 'specific') return specificPoleMatchCount.value;
  return 384;
});
const bindingLampCount = computed(() => {
  const b = bindConfig.value;
  if (b.scopeMode === 'area') {
    return b.areas.reduce((s, a) => s + (AREA_MAPPING[a]?.lamps || 0), 0);
  }
  return 1152;
});
const bindSummary = computed(() => {
  const b = bindConfig.value;
  if (b.scopeMode !== 'area') return [];
  const total = bindingPoleCount.value || 1;
  return b.areas.map(a => {
    const m = AREA_MAPPING[a];
    return { label: a, poles: m?.poles || 0, pct: Math.round(((m?.poles || 0) / total) * 100), color: m?.color || '#6366f1' };
  });
});
const lastTriggerLabel = computed(() => {
  if (!lastTriggerAt.value) return '—';
  const diff = Math.floor((Date.now() - lastTriggerAt.value) / 1000);
  if (diff < 60) return diff + 's 前';
  if (diff < 3600) return Math.floor(diff / 60) + 'min 前';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h 前';
  return new Date(lastTriggerAt.value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
});

/* ============ testRun 执行日志 ============ */
const runLogState = ref('idle'); // idle -> running -> done
const runLogs = ref([]);
const runLogSuccessCount = ref(0);
const runLogFailCount = ref(0);
const highlightedNodeIds = ref(new Set());
const runLogStateLabel = computed(() => ({ idle: '等待执行', running: '执行中...', done: '执行完成' }[runLogState.value]));

/* ============ 拖拽节点 ============ */
const canvasRef = ref(null);
const canvasStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: '0 0',
}))

let nodeSeq = 0;
function nextNodeId() { nodeSeq += 1; return `N${nodeSeq}`; }

function defaultProps(type) {
  switch (type) {
    case 'timer':
      return { cron: '30 18 * * *', timezone: 'Asia/Shanghai', skipHoliday: false, enabled: true };
    case 'alarm':
      return { level: ['critical'], alarmTypes: ['pole_tilt', 'lamp_fault'],
        scope: 'all', scopeValue: '', dedupe: 30, enabled: true };
    case 'device-event':
      return { eventType: 'gw_offline', scope: 'all', deviceType: '', scopeValue: '',
        consecutiveTimes: 3, enabled: true };
    case 'api-call':
      return { method: 'POST', endpoint: '', authType: 'none', authValue: '',
        bodyJson: '', rateLimit: 10, enabled: true };
    case 'cond-lux':  return { variable: 'lux', operator: '<', threshold: 60 };
    case 'cond-power':return { variable: 'power', operator: '>', threshold: 10 };
    case 'cond-online': return { variable: 'online_rate', operator: '>', threshold: 95 };
    case 'cond-balance': return { variable: 'balance', operator: '<', threshold: 5 };
    case 'lamp-on':
    case 'lamp-off': return { target: ['all'] };
    case 'dim':      return { target: ['all'], brightness: 80 };
    case 'ticket':   return { ticketType: 'urgent' };
    case 'message':  return { channels: ['wecom'] };
    case 'pole-power': return { action: 'off', delayMin: 0 };
    default: return {};
  }
}

/* ============ 触发器专属函数 ============ */
const timerPresets = [
  { icon: '🌅', label: '日落开灯', cron: '30 18 * * *', desc: '每天 18:30（日落近似）' },
  { icon: '🌇', label: '下班高峰', cron: '0 17 * * 1-5', desc: '工作日 17:00' },
  { icon: '🌙', label: '深夜降亮', cron: '0 23 * * *', desc: '每天 23:00 进入节能模式' },
  { icon: '🌄', label: '日出关灯', cron: '30 6 * * *', desc: '每天 6:30' },
  { icon: '⏰', label: '每小时巡检', cron: '0 * * * *', desc: '每整点（调试用）' },
  { icon: '🎉', label: '节假日全亮', cron: '0 19 1 5 *', desc: '5 月 1 日 19:00' },
];
const openCronHelper = ref(false);

function applyTimerPreset(p) {
  if (selectedNode.value?.props) {
    selectedNode.value.props.cron = p.cron;
    selectedNode.value.title = selectedNode.value.title.replace(/⏱.*$/, '⏱ ' + p.label);
  }
}

function onTriggerTypeChange(newType) {
  const oldTitle = selectedNode.value.title?.replace(/^(⏱|🚨|📡|🔌).*$/, '').trim();
  const m = nodeMeta[newType];
  selectedNode.value.props = defaultProps(newType);
  selectedNode.value.title = (oldTitle || '') + ' ' + m.label;
  ElMessage.info(`触发方式已切换为：${m.label}`);
}

function defaultTitle(type) {
  const m = nodeMeta[type];
  return m ? m.label : type;
}

function onPaletteDragStart(e, type) {
  e.dataTransfer.setData('application/x-node-type', type);
  e.dataTransfer.effectAllowed = 'copy';
}

function onCanvasDrop(e) {
  const type = e.dataTransfer.getData('application/x-node-type');
  if (!type || !nodeMeta[type]) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const x = (e.clientX - rect.left) / scale.value - 90;
  const y = (e.clientY - rect.top) / scale.value - 24;
  nodes.value.push({
    id: nextNodeId(),
    type,
    x: Math.max(10, Math.round(x)),
    y: Math.max(10, Math.round(y)),
    title: defaultTitle(type),
    props: defaultProps(type),
  });
  ElMessage.success(`已添加：${nodeMeta[type].label}`);
}

/* 节点拖动定位 */
let draggingNode = null;
let nodeDragOffset = { x: 0, y: 0 };

function startNodeDrag(e, n) {
  selectedNode.value = n;
  selectedConnection.value = null;
  draggingNode = n;
  nodeDragOffset.x = e.clientX / scale.value - n.x;
  nodeDragOffset.y = e.clientY / scale.value - n.y;
  window.addEventListener('mousemove', onNodeDrag);
  window.addEventListener('mouseup', stopNodeDrag);
}
function onNodeDrag(e) {
  if (!draggingNode) return;
  draggingNode.x = Math.round(e.clientX / scale.value - nodeDragOffset.x);
  draggingNode.y = Math.round(e.clientY / scale.value - nodeDragOffset.y);
}
function stopNodeDrag() {
  draggingNode = null;
  window.removeEventListener('mousemove', onNodeDrag);
  window.removeEventListener('mouseup', stopNodeDrag);
}

/* 画布背景点击：取消选中 */
function onCanvasBackgroundClick() {
  selectedNode.value = null;
  selectedConnection.value = null;
  editorVisible.value = false;
}

/* ============ 连线拖拽 ============ */
const dragLine = reactive({
  active: false,
  path: '',
  source: null,
  fromX: 0,
  fromY: 0,
});

function portCenter(n, which) {
  const w = 180, h = 72;
  return {
    x: n.x + (which === 'out' ? w : 0),
    y: n.y + h / 2,
  };
}

function startConnectionDrag(e, n) {
  const c = portCenter(n, 'out');
  dragLine.active = true;
  dragLine.source = n;
  dragLine.fromX = c.x;
  dragLine.fromY = c.y;
  updateDragLine(e.clientX / scale.value, e.clientY / scale.value);
  window.addEventListener('mousemove', onConnectionDrag);
  window.addEventListener('mouseup', stopConnectionDrag);
}

function onConnectionDrag(e) {
  if (!dragLine.active) return;
  updateDragLine(e.clientX / scale.value, e.clientY / scale.value);
}

function updateDragLine(tx, ty) {
  dragLine.path = bezierPath(dragLine.fromX, dragLine.fromY, tx, ty);
}

function stopConnectionDrag() {
  dragLine.active = false;
  window.removeEventListener('mousemove', onConnectionDrag);
  window.removeEventListener('mouseup', stopConnectionDrag);
}

function bezierPath(x1, y1, x2, y2) {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

let connSeq = 0;
function nextConnId() { connSeq += 1; return `C${connSeq}`; }

function onPortMouseUp(targetNode) {
  if (!dragLine.active) return;
  const source = dragLine.source;
  if (!source || source.id === targetNode.id) return;
  // 防止重复连线
  const exists = connections.value.find(c => c.source === source.id && c.target === targetNode.id);
  if (exists) {
    ElMessage.warning('该连线已存在');
    stopConnectionDrag();
    return;
  }
  connections.value.push({ id: nextConnId(), source: source.id, target: targetNode.id });
  stopConnectionDrag();
  ElMessage.success('连线已创建');
}

function computeConnectionPath(c) {
  const s = nodes.value.find(n => n.id === c.source);
  const t = nodes.value.find(n => n.id === c.target);
  if (!s || !t) return '';
  const a = portCenter(s, 'out');
  const b = portCenter(t, 'in');
  return bezierPath(a.x, a.y, b.x, b.y);
}

/* ============ 选中 / 删除 ============ */
function selectConnection(c) {
  selectedConnection.value = c;
  selectedNode.value = null;
  editorVisible.value = false;
}

function deleteConnection(c) {
  connections.value = connections.value.filter(x => x.id !== c.id);
  selectedConnection.value = null;
  ElMessage.success('连线已删除');
}

function deleteNode(n) {
  connections.value = connections.value.filter(c => c.source !== n.id && c.target !== n.id);
  nodes.value = nodes.value.filter(x => x.id !== n.id);
  if (selectedNode.value?.id === n.id) {
    selectedNode.value = null;
    editorVisible.value = false;
  }
}

/* ============ 节点编辑器 ============ */
function openNodeEditor(n) {
  selectedNode.value = n;
  editorVisible.value = true;
}

/* ============ 节点摘要 ============ */
function nodeSummary(n) {
  const p = n.props || {};
  switch (n.type) {
    case 'timer':   return `⏱ ${p.cron || '未设置'}`;
    case 'alarm':   return `🔔 ${(p.level || []).join(',') || '全部'}`;
    case 'device-event': return `📡 ${p.device || '未设置'}`;
    case 'api-call': return `🌐 ${p.endpoint || '未设置'}`;
    case 'cond-lux':
    case 'cond-power':
    case 'cond-online':
    case 'cond-balance':
      return `${p.variable || '?'} ${p.operator || '='} ${p.threshold ?? ''}`;
    case 'lamp-on':  return `💡 开灯 · ${(p.target || []).length} 目标`;
    case 'lamp-off': return `🌑 关灯 · ${(p.target || []).length} 目标`;
    case 'dim':      return `💡 亮度 ${p.brightness ?? 80}%`;
    case 'ticket':   return `📋 ${p.ticketType || ''}`;
    case 'message':  return `📢 ${(p.channels || []).join('·') || '未设置'}`;
    case 'pole-power': return `⚡ 杆桩供电 ${p.action || 'off'} · 延时 ${p.delayMin || 0}min`;
    default: return '';
  }
}

/* ============ 预设模板注入 ============ */
function applyPreset(p) {
  let seq = 0;
  function mk(type, x, y, title) {
    seq += 1;
    return { id: `P${seq}`, type, x, y, title: title || defaultTitle(type), props: defaultProps(type) };
  }
  const layout = (() => {
    switch (p.id) {
      case 'sunset':
        return {
          nodes: [mk('timer', 40, 80, '定时 18:30'), mk('cond-lux', 260, 80, '亮度 < 60'),
                  mk('lamp-on', 480, 30, '开灯'), mk('dim', 480, 130, '亮度 80%')],
          conns: [{ source: 'P1', target: 'P2' }, { source: 'P2', target: 'P3' }, { source: 'P2', target: 'P4' }],
        };
      case 'alarm-dispatch':
        return {
          nodes: [mk('alarm', 40, 80, '告警产生'), mk('cond-online', 260, 80, '等级=紧急'),
                  mk('ticket', 480, 30, '派工单'), mk('message', 480, 130, '发企业微信')],
          conns: [{ source: 'P1', target: 'P2' }, { source: 'P2', target: 'P3' }, { source: 'P2', target: 'P4' }],
        };
      case 'midnight':
        return {
          nodes: [mk('timer', 40, 80, '定时 23:00'), mk('cond-online', 260, 80, '在线率 > 95%'),
                  mk('dim', 480, 30, '亮度 40%'), mk('lamp-off', 480, 130, '关广告屏')],
          conns: [{ source: 'P1', target: 'P2' }, { source: 'P2', target: 'P3' }, { source: 'P2', target: 'P4' }],
        };
      case 'rain':
        return {
          nodes: [mk('device-event', 40, 80, '气象降雨'), mk('cond-lux', 260, 80, '降雨 > 中雨'),
                  mk('dim', 480, 80, '亮度 +20%')],
          conns: [{ source: 'P1', target: 'P2' }, { source: 'P2', target: 'P3' }],
        };
      case 'poweroff':
        return {
          nodes: [mk('device-event', 40, 80, '杆桩余额'), mk('cond-balance', 260, 80, '余额 < ¥5'),
                  mk('pole-power', 480, 80, '延时 24h 断电')],
          conns: [{ source: 'P1', target: 'P2' }, { source: 'P2', target: 'P3' }],
        };
      default: return { nodes: [], conns: [] };
    }
  })();

  nodes.value = layout.nodes;
  connections.value = layout.conns.map((c, i) => ({ id: `C${i + 1}`, ...c }))
  // 节点 seq 保持不冲突
  nodeSeq = layout.nodes.length + 10;
  connSeq = layout.conns.length + 10;
  ElMessage.success(`已应用模板：${p.title}`);
}

/* ============ 其他操作 ============ */
function clearCanvas() {
  ElMessageBox.confirm('确定清空画布上的所有节点与连线吗？', '确认', {
    confirmButtonText: '清空', cancelButtonText: '取消', type: 'warning',
  }).then(() => {
    nodes.value = [];
    connections.value = [];
    selectedNode.value = null;
    selectedConnection.value = null;
    ElMessage.success('已清空');
  }).catch(() => {});
}

function exportFlow() {
  const payload = {
    name: sceneName.value,
    version: version.value,
    nodes: nodes.value,
    connections: connections.value,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sceneName.value || 'scene'}.json`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('已导出 JSON');
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}
function pushLog(type, icon, text) {
  runLogs.value.push({ time: nowTime(), type, icon, text });
  nextTick(() => {
    const el = runLogScrollRef.value?.querySelector('.zg-vf__run-stream');
    if (el) el.scrollTop = el.scrollHeight;
  });
}

/* ============ testRun 真模拟执行 ============ */
async function testRun() {
  if (nodes.value.length === 0) { ElMessage.warning('画布为空，请先编排节点'); return; }
  runLogDrawer.value = true;
  runLogs.value = [];
  runLogState.value = 'running';
  runLogSuccessCount.value = 0;
  runLogFailCount.value = 0;
  highlightedNodeIds.value = new Set();

  /* 找到起始触发器节点 */
  const trigNodes = nodes.value.filter(n => nodeMeta[n.type]?.cat === 'trig');
  const startNode = trigNodes[0];
  if (!startNode) {
    pushLog('error', '❌', '画布没有触发器节点，无法执行');
    runLogState.value = 'done';
    return;
  }

  pushLog('info', '🧪', '开始模拟执行：' + sceneName.value);
  pushLog('info', '📋', `节点 ${nodes.value.length} · 连线 ${connections.value.length} · 绑定杆桩 ${bindingPoleCount.value} 根 · 灯具 ${bindingLampCount.value} 盏`);
  await new Promise(r => setTimeout(r, 300));

  /* Step 1: 触发器 */
  highlightNode(startNode.id, '#ef4444');
  pushLog('step', '🔴', `【触发器】${nodeMeta[startNode.type].label} · ${startNode.title}`);
  await new Promise(r => setTimeout(r, 400));

  if (startNode.type === 'timer') {
    const cron = startNode.props?.cron || '* * * * *';
    pushLog('info', '⏱', `解析 cron: ${cron} → 匹配（模拟命中）`);
  } else if (startNode.type === 'alarm') {
    const types = startNode.props?.alarmTypes || ['pole_tilt'];
    pushLog('info', '🚨', `模拟告警：${types.join(' / ')} · 等级 ${startNode.props?.level?.join(',') || 'critical'}`);
  } else if (startNode.type === 'device-event') {
    pushLog('info', '📡', `模拟设备事件：${startNode.props?.eventType || 'gw_offline'}`);
  } else {
    pushLog('info', '🔌', `模拟 API 回调触发（${startNode.props?.method || 'POST'} ${startNode.props?.endpoint || '—'}）`);
  }
  pushLog('success', '✅', '触发器命中，开始向下游传播');
  await new Promise(r => setTimeout(r, 400));

  /* Step 2: 条件节点（找从 startNode 连出去的条件节点） */
  const condConns = connections.value.filter(c => c.from === startNode.id);
  const condNodes = condConns.map(c => nodes.value.find(n => n.id === c.to)).filter(Boolean);
  for (const cn of condNodes) {
    highlightNode(cn.id, '#f59e0b');
    pushLog('step', '🟠', `【条件】${nodeMeta[cn.type].label} · ${cn.title}`);
    await new Promise(r => setTimeout(r, 300));
    const p = cn.props || {};
    const { variable = 'lux', operator = '<', threshold = 60 } = p;
    const SIM_VALUES = { lux: 45, temp: 22, power: 18, online_rate: 98, balance: 32 };
    const simVal = SIM_VALUES[variable] ?? Math.round(Math.random() * 100);
    const opMap = { '>': a=>b=>a>b, '<': a=>b=>a<b, '>=': a=>b=>a>=b, '<=': a=>b=>a<=b, '=': a=>b=>a===b };
    const pass = opMap[operator]?.(simVal, threshold) ?? false;
    pushLog('info', '📊', `${variable}=${simVal} ${operator} ${threshold} → ${pass ? '✅ 成立' : '❌ 不成立'}`);
    if (pass) runLogSuccessCount.value++; else runLogFailCount.value++;
    await new Promise(r => setTimeout(r, 300));
  }

  /* Step 3: 动作节点（找条件之后或直接从触发器连的动作节点） */
  let actSourceIds = condNodes.length ? condNodes.map(c => c.id) : [startNode.id];
  let actConns = [];
  for (const src of actSourceIds) {
    actConns.push(...connections.value.filter(c => c.from === src));
  }
  let actNodes = actConns.map(c => nodes.value.find(n => n.id === c.to)).filter(Boolean);
  /* 如果画布没条件节点，直接从触发器找动作 */
  if (actNodes.length === 0) {
    actConns = connections.value.filter(c => c.from === startNode.id);
    actNodes = actConns.map(c => nodes.value.find(n => n.id === c.to)).filter(n => n && nodeMeta[n.type]?.cat === 'act');
  }

  for (const an of actNodes) {
    highlightNode(an.id, '#10b981');
    pushLog('step', '🟢', `【动作】${nodeMeta[an.type].label} · ${an.title}`);
    await new Promise(r => setTimeout(r, 350));
    const targetLabel = an.props?.target?.length ? an.props.target.join(', ') : '全部灯具';
    const lamps = bindingLampCount.value;
    const poles = bindingPoleCount.value;
    let detail = '';
    if (an.type === 'lamp-on') detail = `下发开灯指令 → ${poles} 根杆 · ${lamps} 盏 → 成功 ${lamps} / 失败 0`;
    else if (an.type === 'lamp-off') detail = `下发关灯指令 → ${poles} 根杆 · ${lamps} 盏 → 成功 ${lamps} / 失败 0`;
    else if (an.type === 'dim') detail = `设置亮度 ${an.props?.brightness || 80}% → ${poles} 根杆 → 全部更新成功`;
    else if (an.type === 'ticket') detail = `创建工单 WO-${Date.now().toString().slice(-6)} · 类型 ${an.props?.ticketType || 'urgent'} · 已派给最近运维`;
    else if (an.type === 'message') detail = `发送消息 · 渠道 ${an.props?.channels?.join(',') || 'wecom'} · 推送 ${poles} 杆负责人`;
    else if (an.type === 'pole-power') detail = `杆桩供电 ${an.props?.action === 'off' ? '断电' : '合闸'} · 延时 ${an.props?.delayMin || 0}min → 下发成功`;
    else detail = `执行完成 · 目标 ${targetLabel}`;
    pushLog('action', '📡', detail);
    runLogSuccessCount.value += 2;
    await new Promise(r => setTimeout(r, 300));
  }

  /* 收尾 */
  pushLog('divider', '—', '—————————————————');
  pushLog('summary', '🏁', `执行完成 · 成功 ${runLogSuccessCount.value} · 失败 ${runLogFailCount.value}`);
  runLogState.value = 'done';
  ElMessage.success('测试运行完成 · 详见执行日志');
}
function highlightNode(nodeId, color) {
  highlightedNodeIds.value.add(nodeId);
  ElNotification({
    title: '节点执行', message: nodeId, type: 'info', duration: 800,
    style: { background: color, color: '#fff', padding: '4px 12px', borderRadius: 6 },
  });
}
function clearRunLogs() {
  runLogs.value = [];
  runLogSuccessCount.value = 0;
  runLogFailCount.value = 0;
  runLogState.value = 'idle';
  highlightedNodeIds.value.clear();
}
function replayRun() { clearRunLogs(); setTimeout(testRun, 200); }
function applyRunAsBinding() {
  saveBinding();
  runLogDrawer.value = false;
  ElMessage.success('已将测试运行结果作为正式配置生效');
}

/* ============ 场景生命周期 ============ */
function saveScene() {
  savedAt.value = Date.now();
  sceneStatus.value = 'saved';
  ElMessageBox.prompt('输入场景版本备注（可选）', '保存场景 v' + version, {
    inputValue: sceneName.value,
    confirmButtonText: '确认保存',
  }).then(({ value }) => {
    if (value) sceneName.value = value;
    ElMessage.success('已保存 · ' + new Date().toLocaleString('zh-CN'));
  }).catch(() => {});
}
function publishScene() {
  if (sceneStatus.value === 'draft' || !savedAt.value) {
    ElMessage.warning('请先保存场景再发布');
    return;
  }
  sceneStatus.value = 'published';
  ElMessageBox.confirm(
    `发布后该场景将在"情景管理"列表可见，可被绑定到杆桩（当前绑定 ${bindingPoleCount.value} 根）。确认发布？`,
    '发布场景',
    { confirmButtonText: '发布', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    sceneStatus.value = 'published';
    ElMessage.success('场景已发布 🎉');
  }).catch(() => {});
}
function runScene() {
  sceneStatus.value = 'running';
  hitCount.value = 0;
  lastTriggerAt.value = null;
  ElMessage.success('场景已启动，开始监控触发器');

  /* 模拟运行时：定时产生"触发" */
  if (sceneRunTimer.value) clearInterval(sceneRunTimer.value);
  sceneRunTimer.value = setInterval(() => {
    if (sceneStatus.value !== 'running') return;
    hitCount.value++;
    lastTriggerAt.value = Date.now();
    /* 随机推送模拟告警到概览 */
    if (Math.random() < 0.3) {
      ElNotification({
        title: '⚡ 场景自动触发',
        message: `${sceneName.value} · 第 ${hitCount.value} 次 · 正在执行`,
        type: 'success', duration: 3000,
      });
    }
  }, 8000);
}
function pauseScene() {
  if (sceneRunTimer.value) { clearInterval(sceneRunTimer.value); sceneRunTimer.value = null; }
  sceneStatus.value = 'paused';
  ElMessage.info('场景已暂停，触发器不再触发');
}
function stopScene() {
  ElMessageBox.confirm('停止后场景不再执行，触发器关闭。确定停止？', '停止场景', {
    type: 'warning', confirmButtonText: '停止', cancelButtonText: '取消',
  }).then(() => {
    if (sceneRunTimer.value) { clearInterval(sceneRunTimer.value); sceneRunTimer.value = null; }
    sceneStatus.value = 'stopped';
    ElMessage.warning('场景已停止');
  }).catch(() => {});
}

function saveBinding() {
  bindingDrawer.value = false;
  ElMessage.success(
    `配置已保存：${bindingPoleCount.value} 根杆桩 · ${bindingLampCount.value} 盏灯 · 优先级 ${bindConfig.value.priority}`
  );
}

function showHelp() {
  ElMessageBox.alert(
    '🧩 节点面板：从左侧拖拽节点到画布，共 3 类\n' +
    '  · 🔴 触发器（定时/告警/设备事件/API）\n' +
    '  · 🟠 条件判断（亮度/功率/在线率/余额）\n' +
    '  · 🟢 执行动作（开灯/关灯/调亮度/派工单/发消息）\n\n' +
    '🔗 连线：从节点右侧圆点拖到下一节点左侧圆点\n' +
    '✏️ 编辑：双击节点或点击后右侧 Drawer 编辑属性\n\n' +
    '📐 场景配置：设置绑定哪些杆桩、生效时间、优先级\n' +
    '🧪 测试运行：模拟执行整条链路，输出日志流\n' +
    '▶ 启动场景：场景真正生效，按规则自动控制灯',
    '场景编排 · 使用指南',
    { confirmButtonText: '好的', customClass: 'zg-vf__help-dialog' }
  );
}

/* ============ 挂载 / 卸载 ============ */
onMounted(async () => {
  await nextTick();
  applyPreset(scenePresets[0]);
  /* 绑定一个默认区域，让用户一进来就看到"绑定杆 30" */
  bindConfig.value.areas = ['先导路'];
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onNodeDrag);
  window.removeEventListener('mouseup', stopNodeDrag);
  window.removeEventListener('mousemove', onConnectionDrag);
  window.removeEventListener('mouseup', stopConnectionDrag);
  if (sceneRunTimer.value) clearInterval(sceneRunTimer.value);
});
</script>

<style lang="scss" scoped>
.zg-vf {
  --trig: #ef4444;
  --trig-bg: #fef2f2;
  --cond: #f59e0b;
  --cond-bg: #fffbeb;
  --act: #10b981;
  --act-bg: #ecfdf5;

  padding: 12px 16px 16px;
  background: #f4f6fa;
  min-height: 100vh;
  color: #1f2937;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* 顶部工具栏 */
  &__topbar {
    background: linear-gradient(135deg, #1e3a8a, #2563eb);
    border-radius: 12px;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    box-shadow: 0 4px 14px rgba(37, 99, 235, .2);
  }
  &__scene { display: flex; align-items: center; gap: 10px; }
  &__scene-icon { font-size: 22px; }
  &__scene-name { width: 280px; :deep(.el-input__wrapper) { background: rgba(255,255,255,.15); box-shadow: none; color: #fff; & input { color: #fff; } } }
  &__ver { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.3); color: #fff; }
  &__actions { display: flex; gap: 8px; }

  /* 主体 */
  &__main {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 12px;
    flex: 1;
    min-height: 0;
  }

  /* 左侧节点面板 */
  &__palette {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e8ecf3;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: calc(100vh - 210px);
  }
  &__palette-head {
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    border-bottom: 1px solid #eef1f6;
    background: #f8fafc;
  }
  &__group { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  &__group-title {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 600; color: #374151;
  }
  &__dot { width: 10px; height: 10px; border-radius: 50%; &--trig { background: var(--trig); } &--cond { background: var(--cond); } &--act { background: var(--act); } }

  &__palette-node {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; border-radius: 8px; cursor: grab;
    border: 1px solid transparent; background: #f9fafb;
    transition: all .15s;
    font-size: 13px;
    &:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,.08); border-color: #d1d5db; }
    &:active { cursor: grabbing; }
    &--trig { border-left: 3px solid var(--trig); &:hover { background: var(--trig-bg); } }
    &--cond { border-left: 3px solid var(--cond); &:hover { background: var(--cond-bg); } }
    &--act  { border-left: 3px solid var(--act);  &:hover { background: var(--act-bg); } }
  }
  &__palette-ico { font-size: 16px; color: #4b5563; }
  &__palette-name { flex: 1; }

  &__hint {
    margin: 8px 12px 14px;
    padding: 10px 12px;
    background: #eff6ff;
    border-radius: 8px;
    font-size: 12px;
    color: #2563eb;
    display: flex;
    gap: 6px;
    align-items: flex-start;
    p { margin: 0; line-height: 1.5; }
  }

  /* 画布区域 */
  &__canvas-wrap {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e8ecf3;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  &__canvas-toolbar {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid #eef1f6;
    background: #fafbfd;
  }
  &__slider { width: 220px; }

  &__canvas {
    position: relative;
    flex: 1;
    overflow: auto;
    padding: 40px;
    background: #f8fafc;
  }
  &__grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, rgba(148,163,184,.18) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148,163,184,.18) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }
  &__svg-layer {
    position: absolute;
    left: 0; top: 0;
    width: 10000px; height: 10000px;
    pointer-events: none;
    overflow: visible;
  }
  &__conn-path {
    pointer-events: auto;
    cursor: pointer;
    transition: stroke .15s, stroke-width .15s;
    &:hover { stroke: #409eff; stroke-width: 2.5; }
  }

  /* 节点 */
  &__node {
    position: absolute;
    width: 180px;
    border-radius: 10px;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    box-shadow: 0 2px 10px rgba(15, 23, 42, .06);
    cursor: grab;
    user-select: none;
    transition: box-shadow .15s, border-color .15s;
    z-index: 2;
    &:hover { box-shadow: 0 4px 16px rgba(15, 23, 42, .1); }
    &--selected { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,.25), 0 4px 16px rgba(15, 23, 42, .12); }

    &--trig .zg-vf__node-head { background: var(--trig); color: #fff; }
    &--cond .zg-vf__node-head { background: var(--cond); color: #fff; }
    &--act  .zg-vf__node-head { background: var(--act);  color: #fff; }
  }

  &__node-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px 8px 0 0;
    font-size: 12.5px;
    font-weight: 600;
    cursor: move;
  }
  &__node-icon { font-size: 15px; }
  &__node-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__node-del {
    display: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: rgba(255,255,255,.25);
    align-items: center; justify-content: center; cursor: pointer;
    font-size: 13px;
    .zg-vf__node--selected & { display: inline-flex; }
    &:hover { background: rgba(255,255,255,.45); }
  }

  &__node-body { padding: 8px 10px; }
  &__node-sub {
    font-size: 12px;
    color: #4b5563;
    display: block;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* 端口 */
  &__port {
    position: absolute;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #64748b;
    cursor: crosshair;
    transition: transform .12s, border-color .12s, background .12s;
    z-index: 3;
    &:hover { transform: scale(1.35); border-color: #409eff; background: #dbeafe; }
    &--in  { left: -8px;  top: 50%; transform: translateY(-50%); &:hover { transform: translateY(-50%) scale(1.35); } }
    &--out { right: -8px; top: 50%; transform: translateY(-50%); &:hover { transform: translateY(-50%) scale(1.35); } }
  }

  &__empty {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #94a3b8; gap: 12px;
    pointer-events: none;
    p { margin: 0; font-size: 13px; }
  }

  /* 底部 */
  &__foot {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e8ecf3;
    padding: 0 16px 12px;
  }
  &__tabs { :deep(.el-tabs__item) { font-weight: 500; } }
  &__preset-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }
  &__preset {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    transition: all .15s;
    &:hover { border-color: #409eff; box-shadow: 0 3px 12px rgba(64,158,255,.15); transform: translateY(-1px); }
  }
  &__preset-ico {
    width: 42px; height: 42px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; flex-shrink: 0;
  }
  &__preset-info { flex: 1; min-width: 0; }
  &__preset-title { font-weight: 600; font-size: 13.5px; color: #111827; }
  &__preset-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
  &__preset-flow {
    font-size: 11.5px; color: #2563eb;
    margin-top: 4px;
    font-family: ui-monospace, Menlo, monospace;
    background: #eff6ff; padding: 2px 6px; border-radius: 4px;
    display: inline-block;
  }

  &__history { display: flex; flex-direction: column; gap: 8px; }
  &__history-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px;
    &:hover { border-color: #c7d2fe; background: #f8fafc; }
  }
  &__history-title { display: flex; align-items: center; gap: 10px; font-weight: 500; }
  &__history-meta { display: flex; gap: 14px; align-items: center; font-size: 12px; color: #6b7280; }

  /* Drawer 编辑器 */
  &__editor { }
  &__help-text { font-size: 12px; color: #9ca3af; margin-top: 4px; font-family: ui-monospace, Menlo, monospace; }
  &__full { width: 100%; }
  &__muted { color: #9ca3af; font-size: 12px; }
  &__node-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6b7280;
    code { font-family: ui-monospace, Menlo, monospace; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px; }
  }

  /* 连线选中操作条 */
  &__conn-actions {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #1f2937; color: #fff; padding: 8px 14px; border-radius: 20px;
    display: flex; gap: 12px; align-items: center; font-size: 13px;
    box-shadow: 0 4px 20px rgba(0,0,0,.25);
    z-index: 100;
  }
}

/* 响应式 */
@media (max-width: 1400px) {
  .zg-vf__preset-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 960px) {
  .zg-vf__main { grid-template-columns: 200px 1fr; }
  .zg-vf__preset-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ============ 新增：状态徽章 ============ */
.zg-vf__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #f1f5f9;
  color: #475569;
  .zg-vf__status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #94a3b8;
  }
  &--draft { background: #fef3c7; color: #b45309; .zg-vf__status-dot { background: #f59e0b; } }
  &--saved { background: #dbeafe; color: #1d4ed8; .zg-vf__status-dot { background: #3b82f6; } }
  &--published { background: #ede9fe; color: #6d28d9; .zg-vf__status-dot { background: #8b5cf6; } }
  &--running { background: #dcfce7; color: #15803d; .zg-vf__status-dot { background: #22c55e; animation: pulse 1.5s infinite; } }
  &--paused { background: #fef9c3; color: #a16207; .zg-vf__status-dot { background: #eab308; } }
  &--stopped { background: #fee2e2; color: #b91c1c; .zg-vf__status-dot { background: #ef4444; } }
  .zg-vf__status-help { font-size: 14px; opacity: .6; }
}
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }

/* ============ KPI ============ */
.zg-vf__kpis {
  display: inline-flex; gap: 16px; margin-left: 16px;
  align-items: center;
}
.zg-vf__kpi {
  display: inline-flex; align-items: baseline; gap: 4px;
  .zg-vf__kpi-num { font-size: 18px; font-weight: 700; color: #6366f1; }
  .zg-vf__kpi-num--sm { font-size: 13px; color: #475569; font-weight: 500; }
  .zg-vf__kpi-lbl { font-size: 11px; color: #94a3b8; }
}

/* ============ 绑定配置 Drawer ============ */
.zg-vf__bind-box { border: 1px dashed #e2e8f0; border-radius: 10px; padding: 12px; background: #f8fafc; }
.zg-vf__bind-groups { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.zg-vf__custom-time { margin-top: 10px; display: flex; align-items: center; gap: 10px; }
.zg-vf__bind-preview { margin-top: 8px; padding: 14px; background: linear-gradient(135deg,#eef2ff,#f5f3ff); border-radius: 12px; }
.zg-vf__bind-preview-head { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; margin-bottom: 10px; }
.zg-vf__bind-bar { display: grid; grid-template-columns: 90px 1fr 45px; gap: 8px; align-items: center; font-size: 12px; color: #475569; }
.zg-vf__bind-bar-track { height: 10px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
.zg-vf__bind-bar-fill { height: 100%; border-radius: 6px; transition: width .4s ease; }
.zg-vf__bind-bar-num { text-align: right; color: #6366f1; font-weight: 600; }

/* ============ 测试运行日志 Drawer ============ */
.zg-vf__run-log { display: flex; flex-direction: column; gap: 12px; }
.zg-vf__run-head { display: flex; justify-content: space-between; align-items: center; }
.zg-vf__run-status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 20px;
  &--idle { background: #f1f5f9; color: #64748b; }
  &--running { background: #dcfce7; color: #15803d;
    .zg-vf__run-pulse { width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse 1s infinite; }
  }
  &--done { background: #dbeafe; color: #1d4ed8;
    .zg-vf__run-pulse { width:8px;height:8px;border-radius:50%;background:#3b82f6; }
  }
}
.zg-vf__run-meta { display: flex; gap: 6px; }
.zg-vf__run-stream {
  height: 360px; overflow-y: auto; padding: 12px;
  background: #0f172a; border-radius: 10px; color: #e2e8f0; font-family: 'SF Mono', Consolas, monospace; font-size: 12px;
}
.zg-vf__run-line { display: grid; grid-template-columns: 70px 20px 1fr; gap: 8px; padding: 3px 0; line-height: 1.6;
  &--info { color: #cbd5e1; }
  &--success { color: #4ade80; }
  &--error { color: #f87171; }
  &--step { color: #fbbf24; font-weight: 600; }
  &--action { color: #a5b4fc; }
  &--summary { color: #93c5fd; font-weight: 700; }
  &--divider { color: #475569; text-align: center; grid-column: 1 / -1; }
}
.zg-vf__run-time { color: #64748b; }
.zg-vf__run-empty { text-align: center; color: #64748b; padding: 40px; }
.zg-vf__run-foot { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #e2e8f0; }
</style>
