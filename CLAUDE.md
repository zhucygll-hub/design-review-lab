# AI设计评审实验室 — 项目总结

> 最后更新: 2026-06-07
> 构建状态: ✅ `npm run build` 通过 (0 TS 错误, 9 条路由全部正常)
> 主部署: EdgeOne Pages（国内直连，函数超时 120s）
> GitHub: https://github.com/zhucygll-hub/design-review-lab

## 项目概述

Next.js 16 全栈 Web 应用。AI 驱动的设计作品评审平台，覆盖作品评审（单张设计图/PDF）和作品集评审（完整 PDF 作品集）两大模式。目标用户为设计类学生。

品牌定位：专业、严厉、启发的设计评审工作室，不是 AI 聊天工具。详见 `PRODUCT.md`。

品牌定位：专业、严厉、启发的设计评审工作室，不是 AI 聊天工具。详见 `PRODUCT.md`。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16.2.6 (App Router, Turbopack) |
| 样式 | Tailwind CSS v4 (`@import "tailwindcss"`) |
| 语言 | TypeScript 5 |
| 动画 | Framer Motion |
| 上传 | react-dropzone, pdfjs-dist |
| AI API | 火山方舟 Doubao-Seed-2.0-Pro-260215 (OpenAI-compatible) |
| JSON 修复 | jsonrepair |
| 图表 | Recharts |
| 存储 | localStorage (历史记录), sessionStorage (结果页传参) |

## 环境变量 (.env.local)

```
ARK_API_KEY=<在部署平台环境变量中配置，不要写入仓库>
ARK_MODEL=doubao-seed-2-0-pro-260215
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

## 路由

```
/              → 首页 (工作室风格 Hero + 双入口 + 案例)
/analyze       → 作品评审页 (JPG/PNG, 场景选择: 设计类型/作品形态/评审目的)
/api/analyze   → POST 作品评审 API
/portfolio     → 作品集评审页 (PDF, 含目标岗位输入)
/api/analyze-portfolio → POST 作品集 API (Responses API, input_file)
/result/[id]   → 结果页 (报告导读 + 校准说明 + 雷达图 + 导师点评)
/history       → 历史记录
```

## 评分体系: S/A+/A/B/C/D/E（7 档）

| 档位 | 分数 | 标签 |
|---|---|---|
| S | 93-100 | 卓越 / Superlative — 国际顶级竞赛 |
| A+ | 88-92 | 优异 / Outstanding — 全国级优秀 |
| A | 82-87 | 优秀 / Excellent — 校级优秀 |
| B | 74-81 | 良好 / Good — 设计学生正常水平 |
| C | 67-73 | 一般 / Average — 低于竞争线 |
| D | 60-66 | 需改进 — 毫无竞争力 |
| E | 0-59 | 不足 — 无法称之为作品 |

## 评分稳定性机制（4 层防线）

### 防线 1: AI 调用层
- `temperature: 0, top_p: 1, seed: 42` — 最大确定性（重试也保持 seed）
- `thinking: { type: 'disabled' }` — 禁推理链，固定输出模式
- 动态评分流水线: 作品形式判断 → 形态专属红牌检查 → 场景维度评分 → 等级判定 → calibrationNote
- AI 不直接给总分 — Prompt 声明 scoreNumeric 会被外部重算
- 系统提示词按 workForm 动态生成，不同形态有独立评价标准、红牌规则和导师指南

### 防线 2: normalizeAnalysisResult（服务端校准）
```
AI 返回 JSON
  → Step 1: clamp 维度分数 0-100
  → Step 2: calculateWeightedScore() 强制重算总分（无视 AI 的 scoreNumeric）
  → Step 3: applyRedFlagCap() — 红牌硬上限
  → Step 4: highScoreCalibration() — 高分区二次校准（5条数值规则 + 视觉审美门）
  → Step 5: numericToScore() 重新推导等级
  → Step 6: 修正 scoreLabel
  → 返回标准化结果 + scoreBreakdown + debug 日志
