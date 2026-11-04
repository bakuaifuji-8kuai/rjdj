<template>
  <section class="zg-quick-op">
    <header class="zg-quick-op__head">
      <div class="zg-quick-op__headline">
        <div class="zg-quick-op__sigil">
          <el-icon :size="22"><Lightning /></el-icon>
        </div>
        <div class="zg-quick-op__copy">
          <h1 class="zg-quick-op__title">快捷操作 · 策略库</h1>
          <p class="zg-quick-op__sub">
            手动一键下发场景 · 在册 {{ sceneCtl.totalRows }} 个场景 ·
            累计下发 {{ recordCtl.totalRows }} 条记录
          </p>
        </div>
      </div>
      <div class="zg-quick-op__cta">
        <el-button type="primary" @click="sceneForm.openComposer()">
          <el-icon><Plus /></el-icon>
          <span>新增策略</span>
        </el-button>
      </div>
    </header>

    <div class="zg-metrics">
      <div class="zg-metrics__cell">
        <span class="zg-metrics__num">{{ sceneCtl.totalRows }}</span>
        <span class="zg-metrics__lbl">策略总数</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--ok">
        <span class="zg-metrics__num">{{ enabledSceneCount }}</span>
        <span class="zg-metrics__lbl">启用运行</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--info">
        <span class="zg-metrics__num">{{ totalBindingPoles }}</span>
        <span class="zg-metrics__lbl">累计覆盖杆桩</span>
      </div>
      <div class="zg-metrics__cell zg-metrics__cell--warn">
        <span class="zg-metrics__num">{{ totalBindingLamps }}</span>
        <span class="zg-metrics__lbl">累计覆盖灯具</span>
      </div>
    </div>

    <div class="zg-tabwrap">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="场景控制" name="control">
          <div class="zg-filterband">
            <div class="zg-filterband__fields">
              <el-input
                v-model="sceneCtl.filterLexicon"
                placeholder="请输入场景名称查询"
                clearable
                class="zg-filterband__search"
                @keyup.enter="sceneCtl.onFilterApply()"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="sceneCtl.onFilterApply()">
                <el-icon><Search /></el-icon>
                <span>查询</span>
              </el-button>
              <el-button @click="sceneCtl.onFilterReset()">
                <el-icon><Refresh /></el-icon>
                <span>重置</span>
              </el-button>
            </div>
          </div>

          <div class="zg-cardgrid">
            <article
              v-for="scene in sceneCtl.pagedRows"
              :key="scene.id"
              class="zg-scenecard"
            >
              <div class="zg-scenecard__head">
                <span class="zg-scenecard__icon">{{ scene.icon || '💡' }}</span>
                <span class="zg-scenecard__name">{{ scene.name }}</span>
                <el-tag
                  class="zg-scenecard__status-tag"
                  :type="scene.enabled ? 'success' : 'info'"
                  size="small"
                  effect="light"
                >
                  {{ scene.enabled ? '启用中' : '已停用' }}
                </el-tag>
                <div class="zg-scenecard__right">
                  <el-switch
                    v-model="scene.enabled"
                    :active-text="''"
                    :inactive-text="''"
                    @change="onToggleEnabled(scene)"
                  />
                  <el-dropdown @command="(cmd) => onSceneAction(scene, cmd)">
                    <span class="zg-scenecard__more">
                      <el-icon><MoreFilled /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑策略</el-dropdown-item>
                        <el-dropdown-item command="detail">策略详情</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <!-- 新摘要：区域 + 杆数 + 灯具 + 动作 -->
              <div class="zg-scenecard__summary">
                <template v-if="scene.scopeMode === 'area' && scene.scopeAreas.length">
                  <div class="zg-scenecard__summary-row">
                    <span class="zg-scenecard__summary-label">📍 作用范围</span>
                    <span class="zg-scenecard__summary-value">
                      {{ scene.scopeAreas.join('、') }}
                    </span>
                  </div>
                  <div class="zg-scenecard__summary-row">
                    <span class="zg-scenecard__summary-label">📊 覆盖规模</span>
                    <span class="zg-scenecard__summary-value">
                      <b class="zg-highlight">{{ getSceneBindingPoles(scene) }}</b> 根杆桩 ·
                      <b class="zg-highlight">{{ getSceneBindingLamps(scene) }}</b> 盏灯具
                    </span>
                  </div>
                </template>
                <template v-else-if="scene.scopeMode === 'specific' && scene.scopeSpecific">
                  <div class="zg-scenecard__summary-row">
                    <span class="zg-scenecard__summary-label">📍 指定杆桩</span>
                    <span class="zg-scenecard__summary-value truncate">{{ scene.scopeSpecific }}</span>
                  </div>
                </template>
                <div class="zg-scenecard__summary-row">
                  <span class="zg-scenecard__summary-label">🎬 执行动作</span>
                  <span class="zg-scenecard__summary-value">
                    <el-tag
                      v-for="(a, ai) in (scene.executeActions || [])"
                      :key="ai"
                      size="small"
                      :type="actionTagType(a.actionType)"
                      effect="light"
                      class="zg-action-tag"
                    >
                      {{ actionLabel(a.actionType, a) }}
                    </el-tag>
                  </span>
                </div>
              </div>

              <div class="zg-scenecard__foot">
                <el-button type="primary" @click="onExecuteScene(scene)">
                  <el-icon><VideoPlay /></el-icon>
                  <span>立即执行</span>
                </el-button>
                <el-button @click="onViewResult(scene)">
                  <el-icon><InfoFilled /></el-icon>
                  <span>上次执行</span>
                </el-button>
              </div>
            </article>
          </div>

          <div class="zg-pagerbar">
            <el-pagination
              v-model:current-page="sceneCtl.pagingCursor"
              v-model:page-size="sceneCtl.pageSpan"
              :total="sceneCtl.totalRows"
              :page-sizes="[10, 15, 20, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
              background
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="场景下发记录" name="records">
          <div class="zg-filterband">
            <div class="zg-filterband__fields">
              <el-input
                v-model="recordCtl.filterLexicon"
                placeholder="请输入场景名称查询"
                clearable
                class="zg-filterband__search"
                @keyup.enter="recordCtl.onFilterApply()"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="recordCtl.onFilterApply()">
                <el-icon><Search /></el-icon>
                <span>查询</span>
              </el-button>
              <el-button @click="recordCtl.onFilterReset()">
                <el-icon><Refresh /></el-icon>
                <span>重置</span>
              </el-button>
            </div>
          </div>

          <div class="zg-tablewrap">
            <el-table :data="recordCtl.pagedRows" stripe class="zg-datatable">
              <el-table-column prop="no" label="序号" width="60" align="center" />
              <el-table-column prop="deployTime" label="下发时间" min-width="160" />
              <el-table-column prop="sceneName" label="场景名称" min-width="160" />
              <el-table-column prop="deployUser" label="下发人员" min-width="120" />
              <el-table-column label="覆盖规模" min-width="140">
                <template #default="{ row }">
                  {{ row.poleCount }} 杆 · {{ row.lampCount }} 盏
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="onInspectRecord(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="zg-pagerbar">
            <el-pagination
              v-model:current-page="recordCtl.pagingCursor"
              v-model:page-size="recordCtl.pageSpan"
              :total="recordCtl.totalRows"
              :page-sizes="[10, 15, 20, 50, 100]"
              layout="prev, pager, next, jumper, ->, sizes, total"
              background
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ============ 新增/编辑 Drawer ============ -->
    <el-drawer
      v-model="sceneForm.drawerOpen"
      :title="sceneForm.editMode === 'compose' ? '📋 新增快捷策略' : '✏️ 编辑快捷策略'"
      direction="rtl"
      size="720px"
    >
      <el-form :model="sceneForm.draftPayload" label-width="96px" class="zg-draftform">

        <!-- ============ 区块 1：场景基本信息 ============ -->
        <div class="zg-section-head">
          <span class="zg-section-ico">📌</span>
          <h4>场景基本信息</h4>
        </div>
        <el-form-item label="策略名称" required>
          <el-input v-model="sceneForm.draftPayload.name"
            placeholder="如：日落一键开灯 / 应急全亮 / 夜间巡检" />
        </el-form-item>
        <div class="zg-draftform__row">
          <el-form-item label="场景图标" class="zg-draftform__col">
            <el-select v-model="sceneForm.draftPayload.icon" style="width:100%">
              <el-option label="💡 开灯" value="💡" />
              <el-option label="🌑 关灯" value="🌑" />
              <el-option label="🔅 调光" value="🔅" />
              <el-option label="🚨 应急" value="🚨" />
              <el-option label="🌙 夜间" value="🌙" />
              <el-option label="🌅 日落" value="🌅" />
              <el-option label="🔧 运维" value="🔧" />
              <el-option label="⚡ 供电" value="⚡" />
            </el-select>
          </el-form-item>
          <el-form-item label="启用开关" class="zg-draftform__col">
            <el-switch v-model="sceneForm.draftPayload.enabled"
              active-text="保存后立即启用" inactive-text="保存为草稿" />
          </el-form-item>
        </div>
        <div class="zg-draftform__row">
          <el-form-item label="排序序号" class="zg-draftform__col">
            <el-input-number v-model="sceneForm.draftPayload.sortOrder" :min="1" :max="999" style="width:100%" />
          </el-form-item>
          <el-form-item label="生效时间" class="zg-draftform__col">
            <el-radio-group v-model="sceneForm.draftPayload.timeMode">
              <el-radio :label="'all'">全时段</el-radio>
              <el-radio :label="'night-only'">仅夜间</el-radio>
              <el-radio :label="'weeknight'">工作日夜间</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <el-form-item label="策略描述">
          <el-input v-model="sceneForm.draftPayload.description" type="textarea" :rows="2"
            placeholder="描述这个策略的业务用途，供运维同事快速理解" />
        </el-form-item>

        <el-divider />

        <!-- ============ 区块 2：绑定范围 ============ -->
        <div class="zg-section-head">
          <span class="zg-section-ico">📐</span>
          <h4>绑定范围（作用于哪些杆桩/灯具）</h4>
        </div>
        <el-form-item label="范围模式" required>
          <el-radio-group v-model="sceneForm.draftPayload.scopeMode">
            <el-radio :label="'area'">按区域分组（推荐）</el-radio>
            <el-radio :label="'specific'">指定杆桩编号</el-radio>
            <el-radio :label="'lamp-type'">按灯具类型</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="sceneForm.draftPayload.scopeMode === 'area'" label="选择区域">
          <el-checkbox-group v-model="sceneForm.draftPayload.scopeAreas">
            <el-checkbox value="先导路">先导路（30 杆 · 90 盏）</el-checkbox>
            <el-checkbox value="麓谷产业园">麓谷产业园（64 杆 · 192 盏）</el-checkbox>
            <el-checkbox value="梅溪湖环湖路">梅溪湖环湖路（72 杆 · 216 盏）</el-checkbox>
            <el-checkbox value="金星大道">金星大道（86 杆 · 258 盏）</el-checkbox>
            <el-checkbox value="咸嘉湖路">咸嘉湖路（54 杆 · 162 盏）</el-checkbox>
            <el-checkbox value="岳麓山景区">岳麓山景区（60 杆 · 180 盏）</el-checkbox>
            <el-checkbox value="隧道 L-01/02/03">隧道（3 座 · 1280 盏）</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="sceneForm.draftPayload.scopeMode === 'specific'" label="指定杆桩">
          <el-input v-model="sceneForm.draftPayload.scopeSpecific"
            placeholder="如：YD-LG-023, YD-LG-024, YD-LG-050" />
        </el-form-item>
        <el-form-item v-if="sceneForm.draftPayload.scopeMode === 'lamp-type'" label="灯具类型">
          <el-select v-model="sceneForm.draftPayload.scopeLampTypes" multiple collapse-tags style="width:100%">
            <el-option label="道路路灯 100W LED" value="ZG-LD-100W" />
            <el-option label="道路路灯 80W LED" value="ZG-LD-80W" />
            <el-option label="景观灯 40W" value="ZG-JG-40W" />
            <el-option label="隧道灯 150W" value="ZG-SD-150W" />
          </el-select>
        </el-form-item>

        <el-divider />

        <!-- ============ 区块 3：执行动作 ============ -->
        <div class="zg-section-head">
          <span class="zg-section-ico">🎬</span>
          <h4>执行动作（必配 · 可叠加多个）</h4>
        </div>
        <div class="zg-form-section">
          <div class="zg-form-section__head">
            <h4>动作列表</h4>
            <el-button type="primary" size="small" @click="addExecuteAction">
              <el-icon><Plus /></el-icon>添加动作
            </el-button>
          </div>
          <div
            v-for="(action, index) in sceneForm.draftPayload.executeActions"
            :key="index"
            class="zg-action-step"
          >
            <div class="zg-action-step__header">
              <span class="zg-action-step__num">{{ index + 1 }}</span>
              <span class="zg-action-step__title">动作 {{ index + 1 }}</span>
              <el-button v-if="sceneForm.draftPayload.executeActions.length > 1"
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
                  <el-option label="📱 发送消息通知" value="message" />
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
          <div v-if="sceneForm.draftPayload.executeActions.length === 0" class="zg-helptext">
            💡 手动场景至少需要配 1 个执行动作
          </div>
        </div>

        <el-divider />

        <!-- ============ 区块 4：实时预览 ============ -->
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
              <b>{{ sceneForm.draftPayload.executeActions.length }}</b>
              <span>个动作</span>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="zg-draftform__foot">
          <el-button @click="sceneForm.onDraftDiscard()">取消</el-button>
          <el-button
            type="primary"
            :loading="sceneForm.submitting"
            @click="onCommitSceneDraft"
          >
            {{ sceneForm.editMode === 'compose' ? '保存策略' : '保存修改' }}
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- ============ 执行结果 Inspector ============ -->
    <el-drawer
      v-model="resultInspector.drawerOpen"
      :title="'执行结果 · ' + (focusedScene?.name || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="focusedScene" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><VideoPlay /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">执行完成</h2>
            <p class="zg-inspector__type">
              {{ focusedScene.lastExecuteTime || '—' }} · {{ focusedScene.lastExecuteUser || '—' }}
            </p>
            <span class="zg-status success">
              <i class="dot"></i>成功 ·
              {{ (focusedScene.lastResultSummary?.successCount || 0) }}/{{ (focusedScene.lastResultSummary?.totalCount || 0) }} 成功
            </span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📋 下发摘要</h4>
          <div class="zg-summary-grid">
            <div class="zg-summary-grid__cell">
              <span class="num">{{ focusedScene.lastResultSummary?.poleCount || 0 }}</span>
              <span class="lbl">根杆桩</span>
            </div>
            <div class="zg-summary-grid__cell">
              <span class="num">{{ focusedScene.lastResultSummary?.lampCount || 0 }}</span>
              <span class="lbl">盏灯具</span>
            </div>
            <div class="zg-summary-grid__cell">
              <span class="num">{{ focusedScene.executeActions?.length || 0 }}</span>
              <span class="lbl">个动作</span>
            </div>
            <div class="zg-summary-grid__cell">
              <span class="num">{{ (focusedScene.scopeAreas || []).length }}</span>
              <span class="lbl">个区域</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📡 下发明细（前 20 条）</h4>
          <el-table :data="focusedScene.results || []" size="small" border class="zg-datatable">
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="area" label="区域" min-width="120" />
            <el-table-column prop="poleCode" label="杆桩编号" min-width="130" />
            <el-table-column prop="actionLabel" label="执行动作" min-width="100" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <span class="zg-status success" style="padding:1px 6px"><i class="dot"></i>{{ row.status }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="resultInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="onExecuteScene(focusedScene)">再次执行</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- ============ 下发记录详情 Inspector ============ -->
    <el-drawer
      v-model="recordInspector.drawerOpen"
      :title="'下发详情 · ' + (focusedRecord?.sceneName || '')"
      direction="rtl"
      size="560px"
    >
      <div v-if="focusedRecord" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <el-icon :size="36"><CircleCheckFilled /></el-icon>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedRecord.sceneName }}</h2>
            <p class="zg-inspector__type">{{ focusedRecord.deployTime }} · {{ focusedRecord.deployUser }}</p>
            <span class="zg-status success"><i class="dot"></i>下发成功</span>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📋 下发摘要</h4>
          <div class="zg-summary-grid">
            <div class="zg-summary-grid__cell">
              <span class="num">{{ focusedRecord.poleCount }}</span>
              <span class="lbl">根杆桩</span>
            </div>
            <div class="zg-summary-grid__cell">
              <span class="num">{{ focusedRecord.lampCount }}</span>
              <span class="lbl">盏灯具</span>
            </div>
            <div class="zg-summary-grid__cell">
              <span class="num">{{ focusedRecord.actionCount }}</span>
              <span class="lbl">个动作</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📡 下发明细（前 20 条）</h4>
          <el-table :data="focusedRecord.results || []" size="small" border class="zg-datatable">
            <el-table-column prop="no" label="序号" width="60" align="center" />
            <el-table-column prop="area" label="区域" min-width="120" />
            <el-table-column prop="poleCode" label="杆桩编号" min-width="130" />
            <el-table-column prop="actionLabel" label="执行动作" min-width="100" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <span class="zg-status success" style="padding:1px 6px"><i class="dot"></i>{{ row.status }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="recordInspector.closeInspector()">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- ============ 策略详情 Inspector ============ -->
    <el-drawer
      v-model="sceneDetailInspector.drawerOpen"
      :title="'策略详情 · ' + (focusedSceneDetail?.name || '')"
      direction="rtl"
      size="600px"
    >
      <div v-if="focusedSceneDetail" class="zg-inspector">
        <div class="zg-inspector__head">
          <div class="zg-inspector__glyph">
            <span style="font-size:40px">{{ focusedSceneDetail.icon || '💡' }}</span>
          </div>
          <div class="zg-inspector__meta">
            <h2 class="zg-inspector__name">{{ focusedSceneDetail.name }}</h2>
            <p class="zg-inspector__type">
              排序 {{ focusedSceneDetail.sortOrder }} ·
              {{ focusedSceneDetail.enabled ? '启用中' : '已停用' }}
            </p>
            <span class="zg-status" :class="focusedSceneDetail.enabled ? 'online' : 'offline'">
              <i class="dot"></i>{{ focusedSceneDetail.enabled ? '启用' : '停用' }}
            </span>
          </div>
        </div>

        <div v-if="focusedSceneDetail.description" class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📝 策略描述</h4>
          <p class="zg-description">{{ focusedSceneDetail.description }}</p>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">📐 绑定范围</h4>
          <div class="zg-inspector__grid">
            <div class="zg-inspector__cell">
              <span class="lbl">范围模式</span>
              <span class="val">{{ scopeModeText[focusedSceneDetail.scopeMode] || focusedSceneDetail.scopeMode }}</span>
            </div>
            <div class="zg-inspector__cell">
              <span class="lbl">生效时间</span>
              <span class="val">{{ timeModeText[focusedSceneDetail.timeMode] || focusedSceneDetail.timeMode }}</span>
            </div>
            <div v-if="focusedSceneDetail.scopeMode === 'area' && focusedSceneDetail.scopeAreas?.length" class="zg-inspector__cell zg-inspector__cell--full">
              <span class="lbl">作用区域</span>
              <span class="val">{{ focusedSceneDetail.scopeAreas.join('、') }}</span>
            </div>
            <div v-if="focusedSceneDetail.scopeMode === 'area'" class="zg-inspector__cell zg-inspector__cell--full">
              <span class="lbl">覆盖规模</span>
              <span class="val">
                <b class="zg-highlight">{{ getSceneBindingPoles(focusedSceneDetail) }}</b> 根杆桩 ·
                <b class="zg-highlight">{{ getSceneBindingLamps(focusedSceneDetail) }}</b> 盏灯具
              </span>
            </div>
            <div v-if="focusedSceneDetail.scopeMode === 'specific'" class="zg-inspector__cell zg-inspector__cell--full">
              <span class="lbl">指定杆桩</span>
              <span class="val">{{ focusedSceneDetail.scopeSpecific }}</span>
            </div>
          </div>
        </div>

        <div class="zg-inspector__section">
          <h4 class="zg-inspector__section-title">🎬 执行动作</h4>
          <div v-if="focusedSceneDetail.executeActions && focusedSceneDetail.executeActions.length > 0">
            <div
              v-for="(a, index) in focusedSceneDetail.executeActions"
              :key="index"
              class="zg-inspector__action-item"
            >
              <span class="zg-inspector__action-num">{{ index + 1 }}.</span>
              <div class="zg-inspector__action-content">
                <div class="zg-inspector__action-main">
                  <el-tag :type="actionTagType(a.actionType)" effect="light">
                    {{ actionLabel(a.actionType, a) }}
                  </el-tag>
                  <span v-if="a.delaySeconds" class="zg-inspector__action-delay">
                    · 延时 {{ a.delaySeconds }} 秒
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="zg-helptext">尚未配置动作</p>
        </div>

        <div class="zg-inspector__actions">
          <el-button size="large" @click="sceneDetailInspector.closeInspector()">关闭</el-button>
          <el-button type="primary" size="large" @click="onExecuteScene(focusedSceneDetail)">立即执行</el-button>
          <el-button type="primary" size="large" plain @click="sceneForm.openReviser(focusedSceneDetail)">修改策略</el-button>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Lightning, Plus, Search, Refresh, VideoPlay, InfoFilled, MoreFilled, Delete, CircleCheckFilled
} from '@element-plus/icons-vue'
import { usePresetTable } from '@/shared/composables/usePresetTable'
import { useFormDraft } from '@/shared/composables/useFormDraft'
import { useDrawerInspector } from '@/shared/composables/useDrawerInspector'
import { useCurrentUser } from '@/shared/composables/useCurrentUser'

