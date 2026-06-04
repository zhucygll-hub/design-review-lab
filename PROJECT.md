# AI设计评审实验室 (Design Review Lab) — 项目说明

> 一个面向设计类学生的 AI 驱动专业评审平台。支持单张作品评审和完整作品集评审两种模式，由 GPT-4o 级别多模态 AI 进行严格、专业的评分和反馈。

---

## 1. 项目定位

**目标用户**：全体设计类学生（不限于毕设场景）—— 工业设计、视觉传达、UI/UX、数字媒体等专业。

**核心价值**：设计师的成长需要真实、严苛的外部反馈，但导师时间有限、同学互评参差不齐。AI设计评审实验室用"设计导师 + 设计总监 + 面试官 + 用户研究员"四重视角，给出**宁严勿松**的专业评审，帮助学生发现盲点、理解业界标准。

**当前阶段**：MVP（最小可行产品），核心评审功能完整，待扩展求职分析和数据持久化。

---

## 2. 核心功能

### 2.1 作品评审（Single Work Review）

上传一张设计作品图片（JPG/PNG），AI 从 7 个维度评分分析：

| 维度 | 说明 |
|---|---|
| 创意与概念 | 独创性、主题明确度、记忆点 |
| 逻辑与叙事 | 设计思路清晰度、表达完整性 |
| 视觉表达 | 色彩/排版/构图/视觉层级/统一性 五个子维度 |
| 用户体验 | 交互类作品才评分，纯视觉作品（海报/插画）自动标记 N/A |
| 专业完成度 | 细节处理、规范程度、成熟度 |
| 创新价值 | 突破性、实验性 |
| 商业与现实价值 | 落地性、市场价值 |

**输出**：总分 + 雷达图 + 四角色导师点评（200字 × 4）+ 优点/缺点 + 5条 actionable 建议。

### 2.2 作品集评审（Portfolio Review）

上传完整设计作品集 PDF，AI 从 7 个加权维度评分分析：

| 维度 | 权重 | 说明 |
|---|---|---|
| 项目质量 | 20% | 每个项目是否达行业标准 |
| 项目完整度 | 15% | 设计闭环（研究→定义→方案→验证→落地） |
| 设计思维 | 20% | "为什么这么设计"的逻辑链 |
| 专业能力 | 15% | 擅长方向（工业设计/UI/用户研究等） |
| 视觉表达能力 | 10% | 作品集本身的排版质量 |
| 差异化竞争力 | 10% | 记忆点、同龄人中的突出程度 |
| 岗位匹配度 | 10% | 针对目标公司/岗位的匹配程度 |

**特色交互**：分析到第 6 维度（差异化竞争力）后暂停，弹出输入卡让用户填写目标公司/岗位/JD，然后继续分析第 7 维度（岗位匹配度），实现针对性评价。用户也可以跳过。

**输出**：加权总分 + 雷达图 + 四角色导师点评 + 优缺点 + 建议 + 目标信息卡。

### 2.3 求职分析（预告）

首页有"即将上线"的预告卡片。计划功能：
- 岗位匹配度深度分析（skill-gap analysis）
- 针对性面试问题生成
- 作品集 vs JD 差异报告

### 2.4 历史记录

localStorage 持久化（上限 50 条），显示模式标签（作品/作品集）、评分、日期。

---

## 3. 评分体系

### 3.1 五档制

| 等级 | 分数 | 含义 | 颜色 |
|---|---|---|---|
| S | 93-100 | 顶级，行业标杆 | 金色 |
| A | 80-92 | 优秀，有求职竞争力 | 绿色 |
| B | 65-79 | 合格，设计学生应有水准 | 蓝色 |
| C | 50-64 | 薄弱，低于竞争线 | 琥珀 |
| D | <50 | 严重不足 | 红色 |

### 3.2 红牌规则（Prompt 级硬约束）

评价 Prompt 中设有 6 条红牌规则，触发任一条件则总分上限 C（<80 分）：

- 无可见排版网格/对齐系统
- 色彩使用无逻辑
- 字体 >2 种且无层级
- 图片/元素拉伸变形
- 可读性问题
- 纯模板化设计，无创新

### 3.3 分布期望

明确告诉 AI 预期分布：S(<1%), A(~10%), B(~30%), C(~35%), D(~25%)，打破模型"平均主义"倾向。

### 3.4 核心哲学

Prompt 中强调"你是来找茬的设计导师，不是来鼓励的"、"虚假的高分比低分更害人"、"Behance 级作为对比校准锚点"。

---

## 4. 技术架构