```

### 防线 3: 红牌规则（代码层强制）
- ≥1 redFlag → max 79 (C 级)
- ≥2 redFlag → max 69 (D 级)
- ≥3 redFlag → max 59 (E 级)

### 防线 4: highScoreCalibration（高分区防越级）
全数值规则，无 NLP 语义分析:
- **视觉审美门**: 视觉 < 70 → ≤73; < 75 → ≤79; < 80 → ≤81; < 85 → ≤87
- 高完成度不能补偿弱视觉审美
- 无 90+ 维度 → ≤87
- 强维度 <3 → ≤89
- 2+ 弱维度 → ≤87
- S 级需 3 个 90+、5 个 85+ 和 1 个 95+

## 结果页透明化

前端通过 `ScoreBreakdown` 展示校准过程：
- **红牌封顶**: 红色卡片列出每条红牌 + 原始加权 vs 封顶后对比
- **高分校准**: 蓝色卡片说明校准原因 + 加权原始 vs 校准后对比
- **边界提示**: 最终分在档位边界 ±3 内时，黄色提示"AI 正常波动可能导致相邻档位变化"
- **AI 备注**: 底部显示 calibrationNote

## 单作品场景系统

7 维动态生成（`lib/single-work-scenario.ts`）：

- 固定核心 5 维（75%权重）: 创意与概念(15), 逻辑与叙事(15), 视觉表达(20), 专业完成度(15), 创新价值(10)
- 第 6 维按作品形态（12%）: 展板→信息组织与阅读性, 模型→结构与工艺合理性, UI→用户体验, 海报→传播与记忆点, 包装→品牌一致性, 其他→使用场景适配度
- 第 7 维按目的/类型（13%）: 概念→探索价值与思辨深度, 求职→岗位相关性, 等

### 作品形式适配评价（2026-06-07 更新）

AI 系统提示词根据不同 workForm 动态生成评价标准（`lib/ai-analysis-single.ts`）：
- **board**: 版式、图文组织、叙事逻辑、图纸/渲染/说明关系
- **physical_model**: 造型语言、比例、结构、材质工艺、展示角度 — 明确禁止评价不可见的"用户调研/概念推导/市场分析"
- **poster**: 视觉冲击、信息层级、主题表达、传播记忆点
- **ui**: 信息架构、交互逻辑、界面层级、可用性、视觉一致性
- **packaging_brand**: 品牌识别、货架表现、系统一致性、商业可用性
- **other**: 通用视觉与概念评价，不强制要求不存在的信息

每种形态有独立的红牌规则、高分区约束、S级条件、导师点评指南和画面证据类型。
物理模型照片特别增加了"只能评价可见证据"原则 — 禁止将"照片看不到"当作"学生没做"。

## 目录结构

```
ai-portfolio-tutor/
├── PRODUCT.md                          # 产品定位/品牌人格/设计原则
├── PROJECT_HANDOVER.md                 # 项目交接文档（以这份为准）
├── CLAUDE.md                           # 本文 — 项目快速参考
├── edgeone.json                        # EdgeOne 部署配置 (maxDuration: 120)
├── vercel.json                         # Vercel 旧配置（保留但非主力）
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # 首页
│   ├── globals.css                     # 工作室评审报告风格
│   ├── analyze/page.tsx                # 单作品评审页
│   ├── portfolio/page.tsx              # 作品集评审页
│   ├── api/analyze/route.ts            # 单作品 API (Chat Completions)
│   ├── api/analyze-portfolio/route.ts  # 作品集 API (Responses API)
│   ├── result/[id]/page.tsx            # 结果页
│   └── history/page.tsx
├── components/
│   ├── layout/    (TopNav, BottomNav, AppLayout)
│   ├── home/      (HeroSection, EntryCards, FeaturesGrid, CaseShowcase, Testimonials, CareerPreviewCard)
│   ├── analyze/   (UploadZone, ImagePreview, ProgressBar, AIThinking, DimensionList, DesignTypeToggle, ScenarioSelector)
│   ├── portfolio/ (PortfolioUploadZone, TargetInputCard)
│   ├── result/    (ResultInsightPanel, ScoreBadge, RadarChart, MentorReview, ProsConsSection, SuggestionsSection, ExportButton)
│   ├── history/   (HistoryList, EmptyState)
│   └── shared/    (Button 等)
├── hooks/
│   ├── useAnalysis.ts          # 单作品评审状态机
│   ├── usePortfolioAnalysis.ts # 作品集评审 + 交互暂停 (Promise 机制)
│   ├── useHistory.ts           # localStorage + 旧 key 迁移
│   └── useMediaQuery.ts
├── lib/
│   ├── ai-analysis-single.ts    # 单作品 Prompt
│   ├── ai-analysis-portfolio.ts # 作品集 Prompt
│   ├── score-utils.ts           # 权重/计算/normalize/红牌封顶/高分校准/边界检测
│   ├── single-work-scenario.ts  # 场景化维度生成
│   ├── single-work-feedback.ts  # 导师点评模板生成
│   ├── ark-utils.ts             # Ark 请求/重试/JSON修复/错误解析
│   ├── utils.ts                 # getScoreColor, getScoreLabel, formatDate
│   ├── api-utils.ts             # parseApiResponse
│   ├── image-compress.ts        # compressImageClient
│   └── fetch-utils.ts           # fetchWithTimeout
├── types/index.ts               # AnalysisResult, ScoreBreakdown, 场景类型
└── package.json
```

## 部署

### EdgeOne Pages（主力）
- 平台: 腾讯云 EdgeOne Pages
- 函数区域: 北京 (`ap-beijing`)，靠近火山方舟 API
- 函数超时: 120 秒（单作品 90s / 作品集 105s 实际限制）
- 部署方式: GitHub push → EdgeOne 自动构建
- 注意: 预览链接带 `eo_token` 会过期，长期分享用生产域名

### Vercel（备用）
- 保留 `vercel.json` 配置但非主力（国内访问不稳定 + 60s 超时太紧）

## 核心数据流

### 作品评审
```
上传 JPG/PNG
→ 客户端 Canvas 压缩 (compressImageClient, 1024px, quality 0.72)
→ 选择场景: DesignTypeToggle + ScenarioSelector (形态+目的)
→ "开始 AI 分析" → 7维动画 (0%→90%) + fetch POST /api/analyze
→ 服务端: base64 → 豆包 Chat Completions
  (temp=0, top_p=1, seed=42, max_completion_tokens=1800, image_detail=low)