// ============ 常量 ============
const AREA_MAPPING = {
  '先导路':          { poles: 30,  lamps: 90 },
  '麓谷产业园':      { poles: 64,  lamps: 192 },
  '梅溪湖环湖路':    { poles: 72,  lamps: 216 },
  '金星大道':        { poles: 86,  lamps: 258 },
  '咸嘉湖路':        { poles: 54,  lamps: 162 },
  '岳麓山景区':      { poles: 60,  lamps: 180 },
  '隧道 L-01/02/03': { poles: 12,  lamps: 1280 },
}

const SCOPE_MODE_TEXT = { 'area': '按区域分组', 'specific': '指定杆桩编号', 'lamp-type': '按灯具类型' }
const TIME_MODE_TEXT = { 'all': '全时段（24/7）', 'night-only': '仅夜间（18:00-06:00）', 'weeknight': '工作日夜间' }

const ACTION_LABELS = {
  'lamp-on':   '💡 开灯',
  'lamp-off':  '🌑 关灯',
  'dim':       '🔅 调光',
  'ticket':    '📋 工单',
  'message':   '📱 通知',
  'pole-power':'⚡ 供电',
}
const ACTION_TAG_TYPES = {
  'lamp-on':   'success',
  'lamp-off':  'info',
  'dim':       'warning',
  'ticket':    'danger',
  'message':   'primary',
  'pole-power':'',
}

