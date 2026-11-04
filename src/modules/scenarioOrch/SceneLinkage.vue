<template>
  <section class="zg-scene-linkage">
    <header class="zg-scene-linkage__head">
      <div class="zg-scene-linkage__headline">
        <div class="zg-scene-linkage__sigil">
          <el-icon :size="22"><Link /></el-icon>
        </div>
        <div class="zg-scene-linkage__copy">
          <h1 class="zg-scene-linkage__title">场景联动</h1>
          <p class="zg-scene-linkage__sub">
            联动规则管理中心 · 在役 {{ activeRuleCount }} 条 ·
            停用 {{ idleRuleCount }} 条 · 累计触发 {{ totalTriggerCount }} 次
          </p>
        </div>
      </div>
      <div class="zg-scene-linkage__cta">
        <el-button type="primary" @click="ruleForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增</span>
        </el-button>
        <el-button
          v-if="selectedRules.length > 0"
          type="danger"
          @click="onBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          <span>批量删除</span>
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ ruleCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">规则总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ activeRuleCount }}</span>
        <span class="zg-metrics__lbl">在役运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ idleRuleCount }}</span>
        <span class="zg-metrics__lbl">停用待启</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ highPriorityCount }}</span>
        <span class="zg-metrics__lbl">高优先级</span>
      </div>
    </div>

    <div class="zg-filterband">
      <div class="zg-filterband__density">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            <span>卡片模式</span>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            <span>列表模式</span>
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="zg-filterband__fields">
        <el-input
          v-model="ruleCtl.filterLexicon"
          placeholder="请输入规则名称查询"
          clearable
          class="zg-filterband__search"
          @keyup.enter="ruleCtl.onFilterApply()"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="ruleCtl.statusBuckets"
          placeholder="启用状态"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="启用" value="启用" />
          <el-option label="禁用" value="禁用" />
        </el-select>
        <el-select
          v-model="ruleCtl.typeBucket"
          placeholder="优先级"
          clearable
          class="zg-filterband__select"
        >
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
        <el-button type="primary" @click="ruleCtl.onFilterApply()">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-button>
        <el-button @click="ruleCtl.onFilterReset()">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </div>

    <div v-if="viewMode === 'card'" class="zg-cardgrid">
      <article
        v-for="rule in ruleCtl.pagedRows"
        :key="rule.id"
        class="zg-rulecard"
        :class="{ 'zg-rulecard--selected': selectedRules.includes(rule.id) }"
      >
        <div class="zg-rulecard__checkbox">
          <el-checkbox
            :checked="selectedRules.includes(rule.id)"
            @change="onToggleSelect(rule.id)"
          />
        </div>
        <div class="zg-rulecard__content">
          <div class="zg-rulecard__head">
            <span class="zg-priority-tag" :class="rule.priority">
              {{ priorityText[rule.priority] }}
            </span>
            <span class="zg-rulecard__name">{{ rule.name }}</span>
            <div class="zg-rulecard__right">
              <el-switch
                v-model="rule.status"
                :active-value="'启用'"
                :inactive-value="'禁用'"
                :active-text="''"
                :inactive-text="''"
                @change="onToggleStatus(rule)"
              />
              <el-dropdown @command="(cmd) => onRuleAction(rule, cmd)">
                <span class="zg-rulecard__more">
                  <el-icon><MoreFilled /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="detail">详情</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="zg-rulecard__body">
            <el-tag size="small" effect="light" type="primary">{{ TRIGGER_LABELS[rule.triggerType] || rule.triggerType }}</el-tag>
            <span class="zg-rulecard__scope">
              <b class="zg-highlight">{{ ruleScopesPoles(rule) }}</b> 杆 ·
              <b class="zg-highlight">{{ ruleScopesLamps(rule) }}</b> 盏
            </span>
            <span v-if="rule.scopeAreas?.length" class="zg-rulecard__areas">
              {{ rule.scopeAreas.join('、') }}
            </span>
            <div class="zg-rulecard__actions-mini">
              <el-tag v-for="(a, ai) in (rule.executeActions || [])" :key="ai"
                size="small" effect="light" class="zg-action-tag">
                {{ ACTION_LABELS[a.actionType] || a.actionType }}
              </el-tag>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="zg-tablewrap">
      <el-table :data="ruleCtl.pagedRows" stripe class="zg-datatable">
        <el-table-column width="50" align="center">
          <template #default="{ row }">
            <el-checkbox
              :checked="selectedRules.includes(row.id)"
              @change="onToggleSelect(row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="no" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="规则名称" min-width="160" />
        <el-table-column label="优先级" width="80" align="center">
          <template #default="{ row }">
            <span class="zg-priority-tag" :class="row.priority">
              {{ priorityText[row.priority] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'启用'"
              :inactive-value="'禁用'"
              :active-text="'启用'"
              :inactive-text="'禁用'"
              @change="onToggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="绑定范围" min-width="200">
          <template #default="{ row }">
            <div style="font-size:12px">
              <div v-if="row.scopeMode === 'area' && row.scopeAreas?.length">
                <el-tag size="small" effect="light" style="margin-right:4px">{{ row.scopeAreas.join('、') }}</el-tag>
              </div>
              <div style="color:#6366f1;font-weight:600;margin-top:4px">
                {{ ruleScopesPoles(row) }} 杆 · {{ ruleScopesLamps(row) }} 盏
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="触发方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="light" type="primary">{{ TRIGGER_LABELS[row.triggerType] || row.triggerType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="ruleInspector.openInspector(row)">详情</el-button>
            <el-button size="small" @click="ruleForm.openReviser(row)">修改</el-button>
            <el-button type="danger" size="small" @click="onDeleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="zg-pagerbar">
      <el-pagination
        v-model:current-page="ruleCtl.pagingCursor"
        v-model:page-size="ruleCtl.pageSpan"
        :total="ruleCtl.totalRows"
        :page-sizes="[10, 15, 20, 50, 100]"
        layout="prev, pager, next, jumper, ->, sizes, total"
        background
      />
    </div>

    <el-drawer
      v-model="ruleForm.drawerOpen"
      :title="ruleForm.editMode === 'compose' ? '📋 新增场景规则' : '✏️ 编辑场景规则'"
      direction="rtl"
      size="780px"
    >
      <el-form :model="ruleForm.draftPayload" label-width="96px" class="zg-draftform">

        <!-- ============ 区块 1：规则元信息 ============ -->
        <div class="zg-section-head">
          <span class="zg-section-ico">📌</span>
          <h4>规则基本信息</h4>
        </div>
        <el-form-item label="规则名称" required>
          <el-input v-model="ruleForm.draftPayload.name"
            placeholder="如：日落自动开灯 / 杆桩倾斜自动派单" />
        </el-form-item>
        <div class="zg-draftform__row">
          <el-form-item label="优先级" class="zg-draftform__col">
            <el-select v-model="ruleForm.draftPayload.priority" placeholder="请选择" style="width:100%">
              <el-option label="🔴 高优先级（紧急场景）" value="high" />
              <el-option label="🟡 中优先级（日常场景）" value="medium" />
              <el-option label="🟢 低优先级（节能场景）" value="low" />
            </el-select>
          </el-form-item>
          <el-form-item label="启用开关" class="zg-draftform__col">
            <el-switch v-model="ruleForm.draftPayload.enabled"
              active-text="保存后立即启用" inactive-text="保存为草稿" />
          </el-form-item>
        </div>
        <el-form-item label="场景描述">
          <el-input v-model="ruleForm.draftPayload.description" type="textarea" :rows="2"
            placeholder="描述这个规则的业务用途，供运维同事快速理解" />
        </el-form-item>

        <el-divider />

        <!-- ============ 区块 2：触发方式（4 选 1，最核心） ============ -->
        <div class="zg-section-head">
          <span class="zg-section-ico">🎯</span>
          <h4>触发方式 <b style="color:#ef4444">*</b></h4>
          <span class="zg-section-sub">选择后下方配置面板会自动切换对应字段</span>
        </div>

        <el-radio-group v-model="ruleForm.draftPayload.triggerType" class="zg-trigger-radio">
          <el-radio-button value="timer" class="zg-trigger-radio__btn">
            <span class="zg-trigger-radio__ico">⏱</span>
            <span class="zg-trigger-radio__lbl">定时触发</span>
            <span class="zg-trigger-radio__hint">cron + 快捷预设 + 时区</span>
          </el-radio-button>
          <el-radio-button value="alarm" class="zg-trigger-radio__btn">
            <span class="zg-trigger-radio__ico">🚨</span>
            <span class="zg-trigger-radio__lbl">告警产生</span>
            <span class="zg-trigger-radio__hint">7 种告警类型 + 去重</span>
          </el-radio-button>
          <el-radio-button value="device-event" class="zg-trigger-radio__btn">
            <span class="zg-trigger-radio__ico">📡</span>
            <span class="zg-trigger-radio__lbl">设备事件</span>
            <span class="zg-trigger-radio__hint">控制模块/灯具/杆桩运营 9 种</span>
          </el-radio-button>
          <el-radio-button value="api-call" class="zg-trigger-radio__btn">
            <span class="zg-trigger-radio__ico">🔌</span>
            <span class="zg-trigger-radio__lbl">API 回调</span>
            <span class="zg-trigger-radio__hint">方法/URL/鉴权/频率限制</span>
          </el-radio-button>
        </el-radio-group>

        <!-- ⏱ 定时触发配置 -->
        <template v-if="ruleForm.draftPayload.triggerType === 'timer'">
          <el-form-item label="快捷预设">
            <div class="zg-timer-presets">
              <el-button v-for="p in TIMER_PRESETS" :key="p.label" size="small"
                :type="ruleForm.draftPayload.timerCron === p.cron ? 'primary' : 'default'"
                @click="ruleForm.draftPayload.timerCron = p.cron">
                {{ p.icon }} {{ p.label }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="Cron 表达式" required>
            <el-input v-model="ruleForm.draftPayload.timerCron" placeholder="分 时 日 月 周" />
            <div class="zg-helptext">
              <span style="color:#6366f1">分</span>·
              <span style="color:#8b5cf6">时</span>·
              <span style="color:#10b981">日</span>·
              <span style="color:#f59e0b">月</span>·
              <span style="color:#ef4444">周</span>
              <span style="color:#64748b">· 示例 <code>30 18 * * *</code> 每天 18:30</span>
            </div>
          </el-form-item>
          <el-form-item label="生效时区">
            <el-select v-model="ruleForm.draftPayload.timezone" style="width:100%">
              <el-option label="Asia/Shanghai (UTC+8) 中国标准时间" value="Asia/Shanghai" />
              <el-option label="Asia/Hong_Kong (UTC+8)" value="Asia/Hong_Kong" />
            </el-select>
          </el-form-item>
          <el-form-item label="节假日">
            <el-switch v-model="ruleForm.draftPayload.skipHoliday"
              active-text="节假日不触发（跳过法定假日）" inactive-text="节假日照常触发" />
          </el-form-item>
        </template>

        <!-- 🚨 告警产生配置 -->
        <template v-if="ruleForm.draftPayload.triggerType === 'alarm'">
          <el-form-item label="告警等级">
            <el-checkbox-group v-model="ruleForm.draftPayload.alarmLevel">
              <el-checkbox value="critical">🔴 紧急（杆桩倾斜/冒烟）</el-checkbox>
              <el-checkbox value="major">🟠 重要（灯具故障/能耗超）</el-checkbox>
              <el-checkbox value="minor">🟡 一般（控制模块离线）</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="告警类型" required>
            <el-select v-model="ruleForm.draftPayload.alarmTypes" multiple collapse-tags
              style="width:100%" placeholder="选一个或多个">
              <el-option label="🔌 灯杆倾斜/倒塌" value="pole_tilt" />
              <el-option label="💡 灯具故障（不亮/闪烁）" value="lamp_fault" />
              <el-option label="🧰 配电箱冒烟/被撬" value="cabinet_smoke" />
              <el-option label="⚡ 能耗超阈值" value="energy_over" />
              <el-option label="💰 杆桩欠费" value="pole_debt" />
              <el-option label="🔩 控制模块离线" value="ctrl_offline" />
              <el-option label="⚠️ 隧道烟雾/火情" value="tunnel_smoke" />
            </el-select>
          </el-form-item>
          <el-form-item label="作用范围">
            <el-radio-group v-model="ruleForm.draftPayload.alarmScope">
              <el-radio value="all">全部设备</el-radio>
              <el-radio value="area">按区域分组</el-radio>
              <el-radio value="specific">指定杆桩编号</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="ruleForm.draftPayload.alarmScope !== 'all'" label="具体范围">
            <el-input v-model="ruleForm.draftPayload.alarmScopeValue"
              :placeholder="ruleForm.draftPayload.alarmScope === 'area' ? '如：先导路 / 麓谷产业园' : '如：YD-LG-023, YD-LG-024'" />
          </el-form-item>
          <el-form-item label="去重策略">
            <el-radio-group v-model="ruleForm.draftPayload.alarmDedupe">
              <el-radio :label="0">不去重</el-radio>
              <el-radio :label="5">同告警 5 分钟内只触发 1 次</el-radio>
              <el-radio :label="30">同告警 30 分钟内只触发 1 次</el-radio>
              <el-radio :label="1440">同告警 1 天内只触发 1 次</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 📡 设备事件配置 -->
        <template v-if="ruleForm.draftPayload.triggerType === 'device-event'">
          <el-form-item label="事件类型" required>
            <el-select v-model="ruleForm.draftPayload.eventType" style="width:100%">
              <el-option-group label="🔩 控制模块">
                <el-option label="✅ 设备上线（网关启动）" value="gw_online" />
                <el-option label="❌ 设备离线（心跳超时）" value="gw_offline" />
                <el-option label="💓 心跳延迟>10s" value="gw_heartbeat_abnormal" />
              </el-option-group>
              <el-option-group label="💡 灯具">
                <el-option label="灯具功率突变 Δσ>2" value="lamp_sudden_change" />
                <el-option label="灯具功率超上限" value="lamp_over_power" />
              </el-option-group>
              <el-option-group label="🏗 杆桩运营">
                <el-option label="📱 用户扫码用电启动" value="pole_power_start" />
                <el-option label="💰 杆桩余额不足" value="pole_balance_low" />
                <el-option label="🔌 充电桩启动充电" value="charger_start" />
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="防抖（连续 N 次才触发）">
            <el-input-number v-model="ruleForm.draftPayload.eventConsecutive" :min="1" :max="10" />
            <span class="zg-helptext" style="margin-left:8px">次（防瞬时抖动）</span>
          </el-form-item>
        </template>

        <!-- 🔌 API 回调配置 -->
        <template v-if="ruleForm.draftPayload.triggerType === 'api-call'">
          <el-form-item label="HTTP 方法">
            <el-radio-group v-model="ruleForm.draftPayload.apiMethod">
              <el-radio-button label="GET">GET</el-radio-button>
              <el-radio-button label="POST">POST</el-radio-button>
              <el-radio-button label="PUT">PUT</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Endpoint URL" required>
            <el-input v-model="ruleForm.draftPayload.apiEndpoint" placeholder="https://example.com/callback" />
          </el-form-item>
          <el-form-item label="鉴权方式">
            <el-radio-group v-model="ruleForm.draftPayload.apiAuth">
              <el-radio :label="'none'">无鉴权</el-radio>
              <el-radio :label="'bearer'">Bearer Token</el-radio>
              <el-radio :label="'apiKey'">API Key</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="ruleForm.draftPayload.apiAuth !== 'none'" label="Token / Key">
            <el-input v-model="ruleForm.draftPayload.apiAuthValue" show-password />
          </el-form-item>
          <el-form-item label="频率限制">
            <el-input-number v-model="ruleForm.draftPayload.apiRateLimit" :min="1" :max="60" />
            <span class="zg-helptext" style="margin-left:8px">次 / 分钟（防回调风暴）</span>
          </el-form-item>
        </template>

        <el-divider />

        <!-- ============ 区块 3：绑定范围 ============ -->
        <div class="zg-section-head">
          <span class="zg-section-ico">📐</span>
          <h4>绑定范围（作用于哪些杆桩/灯具）</h4>
        </div>
        <el-form-item label="范围模式" required>
          <el-radio-group v-model="ruleForm.draftPayload.scopeMode">
            <el-radio :label="'area'">按区域分组（推荐）</el-radio>
            <el-radio :label="'specific'">指定杆桩编号</el-radio>
            <el-radio :label="'lamp-type'">按灯具类型</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="ruleForm.draftPayload.scopeMode === 'area'" label="选择区域">
          <el-checkbox-group v-model="ruleForm.draftPayload.scopeAreas">
            <el-checkbox value="先导路">先导路（30 杆 · 90 盏）</el-checkbox>
            <el-checkbox value="麓谷产业园">麓谷产业园（64 杆 · 192 盏）</el-checkbox>
            <el-checkbox value="梅溪湖环湖路">梅溪湖环湖路（72 杆 · 216 盏）</el-checkbox>
            <el-checkbox value="金星大道">金星大道（86 杆 · 258 盏）</el-checkbox>
            <el-checkbox value="咸嘉湖路">咸嘉湖路（54 杆 · 162 盏）</el-checkbox>
            <el-checkbox value="岳麓山景区">岳麓山景区（60 杆 · 180 盏）</el-checkbox>
            <el-checkbox value="隧道 L-01/02/03">隧道（3 座 · 1280 盏）</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="ruleForm.draftPayload.scopeMode === 'specific'" label="指定杆桩">
          <el-input v-model="ruleForm.draftPayload.scopeSpecific"
            placeholder="如：YD-LG-023, YD-LG-024, YD-LG-050" />
        </el-form-item>
        <el-form-item v-if="ruleForm.draftPayload.scopeMode === 'lamp-type'" label="灯具类型">
          <el-select v-model="ruleForm.draftPayload.scopeLampTypes" multiple collapse-tags style="width:100%">
            <el-option label="道路路灯 100W LED" value="ZG-LD-100W" />
            <el-option label="道路路灯 80W LED" value="ZG-LD-80W" />
            <el-option label="景观灯 40W" value="ZG-JG-40W" />
            <el-option label="隧道灯 150W" value="ZG-SD-150W" />
          </el-select>
        </el-form-item>

        <el-form-item label="生效时间窗口">
          <el-radio-group v-model="ruleForm.draftPayload.timeMode">
            <el-radio :label="'all'">全时段（24/7）</el-radio>
            <el-radio :label="'night-only'">仅夜间（18:00-06:00）</el-radio>
            <el-radio :label="'weeknight'">工作日夜间</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider />

        <!-- ============ 区块 4：附加条件 + 执行动作 ============ -->
        <el-tabs v-model="activeFormTab">
          <el-tab-pane label="📋 附加条件（可选）" name="trigger">
            <div class="zg-helptext" style="margin-bottom:10px">
              <b>触发方式已配置后</b>，可以叠加条件判断（如：定时 18:30 触发 + 附加条件"亮度 < 60"才真正执行）
            </div>
            <div class="zg-form-section">
              <div class="zg-form-section__head">
                <h4>附加条件</h4>
                <el-button type="primary" size="small" @click="addTriggerCondition">
                  <el-icon><Plus /></el-icon>添加条件
                </el-button>
              </div>
              <div
                v-for="(cond, index) in ruleForm.draftPayload.triggerConditions"
                :key="index"
                class="zg-condition-step"
              >
                <div class="zg-condition-step__header">
                  <span class="zg-condition-step__num">{{ index + 1 }}</span>
                  <span class="zg-condition-step__title">条件 {{ index + 1 }}</span>
                  <el-button v-if="ruleForm.draftPayload.triggerConditions.length > 1"
                    type="danger" size="small" @click="removeTriggerCondition(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <div class="zg-draftform__row zg-draftform__row--no-label">
                  <el-form-item class="zg-draftform__col">
                    <el-select v-model="cond.triggerVar" placeholder="变量" style="width:100%">
                      <el-option label="环境亮度 lux" value="lux" />
                      <el-option label="环境温度 °C" value="temp" />
                      <el-option label="实时功率 W" value="power" />
                      <el-option label="在线率 %" value="online_rate" />
                      <el-option label="杆桩余额 ¥" value="balance" />
                      <el-option label="配电箱内部温度 °C" value="cabinet_temp" />
                    </el-select>
                  </el-form-item>
                  <el-form-item class="zg-draftform__col" style="max-width:120px">
                    <el-select v-model="cond.triggerOp" style="width:100%">
                      <el-option label=">" value=">" />
                      <el-option label="<" value="<" />
                      <el-option label="=" value="=" />
                      <el-option label=">=" value=">=" />
                      <el-option label="<=" value="<=" />
                    </el-select>
                  </el-form-item>
                  <el-form-item class="zg-draftform__col" style="max-width:150px">
                    <el-input-number v-model="cond.triggerThreshold" style="width:100%" />
                  </el-form-item>
                </div>
              </div>
              <div v-if="ruleForm.draftPayload.triggerConditions.length === 0" class="zg-helptext">
                💡 条件可为空 — 触发方式本身就是触发源（定时/告警/事件）
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🎬 执行动作（必配）" name="action">
            <div class="zg-form-section">
              <div class="zg-form-section__head">
                <h4>执行动作</h4>
                <el-button type="primary" size="small" @click="addExecuteAction">
                  <el-icon><Plus /></el-icon>添加动作
                </el-button>
              </div>
              <div
                v-for="(action, index) in ruleForm.draftPayload.executeActions"
                :key="index"
                class="zg-action-step"
              >
                <div class="zg-action-step__header">
                  <span class="zg-action-step__num">{{ index + 1 }}</span>
                  <span class="zg-action-step__title">动作 {{ index + 1 }}</span>
                  <el-button v-if="ruleForm.draftPayload.executeActions.length > 1"
                    type="danger" size="small" @click="removeExecuteAction(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <div class="zg-draftform__row zg-draftform__row--no-label">
                  <el-form-item class="zg-draftform__col">
                    <el-select v-model="action.actionType" placeholder="动作类型" style="width:100%">
                      <el-option label="💡 开灯" value="lamp-on" />
                      <el-option label="🌑 关灯" value="lamp-off" />
                      <el-option label="🔅 调节亮度" value="dim" />
                      <el-option label="📋 创建运维工单" value="ticket" />
                      <el-option label="📱 发送消息" value="message" />
                      <el-option label="⚡ 杆桩供电合闸/断电" value="pole-power" />
                    </el-select>
                  </el-form-item>
                  <el-form-item class="zg-draftform__col zg-draftform__col--sm">
                    <el-input-number v-model="action.delaySeconds" :min="0" :max="3600"
                      style="width:100%" />
                    <span class="zg-helptext" style="margin-left:4px">秒延时</span>
                  </el-form-item>
                </div>

                <!-- 动作专属配置 -->
                <el-form-item v-if="action.actionType === 'dim'" label="亮度">
                  <el-slider v-model="action.brightness" :min="0" :max="100" show-input input-size="small" />
                </el-form-item>
                <el-form-item v-if="action.actionType === 'ticket'" label="工单类型">
                  <el-select v-model="action.ticketType" style="width:100%">
                    <el-option label="🔴 紧急故障" value="urgent" />
                    <el-option label="🟠 日常巡检" value="routine" />
                    <el-option label="🚧 杆桩维护" value="pole" />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="action.actionType === 'message'" label="通知渠道">
                  <el-checkbox-group v-model="action.channels">
                    <el-checkbox value="wecom">企业微信</el-checkbox>
                    <el-checkbox value="sms">短信</el-checkbox>
                    <el-checkbox value="dingtalk">钉钉</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item v-if="action.actionType === 'pole-power'" label="供电动作">
                  <el-radio-group v-model="action.powerAction">
                    <el-radio value="on">合闸供电</el-radio>
                    <el-radio value="off">断电保护</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-divider />

        <!-- 实时预览 -->
        <div class="zg-preview-row">
          <div class="zg-preview-row__label">📊 执行预览</div>
          <div class="zg-preview-row__boxes">
            <div class="zg-preview-row__box">
              <b>{{ bindingPoleCount }}</b>
              <span>根杆桩</span>
            </div>
            <div class="zg-preview-row__box">
              <b>{{ bindingLampCount }}</b>
              <span>盏灯具</span>
            </div>
            <div class="zg-preview-row__box">
              <b>{{ ruleForm.draftPayload.executeActions.length }}</b>
              <span>个动作</span>
            </div>
            <div class="zg-preview-row__box">
              <b>{{ ruleForm.draftPayload.triggerConditions.length }}</b>
              <span>条条件</span>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="zg-draftform__foot">
          <el-button @click="ruleForm.onDraftDiscard()">取消</el-button>
          <el-button type="primary" plain :disabled="ruleForm.draftPayload.triggerType === ''"
            @click="ruleForm.onDraftTestRun()">
            <el-icon><VideoPlay /></el-icon>🧪 测试运行
          </el-button>
          <el-button type="primary" :loading="ruleForm.submitting"
            :disabled="ruleForm.draftPayload.triggerType === ''"
            @click="ruleForm.onDraftCommit()">
            {{ ruleForm.editMode === 'compose' ? '保存规则' : '保存修改' }}
          </el-button>
        </div>
      </template>
    </el-drawer>

    <el-drawer
      v-model="ruleInspector.drawerOpen"
      :title="'规则详情 · ' + (focusedRule?.name || '')"
      direction="rtl"
      size="680px"
    >
      <div v-if="focusedRule" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><Link /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRule.name }}</h2>
            <p class="zg-inspector__type">
              {{ priorityText[focusedRule.priority] }}优先级 ·
              {{ TRIGGER_LABELS[focusedRule.triggerType] || focusedRule.triggerType }}
            </p>
            <span class="zg-status" :class="focusedRule.status === '启用' ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedRule.status }}
            </span>
          </div>
        </div>

        <!-- 触发方式 -->
        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">🎯 触发方式</h4>
          <div class="zg-trigger-badge-row">
            <el-tag effect="dark" size="large" style="margin-bottom:8px">
              {{ TRIGGER_LABELS[focusedRule.triggerType] || focusedRule.triggerType }}
            </el-tag>
          </div>
          <div v-if="focusedRule.triggerType === 'timer'" class="zg-inspector__kv">
            <div><span class="lbl">Cron</span><span class="val mono">{{ focusedRule.timerCron }}</span></div>
            <div><span class="lbl">时区</span><span class="val">{{ focusedRule.timezone }}</span></div>
            <div><span class="lbl">节假日</span><span class="val">{{ focusedRule.skipHoliday ? '跳过' : '照常触发' }}</span></div>
          </div>
          <div v-if="focusedRule.triggerType === 'alarm'" class="zg-inspector__kv">
            <div><span class="lbl">告警等级</span><span class="val">{{ (focusedRule.alarmLevel || []).join(', ') }}</span></div>
            <div><span class="lbl">告警类型</span><span class="val">{{ (focusedRule.alarmTypes || []).join(', ') }}</span></div>
            <div><span class="lbl">去重策略</span><span class="val">同告警 {{ focusedRule.alarmDedupe }} 分钟内只触发 1 次</span></div>
          </div>
          <div v-if="focusedRule.triggerType === 'device-event'" class="zg-inspector__kv">
            <div><span class="lbl">事件类型</span><span class="val">{{ focusedRule.eventType }}</span></div>
            <div><span class="lbl">防抖</span><span class="val">连续 {{ focusedRule.eventConsecutive }} 次才触发</span></div>
          </div>
          <div v-if="focusedRule.triggerType === 'api-call'" class="zg-inspector__kv">
            <div><span class="lbl">方法</span><span class="val">{{ focusedRule.apiMethod }}</span></div>
            <div><span class="lbl">URL</span><span class="val mono">{{ focusedRule.apiEndpoint }}</span></div>
            <div><span class="lbl">鉴权</span><span class="val">{{ focusedRule.apiAuth }}</span></div>
          </div>
        </div>

        <!-- 附加条件 -->
        <div v-if="focusedRule.triggerConditions && focusedRule.triggerConditions.length > 0" class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📋 附加条件</h4>
          <div
            v-for="(cond, index) in focusedRule.triggerConditions"
            :key="index"
            class="zg-inspector__condition-item"
          >
            <span class="zg-inspector__condition-num">{{ index + 1 }}.</span>
            <span class="mono">{{ cond.triggerVar }} {{ cond.triggerOp }} {{ cond.triggerThreshold }}</span>
          </div>
        </div>

        <!-- 绑定范围 -->
        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📐 绑定范围</h4>
          <div class="zg-summary-grid">
            <div class="zg-summary-grid__cell">
              <span class="num">{{ ruleScopesPoles(focusedRule) }}</span>
              <span class="lbl">根杆桩</span>
            </div>
            <div class="zg-summary-grid__cell">
              <span class="num">{{ ruleScopesLamps(focusedRule) }}</span>
              <span class="lbl">盏灯具</span>
            </div>
            <div class="zg-summary-grid__cell">
              <span class="num">{{ focusedRule.scopeAreas?.length || 0 }}</span>
              <span class="lbl">个区域</span>
            </div>
          </div>
          <div v-if="focusedRule.scopeAreas?.length" class="zg-inspector__areas">
            <el-tag v-for="a in focusedRule.scopeAreas" :key="a"
              size="small" effect="light" style="margin:2px">
              {{ a }}
            </el-tag>
          </div>
        </div>

        <!-- 执行动作 -->
        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">🎬 执行动作</h4>
          <div v-if="focusedRule.executeActions && focusedRule.executeActions.length > 0">
            <div
              v-for="(action, index) in focusedRule.executeActions"
              :key="index"
              class="zg-inspector__condition-item"
            >
              <span class="zg-inspector__condition-num">{{ index + 1 }}.</span>
              <span class="zg-inspector__action-main">
                <el-tag effect="light">{{ ACTION_LABELS[action.actionType] || action.actionType }}</el-tag>
                <span v-if="action.delaySeconds" class="zg-delay-txt">· 延时 {{ action.delaySeconds }} 秒</span>
                <span v-if="action.brightness != null && action.brightness > 0" class="zg-delay-txt">· 亮度 {{ action.brightness }}%</span>
                <span v-if="action.powerAction === 'off'" class="zg-delay-txt">· 断电保护</span>
                <span v-if="action.channels?.length" class="zg-delay-txt">· 渠道 {{ action.channels.join(',') }}</span>
              </span>
            </div>
          </div>
          <p v-else class="zg-helptext">尚未配置执行动作</p>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="ruleInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="ruleForm.openReviser(focusedRule)">修改规则</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Link,
  Plus,
  Grid,
  List,
  Search,
  Refresh,
  Delete,
  MoreFilled,
  Clock
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'

const viewMode = ref('card')
const activeFormTab = ref('trigger')
const selectedRules = ref([])

const priorityText = { high: '高', medium: '中', low: '低' }

// ============ 常量（与 QuickOperation 统一） ============
const AREA_MAPPING = {
  '先导路':          { poles: 30,  lamps: 90 },
  '麓谷产业园':      { poles: 64,  lamps: 192 },
  '梅溪湖环湖路':    { poles: 72,  lamps: 216 },
  '金星大道':        { poles: 86,  lamps: 258 },
  '咸嘉湖路':        { poles: 54,  lamps: 162 },
  '岳麓山景区':      { poles: 60,  lamps: 180 },
  '隧道 L-01/02/03': { poles: 12,  lamps: 1280 },
}

const TRIGGER_LABELS = {
  timer: '⏱ 定时',
  alarm: '🚨 告警',
  'device-event': '📡 设备事件',
  'api-call': '🔌 API 回调',
}
const ACTION_LABELS = {
  'lamp-on': '💡 开灯',
  'lamp-off': '🌑 关灯',
  'dim': '🔅 调光',
  'ticket': '📋 工单',
  'message': '📱 通知',
  'pole-power': '⚡ 杆桩供电',
}

const bindingPoleCount = computed(() => {
  const d = ruleForm.draftPayload
  if (d.scopeMode === 'area') return (d.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.poles || 0), 0)
  if (d.scopeMode === 'specific') return (d.scopeSpecific || '').split(/[,，\s]+/).filter(Boolean).length
  return 384
})
const bindingLampCount = computed(() => {
  const d = ruleForm.draftPayload
  if (d.scopeMode === 'area') return (d.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.lamps || 0), 0)
  return 1152
})
const ruleScopesPoles = (r) => {
  if (r.scopeMode === 'area') return (r.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.poles || 0), 0)
  return 0
}
const ruleScopesLamps = (r) => {
  if (r.scopeMode === 'area') return (r.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.lamps || 0), 0)
  return 0
}

