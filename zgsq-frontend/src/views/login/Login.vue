<!-- [软著核心代码] Login.vue + 登录页：左侧渐变品牌背景，右侧居中卡片，表单校验 Token 持久化 -->
<template>
  <!-- 登录页全屏布局 -->
  <div class="zgsq-login-page">
    <!-- ========== 左侧品牌区：渐变背景 + 品牌图 ========== -->
    <div class="zgsq-login-banner">
      <!-- 装饰性发光光圈 -->
      <div class="zgsq-login-glow"></div>

      <!-- 品牌主标题 -->
      <div class="zgsq-login-brand">
        <div class="zgsq-login-big-icon">💡</div>
        <h1 class="zgsq-login-title">智光云枢</h1>
        <p class="zgsq-login-subtitle">城市照明物联管控平台</p>
        <p class="zgsq-login-slogan">让每一寸光都在掌控之中</p>
      </div>

      <!-- 底部装饰文案 -->
      <div class="zgsq-login-footer-tip">
        © 2026 智光云枢 · Smart City Lighting IoT Platform
      </div>
    </div>

    <!-- ========== 右侧登录卡片 ========== -->
    <div class="zgsq-login-form-wrap">
      <div class="zgsq-login-card">
        <h2 class="zgsq-login-card-title">欢迎登录</h2>
        <p class="zgsq-login-card-sub">请使用管理员账号登录系统</p>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          size="large"
          @keyup.enter="handleLoginSubmit"
        >
          <!-- 用户名输入框 -->
          <el-form-item prop="userName">
            <el-input
              v-model="loginForm.userName"
              placeholder="请输入用户名（≥3 位）"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码（≥6 位）"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 记住我 + 登录按钮 -->
          <el-form-item>
            <div class="zgsq-login-actions">
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            </div>
          </el-form-item>

          <!-- 提交按钮：loading 状态防重复提交 -->
          <el-button
            type="primary"
            size="large"
            :loading="loginLoading"
            style="width: 100%"
            @click="handleLoginSubmit"
          >{{ loginLoading ? '登录中...' : '立即登录' }}</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
// ========== 导入依赖 ==========
import { ref, reactive, onMounted } from 'vue'           // Vue 组合式 API
import { useRouter, useRoute } from 'vue-router'        // 路由操作
import { ElMessage } from 'element-plus'                // 消息提示
import { User, Lock } from '@element-plus/icons-vue'    // 图标组件
import { useUserStore } from '@/store/user'             // 用户状态 store

// ========== 响应式对象 ==========
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单 ref：用于调用 el-form 的 validate 方法
const loginFormRef = ref(null)
// 登录按钮 loading 状态：防重复提交
const loginLoading = ref(false)

// 登录表单数据（用 reactive 让整个对象响应式）
// 默认预填管理员账号密码，方便首次进入直接点登录
const loginForm = reactive({
  userName: 'admin',     // 用户名：默认预填 admin
  password: 'admin123',  // 密码：默认预填 admin123
  rememberMe: true       // 默认勾选"记住我"
})

// ========== 表单校验规则 ==========
// 业务规则：用户名 ≥3 位，密码 ≥6 位
const loginRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少 3 位字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位字符', trigger: 'blur' }
  ]
}

// ========== 生命周期钩子 ==========

/**
 * 组件挂载时：如果用户之前勾选了"记住我"，恢复用户名
 * 业务说明：提升用户体验，避免每次都重新输入
 */
onMounted(() => {
  const saved = localStorage.getItem('ZgsqRememberUser')
  if (saved) {
    loginForm.userName = saved
    loginForm.rememberMe = true
  }
})

// ========== 事件处理 ==========

/**
 * 提交登录表单
 * 业务说明：
 * 1. 先让 el-form 做前端校验
 * 2. 校验通过后调 userStore.login 发请求
 * 3. 成功后存 localStorage（记住我）并跳转到目标页
 */
const handleLoginSubmit = () => {
  // 先触发表单校验
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return // 校验不通过，停止

    loginLoading.value = true // 开始 loading，禁用按钮

    try {
      // 调 Pinia store 的 login action（内部会请求后端接口）
      await userStore.login({
        userName: loginForm.userName,
        password: loginForm.password
      })

      // 记住我：勾选则保存用户名
      if (loginForm.rememberMe) {
        localStorage.setItem('ZgsqRememberUser', loginForm.userName)
      } else {
        localStorage.removeItem('ZgsqRememberUser')
      }

      ElMessage.success('登录成功，欢迎回来！')

      // 跳转到登录前的目标页（如果是被守卫踢过来的，route.query.redirect 有值）
      const redirect = route.query.redirect || '/dashboard'
      router.replace(redirect)
    } catch (err) {
      // 请求失败的错误信息已在 axios 拦截器里 ElMessage.error 过，这里不需要重复弹
      // 但把错误打印出来方便调试
      console.warn('[Login] 登录失败:', err)
    } finally {
      loginLoading.value = false // 结束 loading
    }
  })
}
</script>

<style scoped>
/* ====== 登录页整体布局 ====== */
.zgsq-login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

/* ====== 左侧品牌区 ====== */
.zgsq-login-banner {
  flex: 1.1;
  /* 渐变背景：从深蓝到紫蓝，配合发光装饰非常有科技感 */
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 40%, #6a11cb 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  overflow: hidden;
}
/* 发光装饰光圈 */
.zgsq-login-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 220, 100, 0.25) 0%, transparent 70%);
  top: 20%;
  left: 10%;
  border-radius: 50%;
  filter: blur(20px);
}
.zgsq-login-brand {
  position: relative;
  z-index: 1;
  text-align: center;
}
.zgsq-login-big-icon {
  font-size: 80px;
  filter: drop-shadow(0 0 20px rgba(255, 220, 100, 0.6));
  margin-bottom: 16px;
}
.zgsq-login-title {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 8px;
  margin-bottom: 8px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}
.zgsq-login-subtitle {
  font-size: 20px;
  letter-spacing: 4px;
  opacity: 0.9;
  margin-bottom: 16px;
}
.zgsq-login-slogan {
  font-size: 14px;
  opacity: 0.7;
  letter-spacing: 2px;
}
.zgsq-login-footer-tip {
  position: absolute;
  bottom: 32px;
  font-size: 12px;
  opacity: 0.5;
  letter-spacing: 1px;
}

/* ====== 右侧登录表单区 ====== */
.zgsq-login-form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.zgsq-login-card {
  width: 380px;
  padding: 40px 36px;
}
.zgsq-login-card-title {
  font-size: 26px;
  color: #1f2d3d;
  margin-bottom: 6px;
}
.zgsq-login-card-sub {
  font-size: 14px;
  color: #909399;
  margin-bottom: 28px;
}
.zgsq-login-actions {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}
</style>