const scopeModeText = SCOPE_MODE_TEXT
const timeModeText = TIME_MODE_TEXT
const actionLabel = (t, a) => {
  if (t === 'dim' && a?.brightness != null) return `🔅 调光 ${a.brightness}%`
  if (t === 'lamp-on') return '💡 开灯'
  if (t === 'lamp-off') return '🌑 关灯'
  return ACTION_LABELS[t] || t
}
const actionTagType = (t) => ACTION_TAG_TYPES[t] || 'info'

// ============ 状态 ============
const activeTab = ref('control')
const currentUser = useCurrentUser()

// ============ 初始策略（新数据结构） ============
const initialScenes = [
  {
    id: 1,
    icon: '🌅',
    name: '日落一键开灯',
    enabled: true,
    sortOrder: 1,
    scopeMode: 'area',
    scopeAreas: ['先导路', '麓谷产业园'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'all',
    description: '值班员手动触发，同时点亮先导路和麓谷产业园主干道路灯，应对日落前后视觉盲区',
    executeActions: [
      { actionType: 'lamp-on', brightness: 80, delaySeconds: 0, ticketType: '', channels: [], powerAction: '' },
    ],
  },
  {
    id: 2,
    icon: '🚨',
    name: '应急全亮',
    enabled: true,
    sortOrder: 2,
    scopeMode: 'area',
    scopeAreas: ['先导路', '麓谷产业园', '梅溪湖环湖路', '金星大道', '咸嘉湖路', '岳麓山景区', '隧道 L-01/02/03'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'all',
    description: '紧急预案，一键点亮全部在役杆桩，适用于事故现场疏散、重大活动保障',
    executeActions: [
      { actionType: 'lamp-on', brightness: 100, delaySeconds: 0, ticketType: '', channels: [], powerAction: '' },
      { actionType: 'message', brightness: 0, delaySeconds: 2, ticketType: '', channels: ['wecom', 'sms'], powerAction: '' },
    ],
  },
  {
    id: 3,
    icon: '🔅',
    name: '深夜节能调光',
    enabled: true,
    sortOrder: 3,
    scopeMode: 'area',
    scopeAreas: ['先导路', '金星大道'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'night-only',
    description: '凌晨 0:00 后把主干道亮度从 80% 降到 40%，兼顾节能与安全',
    executeActions: [
      { actionType: 'dim', brightness: 40, delaySeconds: 0, ticketType: '', channels: [], powerAction: '' },
    ],
  },
  {
    id: 4,
    icon: '🌑',
    name: '深夜自动关灯（隧道保留）',
    enabled: false,
    sortOrder: 4,
    scopeMode: 'area',
    scopeAreas: ['先导路', '麓谷产业园', '金星大道', '咸嘉湖路'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'night-only',
    description: '凌晨 4:30 后关闭非隧道区域灯具，隧道保持常亮',
    executeActions: [
      { actionType: 'lamp-off', brightness: 0, delaySeconds: 0, ticketType: '', channels: [], powerAction: '' },
    ],
  },
  {
    id: 5,
    icon: '🔧',
    name: '杆桩巡检工单触发',
    enabled: true,
    sortOrder: 5,
    scopeMode: 'area',
    scopeAreas: ['麓谷产业园'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'weeknight',
    description: '针对麓谷产业园夜间扫码用电活跃区域，一键创建巡检工单 + 企业微信通知运维',
    executeActions: [
      { actionType: 'ticket', brightness: 0, delaySeconds: 0, ticketType: 'routine', channels: [], powerAction: '' },
      { actionType: 'message', brightness: 0, delaySeconds: 1, ticketType: '', channels: ['wecom'], powerAction: '' },
    ],
  },
  {
    id: 6,
    icon: '⚡',
    name: '杆桩断电保护',
    enabled: true,
    sortOrder: 6,
    scopeMode: 'area',
    scopeAreas: ['隧道 L-01/02/03'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'all',
    description: '隧道烟雾/火情告警时手动一键切断隧道杆桩供电，防止触电和二次事故',
    executeActions: [
      { actionType: 'pole-power', brightness: 0, delaySeconds: 0, ticketType: '', channels: [], powerAction: 'off' },
      { actionType: 'message', brightness: 0, delaySeconds: 1, ticketType: '', channels: ['wecom', 'sms'], powerAction: '' },
      { actionType: 'ticket', brightness: 0, delaySeconds: 3, ticketType: 'urgent', channels: [], powerAction: '' },
    ],
  },
]

const initialRecords = [
  {
    id: 1,
    no: 1,
    sceneName: '日落一键开灯',
    deployTime: '2024-04-22 18:28:05',
    deployUser: '值班员·张工',
    poleCount: 94,
    lampCount: 282,
    actionCount: 1,
    results: [
      { no: 1, area: '先导路', poleCode: 'YD-XD-001', actionLabel: '💡 开灯', status: '成功' },
      { no: 2, area: '先导路', poleCode: 'YD-XD-002', actionLabel: '💡 开灯', status: '成功' },
      { no: 3, area: '麓谷产业园', poleCode: 'YD-LG-001', actionLabel: '💡 开灯', status: '成功' },
    ],
  },
  {
    id: 2,
    no: 2,
    sceneName: '深夜节能调光',
    deployTime: '2024-04-22 00:10:30',
    deployUser: '系统自动',
    poleCount: 116,
    lampCount: 348,
    actionCount: 1,
    results: [
      { no: 1, area: '先导路', poleCode: 'YD-XD-001', actionLabel: '🔅 调光 40%', status: '成功' },
      { no: 2, area: '金星大道', poleCode: 'YD-JX-001', actionLabel: '🔅 调光 40%', status: '成功' },
    ],
  },
]

// ============ 表格控制器 ============
const sceneCtl = usePresetTable(null, { defaultPageSpan: 12, initialData: initialScenes })
const recordCtl = usePresetTable(null, { defaultPageSpan: 10, initialData: initialRecords })

// ============ 派生指标 ============
const enabledSceneCount = computed(() => sceneCtl.allRows.filter(s => s.enabled).length)
const getSceneBindingPoles = (scene) => {
  if (scene.scopeMode === 'area') return (scene.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.poles || 0), 0)
  if (scene.scopeMode === 'specific') return (scene.scopeSpecific || '').split(/[,，\s]+/).filter(Boolean).length
  return 0
}
const getSceneBindingLamps = (scene) => {
  if (scene.scopeMode === 'area') return (scene.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.lamps || 0), 0)
  return 0
}
const totalBindingPoles = computed(() => sceneCtl.allRows.reduce((s, sc) => s + getSceneBindingPoles(sc), 0))
const totalBindingLamps = computed(() => sceneCtl.allRows.reduce((s, sc) => s + getSceneBindingLamps(sc), 0))

const bindingPoleCount = computed(() => {
  const d = sceneForm.draftPayload
  if (d.scopeMode === 'area') return (d.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.poles || 0), 0)
  if (d.scopeMode === 'specific') return (d.scopeSpecific || '').split(/[,，\s]+/).filter(Boolean).length
  return 0
})
const bindingLampCount = computed(() => {
  const d = sceneForm.draftPayload
  if (d.scopeMode === 'area') return (d.scopeAreas || []).reduce((s, a) => s + (AREA_MAPPING[a]?.lamps || 0), 0)
  return 0
})

// ============ 表单控制器（新数据结构） ============
const sceneForm = useFormDraft(
  {
    icon: '💡',
    name: '',
    enabled: true,
    sortOrder: 1,
    description: '',
    scopeMode: 'area',
    scopeAreas: ['先导路'],
    scopeSpecific: '',
    scopeLampTypes: [],
    timeMode: 'all',
    executeActions: [
      { actionType: 'lamp-on', brightness: 80, delaySeconds: 0, ticketType: '', channels: [], powerAction: '' },
    ],
  },
  {
    submitApi: async (draft, { mode, origin }) => {
      if (mode === 'compose') {
        const newScene = { ...draft, id: Date.now() }
        sceneCtl.appendRecord(newScene)
        ElMessage.success(`策略"${draft.name}"已创建`)
      } else if (origin && origin.id) {
        sceneCtl.reviseRecord(origin.id, draft)
        ElMessage.success(`策略"${draft.name}"已更新`)
      }
      return { ok: true }
    },
    validateFn: (draft) => {
      if (!draft.name?.trim()) { ElMessage.warning('请填写策略名称'); return false }
      if (draft.scopeMode === 'area' && (!draft.scopeAreas || draft.scopeAreas.length === 0)) {
        ElMessage.warning('请至少选择一个作用区域'); return false
      }
      if (draft.scopeMode === 'specific' && !draft.scopeSpecific?.trim()) {
        ElMessage.warning('请填写指定杆桩编号'); return false
      }
      if (!draft.executeActions || draft.executeActions.length === 0) {
        ElMessage.warning('请至少配置一个执行动作'); return false
      }
      const hasAnyAction = draft.executeActions.some(a => a.actionType)
      if (!hasAnyAction) { ElMessage.warning('请选择每个动作的类型'); return false }
      return true
    },
  }
)

// ============ Inspector 控制器 ============
const resultInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })
const focusedScene = computed(() => resultInspector.focusedRecord)
const recordInspector = useDrawerInspector({ size: '560px', direction: 'rtl' })
const focusedRecord = computed(() => recordInspector.focusedRecord)
const sceneDetailInspector = useDrawerInspector({ size: '600px', direction: 'rtl' })
const focusedSceneDetail = computed(() => sceneDetailInspector.focusedRecord)

// ============ 动作函数 ============
const addExecuteAction = () => {
  sceneForm.draftPayload.executeActions.push({
    actionType: 'lamp-on', brightness: 80, delaySeconds: 0, ticketType: '', channels: [], powerAction: '',
  })
}
const removeExecuteAction = (index) => {
  sceneForm.draftPayload.executeActions.splice(index, 1)
}

const onToggleEnabled = (scene) => {
  ElMessage.success(`策略"${scene.name}"已${scene.enabled ? '启用' : '停用'}`)
}

const onSceneAction = (scene, action) => {
  switch (action) {
    case 'edit':    sceneForm.openReviser(scene); break
    case 'detail':  sceneDetailInspector.openInspector(scene); break
    case 'delete':
      ElMessageBox.confirm(`确认删除策略"${scene.name}"吗？删除后不可恢复。`, '删除确认', { type: 'warning' })
        .then(() => {
          sceneCtl.retireRecord(scene.id)
          ElMessage.success('策略已删除')
        })
      break
  }
}

/**
 * 一键执行场景 —— 生成真实下发结果
 * 按 AREA_MAPPING 展开每个区域的杆桩 → 每个动作
 */
const onExecuteScene = (scene) => {
  const now = new Date().toLocaleString('zh-CN')
  const areas = scene.scopeAreas || []
  const actions = scene.executeActions || []
  const results = []
  let seq = 1

  areas.forEach(area => {
    const areaInfo = AREA_MAPPING[area]
    if (!areaInfo) return
    for (let p = 1; p <= areaInfo.poles; p++) {
      const poleCode = `YD-${area.slice(0, 2).toUpperCase()}-${String(p).padStart(3, '0')}`
      actions.forEach(a => {
        results.push({
          no: seq++,
          area,
          poleCode,
          actionLabel: actionLabel(a.actionType, a),
          status: '成功',
        })
      })
    }
  })

  const poleCount = results.length > 0 ? AREA_MAPPING[areas[0]]?.poles * areas.length : 0
  const summary = {
    poleCount,
    lampCount: getSceneBindingLamps(scene),
    totalCount: results.length,
    successCount: results.length,
  }

  // 更新 scene 自身
  scene.results = results.slice(0, 100)
  scene.lastExecuteTime = now
  scene.lastExecuteUser = currentUser.value.name
  scene.lastResultSummary = summary

  // 写入下发记录
  recordCtl.appendRecord({
    id: Date.now(),
    no: recordCtl.totalRows + 1,
    sceneName: scene.name,
    deployTime: now,
    deployUser: currentUser.value.name,
    poleCount: summary.poleCount,
    lampCount: summary.lampCount,
    actionCount: actions.length,
    results: results.slice(0, 20),
  })

  ElMessage.success(`✅ 策略"${scene.name}"下发成功 · 覆盖 ${summary.poleCount} 杆 / ${summary.lampCount} 盏`)
  resultInspector.openInspector(scene)
}

const onViewResult = (scene) => {
  if (!scene.lastExecuteTime) {
    ElMessage.info('该策略尚未执行过')
    return
  }
  resultInspector.openInspector(scene)
}

const onInspectRecord = (record) => recordInspector.openInspector(record)

const onCommitSceneDraft = async () => {
  await sceneForm.onDraftCommit()
}
</script>

<style scoped lang="scss">
.zg-quick-op {
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
    width: 40px; height: 40px;
    border-radius: var(--zg-radius-md);
    background: var(--zg-gradient-primary);
    color: #fff;
    display: grid; place-items: center;
  }

  &__title {
    font-size: 18px; font-weight: 600; color: var(--zg-ink-primary);
    margin: 0 0 4px;
  }
  &__sub { font-size: 13px; color: var(--zg-ink-tertiary); margin: 0; }
}

