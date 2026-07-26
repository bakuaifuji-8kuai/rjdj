import { reactive, computed } from 'vue'

const state = reactive({
  tubes: [
    {
      id: 1,
      name: '先导路隧道',
      length: 1000,
      lanes: 2,
      area: '岳麓区',
      level: '长沙-岳麓区-先导路',
      status: '正常',
      createTime: '2024-01-15 10:30:00',
      devices: 156,
      online: true
    },
    {
      id: 2,
      name: '麓景路隧道',
      length: 1500,
      lanes: 2,
      area: '岳麓区',
      level: '长沙-岳麓区-麓景路',
      status: '正常',
      createTime: '2024-02-20 14:20:00',
      devices: 220,
      online: true
    },
    {
      id: 3,
      name: '西二环隧道',
      length: 3200,
      lanes: 6,
      area: '岳麓区',
      level: '长沙-岳麓区-西二环',
      status: '正常',
      createTime: '2024-03-10 09:15:00',
      devices: 480,
      online: true
    }
  ]
})

export const useTubeStore = () => {
  const totalTunnels = computed(() => state.tubes.length)
  const onlineTunnels = computed(() => state.tubes.filter(t => t.online).length)
  const normalCount = computed(() => state.tubes.filter(t => t.status === '正常').length)
  const maintenanceCount = computed(() => state.tubes.filter(t => t.status === '维护中').length)
  const totalLength = computed(() => state.tubes.reduce((sum, t) => sum + t.length, 0))
  const alarmCount = computed(() => state.tubes.filter(t => t.status === '维护中').length + 2)

  const addTube = (tube) => {
    const newTube = {
      id: Date.now(),
      ...tube,
      status: tube.status || '正常',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      devices: tube.devices || Math.floor(Math.random() * 200) + 50,
      online: tube.online !== undefined ? tube.online : true
    }
    state.tubes.push(newTube)
    return newTube
  }

  const updateTube = (id, updates) => {
    const index = state.tubes.findIndex(t => t.id === id)
    if (index !== -1) {
      state.tubes[index] = { ...state.tubes[index], ...updates }
      return state.tubes[index]
    }
    return null
  }

  const deleteTube = (id) => {
    const index = state.tubes.findIndex(t => t.id === id)
    if (index !== -1) {
      state.tubes.splice(index, 1)
      return true
    }
    return false
  }

  const getTubeById = (id) => {
    return state.tubes.find(t => t.id === id)
  }

  const toggleTubeStatus = (id) => {
    const tube = getTubeById(id)
    if (tube) {
      tube.status = tube.status === '正常' ? '维护中' : '正常'
      return tube
    }
    return null
  }

  return {
    tubes: state.tubes,
    totalTunnels,
    onlineTunnels,
    normalCount,
    maintenanceCount,
    totalLength,
    alarmCount,
    addTube,
    updateTube,
    deleteTube,
    getTubeById,
    toggleTubeStatus
  }
}
