/* [软著核心代码] index.js + Pinia Store 统一导出入口 */
import { createPinia } from 'pinia' // 导入 Pinia 工厂函数

// 创建 Pinia 实例，让各模块 store 共享同一个根作用域
const store = createPinia()

// 从各模块 store 中集中导出，方便 main.js 统一注册
export default store
export * from './user'    // 导出 userStore
export * from './guanlang' // 导出 guanlangStore
