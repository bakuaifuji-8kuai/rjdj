import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/lighting/home'
  },
  {
    path: '/lighting',
    name: 'lighting',
    redirect: '/lighting/home',
    children: [
      {
        path: 'home',
        name: 'lighting-home',
        component: () => import('@/views/lighting/LightingHome.vue')
      },
      {
        path: 'map',
        name: 'lighting-map',
        component: () => import('@/views/lighting/GisMap.vue')
      },
      {
        path: 'strategy',
        name: 'lighting-strategy',
        component: () => import('@/views/lighting/LightingStrategy.vue')
      },
      {
        path: 'manage',
        name: 'lighting-manage',
        component: () => import('@/views/lighting/StrategyManage.vue')
      },
      {
        path: 'history',
        name: 'lighting-history',
        component: () => import('@/views/lighting/HistoryStrategy.vue')
      },
      {
        path: 'lamp',
        name: 'lighting-lamp',
        component: () => import('@/views/lighting/LampManage.vue')
      },
      {
        path: 'group',
        name: 'lighting-group',
        component: () => import('@/views/lighting/GroupManage.vue')
      }
    ]
  },
  {
    path: '/power',
    name: 'power',
    redirect: '/power/distribution',
    children: [
      {
        path: 'distribution',
        name: 'power-distribution',
        component: () => import('@/views/power/DistributionBox.vue')
      },
      {
        path: 'line',
        name: 'power-line',
        component: () => import('@/views/power/LineInfo.vue')
      },
      {
        path: 'central',
        name: 'power-central',
        component: () => import('@/views/power/CentralControl.vue')
      },
      {
        path: 'circuit',
        name: 'power-circuit',
        component: () => import('@/views/power/CircuitControl.vue')
      },
      {
        path: 'load',
        name: 'power-load',
        component: () => import('@/views/power/LoadMonitor.vue')
      },
      {
        path: 'module',
        name: 'power-module',
        component: () => import('@/views/power/ModuleInfo.vue')
      },
      {
        path: 'strong-electric',
        name: 'power-strong-electric',
        component: () => import('@/views/power/StrongElectricScene.vue')
      },
      {
        path: 'history-scene',
        name: 'power-history-scene',
        component: () => import('@/views/power/HistoryScene.vue')
      },
      {
        path: 'circuit-group',
        name: 'power-circuit-group',
        component: () => import('@/views/power/CircuitGroup.vue')
      },
      {
        path: 'lamp-control-bind',
        name: 'power-lamp-control-bind',
        component: () => import('@/views/power/LampControlBind.vue')
      }
    ]
  },
  {
    path: '/device',
    name: 'device',
    redirect: '/device/lamp-post',
    children: [
      {
        path: 'list',
        name: 'device-list',
        component: () => import('@/views/device/DeviceList.vue')
      },
      {
        path: 'lamp',
        name: 'device-lamp',
        component: () => import('@/views/device/LampManage.vue')
      },
      {
        path: 'add',
        name: 'device-add',
        component: () => import('@/views/device/DeviceAdd.vue')
      },
      {
        path: 'detail/:id',
        name: 'device-detail',
        component: () => import('@/views/device/DeviceDetail.vue')
      },
      {
        path: 'lamp-post',
        name: 'device-lamp-post',
        component: () => import('@/views/device/PoleManage.vue')
      },
      {
        path: 'lamp-control',
        name: 'device-lamp-control',
        component: () => import('@/views/device/LampControlManage.vue')
      },
      {
        path: 'video-recorder',
        name: 'device-video-recorder',
        component: () => import('@/views/device/VideoRecorderManage.vue')
      },
      {
        path: 'camera',
        name: 'device-camera',
        component: () => import('@/views/device/CameraManage.vue')
      },
      {
        path: 'environment-sensor',
        name: 'device-environment-sensor',
        component: () => import('@/views/device/EnvironmentSensorManage.vue')
      },
      {
        path: 'light-sensor',
        name: 'device-light-sensor',
        component: () => import('@/views/device/LightSensorManage.vue')
      },
      {
        path: 'water-sensor',
        name: 'device-water-sensor',
        component: () => import('@/views/device/WaterSensorManage.vue')
      },
      {
        path: 'smoke-sensor',
        name: 'device-smoke-sensor',
        component: () => import('@/views/device/SmokeSensorManage.vue')
      }
    ]
  },
  {
    path: '/scene',
    name: 'scene',
    redirect: '/scene/quick-operation',
    children: [
      {
        path: 'quick-operation',
        name: 'scene-quick-operation',
        component: () => import('@/views/scene/QuickOperation.vue')
      },
      {
        path: 'manage',
        name: 'scene-manage',
        component: () => import('@/views/scene/SceneManage.vue')
      },
      {
        path: 'linkage',
        name: 'scene-linkage',
        component: () => import('@/views/scene/SceneLinkage.vue')
      },
      {
        path: 'linkage-manage',
        name: 'scene-linkage-manage',
        component: () => import('@/views/scene/LinkageManage.vue')
      },
      {
        path: 'template',
        name: 'scene-template',
        component: () => import('@/views/scene/SceneTemplate.vue')
      },
      {
        path: 'trigger',
        name: 'scene-trigger',
        component: () => import('@/views/scene/SceneTrigger.vue')
      },
      {
        path: 'schedule',
        name: 'scene-schedule',
        component: () => import('@/views/scene/SceneSchedule.vue')
      }
    ]
  },
  {
    path: '/workorder',
    name: 'workorder',
    redirect: '/workorder/list',
    children: [
      {
        path: 'list',
        name: 'workorder-list',
        component: () => import('@/views/workorder/WorkOrderList.vue')
      },
      {
        path: 'create',
        name: 'workorder-create',
        component: () => import('@/views/workorder/WorkOrderCreate.vue')
      },
      {
        path: 'detail/:id',
        name: 'workorder-detail',
        component: () => import('@/views/workorder/WorkOrderDetail.vue')
      },
      {
        path: 'alarm-dispatch',
        name: 'workorder-alarm-dispatch',
        component: () => import('@/views/workorder/AlarmDispatch.vue')
      }
    ]
  },
  {
    path: '/tunnel',
    name: 'tunnel',
    redirect: '/tunnel/home',
    children: [
      {
        path: 'home',
        name: 'tunnel-home',
        component: () => import('@/views/tunnel/TunnelHome.vue')
      },
      {
        path: 'list',
        name: 'tunnel-list',
        component: () => import('@/views/tunnel/TunnelList.vue')
      },
      {
        path: 'section',
        name: 'tunnel-section',
        component: () => import('@/views/tunnel/SectionManage.vue')
      },
      {
        path: 'lamp',
        name: 'tunnel-lamp',
        component: () => import('@/views/tunnel/LampManage.vue')
      },
      {
        path: 'circuit-group',
        name: 'tunnel-circuit-group',
        component: () => import('@/views/tunnel/CircuitGroup.vue')
      },
      {
        path: 'fitting',
        name: 'tunnel-fitting',
        component: () => import('@/views/tunnel/FittingManage.vue')
      },
      {
        path: 'lighting-control',
        name: 'tunnel-lighting-control',
        component: () => import('@/views/tunnel/LightingControl.vue')
      },
      {
        path: 'time-schedule',
        name: 'tunnel-time-schedule',
        component: () => import('@/views/tunnel/TimeSchedule.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router