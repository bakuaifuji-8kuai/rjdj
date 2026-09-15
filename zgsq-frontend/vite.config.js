/* [软著核心代码] vite.config.js + Vite 构建配置，含 /api 代理到后端 localhost:8080 */
import { defineConfig } from 'vite'  // 导入 Vite 的定义配置函数
import vue from '@vitejs/plugin-vue' // 导入 Vue 官方插件，支持 .vue 文件编译
import { fileURLToPath, URL } from 'node:url' // Node.js URL 工具，用于路径别名

// Vite 配置导出：开发服务器端口、路径别名、API 代理
export default defineConfig({
  plugins: [vue()], // 注册 Vue 插件，使 Vite 能解析 SFC 单文件组件
  resolve: {
    // 路径别名配置，方便 @/utils 这种写法
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // @ 指向 src 目录
    }
  },
  server: {
    port: 5173, // 前端开发服务器默认端口
    host: '0.0.0.0', // 允许局域网访问
    proxy: {
      // 把前端 /api 开头的请求代理到后端 Spring Boot
      '/api': {
        target: 'http://localhost:8080', // 后端服务地址
        changeOrigin: true, // 允许跨域代理
        rewrite: (path) => path.replace(/^\/api/, '/api') // 保持 /api 前缀
      }
    }
  },
  build: {
    outDir: 'dist', // 构建输出目录
    sourcemap: false // 生产环境不生成 sourcemap，减小体积
  }
})