const initialRules = [
  {
    id: 1, no: 1,
    name: '日落自动开灯（先导路 + 麓谷）',
    priority: 'high', status: '启用', enabled: true,
    triggerType: 'timer',
    timerCron: '30 18 * * *', timezone: 'Asia/Shanghai', skipHoliday: false,
    scopeMode: 'area', scopeAreas: ['先导路', '麓谷产业园'],
    timeMode: 'all',
    triggerConditions: [],
    executeActions: [
      { actionType: 'lamp-on', brightness: 80, delaySeconds: 0, ticketType: '', channels: [], powerAction: '' },
    ],
  },
  {
    id: 2, no: 2,
    name: '杆桩倾斜告警 → 派紧急工单',
    priority: 'high', status: '启用', enabled: true,
    triggerType: 'alarm',
    alarmLevel: ['critical'], alarmTypes: ['pole_tilt'],
    alarmScope: 'area', alarmScopeValue: '岳麓区全域', alarmDedupe: 30,
    scopeMode: 'area', scopeAreas: ['先导路', '麓谷产业园', '岳麓山景区'],
    timeMode: 'all',
    triggerConditions: [],
    executeActions: [
      { actionType: 'ticket', brightness: 0, delaySeconds: 0, ticketType: 'urgent', channels: [], powerAction: '' },
      { actionType: 'message', brightness: 0, delaySeconds: 2, ticketType: '', channels: ['wecom', 'sms'], powerAction: '' },
    ],
  },
  {
    id: 3, no: 3,
    name: '隧道烟雾告警 → 断电保护 + 工单',
    priority: 'high', status: '启用', enabled: true,
    triggerType: 'alarm',
    alarmLevel: ['critical'], alarmTypes: ['tunnel_smoke'],
    alarmScope: 'area', alarmScopeValue: '隧道 L-01/02/03', alarmDedupe: 5,
    scopeMode: 'area', scopeAreas: ['隧道 L-01/02/03'],
    timeMode: 'all',
    triggerConditions: [],
    executeActions: [
      { actionType: 'pole-power', brightness: 0, delaySeconds: 0, ticketType: '', channels: [], powerAction: 'off' },
      { actionType: 'message', brightness: 0, delaySeconds: 1, ticketType: '', channels: ['wecom', 'sms'], powerAction: '' },
      { actionType: 'ticket', brightness: 0, delaySeconds: 3, ticketType: 'urgent', channels: [], powerAction: '' },
    ],
  },
  {
    id: 4, no: 4,
    name: 'API 回调触发 → 联动先导路开灯',
    priority: 'medium', status: '禁用', enabled: false,
    triggerType: 'api-call',
    apiMethod: 'POST', apiEndpoint: 'https://event.external.com/callback',
    apiAuth: 'bearer', apiAuthValue: 'Bearer ****', apiRateLimit: 10,
    scopeMode: 'area', scopeAreas: ['先导路'],
    timeMode: 'all',
    triggerConditions: [],
    executeActions: [
      { actionType: 'lamp-on', brightness: 100, delaySeconds: 0, ticketType: '', channels: [], powerAction: '' },
    ],
  },
  {
    id: 5, no: 5,
    name: '网关离线 3 次 → 企业微信通知',
    priority: 'medium', status: '启用', enabled: true,
    triggerType: 'device-event',
    eventType: 'gw_offline', eventConsecutive: 3,
    scopeMode: 'area', scopeAreas: ['先导路', '麓谷产业园'],
    timeMode: 'all',
    triggerConditions: [],
    executeActions: [
      { actionType: 'message', brightness: 0, delaySeconds: 0, ticketType: '', channels: ['wecom'], powerAction: '' },
    ],
  },
]