.zg-metrics {
  display: flex; gap: 12px;
  &__cell {
    flex: 1;
    background: var(--zg-surface-card);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-lg);
    padding: 14px 18px;
    display: flex; flex-direction: column; gap: 4px;
    &--ok  { border-left: 3px solid #10b981; }
    &--warn{ border-left: 3px solid #f59e0b; }
    &--info{ border-left: 3px solid #6366f1; }
  }
  &__num { font-size: 22px; font-weight: 700; color: var(--zg-ink-primary); }
  &__lbl { font-size: 12px; color: var(--zg-ink-tertiary); }
}

.zg-filterband {
  background: var(--zg-surface-card);
  padding: 14px 18px;
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  display: flex; gap: 12px; align-items: center;
  &__fields { display: flex; gap: 12px; align-items: center; }
  &__search { width: 260px; }
}

.zg-cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px; padding: 8px 0;
}

.zg-scenecard {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--zg-brand-primary);
    box-shadow: 0 4px 16px rgba(99,102,241,0.12);
    transform: translateY(-2px);
  }

  &__head {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  &__icon { font-size: 22px; }
  &__name { font-size: 15px; font-weight: 600; color: var(--zg-ink-primary); flex: 1; }
  &__status-tag { flex-shrink: 0; }
  &__right { display: flex; align-items: center; gap: 6px; margin-left: auto; }
  &__more { cursor: pointer; color: var(--zg-ink-tertiary); font-size: 16px; }

  &__summary {
    background: var(--zg-surface-elevated);
    border-radius: var(--zg-radius-md);
    padding: 10px 12px;
    display: flex; flex-direction: column; gap: 6px;
  }
  &__summary-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  &__summary-label { font-size: 12px; color: var(--zg-ink-tertiary); min-width: 68px; }
  &__summary-value { font-size: 12px; color: var(--zg-ink-secondary); display: flex; flex-wrap: wrap; gap: 4px; }

  &__foot { display: flex; gap: 8px; margin-top: auto; }
}

