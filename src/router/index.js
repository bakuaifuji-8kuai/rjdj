/**
 * 智光云枢-路由配置
 * 业务域驱动：灯网监控 / 能耗监测 / 终端管理 / 情景管理 / 运维工单 / 管廊照明
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import { getAuthStore, isAuthenticated } from '@/shared/stores/authStore'

const routes = [
  {
    path: '/',
    redirect: '/lampNet/dashboard'
  },
  {
    path: '/login',
    name: 'auth.login',
    component: () => import('@/modules/auth/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/lampNet/dashboard',
    name: 'lampNet.dashboard',
    component: () => import('@/modules/lampNet/LampNetDashboard.vue'),
    meta: { title: '灯网总览' }
  },
  {
    path: '/lampNet/recipe-composer',
    name: 'lampNet.recipeComposer',
    component: () => import('@/modules/lampNet/RecipeComposer.vue'),
    meta: { title: '光照策略编排' }
  },
  {
    path: '/lampNet/recipe-vault',
    name: 'lampNet.recipeVault',
    component: () => import('@/modules/lampNet/RecipeVault.vue'),
    meta: { title: '策略库管理' }
  },
  {
    path: '/lampNet/recipe-archive',
    name: 'lampNet.recipeArchive',
    component: () => import('@/modules/lampNet/RecipeArchive.vue'),
    meta: { title: '历史策略' }
  },
  {
    path: '/lampNet/lamp-registry',
    name: 'lampNet.lampRegistry',
    component: () => import('@/modules/lampNet/LampRegistry.vue'),
    meta: { title: '光源台账' }
  },
  {
    path: '/lampNet/cluster-topology',
    name: 'lampNet.clusterTopology',
    component: () => import('@/modules/lampNet/ClusterTopology.vue'),
    meta: { title: '集群拓扑' }
  },
  {
    path: '/lampNet/gis-atlas',
    name: 'lampNet.gisAtlas',
    component: () => import('@/modules/lampNet/GisAtlas.vue'),
    meta: { title: 'GIS灯位图' }
  },
  {
    path: '/energyPulse/feedCabinet',
    name: 'energyPulse.feedCabinet',
    component: () => import('@/modules/energyPulse/FeedCabinet.vue'),
    meta: { title: '馈电柜监测' }
  },
  {
    path: '/energyPulse/lineTrace',
    name: 'energyPulse.lineTrace',
    component: () => import('@/modules/energyPulse/LineTrace.vue'),
    meta: { title: '供电链路' }
  },
  {
    path: '/energyPulse/edgeHost',
    name: 'energyPulse.edgeHost',
    component: () => import('@/modules/energyPulse/EdgeHost.vue'),
    meta: { title: '边缘主机' }
  },
  {
    path: '/energyPulse/loopSwitch',
    name: 'energyPulse.loopSwitch',
    component: () => import('@/modules/energyPulse/LoopSwitch.vue'),
    meta: { title: '通断监测' }
  },
  {
    path: '/energyPulse/loadProber',
    name: 'energyPulse.loadProber',
    component: () => import('@/modules/energyPulse/LoadProber.vue'),
    meta: { title: '负荷监测' }
  },
  {
    path: '/energyPulse/moduleLedger',
    name: 'energyPulse.moduleLedger',
    component: () => import('@/modules/energyPulse/ModuleLedger.vue'),
    meta: { title: '模块台账' }
  },
  {
    path: '/energyPulse/strongScene',
    name: 'energyPulse.strongScene',
    component: () => import('@/modules/energyPulse/StrongScene.vue'),
    meta: { title: '强电场景' }
  },
  {
    path: '/energyPulse/strongSceneArchive',
    name: 'energyPulse.strongSceneArchive',
    component: () => import('@/modules/energyPulse/StrongSceneArchive.vue'),
    meta: { title: '强电场景回溯' }
  },
  {
    path: '/energyPulse/loopCluster',
    name: 'energyPulse.loopCluster',
    component: () => import('@/modules/energyPulse/LoopCluster.vue'),
    meta: { title: '链路分组' }
  },
  {
    path: '/energyPulse/lampBinding',
    name: 'energyPulse.lampBinding',
    component: () => import('@/modules/energyPulse/LampBinding.vue'),
    meta: { title: '光源绑定' }
  },
  {
    path: '/terminalAtlas/poleCatalog',
    name: 'terminalAtlas.poleCatalog',
    component: () => import('@/modules/terminalAtlas/PoleCatalog.vue'),
    meta: { title: '杆塔台账' }
  },
  {
    path: '/terminalAtlas/lampControl',
    name: 'terminalAtlas.lampControl',
    component: () => import('@/modules/terminalAtlas/LampControl.vue'),
    meta: { title: '光源控制器' }
  },
  {
    path: '/terminalAtlas/fixtureList',
    name: 'terminalAtlas.fixtureList',
    component: () => import('@/modules/terminalAtlas/FixtureList.vue'),
    meta: { title: '灯具清单' }
  },
  {
    path: '/terminalAtlas/recorder',
    name: 'terminalAtlas.recorder',
    component: () => import('@/modules/terminalAtlas/Recorder.vue'),
    meta: { title: '视频记录仪' }
  },
  {
    path: '/terminalAtlas/camera',
    name: 'terminalAtlas.camera',
    component: () => import('@/modules/terminalAtlas/Camera.vue'),
    meta: { title: '视频采集' }
  },
  {
    path: '/terminalAtlas/envProbe',
    name: 'terminalAtlas.envProbe',
    component: () => import('@/modules/terminalAtlas/EnvProbe.vue'),
    meta: { title: '环境监测' }
  },
  {
    path: '/terminalAtlas/luminanceProbe',
    name: 'terminalAtlas.luminanceProbe',
    component: () => import('@/modules/terminalAtlas/LuminanceProbe.vue'),
    meta: { title: '照度监测' }
  },
  {
    path: '/terminalAtlas/waterProbe',
    name: 'terminalAtlas.waterProbe',
    component: () => import('@/modules/terminalAtlas/WaterProbe.vue'),
    meta: { title: '浸水监测' }
  },
  {
    path: '/terminalAtlas/smokeProbe',
    name: 'terminalAtlas.smokeProbe',
    component: () => import('@/modules/terminalAtlas/SmokeProbe.vue'),
    meta: { title: '烟感监测' }
  },
  {
    path: '/scenarioOrch/quickOperation',
    name: 'scenarioOrch.quickOperation',
    component: () => import('@/modules/scenarioOrch/QuickOperation.vue'),
    meta: { title: '快捷操作' }
  },
  {
    path: '/scenarioOrch/sceneLinkage',
    name: 'scenarioOrch.sceneLinkage',
    component: () => import('@/modules/scenarioOrch/SceneLinkage.vue'),
    meta: { title: '场景联动' }
  },
  {
    path: '/scenarioOrch/visualFlow',
    name: 'scenarioOrch.visualFlow',
    component: () => import('@/modules/scenarioOrch/VisualFlow.vue'),
    meta: { title: '场景可视化编排' }
  },
  {
    path: '/opsTicket/dispatchPool',
    name: 'opsTicket.dispatchPool',
    component: () => import('@/modules/opsTicket/DispatchPool.vue'),
    meta: { title: '工单池' }
  },
  
  {
    path: '/opsTicket/autoDispatch',
    name: 'opsTicket.autoDispatch',
    component: () => import('@/modules/opsTicket/AutoDispatch.vue'),
    meta: { title: '自动派单' }
  },
  {
    path: '/opsTicket/myDesk',
    name: 'opsTicket.myDesk',
    component: () => import('@/modules/opsTicket/MyDesk.vue'),
    meta: { title: '我的工单' }
  },
  {
    path: '/opsTicket/statBoard',
    name: 'opsTicket.statBoard',
    component: () => import('@/modules/opsTicket/StatBoard.vue'),
    meta: { title: '效能看板' }
  },
  {
    path: '/tubeLumen/portal',
    name: 'tubeLumen.portal',
    component: () => import('@/modules/tubeLumen/TubePortal.vue'),
    meta: { title: '管廊总览' }
  },
  {
    path: '/tubeLumen/tubeIndex',
    name: 'tubeLumen.tubeIndex',
    component: () => import('@/modules/tubeLumen/TubeIndex.vue'),
    meta: { title: '管廊列表' }
  },
  {
    path: '/tubeLumen/sectionManager',
    name: 'tubeLumen.sectionManager',
    component: () => import('@/modules/tubeLumen/SectionManager.vue'),
    meta: { title: '区段管理' }
  },
  {
    path: '/tubeLumen/fixtureLedger',
    name: 'tubeLumen.fixtureLedger',
    component: () => import('@/modules/tubeLumen/FixtureLedger.vue'),
    meta: { title: '管廊灯具' }
  },
  {
    path: '/tubeLumen/loopCluster',
    name: 'tubeLumen.loopCluster',
    component: () => import('@/modules/tubeLumen/TubeLoopCluster.vue'),
    meta: { title: '管廊链路' }
  },
  {
    path: '/tubeLumen/opticsManager',
    name: 'tubeLumen.opticsManager',
    component: () => import('@/modules/tubeLumen/OpticsManager.vue'),
    meta: { title: '配光管理' }
  },
  {
    path: '/tubeLumen/lumenControl',
    name: 'tubeLumen.lumenControl',
    component: () => import('@/modules/tubeLumen/LumenControl.vue'),
    meta: { title: '光通控制' }
  },
  {
    path: '/tubeLumen/cronScheduler',
    name: 'tubeLumen.cronScheduler',
    component: () => import('@/modules/tubeLumen/CronScheduler.vue'),
    meta: { title: '定时调度' }
  },
  // ========== 杆桩运营 · 商业化增值 ==========
  {
    path: '/poleBiz/sharedPower',
    name: 'poleBiz.sharedPower',
    component: () => import('@/modules/poleBiz/SharedPower.vue'),
    meta: { title: '扫码共享用电' }
  },
  {
    path: '/poleBiz/powerMonitor',
    name: 'poleBiz.powerMonitor',
    component: () => import('@/modules/poleBiz/PowerMonitor.vue'),
    meta: { title: '共享用电实时监控' }
  },
  {
    path: '/poleBiz/powerOrder',
    name: 'poleBiz.powerOrder',
    component: () => import('@/modules/poleBiz/PowerOrder.vue'),
    meta: { title: '共享用电订单中心' }
  },
  {
    path: '/poleBiz/powerEnterprise',
    name: 'poleBiz.powerEnterprise',
    component: () => import('@/modules/poleBiz/PowerEnterprise.vue'),
    meta: { title: '企业客户中心' }
  },
  {
    path: '/poleBiz/chargingPile',
    name: 'poleBiz.chargingPile',
    component: () => import('@/modules/poleBiz/ChargingPile.vue'),
    meta: { title: '充电桩管理' }
  },
  // ========== 隧道增强 · 灯随车亮 ==========
  {
    path: '/tunnelPlus/followLight',
    name: 'tunnelPlus.followLight',
    component: () => import('@/modules/tunnelPlus/FollowLight.vue'),
    meta: { title: '灯随车亮' }
  },
  // ========== 杆桩运营扩展 ==========
  {
    path: '/poleBiz/gBaseTower',
    name: 'poleBiz.gBaseTower',
    component: () => import('@/modules/poleBiz/GBaseTower.vue'),
    meta: { title: '5G 微基站站址' }
  },
  {
    path: '/poleBiz/adSchedule',
    name: 'poleBiz.adSchedule',
    component: () => import('@/modules/poleBiz/AdSchedule.vue'),
    meta: { title: '信息屏广告排期' }
  },
  // ========== Phase 1 新增业务域 ==========
  // 指挥中心 · 数据大屏
  {
    path: '/commandCenter/overview',
    name: 'commandCenter.overview',
    component: () => import('@/modules/commandCenter/Overview.vue'),
    meta: { title: '数据大屏' }
  },
  // 智能安防中心
  {
    path: '/security/overview',
    name: 'security.overview',
    component: () => import('@/modules/security/SecurityOverview.vue'),
    meta: { title: '安防总览' }
  },
  {
    path: '/security/manhole',
    name: 'security.manhole',
    component: () => import('@/modules/security/ManholeGuard.vue'),
    meta: { title: '井盖防偷' }
  },
  {
    path: '/security/perimeter',
    name: 'security.perimeter',
    component: () => import('@/modules/security/PerimeterGuard.vue'),
    meta: { title: 'AI 周界防护' }
  },
  {
    path: '/security/sos',
    name: 'security.sos',
    component: () => import('@/modules/security/SosPillar.vue'),
    meta: { title: '应急对讲 SOS' }
  },
  // 移动端运维
  {
    path: '/mobile/home',
    name: 'mobile.home',
    component: () => import('@/modules/mobile/Home.vue'),
    meta: { title: '运维助手首页' }
  },
  // 低空经济
  {
    path: '/lowAltitude/drone',
    name: 'lowAltitude.drone',
    component: () => import('@/modules/lowAltitude/DroneFleet.vue'),
    meta: { title: '无人机机队' }
  },
  {
    path: '/lowAltitude/vertiport',
    name: 'lowAltitude.vertiport',
    component: () => import('@/modules/lowAltitude/Vertiport.vue'),
    meta: { title: '停机坪站址' }
  },
  {
    path: '/lowAltitude/flightPlan',
    name: 'lowAltitude.flightPlan',
    component: () => import('@/modules/lowAltitude/FlightPlan.vue'),
    meta: { title: '飞行计划与空域' }
  },
  // 数字孪生
  {
    path: '/digitalTwin/city',
    name: 'digitalTwin.city',
    component: () => import('@/modules/digitalTwin/City.vue'),
    meta: { title: '城市 3D 孪生' }
  },
  {
    path: '/digitalTwin/structure',
    name: 'digitalTwin.structure',
    component: () => import('@/modules/digitalTwin/Structure.vue'),
    meta: { title: '灯杆构件级孪生' }
  },
  {
    path: '/digitalTwin/simulate',
    name: 'digitalTwin.simulate',
    component: () => import('@/modules/digitalTwin/Simulate.vue'),
    meta: { title: '光照推演模拟器' }
  },
  {
    path: '/digitalTwin/matrix',
    name: 'digitalTwin.matrix',
    component: () => import('@/modules/digitalTwin/Matrix.vue'),
    meta: { title: '数字孪生大屏', fullscreen: true }
  },
  // 开放平台 · API 网关
  {
    path: '/openApi/gateway',
    name: 'openApi.gateway',
    component: () => import('@/modules/openApi/Gateway.vue'),
    meta: { title: '开放 API 网关' }
  },
  // ========== Phase 2 · AI 视觉分析（照明公司核心场景） ==========
  {
    path: '/aiVision/overview',
    name: 'aiVision.overview',
    component: () => import('@/modules/aiVision/Overview.vue'),
    meta: { title: 'AI 视觉分析总览' }
  },
  {
    path: '/aiVision/garbageOverflow',
    name: 'aiVision.garbageOverflow',
    component: () => import('@/modules/aiVision/PoleTiltDetect.vue'),
    meta: { title: '灯杆倾斜/倒塌 AI 检测' }
  },
  {
    path: '/aiVision/pavementDefect',
    name: 'aiVision.pavementDefect',
    component: () => import('@/modules/aiVision/LampFaultDetect.vue'),
    meta: { title: '灯具故障 AI 检测' }
  },
  {
    path: '/aiVision/occupation',
    name: 'aiVision.occupation',
    component: () => import('@/modules/aiVision/SafetyDetect.vue'),
    meta: { title: '配电箱/杆身安全检测' }
  },
  {
    path: '/aiVision/lightingAcceptance',
    name: 'aiVision.lightingAcceptance',
    component: () => import('@/modules/aiVision/LightingAcceptance.vue'),
    meta: { title: '夜间照明效果 AI 验收' }
  },
  // ========== Phase 2 · 智能运维 Copilot ==========
  {
    path: '/aiOps/copilot',
    name: 'aiOps.copilot',
    component: () => import('@/modules/aiOps/Copilot.vue'),
    meta: { title: '智能运维 Copilot' }
  },
  // ========== Phase 2 · 环境气象站 ==========
  {
    path: '/envProbe/weatherStation',
    name: 'envProbe.weatherStation',
    component: () => import('@/modules/envProbe/WeatherStation.vue'),
    meta: { title: '环境气象站与空气质量' }
  },
  // ========== v3 · 固定资产全生命周期 ==========
  { path: '/assetManage/ledger', name: 'assetManage.ledger', component: () => import('@/modules/assetManage/AssetLedger.vue'), meta: { title: '资产总台账' } },
  { path: '/assetManage/detail', name: 'assetManage.detail', component: () => import('@/modules/assetManage/AssetDetail.vue'), meta: { title: '资产详情' } },
  { path: '/assetManage/check', name: 'assetManage.check', component: () => import('@/modules/assetManage/AssetCheck.vue'), meta: { title: '资产盘点' } },
  { path: '/assetManage/depreciation', name: 'assetManage.depreciation', component: () => import('@/modules/assetManage/AssetDepreciation.vue'), meta: { title: '折旧中心' } },
  { path: '/assetManage/scrap', name: 'assetManage.scrap', component: () => import('@/modules/assetManage/AssetScrap.vue'), meta: { title: '报废与回收' } },
  // ========== v3 · 运维组织 ==========
  { path: '/opsOrg/orgChart', name: 'opsOrg.orgChart', component: () => import('@/modules/opsOrg/OrgChart.vue'), meta: { title: '组织架构与人员' } },
  { path: '/opsOrg/certCenter', name: 'opsOrg.certCenter', component: () => import('@/modules/opsOrg/CertCenter.vue'), meta: { title: '资质证书到期' } },
  { path: '/opsOrg/dispatchBoard', name: 'opsOrg.dispatchBoard', component: () => import('@/modules/opsOrg/DispatchBoard.vue'), meta: { title: '智能调度看板' } },
  { path: '/opsOrg/patrolPlan', name: 'opsOrg.patrolPlan', component: () => import('@/modules/opsOrg/PatrolPlan.vue'), meta: { title: '巡检计划配置' } },
  { path: '/opsOrg/patrolRecord', name: 'opsOrg.patrolRecord', component: () => import('@/modules/opsOrg/PatrolRecord.vue'), meta: { title: '巡检执行与打卡' } },
  { path: '/opsOrg/performanceBoard', name: 'opsOrg.performanceBoard', component: () => import('@/modules/opsOrg/PerformanceBoard.vue'), meta: { title: '绩效考核' } },
  // ========== v3 · 节能报告 ==========
  { path: '/energyReport/overview', name: 'energyReport.overview', component: () => import('@/modules/energyReport/EnergySavingsOverview.vue'), meta: { title: '节能绩效看板' } },
  { path: '/energyReport/emcCalc', name: 'energyReport.emcCalc', component: () => import('@/modules/energyReport/EMCCalculator.vue'), meta: { title: 'EMC 收益计算器' } },
  { path: '/energyReport/carbon', name: 'energyReport.carbon', component: () => import('@/modules/energyReport/CarbonReport.vue'), meta: { title: '碳减排核算' } },
  { path: '/energyReport/govReport', name: 'energyReport.govReport', component: () => import('@/modules/energyReport/GovernmentReport.vue'), meta: { title: '政府报送模板' } },
  // ========== v3 · 仓储 ==========
  { path: '/warehouse/overview', name: 'warehouse.overview', component: () => import('@/modules/warehouse/WarehouseOverview.vue'), meta: { title: '仓储总览' } },
  { path: '/warehouse/ledger', name: 'warehouse.ledger', component: () => import('@/modules/warehouse/StockLedger.vue'), meta: { title: '库存台账' } },
  { path: '/warehouse/check', name: 'warehouse.check', component: () => import('@/modules/warehouse/StockCheck.vue'), meta: { title: '库存盘点' } },
  { path: '/warehouse/purchase', name: 'warehouse.purchase', component: () => import('@/modules/warehouse/StockPurchase.vue'), meta: { title: '采购申请' } },
  // ========== v3 · 线路拓扑 ==========
  { path: '/lineTopo/topology', name: 'lineTopo.topology', component: () => import('@/modules/lineTopo/LineTopology.vue'), meta: { title: '线路拓扑 GIS' } },
  { path: '/lineTopo/cabinet', name: 'lineTopo.cabinet', component: () => import('@/modules/lineTopo/CabinetDetail.vue'), meta: { title: '配电箱详情' } },
  // ========== Phase 4 · 元数起航 TwinAdapter 接入 ==========
  { path: '/digitalTwin/adapter', name: 'digitalTwin.adapter', component: () => import('@/modules/digitalTwin/pages/AdapterConfig.vue'), meta: { title: '元数起航引擎接入配置' } },
  // ========== P0-3 · 电网/电路知识库 ==========
  { path: '/gridKnowledge/overview', name: 'gridKnowledge.overview', component: () => import('@/modules/gridKnowledge/Overview.vue'), meta: { title: '电网/电路知识库' } },
  // ========== P0-1 · 抢修与停电研判 ==========
  { path: '/opsEmergency/outageDispatch', name: 'opsEmergency.outageDispatch', component: () => import('@/modules/opsEmergency/OutageDispatch.vue'), meta: { title: '抢修与停电研判' } },
  // ========== P0-2 · 用电申请服务 ==========
  { path: '/powerApply/new', name: 'powerApply.new', component: () => import('@/modules/powerApply/NewApply.vue'), meta: { title: '用电申请服务中心' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/**
 * 路由守卫 - 检查用户认证状态
 */
router.beforeEach((to, from, next) => {
  // 公开页面直接放行
  if (to.meta.public) {
    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login' && isAuthenticated()) {
      next('/')
      return
    }
    next()
    return
  }

  // 需要认证的页面
  if (!isAuthenticated()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
