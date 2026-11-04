<!--
  智光云枢 · QRCode 组件
  基于 FNV1a(assetCode) 确定性生成 25x25 QR 矩阵
-->
<template>
  <div class="qr-box" :style="{ width: size + 'px', height: size + 'px' }">
    <svg
      :viewBox="`0 0 ${matrixSize} ${matrixSize}`"
      :width="size"
      :height="size"
      shape-rendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill="#ffffff" />
      <g>
        <template v-for="(row, y) in qrMatrix" :key="'row-' + y">
          <rect
            v-for="(cell, x) in row"
            :key="x + '-' + y"
            :x="x"
            :y="y"
            width="1"
            height="1"
            :fill="cell ? '#1e293b' : '#ffffff'"
          />
        </template>
      </g>
      <!-- 三定位角 -->
      <g v-for="pos in finderPositions" :key="pos.label">
        <rect :x="pos.x" :y="pos.y" width="7" height="7" fill="#ffffff" />
        <rect :x="pos.x + 1" :y="pos.y + 1" width="5" height="5" fill="#1e293b" />
        <rect :x="pos.x + 2" :y="pos.y + 2" width="3" height="3" fill="#ffffff" />
      </g>
      <!-- 中心渐变 logo -->
      <circle :cx="matrixSize / 2" :cy="matrixSize / 2" r="3" fill="url(#zgqrgrad)" />
      <defs>
        <linearGradient id="zgqrgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#6366f1" />
          <stop offset="1" stop-color="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { generateQRM } from '@/utils/assetUtils'

const props = withDefaults(
  defineProps<{ assetCode: string; size?: number }>(),
  { size: 150 }
)

const matrixSize = 25
const qrMatrix = computed(() => generateQRM(props.assetCode, matrixSize))

const finderPositions = [
  { label: 'tl', x: 0, y: 0 },
  { label: 'tr', x: matrixSize - 7, y: 0 },
  { label: 'bl', x: 0, y: matrixSize - 7 }
]
</script>

<style scoped lang="scss">
.qr-box {
  display: inline-block;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  overflow: hidden;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