const ruleCtl = usePresetTable(null, {
  defaultPageSpan: 15,
  initialData: initialRules
})

const TIMER_PRESETS = [
  { icon: '🌅', label: '日落开灯', cron: '30 18 * * *' },
  { icon: '🌇', label: '下班高峰', cron: '0 17 * * 1-5' },
  { icon: '🌙', label: '深夜降亮', cron: '0 23 * * *' },
  { icon: '🌄', label: '日出关灯', cron: '30 6 * * *' },
  { icon: '⏰', label: '每小时巡检', cron: '0 * * * *' },
  { icon: '🎉', label: '节假日全亮', cron: '0 19 1 5 *' },
];

const ruleForm = useFormDraft(
  {
    name: '',
    description: '',
    priority: 'medium',
    enabled: true,

    /* 触发方式（4 选 1）*/
    triggerType: '',
    /* timer 专属 */
    timerCron: '30 18 * * *',
    timezone: 'Asia/Shanghai',
    skipHoliday: false,
    /* alarm 专属 */
    alarmLevel: ['critical'],
    alarmTypes: ['pole_tilt'],
    alarmScope: 'all',
    alarmScopeValue: '',
    alarmDedupe: 30,
    /* device-event 专属 */
    eventType: 'gw_offline',
    eventConsecutive: 3,
    /* api-call 专属 */
    apiMethod: 'POST',
    apiEndpoint: '',
    apiAuth: 'none',
    apiAuthValue: '',
    apiRateLimit: 10,

    /* 绑定范围 */
    scopeMode: 'area',
    scopeAreas: ['先导路'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'all',

    /* 附加条件（可选）*/
    triggerConditions: [
      { triggerVar: 'lux', triggerOp: '<', triggerThreshold: 60 }
    ],

    /* 执行动作 */
    executeActions: [
      { actionType: 'lamp-on', brightness: 80, ticketType: 'urgent', channels: ['wecom'], powerAction: 'off', delaySeconds: 0 }
    ]
  },
  {
    submitApi: async (draft, { mode }) => {
      if (mode === 'compose') {
        ruleCtl.appendRecord({
          ...draft, id: Date.now(), no: ruleCtl.totalRows + 1,
          status: draft.enabled ? '启用' : '禁用'
        })
        ElMessage.success('🎉 规则已创建并生效！')
      } else {
        ruleCtl.reviseRecord(draft.id, draft)
        ElMessage.success('规则已更新')
      }
      return { ok: true }
    },
    validateFn: (draft) => {
      if (!draft.name) { ElMessage.warning('请填写规则名称'); return false }
      if (!draft.triggerType) { ElMessage.warning('请选择触发方式（定时/告警/设备事件/API）'); return false }
      if (!draft.scopeMode) { ElMessage.warning('请设置绑定范围'); return false }
      if (draft.executeActions.length === 0) { ElMessage.warning('请至少配置一个执行动作'); return false }
      const hasAnyAction = draft.executeActions.some(a => a.actionType)
      if (!hasAnyAction) { ElMessage.warning('请选择动作类型'); return false }
      return true
    },
    extraMethods: {
      onDraftTestRun() {
        ElMessage.info('🧪 测试运行模拟：' + ruleForm.draftPayload.triggerType + ' 触发，' + bindingPoleCount.value + ' 根杆执行中...')
      }
    }
  }
)

const ruleInspector = useDrawerInspector({ size: '680px', direction: 'rtl' })
const focusedRule = computed(() => ruleInspector.focusedRecord)

const activeRuleCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.status === '启用').length
)
const idleRuleCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.status === '禁用').length
)
const highPriorityCount = computed(
  () => ruleCtl.presetPlaybook.filter(r => r.priority === 'high').length
)
const totalTriggerCount = computed(
  () => ruleCtl.presetPlaybook.reduce((sum, r) => sum + (r.triggerCount || 0), 0)
)

