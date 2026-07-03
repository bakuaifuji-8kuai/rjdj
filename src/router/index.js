/**
 * 智光云枢-路由配置
 * 业务域驱动：灯网态势 / 能源脉动 / 终端图谱 / 情景编排 / 运维工单 / 管廊照明
 */
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/lampNet/dashboard'
  },
  // 灯网态势
  {
    path: '/lampNet',
    name: 'lampNet',
    redirect: '/lampNet/dashboard',
    meta: { title: '灯网态势', icon: 'Sunrise' },
    children: [
      {
        path: 'dashboard',
        name: 'lampNet.dashboard',
        component: () => import('@/modules/lampNet/LampNetDashboard.vue'),
        meta: { title: '灯网驾驶舱' }
      },
      {
        path: 'recipe-composer',
        name: 'lampNet.recipeComposer',
        component: () => import('@/modules/lampNet/RecipeComposer.vue'),
        meta: { title: '光照处方编排' }
      },
      {
        path: 'recipe-vault',
        name: 'lampNet.recipeVault',
        component: () => import('@/modules/lampNet/RecipeVault.vue'),
        meta: { title: '处方库管理' }
      },
      {
        path: 'recipe-archive',
        name: 'lampNet.recipeArchive',
        component: () => import('@/modules/lampNet/RecipeArchive.vue'),
        meta: { title: '历史处方' }
      },
      {
        path: 'lamp-registry',
        name: 'lampNet.lampRegistry',
        component: () => import('@/modules/lampNet/LampRegistry.vue'),
        meta: { title: '光源台账' }
      },
      {
        path: 'cluster-topology',
        name: 'lampNet.clusterTopology',
        component: () => import('@/modules/lampNet/ClusterTopology.vue'),
        meta: { title: '集群拓扑' }
      },
      {
        path: 'gis-atlas',
        name: 'lampNet.gisAtlas',
        component: () => import('@/modules/lampNet/GisAtlas.vue'),
        meta: { title: 'GIS灯位图' }
      }
    ]
  },
  // 能源脉动
  {
    path: '/energyPulse',
    name: 'energyPulse',
    redirect: '/energyPulse/feedCabinet',
    meta: { title: '能源脉动', icon: 'Lightning' },
    children: [
      {
        path: 'feedCabinet',
        name: 'energyPulse.feedCabinet',
        component: () => import('@/modules/energyPulse/FeedCabinet.vue'),
        meta: { title: '馈电柜监测' }
      },
      {
        path: 'lineTrace',
        name: 'energyPulse.lineTrace',
        component: () => import('@/modules/energyPulse/LineTrace.vue'),
        meta: { title: '供电链路' }
      },
      {
        path: 'edgeHost',
        name: 'energyPulse.edgeHost',
        component: () => import('@/modules/energyPulse/EdgeHost.vue'),
        meta: { title: '边缘主机' }
      },
      {
        path: 'loopSwitch',
        name: 'energyPulse.loopSwitch',
        component: () => import('@/modules/energyPulse/LoopSwitch.vue'),
        meta: { title: '链路通断' }
      },
      {
        path: 'loadProber',
        name: 'energyPulse.loadProber',
        component: () => import('@/modules/energyPulse/LoadProber.vue'),
        meta: { title: '负荷探针' }
      },
      {
        path: 'moduleLedger',
        name: 'energyPulse.moduleLedger',
        component: () => import('@/modules/energyPulse/ModuleLedger.vue'),
        meta: { title: '模块台账' }
      },
      {
        path: 'strongScene',
        name: 'energyPulse.strongScene',
        component: () => import('@/modules/energyPulse/StrongScene.vue'),
        meta: { title: '强电情景' }
      },
      {
        path: 'strongSceneArchive',
        name: 'energyPulse.strongSceneArchive',
        component: () => import('@/modules/energyPulse/StrongSceneArchive.vue'),
        meta: { title: '强电情景回溯' }
      },
      {
        path: 'loopCluster',
        name: 'energyPulse.loopCluster',
        component: () => import('@/modules/energyPulse/LoopCluster.vue'),
        meta: { title: '链路分组' }
      },
      {
        path: 'lampBinding',
        name: 'energyPulse.lampBinding',
        component: () => import('@/modules/energyPulse/LampBinding.vue'),
        meta: { title: '光源绑定' }
      }
    ]
  },
  // 终端图谱
  {
    path: '/terminalAtlas',
    name: 'terminalAtlas',
    redirect: '/terminalAtlas/poleCatalog',
    meta: { title: '终端图谱', icon: 'Cpu' },
    children: [
      {
        path: 'poleCatalog',
        name: 'terminalAtlas.poleCatalog',
        component: () => import('@/modules/terminalAtlas/PoleCatalog.vue'),
        meta: { title: '杆塔位点' }
      },
      {
        path: 'lampControl',
        name: 'terminalAtlas.lampControl',
        component: () => import('@/modules/terminalAtlas/LampControl.vue'),
        meta: { title: '光源控制器' }
      },
      {
        path: 'fixtureList',
        name: 'terminalAtlas.fixtureList',
        component: () => import('@/modules/terminalAtlas/FixtureList.vue'),
        meta: { title: '灯具清单' }
      },
      {
        path: 'recorder',
        name: 'terminalAtlas.recorder',
        component: () => import('@/modules/terminalAtlas/Recorder.vue'),
        meta: { title: '视频记录仪' }
      },
      {
        path: 'camera',
        name: 'terminalAtlas.camera',
        component: () => import('@/modules/terminalAtlas/Camera.vue'),
        meta: { title: '视频采集' }
      },
      {
        path: 'envProbe',
        name: 'terminalAtlas.envProbe',
        component: () => import('@/modules/terminalAtlas/EnvProbe.vue'),
        meta: { title: '环境探针' }
      },
      {
        path: 'luminanceProbe',
        name: 'terminalAtlas.luminanceProbe',
        component: () => import('@/modules/terminalAtlas/LuminanceProbe.vue'),
        meta: { title: '照度探针' }
      },
      {
        path: 'waterProbe',
        name: 'terminalAtlas.waterProbe',
        component: () => import('@/modules/terminalAtlas/WaterProbe.vue'),
        meta: { title: '浸水探针' }
      },
      {
        path: 'smokeProbe',
        name: 'terminalAtlas.smokeProbe',
        component: () => import('@/modules/terminalAtlas/SmokeProbe.vue'),
        meta: { title: '烟感探针' }
      }
    ]
  },
  // 情景编排
  {
    path: '/scenarioOrch',
    name: 'scenarioOrch',
    redirect: '/scenarioOrch/presetConsole',
    meta: { title: '情景编排', icon: 'Grid' },
    children: [
      {
        path: 'presetConsole',
        name: 'scenarioOrch.presetConsole',
        component: () => import('@/modules/scenarioOrch/PresetConsole.vue'),
        meta: { title: '预案控制台' }
      },
      {
        path: 'presetLibrary',
        name: 'scenarioOrch.presetLibrary',
        component: () => import('@/modules/scenarioOrch/PresetLibrary.vue'),
        meta: { title: '预案库' }
      },
      {
        path: 'presetLinkage',
        name: 'scenarioOrch.presetLinkage',
        component: () => import('@/modules/scenarioOrch/PresetLinkage.vue'),
        meta: { title: '预案联动' }
      },
      {
        path: 'linkageManager',
        name: 'scenarioOrch.linkageManager',
        component: () => import('@/modules/scenarioOrch/LinkageManager.vue'),
        meta: { title: '联动管理' }
      },
      {
        path: 'presetTemplate',
        name: 'scenarioOrch.presetTemplate',
        component: () => import('@/modules/scenarioOrch/PresetTemplate.vue'),
        meta: { title: '预案模板' }
      },
      {
        path: 'presetTrigger',
        name: 'scenarioOrch.presetTrigger',
        component: () => import('@/modules/scenarioOrch/PresetTrigger.vue'),
        meta: { title: '触发器' }
      },
      {
        path: 'presetSchedule',
        name: 'scenarioOrch.presetSchedule',
        component: () => import('@/modules/scenarioOrch/PresetSchedule.vue'),
        meta: { title: '时间编排' }
      }
    ]
  },
  // 运维工单
  {
    path: '/opsTicket',
    name: 'opsTicket',
    redirect: '/opsTicket/dispatchPool',
    meta: { title: '运维工单', icon: 'List' },
    children: [
      {
        path: 'dispatchPool',
        name: 'opsTicket.dispatchPool',
        component: () => import('@/modules/opsTicket/DispatchPool.vue'),
        meta: { title: '调度池' }
      },
      {
        path: 'ticketCreate',
        name: 'opsTicket.ticketCreate',
        component: () => import('@/modules/opsTicket/TicketCreate.vue'),
        meta: { title: '新建处置单' }
      },
      {
        path: 'ticketDetail/:id',
        name: 'opsTicket.ticketDetail',
        component: () => import('@/modules/opsTicket/TicketDetail.vue'),
        meta: { title: '处置单详情' }
      },
      {
        path: 'autoDispatch',
        name: 'opsTicket.autoDispatch',
        component: () => import('@/modules/opsTicket/AutoDispatch.vue'),
        meta: { title: '告警自动调度' }
      },
      {
        path: 'myDesk',
        name: 'opsTicket.myDesk',
        component: () => import('@/modules/opsTicket/MyDesk.vue'),
        meta: { title: '我的工位' }
      },
      {
        path: 'statBoard',
        name: 'opsTicket.statBoard',
        component: () => import('@/modules/opsTicket/StatBoard.vue'),
        meta: { title: '效能看板' }
      }
    ]
  },
  // 管廊照明
  {
    path: '/tubeLumen',
    name: 'tubeLumen',
    redirect: '/tubeLumen/portal',
    meta: { title: '管廊照明', icon: 'Location' },
    children: [
      {
        path: 'portal',
        name: 'tubeLumen.portal',
        component: () => import('@/modules/tubeLumen/TubePortal.vue'),
        meta: { title: '管廊门户' }
      },
      {
        path: 'tubeIndex',
        name: 'tubeLumen.tubeIndex',
        component: () => import('@/modules/tubeLumen/TubeIndex.vue'),
        meta: { title: '管廊索引' }
      },
      {
        path: 'sectionManager',
        name: 'tubeLumen.sectionManager',
        component: () => import('@/modules/tubeLumen/SectionManager.vue'),
        meta: { title: '区段管理' }
      },
      {
        path: 'fixtureLedger',
        name: 'tubeLumen.fixtureLedger',
        component: () => import('@/modules/tubeLumen/FixtureLedger.vue'),
        meta: { title: '管廊灯具' }
      },
      {
        path: 'loopCluster',
        name: 'tubeLumen.loopCluster',
        component: () => import('@/modules/tubeLumen/TubeLoopCluster.vue'),
        meta: { title: '管廊链路' }
      },
      {
        path: 'opticsManager',
        name: 'tubeLumen.opticsManager',
        component: () => import('@/modules/tubeLumen/OpticsManager.vue'),
        meta: { title: '配光管理' }
      },
      {
        path: 'lumenControl',
        name: 'tubeLumen.lumenControl',
        component: () => import('@/modules/tubeLumen/LumenControl.vue'),
        meta: { title: '光通控制' }
      },
      {
        path: 'cronScheduler',
        name: 'tubeLumen.cronScheduler',
        component: () => import('@/modules/tubeLumen/CronScheduler.vue'),
        meta: { title: '定时调度' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