→ AI 返回核心 JSON (score/redFlags/calibrationNote/dimensions)
→ 最多重试 1 次（JSON 不完整时，seed 保持 42）
→ 服务端 buildSingleWorkFeedback() 生成导师点评/优缺点/建议
→ normalizeAnalysisResult: 重算总分 → redFlagCap → highScoreCalibration → 等级
→ 附带 scoreBreakdown (原始加权/封顶后/校准后/边界检测)
→ 前端: parseApiResponse → sessionStorage → /result/[id]
```

### 作品集评审
```
上传 PDF (≤8MB)
→ 首轮 POST /api/analyze-portfolio (无目标信息)
→ 豆包 Responses API (input_file, max_output_tokens=2200, top_p=1)
→ 维度1-6动画 → TargetInputCard (用户输入目标公司/岗位/JD 或跳过)
→ 维度7动画 → 等待首轮/二轮 API
→ normalizeAnalysisResult → sessionStorage → /result/[id]
```

## 设计风格（2026-06-07 更新）

品牌人格: 专业、严厉、启发 — 评审工作室/编辑报告风格

```
背景 #11100E (暖黑) | 纸色 #F4EFE6 | 金 #D6A85A | 绿 #7EB98E | 蓝 #6B9CFF
评审报告卡片: .report-panel 类，纸质感 + 批注排版
避免: 蓝紫光效、过度玻璃拟态、花哨渐变、赛博仪表盘
```

## 当前已知问题

1. **结果页刷新丢失**: 只依赖 sessionStorage，刷新或分享链接会丢失 → 计划 IndexedDB
2. **作品集稳定性弱于单作品**: 仍要求 AI 一次性返回完整结构，未做"核心JSON+服务端生成"分离
3. **导师点评由 AI 生成但带模板兜底**: 单作品评审 AI 现在生成 mentorReviews 并经质量校验（`mentor-review-quality.ts`），不合格时回退到 workForm 感知的模板（`single-work-feedback.ts`）。AI 同时生成 pros/cons/suggestions，同样经过具体性校验。作品集评审同理。
4. **作品集无缩略图**: PDF 无预览图
5. **lint 未通过**: `set-state-in-effect` 等问题待清理
6. **AI 评分固有波动**: 视觉模型即使 temp=0/seed=42 也有 ±2-4 分波动，边界线上可能翻档（前端已有边界提示，但需用户理解）