.zg-action-tag { margin: 0; }
.zg-highlight { color: var(--zg-brand-primary); font-weight: 700; }
.truncate { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.zg-pagerbar {
  display: flex; justify-content: flex-end;
  padding: 16px;
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  margin-top: 8px;
}

/* ============ Drawer 区块头（对齐 SceneLinkage） ============ */
.zg-section-head {
  display: flex; align-items: center; gap: 8px;
  margin: 4px 0 14px;
  h4 { font-size: 15px; font-weight: 700; color: var(--zg-ink-primary); margin: 0; }
  &__ico { font-size: 18px; }
}

.zg-draftform {
  padding: 4px 0 16px;
  &__row { display: flex; gap: 16px; }
  &__col { flex: 1; min-width: 0; }
  &__col--sm { max-width: 240px; }
  &__row--no-label { margin-top: 0; }
  &__foot { display: flex; justify-content: flex-end; gap: 12px; }
}

.zg-helptext { font-size: 12px; color: var(--zg-ink-tertiary); }

/* 动作 step 卡片 */
.zg-action-step {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid var(--zg-line-soft);
  border-radius: var(--zg-radius-md);
  padding: 14px 16px;
  margin-bottom: 12px;
  &__header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  &__num {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--zg-gradient-primary); color: #fff;
    font-size: 12px; font-weight: 700;
    display: grid; place-items: center;
  }
  &__title { font-size: 13px; font-weight: 600; color: var(--zg-ink-primary); flex: 1; }
}

