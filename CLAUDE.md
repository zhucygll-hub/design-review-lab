# AI设计评审实验室 — 项目总结

> 最后更新: 2026-06-04
> 构建状态: ✅ `npm run build` 通过 (0 TS 错误, 9 条路由全部正常)
> 线上地址 (Vercel): https://design-review-lab.vercel.app
> 线上地址 (EdgeOne): 待部署

## 项目概述

Next.js 16 全栈 Web 应用。AI 驱动的设计作品评审平台，覆盖作品评审（单张设计图）和作品集评审（完整 PDF 作品集）两大模式。目标用户为全体设计类学生。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16.2.6 (App Router, Turbopack) |
| 样式 | Tailwind CSS v4 (`@import "tailwindcss"`) |
| 语言 | TypeScript 5 |
| 动画 | Framer Motion |
| 上传 | react-dropzone |
| 图片压缩 | sharp (服务端) |
| PDF 解析 | pdf-parse (文字提取) + sharp (页面渲染) |
| AI API | 火山方舟 Doubao-Seed-2.0-Pro-260215 (OpenAI-compatible) |
| 存储 | localStorage (历史记录), sessionStorage (结果页传参) |

## 环境变量 (.env.local)

```
ARK_API_KEY=ark-25516a87-f5bf-4025-8434-e2ff8b219aa2-9269b
ARK_MODEL=doubao-seed-2-0-pro-260215
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

## 路由

```
/              → 首页 (Hero + 双入口 + 功能 + 求职预告 + 案例)
/analyze       → 作品评审页 (JPG/PNG)
/api/analyze   → POST 作品评审 API (sharp压缩 → 豆包 → normalize)
/portfolio     → 作品集评审页 (PDF)
/api/analyze-portfolio → POST 作品集 API (PDF解析 → 豆包 → normalize)
/result/[id]   → 结果页 (双模式共用)
/history       → 历史记录 (含模式标签)
```

## 评分体系: S/A+/A/B/C/D/E（7 档）

| 档位 | 分数 | 颜色 | 标签 |
|---|---|---|---|
| S | 93-100 | 金 #F59E0B | 卓越 / Superlative — 国际顶级竞赛 |
| A+ | 88-92 | 翠绿 #10B981 | 优异 / Outstanding — 全国级优秀 |
| A | 82-87 | 绿 #22C55E | 优秀 / Excellent — 校级优秀 |
| B | 74-81 | 蓝 #4F8CFF | 良好 / Good — 设计学生正常水平 |
| C | 67-73 | 琥珀 #F59E0B | 一般 / Average — 低于竞争线 |
| D | 60-66 | 橙 #F97316 | 需改进 — 毫无竞争力 |
| E | 0-59 | 红 #EF4444 | 不足 — 无法称之为作品 |

### 单作品评审维度（固定权重）
1. 创意与概念 (15%)
2. 逻辑与叙事 (15%)
3. 视觉表达 (20%)
4. 用户体验 (10%) — 非交互作品自动 N/A，权重按比例重分配
5. 专业完成度 (15%)
6. 创新价值 (10%)
7. 商业与现实价值 (15%)

### 作品集评审维度（固定权重）
1. 项目质量 (20%)
2. 项目完整度 (15%)
3. 设计思维 (20%)
4. 专业能力 (15%)
5. 视觉表达能力 (10%)
6. 差异化竞争力 (10%)
7. 岗位匹配度 (10%)

## 评分稳定性机制（三层防线）

### 防线 1: AI 调用层
- `temperature: 0, seed: 42` — 最大确定性
- 固定评分流水线: 类型判断 → 红牌检查 → 维度评分 → 等级判定 → calibrationNote
- AI 不直接给总分 — Prompt 声明 scoreNumeric 会被外部重算

### 防线 2: normalizeAnalysisResult（服务端校准）
```
AI 返回 JSON
  → Step 1: clamp 维度分数 0-100
  → Step 2: calculateWeightedScore() 强制重算总分
  → Step 3: applyRedFlagCap() — 红牌硬上限
  → Step 4: highScoreCalibration() — 高分区二次校准
  → Step 5: numericToScore() 重新推导等级
  → Step 6: 修正 scoreLabel
  → 返回标准化结果 + debug 日志