const onToggleSelect = (id) => {
  const index = selectedRules.value.indexOf(id)
  if (index > -1) {
    selectedRules.value.splice(index, 1)
  } else {
    selectedRules.value.push(id)
  }
}

const onToggleStatus = (rule) => {
  ElMessage.success(`规则"${rule.name}"已${rule.status === '启用' ? '启用' : '禁用'}`)
}

const onRuleAction = (rule, action) => {
  switch (action) {
    case 'edit':
      ruleForm.openReviser(rule)
      break
    case 'detail':
      ruleInspector.openInspector(rule)
      break
    case 'delete':
      onDeleteRule(rule)
      break
  }
}

const onDeleteRule = (rule) => {
  ElMessageBox.confirm(`确认删除规则"${rule.name}"吗？`, '删除确认', { type: 'warning' })
    .then(() => {
      ruleCtl.retireRecord(rule.id)
      selectedRules.value = selectedRules.value.filter(id => id !== rule.id)
      ElMessage.success('规则已删除')
    })
}

const onBatchDelete = () => {
  ElMessageBox.confirm(`确认删除选中的${selectedRules.value.length}条规则吗？`, '批量删除确认', { type: 'warning' })
    .then(() => {
      selectedRules.value.forEach(id => ruleCtl.retireRecord(id))
      selectedRules.value = []
      ElMessage.success('规则已批量删除')
    })
}