### 4.1 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS v4 |
| 动画 | Framer Motion |
| 上传 | react-dropzone |
| 图片压缩 | sharp（服务端转 JPEG 80%, 1024px） |
| PDF 解析 | pdf-parse（文字提取）+ sharp（页面渲染前 3 页为 JPEG） |
| AI API | 火山方舟 Doubao-Seed-2.0-Pro-260215（OpenAI 兼容接口） |
| 存储 | localStorage（历史）+ sessionStorage（结果页跨路由传参） |

### 4.2 路由

```
/              → 首页
/analyze       → 作品评审页
/api/analyze   → 作品评审 API（图片→sharp压缩→豆包分析）
/portfolio     → 作品集评审页
/api/analyze-portfolio → 作品集 API（PDF→文字+图片→豆包分析）
/result/[id]   → 结果页（双模式共用）
/history       → 历史记录
```

### 4.3 数据流（作品评审）

```
用户上传 JPG/PNG
  → 预览 + "开始 AI 分析"按钮
  → 7 维动画滚动（0%→90%）同时 POST /api/analyze
  → 服务端：sharp 压缩 1024px → base64 → 调豆包
  → 动画结束 → 等待 API
  → API 返回 → sessionStorage → router.push(/result/[id])
```

### 4.4 数据流（作品集评审，含交互暂停）

```
用户上传 PDF
  → 预览 + "开始 AI 分析"按钮
  → 发起首轮 API（无目标信息）
  → 维度 1-6 动画滚动
  → 暂停：弹出 TargetInputCard（目标公司/岗位/JD）
  → 用户提交或跳过
  → 若提交目标 → 二次 API 重新评估维度 7
  → 维度 7 动画 → 等待 API
  → sessionStorage → router.push(/result/[id])
```

交互暂停通过 Promise-based 机制实现：`resolveTargetRef` 存储 resolve 函数，用户点击提交/跳过时调用 resolve 恢复执行流。

### 4.5 视觉设计

- **主题**：暗黑玻璃拟态（Dark Glassmorphism）
- **背景**：#0A0A0A
- **主色**：#4F8CFF（蓝）、#7C3AED（紫）
- **玻璃卡片**：rgba(255,255,255,0.03) + border rgba(255,255,255,0.08) + backdrop-blur(24px)
- **文字渐变**：蓝色→紫色→白色 linear-gradient
- **动画**：framed-motion 入场、shimmer 加载、pulse-glow 强调、float 悬浮

### 4.6 组件结构（46 个文件）

```
components/
├── layout/    TopNav, BottomNav, AppLayout
├── home/      HeroSection, EntryCards, FeaturesGrid, CareerPreviewCard, CaseShowcase, Testimonials
├── analyze/   UploadZone, ImagePreview, ProgressBar, AIThinking, DimensionList
├── portfolio/ PortfolioUploadZone, TargetInputCard
├── result/    ScoreBadge, RadarChart, MentorReview, ProsConsSection, SuggestionsSection, ExportButton
├── history/   HistoryList, EmptyState
└── shared/    GlassCard, GradientText, AnimatedCounter, Badge, Button
```

---

## 5. AI Prompt 设计

这是项目的核心竞争力。两个 Prompt（`lib/ai-analysis-single.ts` + `lib/ai-analysis-portfolio.ts`）经过多次迭代调优：

### 5.1 结构
```
核心哲学（找茬不是鼓励）
  → 红牌规则（6 条硬门槛）
  → 分布期望（打破平均主义）
  → 对比校准（Behance/校招场景锚点）
  → 分数锚点（S/A/B/C/D 精确区间）
  → 从严原则（不确定时向下取整）
  → 7 维度定义 + 评分指令
  → JSON Schema 约束
```

### 5.2 关键参数
- temperature: 0.3（低随机性，确保严格执行）
- max_tokens: 4096
- 图片 detail: 'low'（降低带宽和延迟）

---

## 6. 已知限制

1. **结果页刷新丢失**：使用 sessionStorage 传递结果，直接 URL 访问或刷新会丢失。计划改为 IndexedDB。
2. **作品集无缩略图**：PDF 上传后在历史列表中无预览图。
3. **二次 API 延迟**：用户填写目标信息后发起第二次完整 API 调用，而非仅更新维度 7。
4. **pdf-parse 为 CommonJS**：生产环境（Turbopack）待验证。
5. **求职分析未实现**：仅静态预告卡片。

---

## 7. 待开发功能

- 求职分析模块（岗位匹配 + 面试问题生成）
- 结果页数据持久化（IndexedDB 或 Supabase）
- 作品集 PDF 缩略图预览
- 用户账号系统（可选）
- 分享功能（生成评审报告链接/图片）
- 多语言支持

---

## 8. 本地运行

```bash
cd <project-root>
npm run dev    # http://localhost:3000
npm run build  # 生产构建
```

环境变量 `.env.local`:
```
ARK_API_KEY=<火山方舟 API Key>
ARK_MODEL=doubao-seed-2-0-pro-260215
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```