```

### 防线 3: 红牌规则（代码层强制）
- ≥1 redFlag → max 79
- ≥2 redFlag → max 69
- ≥3 redFlag → max 59

### 防线 4: highScoreCalibration（高分区防越级）
全数值规则，无 NLP 语义分析:
- 无 90+ 维度 → ≤87
- 仅 1 强维度 + 3 弱维度 → ≤87
- 强维度 <3 但 ≥90 → ≤89
- 2+ 弱维度 → ≤87
- S 级需 3 个 90+、5 个 85+ 和 1 个 95+

## 目录结构

```
ai-portfolio-tutor/
├── app/
│   ├── layout.tsx                     # 根布局
│   ├── page.tsx                       # 首页
│   ├── globals.css                    # 玻璃拟态/渐变/动画
│   ├── analyze/page.tsx               # 作品评审页
│   ├── portfolio/page.tsx             # 作品集评审页
│   ├── api/analyze/route.ts           # 作品评审 API (temp=0, seed=42, normalize)
│   ├── api/analyze-portfolio/route.ts # 作品集 API (temp=0, seed=42, normalize)
│   ├── result/[id]/page.tsx           # 结果页
│   └── history/page.tsx               # 历史页
├── components/
│   ├── layout/    (TopNav, BottomNav, AppLayout)
│   ├── home/      (HeroSection, EntryCards, FeaturesGrid, CaseShowcase, Testimonials, CareerPreviewCard)
│   ├── analyze/   (UploadZone, ImagePreview, ProgressBar, AIThinking, DimensionList, DesignTypeToggle)
│   ├── portfolio/ (PortfolioUploadZone, TargetInputCard)
│   ├── result/    (ScoreBadge, RadarChart, MentorReview, ProsConsSection, SuggestionsSection, ExportButton)
│   ├── history/   (HistoryList, EmptyState)
│   └── shared/    (GlassCard, GradientText, AnimatedCounter, Badge, Button)
├── hooks/
│   ├── useAnalysis.ts          # 作品评审状态机
│   ├── usePortfolioAnalysis.ts # 作品集评审 + 交互暂停 (Promise 机制)
│   ├── useHistory.ts           # localStorage + 旧 key 迁移
│   └── useMediaQuery.ts
├── lib/
│   ├── ai-analysis-single.ts    # 单作品 Prompt (7维+designType切换+redFlags)
│   ├── ai-analysis-portfolio.ts # 作品集 Prompt (同上)
│   ├── score-utils.ts           # 权重表 + 计算 + normalize + highScoreCalibration + redFlagCap
│   ├── utils.ts                 # getScoreColor(7级), getScoreLabel(7级), formatDate
│   ├── api-utils.ts             # [新] parseApiResponse — 防 Vercel HTML 错误页崩溃
│   ├── image-compress.ts        # [新] compressImageClient — 浏览器端 Canvas 压缩
│   ├── fetch-utils.ts           # [新] fetchWithTimeout — 超时保护
│   └── mock-data.ts             # Mock 数据 (含 redFlags)
├── types/index.ts               # NewScore(7档), DesignType, AnalysisResult, HistoryItem
├── .env.local
├── vercel.json                  # Vercel 部署配置 (API maxDuration: 60s)
└── package.json
```

## 部署

### Vercel（当前线上）
- 地址: https://design-review-lab.vercel.app
- GitHub 仓库: https://github.com/zhucygll-hub/design-review-lab
- 自动部署: 推送到 master → Vercel 自动构建
- 环境变量在 Vercel Dashboard → Settings → Environment Variables 中配置
- 函数超时: 60 秒 (Hobby 套餐上限)
- 请求体限制: 4.5MB（通过客户端压缩规避）
- 已知问题: `.vercel.app` 域名国内需 VPN 访问；API 生成时间可能超时

### EdgeOne Pages（计划中 — 国内免 VPN 访问）
- 平台: 腾讯云 EdgeOne Pages（公测免费）
- 优势: 国内节点直连、函数超时远高于 60s、不需备案
- 部署方式: 同 Vercel — GitHub 授权 → 导入项目 → 配置环境变量 → 自动部署
- 待部署前: 恢复 max_tokens 4096、恢复 200 字点评、恢复 5 条建议

### 环境变量列表（两个平台都需配置）
```
ARK_API_KEY=ark-25516a87-f5bf-4025-8434-e2ff8b219aa2-9269b
ARK_MODEL=doubao-seed-2-0-pro-260215
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

## 核心数据流

### 作品评审
```
上传 JPG/PNG
→ 客户端 Canvas 压缩 (compressImageClient, 1200px, quality 0.8)
→ 预览 + 选择设计类型 (DesignTypeToggle: 商业/概念)
→ "开始 AI 分析" → startAnalysis() → 7维动画 (0%→90%)
  + POST /api/analyze (FormData: compressed file + designType)
→ 服务端: sharp压缩1024px → base64 → 豆包 (fetchWithTimeout 55s, max_tokens 2048, temp=0, seed=42)
→ normalizeAnalysisResult: 重算总分 → redFlagCap → highScoreCalibration → 等级
→ 客户端 parseApiResponse 安全解析 → sessionStorage → /result/[id]
```

### 作品集评审（含交互暂停）
```
上传 PDF → 预览 + "开始 AI 分析"
→ 首轮 API 发出 (无目标信息)
→ 维度1-6动画 → isAwaitingTargetInput=true → TargetInputCard
→ 用户提交/跳过 → 二次API (可选) → 维度7动画 → 等待API
→ normalizeAnalysisResult → sessionStorage → /result/[id]
```

## 颜色主题

