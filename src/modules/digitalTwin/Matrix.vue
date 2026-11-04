<template>
  <section class="zg-twin-matrix">
    <!-- 背景装饰层 -->
    <div class="zg-bg">
      <div class="zg-bg__radial zg-bg__radial--a"></div>
      <div class="zg-bg__radial zg-bg__radial--b"></div>
      <div class="zg-bg__noise"></div>
      <div class="zg-bg__stars"></div>
    </div>

    <!-- 顶部导航 -->
    <header class="zg-header">
      <div class="zg-header__left">
        <div class="zg-header__logo">
          <div class="zg-header__logo-icon">
            <Monitor :size="22" />
          </div>
          <div class="zg-header__logo-text">
            <span class="zg-header__title">数字孪生 · 智慧长沙</span>
            <span class="zg-header__subtitle">Digital Twin · Command Center</span>
          </div>
        </div>
      </div>

      <div class="zg-header__center">
        <div class="zg-header__title-main">
          <span class="zg-header__title-main--en">CHANGSHA · YUELU DISTRICT</span>
          <span class="zg-header__title-main--cn">指挥中心大屏</span>
        </div>
      </div>

      <div class="zg-header__right">
        <div class="zg-header__cluster">
          <div class="zg-header__cluster-item" v-for="(n, i) in ['采集层', '边缘层', '平台层', '应用层']" :key="i">
            <span class="zg-header__cluster-dot"></span>
            <span>{{ n }}</span>
          </div>
        </div>
        <div class="zg-header__clock">
          <div class="zg-header__clock--date">{{ currentDate }}</div>
          <div class="zg-header__clock--time">{{ currentTime }}</div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="zg-main">
      <!-- 左侧列 -->
      <div class="zg-col zg-col--left">
        <!-- 左上 4 个 KPI -->
        <div class="zg-panel zg-kpi-panel">
          <div class="zg-panel__header">
            <span class="zg-panel__title">核心指标 · CORE METRICS</span>
          </div>
          <div class="zg-kpi-grid">
            <div class="zg-kpi zg-kpi--online">
              <div class="zg-kpi__label">在线设备</div>
              <div class="zg-kpi__value">
                <span class="zg-kpi__num">{{ kpi.online }}</span>
                <span class="zg-kpi__unit">台</span>
              </div>
              <div class="zg-kpi__trend zg-kpi__trend--up">
                <span>▲ 0.3%</span>
                <span class="zg-kpi__trend-sub">较昨日</span>
              </div>
            </div>

            <div class="zg-kpi zg-kpi--energy">
              <div class="zg-kpi__label">今日能耗</div>
              <div class="zg-kpi__value">
                <span class="zg-kpi__num">{{ kpi.energy }}</span>
                <span class="zg-kpi__unit">MWh</span>
              </div>
              <div class="zg-kpi__trend zg-kpi__trend--down">
                <span>▼ 2.1%</span>
                <span class="zg-kpi__trend-sub">较昨日</span>
              </div>
            </div>

            <div class="zg-kpi zg-kpi--save">
              <div class="zg-kpi__label">年度节能</div>
              <div class="zg-kpi__value">
                <span class="zg-kpi__prefix">¥</span>
                <span class="zg-kpi__num">{{ kpi.save }}</span>
                <span class="zg-kpi__unit">M</span>
              </div>
              <div class="zg-kpi__trend zg-kpi__trend--up">
                <span>▲ 18.7%</span>
                <span class="zg-kpi__trend-sub">同比增长</span>
              </div>
              <div class="zg-kpi__medal">★ VIP</div>
            </div>

            <div class="zg-kpi zg-kpi--alarm">
              <div class="zg-kpi__label">告警待处理</div>
              <div class="zg-kpi__value">
                <span class="zg-kpi__num">{{ kpi.alarm }}</span>
                <span class="zg-kpi__unit">条</span>
              </div>
              <div class="zg-kpi__pulse"></div>
            </div>
          </div>
        </div>

        <!-- 左中：能耗趋势 -->
        <div class="zg-panel">
          <div class="zg-panel__header">
            <span class="zg-panel__title">能耗趋势 · 7 Days Trend</span>
            <span class="zg-panel__extra">单位 MWh</span>
          </div>
          <div class="zg-energy-chart">
            <div class="zg-energy-chart__grid">
              <div class="zg-energy-chart__h" v-for="n in 5" :key="n"></div>
            </div>
            <div class="zg-energy-chart__bars">
              <div
                class="zg-energy-bar"
                v-for="(d, i) in energyData"
                :key="i"
                :style="{ height: d.pct + '%' }"
              >
                <div class="zg-energy-bar__fill"></div>
                <div class="zg-energy-bar__val">{{ d.val }}</div>
                <div class="zg-energy-bar__day">{{ d.day }}</div>
              </div>
            </div>
            <div class="zg-energy-chart__line">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="energyLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#22d3ee" />
                    <stop offset="100%" stop-color="#a78bfa" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="url(#energyLine)"
                  stroke-width="1.5"
                  :points="energyLinePoints"
                />
              </svg>
            </div>
            <div class="zg-energy-chart__minmax">
              <div class="zg-energy-chart__min">MIN · {{ energyMin }}</div>
              <div class="zg-energy-chart__max">MAX · {{ energyMax }}</div>
            </div>
          </div>
        </div>

        <!-- 左下：设备拓扑 -->
        <div class="zg-panel zg-topo-panel">
          <div class="zg-panel__header">
            <span class="zg-panel__title">设备拓扑 · Topology</span>
            <span class="zg-panel__extra">实时链路</span>
          </div>
          <div class="zg-topo">
            <svg viewBox="0 0 360 280" class="zg-topo__svg">
              <defs>
                <linearGradient id="topoLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.8" />
                  <stop offset="100%" stop-color="#a78bfa" stop-opacity="0.8" />
                </linearGradient>
                <filter id="glow2">
                  <feGaussianBlur stdDeviation="2" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              <!-- 连接线 -->
              <line x1="180" y1="40" x2="180" y2="100" stroke="url(#topoLine)" stroke-width="1" class="zg-topo__line" />
              <line x1="110" y1="100" x2="60" y2="160" stroke="url(#topoLine)" stroke-width="1" class="zg-topo__line" />
              <line x1="180" y1="100" x2="180" y2="160" stroke="url(#topoLine)" stroke-width="1" class="zg-topo__line" />
              <line x1="250" y1="100" x2="300" y2="160" stroke="url(#topoLine)" stroke-width="1" class="zg-topo__line" />

              <line x1="60" y1="160" x2="30" y2="230" stroke="#6366f1" stroke-width="0.8" stroke-dasharray="3 2" class="zg-topo__line-dash" />
              <line x1="60" y1="160" x2="70" y2="230" stroke="#6366f1" stroke-width="0.8" stroke-dasharray="3 2" class="zg-topo__line-dash" />
              <line x1="180" y1="160" x2="150" y2="230" stroke="#6366f1" stroke-width="0.8" stroke-dasharray="3 2" class="zg-topo__line-dash" />
              <line x1="180" y1="160" x2="180" y2="230" stroke="#6366f1" stroke-width="0.8" stroke-dasharray="3 2" class="zg-topo__line-dash" />
              <line x1="180" y1="160" x2="210" y2="230" stroke="#6366f1" stroke-width="0.8" stroke-dasharray="3 2" class="zg-topo__line-dash" />
              <line x1="300" y1="160" x2="280" y2="230" stroke="#6366f1" stroke-width="0.8" stroke-dasharray="3 2" class="zg-topo__line-dash" />
              <line x1="300" y1="160" x2="320" y2="230" stroke="#6366f1" stroke-width="0.8" stroke-dasharray="3 2" class="zg-topo__line-dash" />

              <!-- 数据流动画点 -->
              <circle r="2" fill="#22d3ee">
                <animateMotion dur="3s" repeatCount="indefinite" path="M180,40 L180,100" />
              </circle>
              <circle r="2" fill="#22d3ee">
                <animateMotion dur="3s" repeatCount="indefinite" begin="0.5s" path="M180,100 L60,160 L30,230" />
              </circle>
              <circle r="2" fill="#22d3ee">
                <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M180,100 L180,160 L180,230" />
              </circle>
              <circle r="2" fill="#22d3ee">
                <animateMotion dur="3s" repeatCount="indefinite" begin="1.5s" path="M180,100 L300,160 L320,230" />
              </circle>

              <!-- 云端 -->
              <g filter="url(#glow2)">
                <circle cx="180" cy="40" r="22" fill="#0f1e3c" stroke="#22d3ee" stroke-width="1.5" />
                <text x="180" y="44" text-anchor="middle" fill="#22d3ee" font-size="9" font-family="monospace">CLOUD</text>
              </g>

              <!-- 边缘主机 -->
              <g>
                <circle cx="60" cy="160" r="16" fill="#0f1e3c" stroke="#a78bfa" stroke-width="1.2" />
                <text x="60" y="163" text-anchor="middle" fill="#a78bfa" font-size="7">EDGE-1</text>

                <circle cx="180" cy="160" r="16" fill="#0f1e3c" stroke="#a78bfa" stroke-width="1.2" />
                <text x="180" y="163" text-anchor="middle" fill="#a78bfa" font-size="7">EDGE-2</text>

                <circle cx="300" cy="160" r="16" fill="#0f1e3c" stroke="#a78bfa" stroke-width="1.2" />
                <text x="300" y="163" text-anchor="middle" fill="#a78bfa" font-size="7">EDGE-3</text>
              </g>

              <!-- 灯杆簇 -->
              <g v-for="(n, i) in [30, 70, 150, 180, 210, 280, 320]" :key="i">
                <circle :cx="n" cy="230" r="8" fill="#0f1e3c" stroke="#34d399" stroke-width="1" />
                <circle :cx="n" cy="230" r="3" fill="#34d399" class="zg-topo__pulse" />
              </g>

              <!-- 在线统计 -->
              <text x="180" y="270" text-anchor="middle" fill="#94a3b8" font-size="9">
                在线 12,847 / 总数 13,021 · 在线率 98.7%
              </text>
            </svg>
          </div>
        </div>
      </div>

      <!-- 中央：数字孪生 3D 城市鸟瞰 -->
      <div class="zg-col zg-col--center">
        <div class="zg-panel zg-city-panel">
          <div class="zg-panel__header zg-panel__header--center">
            <span class="zg-panel__title">长沙市岳麓区 · 实时数字孪生</span>
            <div class="zg-panel__legend">
              <span class="zg-legend"><i style="background:#3b82f6"></i>灯杆 12,847</span>
              <span class="zg-legend"><i style="background:#ef4444"></i>摄像头 384</span>
              <span class="zg-legend"><i style="background:#22c55e"></i>充电桩 92</span>
              <span class="zg-legend"><i style="background:#a855f7"></i>5G 24</span>
              <span class="zg-legend"><i style="background:#fbbf24"></i>无人机</span>
            </div>
          </div>

          <div class="zg-city">
            <!-- 3D 透视 -->
            <div class="zg-city__perspective">
              <!-- 背景网格 -->
              <div class="zg-city__grid"></div>

              <!-- 热力图叠加 -->
              <div class="zg-city__heatmap">
                <div class="zg-heat zg-heat--alert" style="left: 38%; top: 30%;"></div>
                <div class="zg-heat zg-heat--energy" style="left: 55%; top: 55%;"></div>
                <div class="zg-heat zg-heat--online" style="left: 22%; top: 62%;"></div>
                <div class="zg-heat zg-heat--alert" style="left: 68%; top: 28%;"></div>
                <div class="zg-heat zg-heat--energy" style="left: 15%; top: 40%;"></div>
              </div>

              <!-- SVG 底图 -->
              <svg viewBox="0 0 600 400" class="zg-city__svg" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#1e40af" />
                    <stop offset="50%" stop-color="#22d3ee" />
                    <stop offset="100%" stop-color="#1e40af" />
                  </linearGradient>
                  <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#14532d" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#166534" stop-opacity="0.5" />
                  </linearGradient>
                  <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
                    <stop offset="50%" stop-color="#ffffff" stop-opacity="1" />
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0.8" />
                  </linearGradient>
                  <filter id="roadGlow">
                    <feGaussianBlur stdDeviation="1.5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="nodeGlow">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                <!-- 湘江 -->
                <path
                  class="zg-city__river"
                  d="M 0,160 C 80,150 150,200 220,180 C 300,160 380,220 450,200 C 520,180 580,220 600,210 L 600,240 C 520,250 450,210 380,230 C 300,250 220,200 150,220 C 80,240 20,200 0,210 Z"
                  fill="url(#riverGrad)"
                  opacity="0.6"
                />
                <path
                  class="zg-city__river-flow"
                  d="M 0,170 C 80,160 150,210 220,190 C 300,170 380,230 450,210 C 520,190 580,230 600,220"
                  fill="none"
                  stroke="#67e8f9"
                  stroke-width="2"
                  stroke-dasharray="20 15"
                  opacity="0.8"
                />

                <!-- 岳麓山（简化轮廓） -->
                <path
                  d="M 60,60 C 90,40 130,45 160,55 C 190,65 220,50 250,70 C 270,85 280,110 260,130 C 240,150 200,145 180,160 C 150,180 100,170 70,150 C 40,130 30,90 60,60 Z"
                  fill="url(#mountainGrad)"
                  stroke="#22c55e"
                  stroke-width="1"
                  stroke-opacity="0.6"
                />
                <!-- 岳麓山轮廓发光 -->
                <path
                  d="M 60,60 C 90,40 130,45 160,55 C 190,65 220,50 250,70 C 270,85 280,110 260,130 C 240,150 200,145 180,160 C 150,180 100,170 70,150 C 40,130 30,90 60,60"
                  fill="none"
                  stroke="#22c55e"
                  stroke-width="1.5"
                  class="zg-city__mountain-outline"
                  filter="url(#roadGlow)"
                />
                <text x="155" y="110" fill="#86efac" font-size="10" font-family="monospace" opacity="0.9">岳麓山</text>

                <!-- 橘子洲头 -->
                <ellipse cx="330" cy="195" rx="28" ry="8" fill="#14532d" stroke="#22c55e" stroke-width="0.8" opacity="0.8" />
                <ellipse cx="330" cy="195" rx="20" ry="5" fill="#166534" opacity="0.7" />
                <text x="330" y="215" fill="#86efac" font-size="8" text-anchor="middle" font-family="monospace">橘子洲头</text>

                <!-- 梅溪湖 -->
                <ellipse cx="130" cy="290" rx="40" ry="18" fill="#0c4a6e" stroke="#0ea5e9" stroke-width="0.8" opacity="0.7" />
                <text x="130" y="295" fill="#7dd3fc" font-size="8" text-anchor="middle" font-family="monospace">梅溪湖</text>

                <!-- 先导路 -->
                <path d="M 20,110 L 580,90" stroke="#ffffff" stroke-width="2" stroke-opacity="0.9" filter="url(#roadGlow)" />
                <path d="M 20,110 L 580,90" stroke="#e0e7ff" stroke-width="0.5" stroke-dasharray="8 6" opacity="0.7" />

                <!-- 麓谷大道 -->
                <path d="M 80,20 L 100,380" stroke="#ffffff" stroke-width="2" stroke-opacity="0.9" filter="url(#roadGlow)" />
                <path d="M 80,20 L 100,380" stroke="#e0e7ff" stroke-width="0.5" stroke-dasharray="8 6" opacity="0.7" />

                <!-- 金星大道 -->
                <path d="M 280,20 L 320,380" stroke="#ffffff" stroke-width="2" stroke-opacity="0.9" filter="url(#roadGlow)" />
                <path d="M 280,20 L 320,380" stroke="#e0e7ff" stroke-width="0.5" stroke-dasharray="8 6" opacity="0.7" />

                <!-- 其他道路 -->
                <path d="M 20,260 L 580,320" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" />
                <path d="M 450,20 L 480,380" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" />
                <path d="M 20,180 L 580,150" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4" />

                <!-- 道路标签 -->
                <text x="440" y="82" fill="#c7d2fe" font-size="8" font-family="monospace" opacity="0.8">先导路</text>
                <text x="55" y="195" fill="#c7d2fe" font-size="8" font-family="monospace" opacity="0.8" transform="rotate(-90,55,195)">麓谷大道</text>
                <text x="330" y="200" fill="#c7d2fe" font-size="8" font-family="monospace" opacity="0.8" transform="rotate(90,330,200)">金星大道</text>

                <!-- 发光节点 -->
                <g v-for="(n, i) in nodes" :key="i">
                  <circle
                    :cx="n.x"
                    :cy="n.y"
                    :r="n.r || 3"
                    :fill="n.color"
                    filter="url(#nodeGlow)"
                    class="zg-node zg-node--pulse"
                    :style="{ animationDelay: (i * 0.15) + 's' }"
                  />
                  <circle
                    :cx="n.x"
                    :cy="n.y"
                    :r="(n.r || 3) + 4"
                    :fill="n.color"
                    opacity="0.15"
                    class="zg-node-ring"
                    :style="{ animationDelay: (i * 0.15) + 's' }"
                  />
                </g>

                <!-- 无人机飞行轨迹 -->
                <path
                  id="dronePath"
                  d="M 100,100 C 180,80 250,150 330,195"
                  fill="none"
                  stroke="#fbbf24"
                  stroke-width="1"
                  stroke-dasharray="4 4"
                  opacity="0.6"
                />

                <!-- 无人机图标 -->
                <g filter="url(#nodeGlow)">
                  <circle r="4" fill="#fbbf24">
                    <animateMotion dur="12s" repeatCount="indefinite" rotate="auto" path="M 100,100 C 180,80 250,150 330,195" />
                  </circle>
                  <text fill="#fde68a" font-size="7" text-anchor="middle">
                    <animateMotion dur="12s" repeatCount="indefinite" rotate="auto" path="M 100,100 C 180,80 250,150 330,195" />
                    🛩
                  </text>
                </g>
              </svg>

              <!-- 城市顶部 HUD 覆盖 -->
              <div class="zg-city__hud">
                <div class="zg-city__hud-corner zg-city__hud-corner--tl"></div>
                <div class="zg-city__hud-corner zg-city__hud-corner--tr"></div>
                <div class="zg-city__hud-corner zg-city__hud-corner--bl"></div>
                <div class="zg-city__hud-corner zg-city__hud-corner--br"></div>
                <div class="zg-city__hud-label">
                  <span>27.9486°N · 112.9412°E</span>
                  <span>Alt 45m · Scale 1:20000</span>
                </div>
              </div>
            </div>

            <!-- 3D 立体柱群（远景） -->
            <div class="zg-city__buildings">
              <div class="zg-bldg" v-for="(b, i) in buildings" :key="i" :style="b"></div>
            </div>
          </div>

          <!-- 底部数据条 -->
          <div class="zg-city__data-bar">
            <div class="zg-city__data-stat" v-for="(s, i) in cityStats" :key="i">
              <span class="zg-city__data-val">{{ s.val }}</span>
              <span class="zg-city__data-lbl">{{ s.lbl }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="zg-col zg-col--right">
        <!-- 右上：告警实时流 -->
        <div class="zg-panel zg-alarm-panel">
          <div class="zg-panel__header">
            <span class="zg-panel__title">告警实时流 · Alerts</span>
            <span class="zg-panel__extra zg-panel__extra--alarm"><WarningFilled :size="14" /> {{ kpi.alarm }} 待处理</span>
          </div>
          <div class="zg-alarm-list">
            <div class="zg-alarm-scroll">
              <div
                class="zg-alarm"
                :class="'zg-alarm--' + a.level"
                v-for="(a, i) in alarmStream"
                :key="i"
              >
                <span class="zg-alarm__dot"></span>
                <span class="zg-alarm__time">{{ a.time }}</span>
                <span class="zg-alarm__loc">{{ a.loc }}</span>
                <span class="zg-alarm__desc">{{ a.desc }}</span>
                <span class="zg-alarm__level">{{ a.level === 'critical' ? '紧急' : a.level === 'warn' ? '警告' : '提示' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右中：实时数据面板 -->
        <div class="zg-panel">
          <div class="zg-panel__header">
            <span class="zg-panel__title">实时数据 · Live Telemetry</span>
          </div>
          <div class="zg-live-grid">
            <div class="zg-live">
              <div class="zg-live__icon"><Cpu :size="18" /></div>
              <div class="zg-live__content">
                <div class="zg-live__val">{{ live.illuminance }}<span class="zg-live__unit">lux</span></div>
                <div class="zg-live__lbl">平均照度</div>
              </div>
            </div>
            <div class="zg-live">
              <div class="zg-live__icon"><Connection :size="18" /></div>
              <div class="zg-live__content">
                <div class="zg-live__val">{{ live.onlineRate }}<span class="zg-live__unit">%</span></div>
                <div class="zg-live__lbl">设备在线率</div>
              </div>
            </div>
            <div class="zg-live">
              <div class="zg-live__icon"><Refresh :size="18" /></div>
              <div class="zg-live__content">
                <div class="zg-live__val">{{ live.response }}<span class="zg-live__unit">min</span></div>
                <div class="zg-live__lbl">平均响应</div>
              </div>
            </div>
            <div class="zg-live">
              <div class="zg-live__icon"><Coin :size="18" /></div>
              <div class="zg-live__content">
                <div class="zg-live__val">¥{{ live.revenue }}<span class="zg-live__unit">k</span></div>
                <div class="zg-live__lbl">月度杆桩收入</div>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="zg-progress-block">
            <div class="zg-progress">
              <div class="zg-progress__label"><span>节能达成</span><span>{{ energySavePct }}%</span></div>
              <div class="zg-progress__bar">
                <div class="zg-progress__fill" :style="{ width: energySavePct + '%' }"></div>
              </div>
            </div>
            <div class="zg-progress">
              <div class="zg-progress__label"><span>告警处置率</span><span>{{ alarmHandlePct }}%</span></div>
              <div class="zg-progress__bar">
                <div class="zg-progress__fill zg-progress__fill--warn" :style="{ width: alarmHandlePct + '%' }"></div>
              </div>
            </div>
            <div class="zg-progress">
              <div class="zg-progress__label"><span>设备健康度</span><span>{{ healthPct }}%</span></div>
              <div class="zg-progress__bar">
                <div class="zg-progress__fill zg-progress__fill--ok" :style="{ width: healthPct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右下：杆桩运营饼图 -->
        <div class="zg-panel">
          <div class="zg-panel__header">
            <span class="zg-panel__title">杆桩商业化 · Revenue Mix</span>
            <span class="zg-panel__extra">月均 ¥284,000</span>
          </div>
          <div class="zg-pie">
            <div class="zg-pie__chart">
              <svg viewBox="0 0 120 120" class="zg-pie__svg">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#0f1e3c" stroke-width="14" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#3b82f6" stroke-width="14"
                  stroke-dasharray="100 283" stroke-dashoffset="0" transform="rotate(-90 60 60)" class="zg-pie__seg" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#22d3ee" stroke-width="14"
                  stroke-dasharray="80 283" stroke-dashoffset="-100" transform="rotate(-90 60 60)" class="zg-pie__seg" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#a78bfa" stroke-width="14"
                  stroke-dasharray="68 283" stroke-dashoffset="-180" transform="rotate(-90 60 60)" class="zg-pie__seg" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#34d399" stroke-width="14"
                  stroke-dasharray="35 283" stroke-dashoffset="-248" transform="rotate(-90 60 60)" class="zg-pie__seg" />
                <text x="60" y="58" text-anchor="middle" fill="#e2e8f0" font-size="10" font-family="monospace">¥284k</text>
                <text x="60" y="72" text-anchor="middle" fill="#64748b" font-size="7">TOTAL</text>
              </svg>
            </div>
            <div class="zg-pie__legend">
              <div class="zg-pie__item" v-for="(c, i) in pieData" :key="i">
                <span class="zg-pie__dot" :style="{ background: c.color }"></span>
                <span class="zg-pie__name">{{ c.name }}</span>
                <span class="zg-pie__val">{{ c.pct }}%</span>
                <div class="zg-pie__bar"><div :style="{ width: c.pct + '%', background: c.color }"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部横条 -->
    <footer class="zg-footer">
      <div class="zg-footer__left">
        <div class="zg-footer__title">能耗 · 7 天走势</div>
        <div class="zg-footer__bars">
          <div class="zg-footer-bar" v-for="(d, i) in energyData" :key="i" :style="{ '--h': d.pct + '%' }">
            <span class="zg-footer-bar__val">{{ d.val }}</span>
            <span class="zg-footer-bar__fill"></span>
            <span class="zg-footer-bar__day">{{ d.day }}</span>
          </div>
        </div>
      </div>
      <div class="zg-footer__right">
        <div class="zg-footer__led">
          <div class="zg-footer__led-title">
            <span class="zg-footer__led-icon"><Bell :size="16" /></span>
            <span>实时日志 · LIVE LOG</span>
          </div>
          <div class="zg-footer__led-scroller">
            <div class="zg-footer__led-track">
              <div class="zg-footer__led-item" v-for="(l, i) in ledLogs" :key="i">{{ l }}</div>
              <div class="zg-footer__led-item" v-for="(l, i) in ledLogs" :key="'d' + i">{{ l }}</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  Monitor,
  Connection,
  Histogram,
  WarningFilled,
  TrendCharts,
  Coin,
  Cpu,
  Camera,
  Bell,
  Refresh,
} from '@element-plus/icons-vue';

// ========= 时钟 =========
const currentDate = ref('');
const currentTime = ref('');
let timerClock = null;

const pad = (n) => (n < 10 ? '0' + n : '' + n);
function updateClock() {
  const d = new Date();
  const wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
  currentDate.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${wk}`;
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ========= KPI（带跳动） =========
const kpi = reactive({
  online: 12847,
  energy: '384.2',
  save: '5.6',
  alarm: 7,
});
let timerKpi = null;

// ========= 实时数据 =========
const live = reactive({
  illuminance: 85,
  onlineRate: 98.7,
  response: 3.2,
  revenue: '284',
});
let timerLive = null;

// ========= 能耗数据 =========
const energyData = [
  { day: '周一', val: '342', pct: 70 },
  { day: '周二', val: '398', pct: 82 },
  { day: '周三', val: '415', pct: 86 },
  { day: '周四', val: '376', pct: 78 },
  { day: '周五', val: '468', pct: 97 },
  { day: '周六', val: '432', pct: 89 },
  { day: '今日', val: '384', pct: 79 },
];
const energyMin = computed(() => Math.min(...energyData.map((e) => parseInt(e.val))))
const energyMax = computed(() => Math.max(...energyData.map((e) => parseInt(e.val))))

// 折线点
const energyLinePoints = computed(() => {
  const w = 300;
  const h = 100;
  const maxV = Math.max(...energyData.map((e) => e.pct))
  return energyData
    .map((d, i) => {
      const x = (i / (energyData.length - 1)) * w;
      const y = h - (d.pct / maxV) * h;
      return `${x},${y}`;
    })
    .join(' ');
});

// ========= 告警流 =========
const alarmStream = [
  { time: '09:23', loc: '先导路#23', desc: '亮度异常偏高', level: 'warn' },
  { time: '09:18', loc: '麓谷大道#87', desc: '离线告警', level: 'critical' },
  { time: '09:12', loc: '梅溪湖#12', desc: '摄像头故障', level: 'warn' },
  { time: '09:05', loc: '金星大道#45', desc: '充电桩过温', level: 'critical' },
  { time: '08:51', loc: '橘子洲头#3', desc: '信号弱', level: 'info' },
  { time: '08:42', loc: '岳麓山南门', desc: 'SOS 按钮触发', level: 'critical' },
  { time: '08:30', loc: '先导路#101', desc: '灯具损坏', level: 'warn' },
  { time: '08:15', loc: '麓谷大道#12', desc: '5G 基站告警', level: 'warn' },
  { time: '07:58', loc: '金星大道#78', desc: '亮度校准', level: 'info' },
  { time: '07:40', loc: '梅溪湖#22', desc: '充电完成', level: 'info' },
];

// ========= 饼图 =========
const pieData = [
  { name: '充电桩运营', color: '#3b82f6', pct: 35 },
  { name: '户外广告', color: '#22d3ee', pct: 28 },
  { name: '5G 基站', color: '#a78bfa', pct: 24 },
  { name: '共享用电', color: '#34d399', pct: 13 },
];

// ========= 进度 =========
const energySavePct = ref(78);
const alarmHandlePct = ref(94);
const healthPct = ref(99);

// ========= 城市节点（30+） =========
const nodes = [
  // 灯杆 - 蓝
  { x: 60, y: 95, color: '#3b82f6' },
  { x: 120, y: 100, color: '#3b82f6' },
  { x: 200, y: 90, color: '#3b82f6' },
  { x: 260, y: 88, color: '#3b82f6' },
  { x: 350, y: 95, color: '#3b82f6' },
  { x: 430, y: 92, color: '#3b82f6' },
  { x: 500, y: 88, color: '#3b82f6' },
  { x: 85, y: 180, color: '#3b82f6' },
  { x: 100, y: 260, color: '#3b82f6' },
  { x: 155, y: 265, color: '#3b82f6' },
  { x: 200, y: 260, color: '#3b82f6' },
  { x: 240, y: 280, color: '#3b82f6' },
  { x: 280, y: 290, color: '#3b82f6' },
  { x: 320, y: 300, color: '#3b82f6' },
  { x: 360, y: 305, color: '#3b82f6' },
  { x: 400, y: 310, color: '#3b82f6' },
  { x: 440, y: 315, color: '#3b82f6' },
  { x: 480, y: 320, color: '#3b82f6' },
  { x: 520, y: 325, color: '#3b82f6' },
  { x: 560, y: 330, color: '#3b82f6' },
  // 摄像头 - 红
  { x: 140, y: 80, color: '#ef4444', r: 4 },
  { x: 300, y: 75, color: '#ef4444', r: 4 },
  { x: 420, y: 78, color: '#ef4444', r: 4 },
  { x: 95, y: 340, color: '#ef4444', r: 4 },
  { x: 220, y: 350, color: '#ef4444', r: 4 },
  { x: 410, y: 355, color: '#ef4444', r: 4 },
  { x: 530, y: 360, color: '#ef4444', r: 4 },
  // 充电桩 - 绿
  { x: 105, y: 210, color: '#22c55e', r: 4 },
  { x: 220, y: 220, color: '#22c55e', r: 4 },
  { x: 350, y: 230, color: '#22c55e', r: 4 },
  { x: 470, y: 240, color: '#22c55e', r: 4 },
  { x: 150, y: 320, color: '#22c55e', r: 4 },
  { x: 310, y: 335, color: '#22c55e', r: 4 },
  // 5G 基站 - 紫
  { x: 120, y: 55, color: '#a855f7', r: 5 },
  { x: 280, y: 45, color: '#a855f7', r: 5 },
  { x: 450, y: 50, color: '#a855f7', r: 5 },
  { x: 550, y: 40, color: '#a855f7', r: 5 },
  { x: 70, y: 370, color: '#a855f7', r: 5 },
  { x: 250, y: 370, color: '#a855f7', r: 5 },
  { x: 500, y: 380, color: '#a855f7', r: 5 },
];

// ========= 远景建筑 =========
const buildings = [
  { left: '3%', bottom: '2%', width: '18px', height: '30px' },
  { left: '8%', bottom: '2%', width: '22px', height: '45px' },
  { left: '14%', bottom: '2%', width: '16px', height: '25px' },
  { left: '20%', bottom: '2%', width: '24px', height: '55px' },
  { left: '28%', bottom: '2%', width: '20px', height: '40px' },
  { left: '34%', bottom: '2%', width: '28px', height: '70px' },
  { left: '42%', bottom: '2%', width: '18px', height: '35px' },
  { left: '48%', bottom: '2%', width: '22px', height: '50px' },
  { left: '55%', bottom: '2%', width: '26px', height: '60px' },
  { left: '62%', bottom: '2%', width: '20px', height: '38px' },
  { left: '68%', bottom: '2%', width: '24px', height: '52px' },
  { left: '75%', bottom: '2%', width: '18px', height: '30px' },
  { left: '82%', bottom: '2%', width: '22px', height: '42px' },
  { left: '88%', bottom: '2%', width: '20px', height: '35px' },
  { left: '93%', bottom: '2%', width: '16px', height: '28px' },
];

// ========= 城市统计 =========
const cityStats = [
  { val: '12,847', lbl: '接入设备' },
  { val: '384', lbl: '视频监控' },
  { val: '92', lbl: '充电桩' },
  { val: '24', lbl: '无人机' },
  { val: '56', lbl: 'SOS 柱' },
];

// ========= LED 日志 =========
const ledLogs = [
  '2026-10-27 09:23 · 先导路#23 · 亮度下调至 80% · 节能 2.4 kWh',
  '2026-10-27 09:22 · 麓谷大道#56 · 自动巡检完成 · 在线',
  '2026-10-27 09:20 · 梅溪湖环湖路 · 临时事件联动 · SOS 取消',
  '2026-10-27 09:18 · 金星大道#128 · 充电完成 · ¥18.50',
  '2026-10-27 09:15 · 岳麓山南门 · 5G 基站数据同步',
  '2026-10-27 09:12 · 橘子洲头景区 · 夜间模式切换 · 亮度 60%',
  '2026-10-27 09:10 · 先导路 · 无人机 3# 起飞巡航',
  '2026-10-27 09:08 · 麓谷工业园 · 能耗高峰预警解除',
  '2026-10-27 09:05 · 政务中心 · 广告屏轮播 · 今日第 18 次',
  '2026-10-27 09:02 · 全市 · 节点在线率 98.7% · 正常',
  '2026-10-27 09:00 · 晨间报告 · 昨夜节能 8.2 MWh',
  '2026-10-27 08:55 · 梅溪湖 · 充电桩 12# 启动 · 功率 7.2kW',
];

// ========= 生命周期 =========
onMounted(() => {
  updateClock();
  timerClock = setInterval(updateClock, 1000);

  timerKpi = setInterval(() => {
    // 在线数 +-1
    kpi.online += Math.floor(Math.random() * 3) - 1;
    if (kpi.online < 12800) kpi.online = 12847;
    // 告警数 偶尔变
    if (Math.random() < 0.3) {
      kpi.alarm = Math.max(3, Math.min(12, kpi.alarm + (Math.random() < 0.5 ? -1 : 1)))
    }
  }, 5000);

  timerLive = setInterval(() => {
    live.illuminance = Math.max(30, Math.min(120, live.illuminance + Math.round(Math.random() * 7 - 3)))
    live.onlineRate = Math.max(97, Math.min(99.9, +(live.onlineRate + (Math.random() - 0.5) * 0.2).toFixed(1)))
    live.response = Math.max(1.5, Math.min(6, +(live.response + (Math.random() - 0.5) * 0.4).toFixed(1)))
  }, 4000);
});

onUnmounted(() => {
  if (timerClock) clearInterval(timerClock);
  if (timerKpi) clearInterval(timerKpi);
  if (timerLive) clearInterval(timerLive);
});
</script>

<style lang="scss" scoped>
.zg-twin-matrix {
  --c-bg-1: #050818;
  --c-bg-2: #0a1628;
  --c-panel-bg: rgba(15, 31, 60, 0.65);
  --c-panel-border: rgba(99, 102, 241, 0.28);
  --c-indigo: #6366f1;
  --c-cyan: #22d3ee;
  --c-purple: #a78bfa;
  --c-green: #34d399;
  --c-amber: #fbbf24;
  --c-red: #ef4444;
  --c-blue: #3b82f6;
  --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, Monaco, monospace;

  position: relative;
  width: 100vw;
  height: 100vh;
  min-width: 1920px;
  min-height: 1080px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(99, 102, 241, 0.18) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 85%, rgba(34, 211, 238, 0.12) 0%, transparent 45%),
    radial-gradient(ellipse at 50% 50%, rgba(167, 139, 250, 0.08) 0%, transparent 60%),
    linear-gradient(135deg, var(--c-bg-1) 0%, var(--c-bg-2) 60%, #081225 100%);
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;

  // 强制隐藏侧边栏
  :deep(.zg-sidebar),
  :deep(.el-aside),
  :deep(.layout-aside) {
    display: none !important;
  }
}

// ========= 背景层 =========
.zg-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  &__radial {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;

    &--a {
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%);
      top: -200px;
      left: -200px;
    }
    &--b {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, transparent 70%);
      bottom: -150px;
      right: -100px;
    }
  }

  &__noise {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.5;
  }

  &__stars {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 10% 20%, rgba(255, 255, 255, 0.6), transparent),
      radial-gradient(1px 1px at 30% 50%, rgba(255, 255, 255, 0.4), transparent),
      radial-gradient(1px 1px at 50% 80%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1px 1px at 70% 30%, rgba(255, 255, 255, 0.3), transparent),
      radial-gradient(1px 1px at 90% 60%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1px 1px at 15% 85%, rgba(255, 255, 255, 0.4), transparent),
      radial-gradient(1px 1px at 85% 15%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(1px 1px at 45% 15%, rgba(255, 255, 255, 0.3), transparent);
  }
}

// ========= 顶部 Header =========
.zg-header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 0 28px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  background: linear-gradient(180deg, rgba(15, 31, 60, 0.6) 0%, transparent 100%);

  &__left,
  &__right {
    flex: 1;
    display: flex;
    align-items: center;
  }
  &__right {
    justify-content: flex-end;
    gap: 24px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__logo-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(34, 211, 238, 0.3));
        border: 1px solid rgba(99, 102, 241, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a5b4fc;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }
  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #e0e7ff;
    letter-spacing: 1px;
    display: block;
  }
  &__subtitle {
    font-size: 10px;
    color: #64748b;
    letter-spacing: 2px;
    font-family: var(--font-mono);
  }

  &__center {
    flex: 2;
    text-align: center;
  }
  &__title-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.1;
    &--en {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 6px;
      color: #6366f1;
      opacity: 0.7;
    }
    &--cn {
      font-size: 26px;
      font-weight: 700;
      background: linear-gradient(90deg, #a5b4fc, #22d3ee, #a78bfa, #a5b4fc);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: neonShift 6s linear infinite;
      text-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
      letter-spacing: 4px;
      margin-top: 4px;
    }
  }

  &__cluster {
    display: flex;
    gap: 14px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: #94a3b8;
  }
  &__cluster-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 4px;
  }
  &__cluster-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 6px #22c55e;
    animation: pulse 2s infinite;
  }

  &__clock {
    text-align: right;
    padding: 6px 12px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 6px;
  }
  &__clock--date {
    font-size: 11px;
    color: #94a3b8;
    font-family: var(--font-mono);
  }
  &__clock--time {
    font-size: 22px;
    font-family: var(--font-mono);
    font-weight: 700;
    color: #22d3ee;
    text-shadow: 0 0 12px rgba(34, 211, 238, 0.7);
    letter-spacing: 2px;
    margin-top: 2px;
  }
}

@keyframes neonShift {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

// ========= 主布局 =========
.zg-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 440px 1fr 440px;
  gap: 18px;
  padding: 18px;
  height: calc(100vh - 72px - 130px);
}

.zg-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;

  &--left,
  &--right {
    > .zg-panel {
      flex: 1;
      min-height: 0;
    }
  }
}

// ========= Panel =========
.zg-panel {
  position: relative;
  background: var(--c-panel-bg);
  border: 1px solid var(--c-panel-border);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;

  // 顶部流光条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background: linear-gradient(90deg, transparent, #6366f1, #a78bfa, #22d3ee, #6366f1, transparent);
    background-size: 200% 100%;
    animation: panelScan 8s linear infinite;
    opacity: 0.8;
  }

  // 四角装饰
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    pointer-events: none;
    border: 1px solid rgba(99, 102, 241, 0.1);
    border-radius: 4px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 10px;
    position: relative;

    &--center {
      padding-bottom: 12px;
    }
  }
  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #e0e7ff;
    letter-spacing: 1px;
    padding-left: 10px;
    position: relative;
    font-family: var(--font-mono);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      background: linear-gradient(180deg, #a78bfa, #6366f1);
      box-shadow: 0 0 8px rgba(167, 139, 250, 0.8);
    }
  }
  &__extra {
    font-size: 11px;
    color: #64748b;
    font-family: var(--font-mono);

    &--alarm {
      color: #f87171;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  &__legend {
    display: flex;
    gap: 14px;
    font-size: 11px;
    color: #94a3b8;
    font-family: var(--font-mono);
  }
}

@keyframes panelScan {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.zg-legend {
  display: flex;
  align-items: center;
  gap: 5px;
  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 6px currentColor;
  }
}

// ========= KPI 面板 =========
.zg-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 4px 18px 18px;
}

.zg-kpi {
  position: relative;
  padding: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(34, 211, 238, 0.04));
    border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 6px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: currentColor;
  }

  &--online { color: #22d3ee; &::before { background: #22d3ee; } }
  &--energy { color: #a78bfa; &::before { background: #a78bfa; } }
  &--save { color: #34d399; &::before { background: #34d399; } }
  &--alarm { color: #f87171; &::before { background: #f87171; } }

  &__label {
    font-size: 12px;
    color: #94a3b8;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  &__value {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }
  &__num {
    font-family: var(--font-mono);
    font-size: 34px;
    font-weight: 700;
    color: currentColor;
    text-shadow: 0 0 12px currentColor;
    line-height: 1;
  }
  &__unit {
    font-size: 13px;
    color: #94a3b8;
    font-family: var(--font-mono);
  }
  &__prefix {
    font-size: 18px;
    margin-right: 2px;
  }
  &__trend {
    margin-top: 8px;
    font-size: 11px;
    font-family: var(--font-mono);
    display: flex;
    align-items: center;
    gap: 8px;

    &--up span:first-child { color: #34d399; }
    &--down span:first-child { color: #f87171; }
    &-sub { color: #64748b; font-size: 10px; }
  }
  &__medal {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 10px;
    padding: 2px 6px;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    color: #000;
    font-weight: 700;
    border-radius: 3px;
    font-family: var(--font-mono);
  }
  &__pulse {
    position: absolute;
    inset: 0;
    border-radius: 6px;
    border: 1px solid #f87171;
    animation: borderPulse 1.5s ease-in-out infinite;
    pointer-events: none;
  }
}

@keyframes borderPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.6); }
  50% { opacity: 0.5; box-shadow: 0 0 0 6px rgba(248, 113, 113, 0); }
}

// ========= 能耗趋势 =========
.zg-energy-chart {
  padding: 0 18px 18px;
  height: calc(100% - 48px);
  position: relative;

  &__grid {
    position: absolute;
    inset: 10px 18px 30px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    opacity: 0.3;
  }
  &__h {
    border-top: 1px dashed rgba(99, 102, 241, 0.3);
  }
  &__bars {
    position: relative;
    height: calc(100% - 30px);
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 10px 0 0;
  }
  &__line {
    position: absolute;
    inset: 10px 0 30px 0;
    pointer-events: none;
  }
  &__minmax {
    position: absolute;
    top: 8px;
    right: 18px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: #64748b;
    display: flex;
    gap: 14px;
  }
  &__min { color: #22d3ee; }
  &__max { color: #f87171; }
}

.zg-energy-bar {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  &__fill {
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #a78bfa 0%, #6366f1 50%, #22d3ee 100%);
    border-radius: 3px 3px 0 0;
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
      animation: barShine 3s ease-in-out infinite;
    }
  }
  &__val {
    position: absolute;
    top: -4px;
    font-size: 10px;
    font-family: var(--font-mono);
    color: #e2e8f0;
    text-shadow: 0 0 6px rgba(99, 102, 241, 0.8);
  }
  &__day {
    font-size: 11px;
    color: #64748b;
    margin-top: 6px;
  }
}

@keyframes barShine {
  0%, 100% { transform: translateY(-100%); }
  50% { transform: translateY(100%); }
}

// ========= 拓扑 =========
.zg-topo {
  padding: 4px 18px 18px;
  height: calc(100% - 48px);
  display: flex;
  align-items: center;
  justify-content: center;

  &__svg {
    width: 100%;
    height: 100%;
    max-height: 280px;
  }
  &__line {
    stroke-dasharray: 4 3;
    animation: flowDash 2s linear infinite;
  }
  &__line-dash {
    animation: flowDash 3s linear infinite reverse;
  }
  &__pulse {
    animation: nodePulse 2s ease-in-out infinite;
    transform-origin: center;
  }
}

@keyframes flowDash {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -14; }
}

// ========= 中央城市 =========
.zg-city-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.zg-city {
  flex: 1;
  position: relative;
  overflow: hidden;
  margin: 0 12px;
  border-radius: 4px;
  background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.5) 0%, rgba(2, 6, 23, 0.8) 100%);
  perspective: 1200px;
  min-height: 0;
}

.zg-city__perspective {
  position: absolute;
  inset: 0;
  transform: rotateX(12deg) scale(1.02);
  transform-origin: center center;
}

.zg-city__grid {
  position: absolute;
  inset: -10%;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.18) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridPulse 5s ease-in-out infinite;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
}

@keyframes gridPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

.zg-city__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

// 河流流动
.zg-city__river {
  animation: riverFlow 20s linear infinite;
}
.zg-city__river-flow {
  animation: riverFlowDash 8s linear infinite;
}

@keyframes riverFlowDash {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -70; }
}

.zg-city__mountain-outline {
  animation: mountainGlow 3s ease-in-out infinite;
}

@keyframes mountainGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

// 热力图
.zg-city__heatmap {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
.zg-heat {
  position: absolute;
  width: 120px;
  height: 80px;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.45;
  animation: heatPulse 4s ease-in-out infinite;
}
.zg-heat--alert { background: radial-gradient(ellipse, #ef4444 0%, transparent 70%); }
.zg-heat--energy { background: radial-gradient(ellipse, #f59e0b 0%, transparent 70%); }
.zg-heat--online { background: radial-gradient(ellipse, #22c55e 0%, transparent 70%); }

@keyframes heatPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(1.1); }
}

// 发光节点
.zg-node--pulse {
  animation: nodePulse 2.2s ease-in-out infinite;
  transform-origin: center;
}
.zg-node-ring {
  animation: ringExpand 2.2s ease-out infinite;
  transform-origin: center;
}

@keyframes nodePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.6; }
}
@keyframes ringExpand {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(2.2); opacity: 0; }
}

// HUD
.zg-city__hud {
  position: absolute;
  inset: 12px;
  pointer-events: none;
  z-index: 10;
}
.zg-city__hud-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: rgba(99, 102, 241, 0.8);
  border-style: solid;
  border-width: 0;
  &--tl { top: 0; left: 0; border-top-width: 2px; border-left-width: 2px; }
  &--tr { top: 0; right: 0; border-top-width: 2px; border-right-width: 2px; }
  &--bl { bottom: 0; left: 0; border-bottom-width: 2px; border-left-width: 2px; }
  &--br { bottom: 0; right: 0; border-bottom-width: 2px; border-right-width: 2px; }
}
.zg-city__hud-label {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  font-size: 10px;
  color: #64748b;
  font-family: var(--font-mono);
  letter-spacing: 1px;
}

// 远景建筑
.zg-city__buildings {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  height: 100px;
  pointer-events: none;
  opacity: 0.5;
  transform: rotateX(-30deg);
  transform-origin: bottom;
}
.zg-bldg {
  position: absolute;
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.3), rgba(34, 211, 238, 0.1));
    border-top: 1px solid rgba(167, 139, 250, 0.6);
  border-left: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 -4px 20px rgba(99, 102, 241, 0.2);
}

// 数据统计条
.zg-city__data-bar {
  position: relative;
  display: flex;
  justify-content: space-around;
  padding: 10px 18px 14px;
  border-top: 1px solid rgba(99, 102, 241, 0.15);
  margin-top: 8px;
  background: linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.05));
}
.zg-city__data-stat {
    text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.zg-city__data-val {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: #22d3ee;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
}
.zg-city__data-lbl {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 1px;
}

// ========= 告警流 =========
.zg-alarm-list {
  padding: 4px 14px 14px;
  height: calc(100% - 48px);
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%);
}
.zg-alarm-scroll {
  animation: alarmScroll 25s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
}
.zg-alarm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  margin-bottom: 8px;
  background: rgba(15, 23, 42, 0.5);
  border-left: 2px solid #64748b;
  border-radius: 2px;
  font-size: 12px;
  font-family: var(--font-mono);

  &--critical {
    border-left-color: #f87171;
    background: linear-gradient(90deg, rgba(248, 113, 113, 0.15), transparent);
    .zg-alarm__level { color: #f87171; }
    .zg-alarm__dot { background: #f87171; box-shadow: 0 0 8px #f87171; animation: nodePulse 1s infinite; }
  }
  &--warn {
    border-left-color: #fbbf24;
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), transparent);
    .zg-alarm__level { color: #fbbf24; }
    .zg-alarm__dot { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
  }
  &--info {
    border-left-color: #22d3ee;
    .zg-alarm__level { color: #22d3ee; }
    .zg-alarm__dot { background: #22d3ee; box-shadow: 0 0 8px #22d3ee; }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  &__time { color: #64748b; font-size: 11px; }
  &__loc { color: #e0e7ff; font-weight: 500; }
  &__desc { color: #94a3b8; flex: 1; }
  &__level {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    border: 1px solid currentColor;
  }
}

@keyframes alarmScroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

// ========= 实时数据 =========
.zg-live-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 18px;
}

.zg-live {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 6px;

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(34, 211, 238, 0.1));
        border: 1px solid rgba(99, 102, 241, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a5b4fc;
    flex-shrink: 0;
  }
  &__val {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: 700;
    color: #22d3ee;
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
  }
  &__unit {
    font-size: 11px;
    color: #64748b;
    margin-left: 2px;
    font-weight: 400;
  }
  &__lbl {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }
}

.zg-progress-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 18px 18px;
}
.zg-progress {
  &__label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #94a3b8;
    font-family: var(--font-mono);
    margin-bottom: 4px;
  }
  &__bar {
    height: 6px;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgba(99, 102, 241, 0.15);
  }
  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #22d3ee);
    border-radius: 3px;
    transition: width 1s ease;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);

    &--warn { background: linear-gradient(90deg, #f59e0b, #fbbf24); box-shadow: 0 0 8px rgba(251, 191, 36, 0.6); }
    &--ok { background: linear-gradient(90deg, #22c55e, #34d399); box-shadow: 0 0 8px rgba(52, 211, 153, 0.6); }
  }
}

// ========= 饼图 =========
.zg-pie {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 4px 18px 18px;
  height: calc(100% - 48px);

  &__chart {
    flex-shrink: 0;
  }
  &__svg {
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.3)) }
  &__seg {
    animation: pieSpin 1s ease-out;
    transform-origin: center;
  }
  &__legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &__item {
    display: grid;
    grid-template-columns: 10px 1fr 36px;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-family: var(--font-mono);
  }
  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
  &__name { color: #cbd5e1; }
  &__val { color: #22d3ee; text-align: right; }
  &__bar {
    grid-column: 1 / span 3;
    height: 3px;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 2px;
    > div {
      height: 100%;
      border-radius: 2px;
      box-shadow: 0 0 6px currentColor;
    }
  }
}

@keyframes pieSpin {
  from { stroke-dasharray: 0 283; }
}

// ========= 底部 =========
.zg-footer {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 0 18px 18px;
  height: 130px;

  > div {
    background: var(--c-panel-bg);
    border: 1px solid var(--c-panel-border);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 2px;
      width: 100%;
      background: linear-gradient(90deg, transparent, #6366f1, #a78bfa, #22d3ee, transparent);
      background-size: 200% 100%;
      animation: panelScan 8s linear infinite;
    }
  }
}

.zg-footer__left {
  padding: 10px 18px 14px;
  display: flex;
  flex-direction: column;

  &-title {
    font-size: 13px;
    color: #e0e7ff;
    font-family: var(--font-mono);
    padding-left: 10px;
    position: relative;
    letter-spacing: 1px;
    margin-bottom: 8px;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 12px;
      background: linear-gradient(180deg, #22d3ee, #6366f1);
    }
  }
}

.zg-footer__bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding-top: 4px;
}

.zg-footer-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  height: 100%;

  &__fill {
    width: 100%;
    height: var(--h);
    background: linear-gradient(180deg, #a78bfa 0%, #6366f1 50%, #22d3ee 100%);
    border-radius: 3px 3px 0 0;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
    animation: barShine 3s ease-in-out infinite;
  }
  &__val {
    position: absolute;
    top: 0;
    font-size: 10px;
    font-family: var(--font-mono);
    color: #e2e8f0;
  }
  &__day {
    font-size: 10px;
    color: #64748b;
    margin-top: 4px;
  }
}

.zg-footer__right {
  padding: 10px 18px 14px;
  display: flex;
  flex-direction: column;
}

.zg-footer__led {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.zg-footer__led-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #22d3ee;
  font-family: var(--font-mono);
  letter-spacing: 1px;
  margin-bottom: 8px;

  &-icon {
    color: #fbbf24;
    filter: drop-shadow(0 0 6px #fbbf24);
  }
}

.zg-footer__led-scroller {
  flex: 1;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%);
  background: repeating-linear-gradient(
    0deg,
    rgba(99, 102, 241, 0.03) 0px,
    rgba(99, 102, 241, 0.03) 1px,
    transparent 1px,
    transparent 3px
  );
}

.zg-footer__led-track {
  animation: ledScroll 40s linear infinite;
}

.zg-footer__led-item {
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #94a3b8;
  border-bottom: 1px dashed rgba(99, 102, 241, 0.1);
  display: flex;

  &:nth-child(odd) {
    color: #22d3ee;
    opacity: 0.9;
  }
}

@keyframes ledScroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

// ========= 通用 =========
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}
</style>
