/**
 * 智光云枢-路由配置
 * 业务域驱动：灯网态势 / 能源脉动 / 终端图谱 / 情景编排 / 运维工单 / 管廊照明
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import ZhiGuangApp from '@/App.vue'

const routes = [
  {
    path: '/',
    redirect: '/lampNet/dashboard'
  },
  {
    path: '/lampNet/dashboard',
    name: 'lampNet.dashboard',
    component: () => import('@/modules/lampNet/LampNetDashboard.vue'),
    meta: { title: '灯网驾驶舱' }
  },
  {
    path: '/lampNet/recipe-composer',
    name: 'lampNet.recipeComposer',
    component: () => import('@/modules/lampNet/RecipeComposer.vue'),
    meta: { title: '光照处方编排' }
  },
  {
    path: '/lampNet/recipe-vault',
    name: 'lampNet.recipeVault',
    component: () => import('@/modules/lampNet/RecipeVault.vue'),
    meta: { title: '处方库管理' }
  },
  {
    path: '/lampNet/recipe-archive',
    name: 'lampNet.recipeArchive',
    component: () => import('@/modules/lampNet/RecipeArchive.vue'),
    meta: { title: '历史处方' }
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
    meta: { title: '链路通断' }
  },
  {
    path: '/energyPulse/loadProber',
    name: 'energyPulse.loadProber',
    component: () => import('@/modules/energyPulse/LoadProber.vue'),
    meta: { title: '负荷探针' }
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
    meta: { title: '强电情景' }
  },
  {
    path: '/energyPulse/strongSceneArchive',
    name: 'energyPulse.strongSceneArchive',
    component: () => import('@/modules/energyPulse/StrongSceneArchive.vue'),
    meta: { title: '强电情景回溯' }
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
    meta: { title: '杆塔位点' }
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
    meta: { title: '环境探针' }
  },
  {
    path: '/terminalAtlas/luminanceProbe',
    name: 'terminalAtlas.luminanceProbe',
    component: () => import('@/modules/terminalAtlas/LuminanceProbe.vue'),
    meta: { title: '照度探针' }
  },
  {
    path: '/terminalAtlas/waterProbe',
    name: 'terminalAtlas.waterProbe',
    component: () => import('@/modules/terminalAtlas/WaterProbe.vue'),
    meta: { title: '浸水探针' }
  },
  {
    path: '/terminalAtlas/smokeProbe',
    name: 'terminalAtlas.smokeProbe',
    component: () => import('@/modules/terminalAtlas/SmokeProbe.vue'),
    meta: { title: '烟感探针' }
  },
  {
    path: '/scenarioOrch/presetConsole',
    name: 'scenarioOrch.presetConsole',
    component: () => import('@/modules/scenarioOrch/PresetConsole.vue'),
    meta: { title: '预案控制台' }
  },
  {
    path: '/scenarioOrch/presetLibrary',
    name: 'scenarioOrch.presetLibrary',
    component: () => import('@/modules/scenarioOrch/PresetLibrary.vue'),
    meta: { title: '预案库' }
  },
  {
    path: '/scenarioOrch/presetLinkage',
    name: 'scenarioOrch.presetLinkage',
    component: () => import('@/modules/scenarioOrch/PresetLinkage.vue'),
    meta: { title: '预案联动' }
  },
  {
    path: '/scenarioOrch/linkageManager',
    name: 'scenarioOrch.linkageManager',
    component: () => import('@/modules/scenarioOrch/LinkageManager.vue'),
    meta: { title: '联动管理' }
  },
  {
    path: '/scenarioOrch/presetTemplate',
    name: 'scenarioOrch.presetTemplate',
    component: () => import('@/modules/scenarioOrch/PresetTemplate.vue'),
    meta: { title: '预案模板' }
  },
  {
    path: '/scenarioOrch/presetTrigger',
    name: 'scenarioOrch.presetTrigger',
    component: () => import('@/modules/scenarioOrch/PresetTrigger.vue'),
    meta: { title: '触发器' }
  },
  {
    path: '/scenarioOrch/presetSchedule',
    name: 'scenarioOrch.presetSchedule',
    component: () => import('@/modules/scenarioOrch/PresetSchedule.vue'),
    meta: { title: '时间编排' }
  },
  {
    path: '/opsTicket/dispatchPool',
    name: 'opsTicket.dispatchPool',
    component: () => import('@/modules/opsTicket/DispatchPool.vue'),
    meta: { title: '调度池' }
  },
  {
    path: '/opsTicket/ticketCreate',
    name: 'opsTicket.ticketCreate',
    component: () => import('@/modules/opsTicket/TicketCreate.vue'),
    meta: { title: '新建处置单' }
  },
  {
    path: '/opsTicket/ticketDetail/:id',
    name: 'opsTicket.ticketDetail',
    component: () => import('@/modules/opsTicket/TicketDetail.vue'),
    meta: { title: '处置单详情' }
  },
  {
    path: '/opsTicket/autoDispatch',
    name: 'opsTicket.autoDispatch',
    component: () => import('@/modules/opsTicket/AutoDispatch.vue'),
    meta: { title: '告警自动调度' }
  },
  {
    path: '/opsTicket/myDesk',
    name: 'opsTicket.myDesk',
    component: () => import('@/modules/opsTicket/MyDesk.vue'),
    meta: { title: '我的工位' }
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
    meta: { title: '管廊门户' }
  },
  {
    path: '/tubeLumen/tubeIndex',
    name: 'tubeLumen.tubeIndex',
    component: () => import('@/modules/tubeLumen/TubeIndex.vue'),
    meta: { title: '管廊索引' }
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