.zg-form-section {
  &__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  &__title { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary); margin: 0; }
}

/* 预览行 */
.zg-preview-row {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #eff6ff 100%);
  border: 1px solid #bbf7d0;
  border-radius: var(--zg-radius-lg);
  padding: 14px 18px;
  display: flex; justify-content: space-between; align-items: center;
  &__label { font-size: 13px; font-weight: 600; color: #166534; }
  &__boxes { display: flex; gap: 24px; }
  &__box {
    display: flex; flex-direction: column; align-items: center;
    b { font-size: 20px; font-weight: 700; color: #0f172a; }
    span { font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 2px; }
  }
}

/* ============ Inspector ============ */
.zg-inspector {
  display: flex; flex-direction: column; gap: 16px;
  &__head { display: flex; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--zg-line-soft); align-items: center; }
  &__glyph { color: var(--zg-brand-success); }
  &__meta { flex: 1; }
  &__name { font-size: 18px; font-weight: 600; color: var(--zg-ink-primary); margin: 0 0 4px; }
  &__type { font-size: 13px; color: var(--zg-ink-tertiary); margin: 0 0 6px; }
  &__section {
    &-title { font-size: 14px; font-weight: 600; color: var(--zg-ink-primary); margin: 0 0 12px; }
  }
  &__grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  &__cell {
    background: var(--zg-surface-elevated);
    border-radius: var(--zg-radius-md);
    padding: 10px 12px;
    display: flex; flex-direction: column; gap: 4px;
    &--full { grid-column: 1 / -1; }
    .lbl { font-size: 11px; color: var(--zg-ink-tertiary); }
    .val { font-size: 13px; font-weight: 500; color: var(--zg-ink-primary); }
  }
  &__description { font-size: 13px; color: var(--zg-ink-secondary); line-height: 1.7; margin: 0; }
  &__actions {
    display: flex; justify-content: flex-end; gap: 12px;
    padding-top: 16px; border-top: 1px solid var(--zg-line-soft); margin-top: auto;
  }
  &__action-item {
    background: var(--zg-surface-elevated);
    border-radius: var(--zg-radius-md);
    padding: 10px 12px;
    display: flex; gap: 10px; margin-bottom: 8px;
  }
  &__action-num {
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--zg-brand-primary); color: #fff;
    font-size: 11px; font-weight: 700;
    display: grid; place-items: center; flex-shrink: 0;
  }
  &__action-content { flex: 1; }
  &__action-main { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  &__action-delay { font-size: 12px; color: var(--zg-ink-tertiary); }
}

.zg-summary-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  &__cell {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid var(--zg-line-soft);
    border-radius: var(--zg-radius-md);
    padding: 12px;
    text-align: center;
    .num { display: block; font-size: 22px; font-weight: 700; color: var(--zg-brand-primary); }
    .lbl { display: block; font-size: 11px; color: var(--zg-ink-tertiary); margin-top: 2px; }
  }
}

