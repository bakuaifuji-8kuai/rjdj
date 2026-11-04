/**
 * 智光云枢 · 资产管理 · 核心工具库
 * FNV1a 确定性哈希 · Mulberry32 PRNG · QR 生成 · 折旧计算 · 状态流转
 */

// ============================================================
// 1. FNV1a 确定性哈希 (32bit)
// ============================================================
export function fnv1aHash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// ============================================================
// 2. Mulberry32 PRNG (确定性)
// ============================================================
export function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ============================================================
// 3. 确定性 QR 生成 (25x25 黑白矩阵)
// ============================================================
export function generateQRM(assetCode: string, size = 25): boolean[][] {
  const seed = fnv1aHash(assetCode)
  const rand = mulberry32(seed)
  const matrix: boolean[][] = []
  for (let y = 0; y < size; y++) {
    const row: boolean[] = []
    for (let x = 0; x < size; x++) {
      row.push(rand() > 0.5)
    }
    matrix.push(row)
  }

  // 三定位角：左上、右上、左下 7x7
  const positions = [
    { x: 0, y: 0 },
    { x: size - 7, y: 0 },
    { x: 0, y: size - 7 }
  ]
  for (const pos of positions) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const cx = pos.x + dx
        const cy = pos.y + dy
        if (cx >= 0 && cx < size && cy >= 0 && cy < size) {
          matrix[cy][cx] =
            dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
            (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
        }
      }
    }
  }

  // 中心视觉标记（资产编码最后 4 位）
  const last4 = assetCode.slice(-4)
  const midX = Math.floor(size / 2)
  const midY = Math.floor(size / 2)
  // 用最后 4 位的每个字符哈希决定中心附近像素
  for (let i = 0; i < last4.length; i++) {
    const n = last4.charCodeAt(i)
    const dx = (i % 2 === 0 ? -1 : 1) * ((n % 2) + 1)
    const dy = (i < 2 ? -1 : 1) * (((n >> 1) % 2) + 1)
    const cx = midX + dx
    const cy = midY + dy
    if (cx > 0 && cx < size - 1 && cy > 0 && cy < size - 1) {
      matrix[cy][cx] = (n & 1) === 1
    }
  }

  return matrix
}

// ============================================================
// 4. QR 矩阵转 SVG 字符串
// ============================================================
export function qrMatrixToSvg(matrix: boolean[][], cellSize = 6): string {
  const rows = matrix.length
  const cols = rows > 0 ? matrix[0].length : 0
  const w = cols * cellSize
  const h = rows * cellSize

  let rects = ''
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${matrix[y][x] ? '#1e293b' : '#ffffff'}"/>`
    }
  }

  const cx = (cols / 2) * cellSize
  const cy = (rows / 2) * cellSize
  const r = 3 * cellSize

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">
<rect width="${w}" height="${h}" fill="#ffffff"/>
${rects}
<defs>
  <linearGradient id="zgqrgrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6366f1"/>
    <stop offset="100%" stop-color="#a855f7"/>
  </linearGradient>
</defs>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#zgqrgrad)"/>
</svg>`
}

// ============================================================
// 5. 折旧计算
// ============================================================
export interface AssetDepreciationInput {
  purchaseDate: string
  installDate?: string
  purchasePrice: number
  depreciationYears: number
  residualRate: number
}

export interface AssetDepreciationResult {
  monthlyDepreciation: number
  accumulatedMonths: number
  accumulatedDepreciation: number
  netValue: number
  depreciationProgress: number
  remainingMonths: number
  isFullyDepreciated: boolean
}

function dateDiffMonths(from: Date, to: Date): number {
  const y = to.getFullYear() - from.getFullYear()
  const m = to.getMonth() - from.getMonth()
  let months = y * 12 + m
  if (to.getDate() >= from.getDate()) months++
  return Math.max(0, months)
}

export function calcDepreciation(input: AssetDepreciationInput): AssetDepreciationResult {
  const installDateStr = input.installDate || input.purchaseDate
  const install = new Date(installDateStr)
  const now = new Date()

  const totalMonths = input.depreciationYears * 12
  const depreciable = input.purchasePrice * (1 - input.residualRate)
  const monthlyDepreciation = depreciable / totalMonths

  const accumulatedMonths = dateDiffMonths(install, now)
  const actualAccMonths = Math.min(accumulatedMonths, totalMonths)

  const accumulatedDepreciation = monthlyDepreciation * actualAccMonths
  const residual = input.purchasePrice * input.residualRate
  const netValue = Math.max(residual, input.purchasePrice - accumulatedDepreciation)
  const depreciationProgress = (accumulatedMonths / totalMonths) * 100
  const remainingMonths = Math.max(0, totalMonths - accumulatedMonths)
  const isFullyDepreciated = accumulatedMonths >= totalMonths

  return {
    monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
    accumulatedMonths,
    accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
    netValue: Math.round(netValue * 100) / 100,
    depreciationProgress: Math.round(depreciationProgress * 100) / 100,
    remainingMonths,
    isFullyDepreciated
  }
}

// ============================================================
// 6. 资产状态流转
// ============================================================
export type AssetStatus = 'idle' | 'installing' | 'inService' | 'repairing' | 'scrapped' | 'recycled'

export const assetStatusFlow: Record<AssetStatus, AssetStatus[]> = {
  idle: ['installing'],
  installing: ['inService', 'idle'],
  inService: ['repairing', 'scrapped'],
  repairing: ['inService', 'scrapped'],
  scrapped: ['recycled']
}

export const assetStatusLabel: Record<AssetStatus, string> = {
  idle: '闲置',
  installing: '安装中',
  inService: '在役',
  repairing: '维修中',
  scrapped: '已报废',
  recycled: '已回收'
}

export function canTransition(from: AssetStatus, to: AssetStatus): boolean {
  if (from === to) return true
  const allowed = assetStatusFlow[from] || []
  return allowed.includes(to)
}

// ============================================================
// 7. 辅助：质保剩余天数
// ============================================================
export function calcWarrantyDays(purchaseDate: string, warrantyYears = 3): number {
  const p = new Date(purchaseDate)
  const expiry = new Date(p.getFullYear() + warrantyYears, p.getMonth(), p.getDate())
  const now = new Date()
  const ms = expiry.getTime() - now.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function calcWarrantyDate(purchaseDate: string, warrantyYears = 3): string {
  const p = new Date(purchaseDate)
  const expiry = new Date(p.getFullYear() + warrantyYears, p.getMonth(), p.getDate())
  return `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, '0')}-${String(expiry.getDate()).padStart(2, '0')}`
}
