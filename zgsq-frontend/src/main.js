/* [软著核心代码] main.js + Vue 3 应用入口，注册 ElementPlus、router、pinia、全局指令 */
import { createApp } from 'vue'        // 导入 Vue 3 的应用工厂函数
import { createPinia } from 'pinia'    // 导入 Pinia 状态管理
import ElementPlus from 'element-plus' // 导入 Element Plus UI 组件库
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 中文语言包
import 'element-plus/dist/index.css'   // 导入 Element Plus 样式文件
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 导入所有图标组件

import App from './App.vue'            // 导入根组件
import router from './router'          // 导入路由配置
import store from './store'            // 导入 Pinia store 实例

// 创建 Vue 3 应用实例
const app = createApp(App)

// 全局注册 Element Plus 图标组件，方便模板中直接 <el-icon><Edit /></el-icon> 使用
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册 Pinia 状态管理
app.use(createPinia())
// 注册 Vue Router 路由
app.use(router)
// 注册 Element Plus，配置中文语言包
app.use(ElementPlus, { locale: zhCn, size: 'default' })

// 挂载到 index.html 中的 #app 元素上
app.mount('#app')
