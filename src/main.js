/**
 * 智光云枢-前端应用入口
 * 注册 Element Plus 组件库与 Vue Router 路由
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style/index.scss'
import ZhiGuangApp from './App.vue'
import hubRouter from './router'

const app = createApp(ZhiGuangApp)
app.use(ElementPlus)
app.use(hubRouter)
app.mount('#app')