```
背景 #0A0A0A | 主色 #FFFFFF | 强调 #4F8CFF | 辅助 #7C3AED
S #F59E0B | A+ #10B981 | A #22C55E | B #4F8CFF | C #F59E0B | D #F97316 | E #EF4444
玻璃拟态: rgba(255,255,255,0.03) + border rgba(255,255,255,0.08) + blur(24px)
```

## 本次会话改动 (2026-06-04)

### 评分稳定性优化（第1轮）
- `lib/ai-analysis-single.ts` — Prompt 加流水线/redFlags/权重/禁 AI 自由总分
- `lib/ai-analysis-portfolio.ts` — 同上
- `lib/score-utils.ts` — 新增 normalizeAnalysisResult（6步校准+debug日志）+ applyRedFlagCap + 固定权重表（单作品+作品集）
- `app/api/analyze/route.ts` — temperature→0, seed:42, 调用 normalizeAnalysisResult
- `app/api/analyze-portfolio/route.ts` — 同上
- `types/index.ts` — AnalysisResult 新增 redFlags: string[]
- `lib/mock-data.ts` — 补 redFlags: []

### 7档评分体系（第2轮）
- `types/index.ts` — NewScore: S|A+|A|B|C|D|E；AnalysisResult 新增 calibrationNote
- `lib/utils.ts` — getScoreColor: A+→#10B981, D→#F97316, E→#EF4444；getScoreLabel: 新增 A+("优异") 和 E("不足")
- `lib/score-utils.ts` — numericToScore 新边界(93/88/82/74/67/60)；新增 highScoreCalibration（5条数值规则）
- `lib/ai-analysis-single.ts` — Prompt 重写：7级锚点+子锚点+五条件S门槛+高分区约束+calibrationNote
- `lib/ai-analysis-portfolio.ts` — 同上适配作品集

### 概念/商业设计类型切换（第3轮）
- `types/index.ts` — 新增 `DesignType = 'commercial' | 'concept'`，AnalysisResult/HistoryItem 各加 `designType?`
- `lib/ai-analysis-single.ts` — `buildAnalysisPrompt(designType?)` 接受参数，概念模式下维度7评估标准从"落地性"切换为"探索价值/思想深度"
- `components/analyze/DesignTypeToggle.tsx` — **新文件** — 二选一分段控件，🏢商业/落地（默认）+ 💡概念/实验
- `hooks/useAnalysis.ts` — UploadState 加 designType，新增 setDesignType setter
- `app/api/analyze/route.ts` — 读取 designType → 传给 buildAnalysisPrompt → 写入 response
- `app/analyze/page.tsx` — ImagePreview 和按钮之间插入 DesignTypeToggle
- `app/result/[id]/page.tsx` — 显示设计类型标签（概念=紫色，商业=蓝色）
- `components/history/HistoryList.tsx` — 显示设计类型标签

### GitHub + Vercel 部署（第4轮）
- Git init + 推送到 github.com/zhucygll-hub/design-review-lab
- Vercel 自动部署: https://design-review-lab.vercel.app
- 环境变量: ARK_API_KEY, ARK_MODEL, ARK_BASE_URL
- `vercel.json` — maxDuration 60s 配置

### 客户端稳性修复（第5轮 — Vercel 线上调试）
- `lib/image-compress.ts` — **新文件** — compressImageClient (Canvas API, 1200px/jpeg 0.8)
- `lib/api-utils.ts` — **新文件** — parseApiResponse（先读 text→尝试 JSON→失败提取错误信息）
- `lib/fetch-utils.ts` — **新文件** — fetchWithTimeout（55s timeout within 60s Vercel limit）
- `hooks/useAnalysis.ts` — 使用 compressImageClient + parseApiResponse
- `hooks/usePortfolioAnalysis.ts` — 同上
- `app/api/analyze/route.ts` — max_tokens 4096→2048, 使用 fetchWithTimeout, 加 `export const maxDuration = 60`
- `app/api/analyze-portfolio/route.ts` — 同上
- `lib/ai-analysis-single.ts` — 导师点评 200字→80字, suggestions 5→3, pros/cons 4→3
- `lib/ai-analysis-portfolio.ts` — 同上

## 已知待修复

1. **Vercel 国内无法访问**: `.vercel.app` 域名被墙 → 计划迁移 EdgeOne Pages
2. **Vercel 函数超时**: 60s 上限导致不得不砍 token (4096→2048)、砍字数 (200→80字) → EdgeOne 可恢复完整输出
3. **结果页刷新丢失**: sessionStorage 换 IndexedDB
4. **PDF 文字提取**: pdf-parse 为 CommonJS，Turbopack 生产环境待验证
5. **作品集二次 API 延迟**: 用户提供目标后发起完整二次调用而非仅维度7补评
6. **作品集无缩略图**: PDF 在预览区和历史列表无预览图
7. **求职分析未实现**: CareerPreviewCard 为静态预告卡片

## 启动命令

```bash
cd "D:\克劳德尝试\ai设计导师\ai-portfolio-tutor"
npm run dev    # http://localhost:3000
npm run build  # 生产构建
```
