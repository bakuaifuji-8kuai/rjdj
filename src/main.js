/**
 * 智光云枢-前端应用入口
 * 注册 Element Plus 组件库与 Vue Router 路由
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import './style/index.scss'
import ZhiGuangApp from './App.vue'
import hubRouter from './router'

const app = createApp(ZhiGuangApp)

// 自定义中文 locale：弹窗确认按钮统一为"确认"
const customZhCn = {
  ...zhCn,
  el: {
    ...zhCn.el,
    messagebox: {
      ...zhCn.el.messagebox,
      confirm: '确认'
    }
  }
}

app.use(ElementPlus, { locale: customZhCn })
app.use(hubRouter)
app.mount('#app')