const addTriggerCondition = () => {
  ruleForm.draftPayload.triggerConditions.push({
    triggerVar: 'lux', triggerOp: '<', triggerThreshold: 60
  })
}

const removeTriggerCondition = (index) => {
  ruleForm.draftPayload.triggerConditions.splice(index, 1)
}

const addExecuteAction = () => {
  ruleForm.draftPayload.executeActions.push({
    actionType: 'lamp-on', brightness: 80, ticketType: 'urgent',
    channels: ['wecom'], powerAction: 'off', delaySeconds: 0
  })
}

const removeExecuteAction = (index) => {
  ruleForm.draftPayload.executeActions.splice(index, 1)
}

const onCommitRuleDraft = async () => {
  await ruleForm.onDraftCommit()
}
</script>

<style scoped lang="scss">
.zg-scene-linkage {
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  background: linear-gradient(180deg, #f0fdfa 0%, #ecfeff 100%);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    border: 1px solid var(--zg-line-brand);
  }

  &__sigil {
    width: 40px;
    height: 40px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: grid;
    place-items: center;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__cta {
    display: flex;
    gap: 8px;
  }
}

.zg-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  &__cell {
    background: var(--zg-surface-card);
    border-radius: var(--zg-radius-lg);
    padding: 16px;
    text-align: center;
    border: 1px solid var(--zg-line-soft);

    &--ok {
      border-color: var(--zg-brand-success);
    }

    &--warn {
      border-color: var(--zg-brand-warning);
    }

    &--info {
      border-color: var(--zg-brand-info);
    }
  }

  &__num {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--zg-ink-primary);
    margin-bottom: 4px;
  }

  &__lbl {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-filterband {
  background: var(--zg-surface-card);
  padding: 14px 18px;
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__density {
    display: flex;
    gap: 8px;
  }

  &__fields {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__search {
    width: 220px;
  }

  &__select {
    width: 140px;
  }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.zg-rulecard {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  padding: 16px;
  display: flex;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--zg-brand-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  &--selected {
    border-color: var(--zg-brand-primary);
    background: rgba(59, 130, 246, 0.05);
  }

  &__checkbox {
    display: flex;
    align-items: flex-start;
    padding-top: 2px;
  }

  &__content {
    flex: 1;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    flex: 1;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__more {
    cursor: pointer;
    color: var(--zg-ink-tertiary);
    font-size: 16px;
  }

  &__body {
    margin-top: 8px;
  }

  &__execute-date {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
  }
}

.zg-priority-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;

  &.high {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  &.medium {
    background: rgba(249, 115, 22, 0.1);
    color: #f97316;
  }

  &.low {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  overflow: hidden;
}

.zg-datatable {
  width: 100%;

  :deep(.el-table__header-wrapper) {
    background: var(--zg-surface-elevated);
  }

  :deep(.el-table th) {
    background: var(--zg-surface-elevated);
    font-weight: 600;
    color: var(--zg-ink-secondary);
  }
}

.zg-pagerbar {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  margin-top: 8px;
}

.zg-draftform {
  padding: 8px 0;

  &__foot {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.zg-form-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--zg-line-soft);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0;
  }
}

.zg-condition-step,
.zg-action-step {
  background: var(--zg-surface-elevated);
  border-radius: var(--zg-radius-md);
  padding: 12px;
  margin-bottom: 12px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--zg-brand-primary);
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--zg-ink-primary);
    flex: 1;
  }
}

.zg-form-item__unit {
  margin-left: 8px;
  font-size: 13px;
  color: var(--zg-ink-tertiary);
}

.zg-time-range-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zg-time-range-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--zg-ink-secondary);
}

.zg-time-range-form {
  padding: 8px 0;
}

.zg-time-range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.zg-time-range-separator {
  color: var(--zg-ink-tertiary);
}

.zg-inspector {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--zg-line-soft);
  }

  &__glyph {
    color: var(--zg-brand-primary);
  }

  &__meta {
    flex: 1;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }

  &__type {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    margin: 0;
  }

  &__section {
    &-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--zg-ink-primary);
      margin: 0 0 12px;
    }
  }

  &__condition-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: var(--zg-ink-secondary);
    margin-bottom: 8px;
    padding: 8px;
    background: var(--zg-surface-elevated);
    border-radius: var(--zg-radius-sm);
  }

  &__condition-num {
    font-weight: 600;
    color: var(--zg-brand-primary);
  }

  &__empty {
    font-size: 13px;
    color: var(--zg-ink-tertiary);
    text-align: center;
    padding: 16px;
    background: var(--zg-surface-elevated);
    border-radius: var(--zg-radius-sm);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--zg-line-soft);
    margin-top: auto;
  }
}

.zg-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;

  &.online {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
    }
  }

  &.offline {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6b7280;
    }
  }
}
</style>