.zg-description {
  font-size: 13px; color: var(--zg-ink-secondary); line-height: 1.7;
  background: var(--zg-surface-elevated);
  padding: 10px 14px; border-radius: var(--zg-radius-md);
  border-left: 3px solid var(--zg-brand-primary);
}

.zg-tablewrap {
  background: var(--zg-surface-card);
  border-radius: var(--zg-radius-lg);
  border: 1px solid var(--zg-line-soft);
  overflow: hidden;
}

.zg-datatable {
  width: 100%;
  :deep(.el-table__header-wrapper) { background: var(--zg-surface-elevated); }
  :deep(.el-table th) {
    background: var(--zg-surface-elevated);
    font-weight: 600; color: var(--zg-ink-secondary);
  }
}

.zg-status {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; padding: 2px 8px; border-radius: 12px;
  &.success { background: rgba(34,197,94,0.1); color: #22c55e; .dot { width:6px;height:6px;border-radius:50%;background:#22c55e; } }
  &.online  { background: rgba(34,197,94,0.1); color: #22c55e; .dot { width:6px;height:6px;border-radius:50%;background:#22c55e; } }
  &.offline { background: rgba(107,114,128,0.1); color: #6b7280; .dot { width:6px;height:6px;border-radius:50%;background:#6b7280; } }
}
</style>
