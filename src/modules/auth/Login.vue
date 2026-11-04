<!--
  智光云枢 · 登录页面
  业务域：auth
  功能：用户身份认证入口
-->
<template>
  <div class="zg-login">
    <!-- 背景装饰 -->
    <div class="zg-login__backdrop">
      <div class="zg-login__particle zg-login__particle--1"></div>
      <div class="zg-login__particle zg-login__particle--2"></div>
      <div class="zg-login__particle zg-login__particle--3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="zg-login__card">
      <!-- 品牌标识 -->
      <div class="zg-login__brand">
        <div class="zg-login__sigil">
          <el-icon :size="40"><Connection /></el-icon>
        </div>
        <div class="zg-login__copy">
          <h1 class="zg-login__title">智光云枢</h1>
          <p class="zg-login__subtitle">ZhiGuangCloud Hub</p>
        </div>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="zg-login__form"
        @submit.prevent="onSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="onSubmit"
          />
        </el-form-item>

        <el-form-item>
          <div class="zg-login__remember">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="zg-login__submit"
            :loading="isSubmitting"
            @click="onSubmit"
          >
            {{ isSubmitting ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部信息 -->
      <div class="zg-login__footer">
        <p class="zg-login__copyright">© 2024-2026 智光云枢 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 智光云枢 · 登录页面
 * 业务域：auth
 * 功能：用户身份认证入口
 * @module auth/Login
 * @author 智光云枢研发团队
 */
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Connection, User, Lock } from '@element-plus/icons-vue'
import { getAuthStore } from '@/shared/stores/authStore'

const router = useRouter()
const authStore = getAuthStore()

// 表单引用
const loginFormRef = ref(null)

// 提交状态
const isSubmitting = ref(false)

// 登录表单数据（默认预填管理员账号密码，方便首次进入直接点登录）
const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  remember: true
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

/**
 * 提交登录
 */
const onSubmit = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    isSubmitting.value = true

    // 模拟登录验证
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 调用认证 store 进行登录
    const success = authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })

    if (success) {
      ElMessage.success('登录成功，欢迎回来！')
      router.push('/')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.zg-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

// 背景粒子动画
.zg-login__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.zg-login__particle {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 125, 0, 0.15) 0%, transparent 70%);
  animation: float 20s infinite ease-in-out;
}

.zg-login__particle--1 {
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.zg-login__particle--2 {
  bottom: -150px;
  right: -100px;
  animation-delay: -7s;
}

.zg-login__particle--3 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-30px, 50px) scale(0.9);
  }
  75% {
    transform: translate(-50px, -20px) scale(1.05);
  }
}

// 登录卡片
.zg-login__card {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

// 品牌标识
.zg-login__brand {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  justify-content: center;
}

.zg-login__sigil {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff7d00 0%, #ff5722 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.zg-login__copy {
  text-align: left;
}

.zg-login__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.zg-login__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #666;
  font-weight: 400;
}

// 登录表单
.zg-login__form {
  margin-top: 24px;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
  }

  :deep(.el-input__inner) {
    height: 48px;
    line-height: 48px;
  }
}

.zg-login__remember {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.zg-login__submit {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff7d00 0%, #ff5722 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 125, 0, 0.4);
  }
}

// 底部信息
.zg-login__footer {
  margin-top: 32px;
  text-align: center;
}

.zg-login__copyright {
  margin: 0;
  font-size: 12px;
  color: #999;
}

// 响应式
@media (max-width: 480px) {
  .zg-login__card {
    width: 90%;
    padding: 32px 24px;
  }
}
</style>