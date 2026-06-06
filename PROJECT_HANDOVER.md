# PROJECT_HANDOVER.md

> 交接日期：2026-06-05  
> 项目：AI 设计评审实验室 / Design Review Lab  
> 仓库：`zhucygll-hub/design-review-lab`  
> 当前主分支：`master`  
> 最新相关提交：`2d5a665 fix: vary single work mentor feedback`

这是一份给下一位 Claude Code / Claude 对话的项目交接文档。请把它当作项目负责人离职前的交接说明。新的开发者如果完全不了解项目，应先读完本文，再开始改代码。

## 1. 一句话概括

这是一个基于 Next.js 16 的全栈 Web 应用，面向设计类学生，提供两类 AI 评审：

- 单张作品评审：上传 JPG/PNG，选择设计类型、作品形态、评审目的，由火山方舟豆包多模态模型评审。
- 作品集评审：上传 PDF，AI 评审完整作品集，并可补充目标公司/岗位/JD 做求职匹配。

产品核心不是“鼓励式 AI”，而是“严格的设计导师”。评分逻辑强调审美、排版、完成度、概念深度和现实/场景价值，目标是避免普通作品被虚高评分。

## 2. 当前技术栈

- Framework：Next.js `16.2.6`，App Router，Turbopack
- React：`19.2.4`
- TypeScript：strict mode
- CSS：Tailwind CSS v4，`app/globals.css`
- 动画：Framer Motion
- 图表：Recharts + 自定义 SVG 雷达图
- 上传：react-dropzone
- AI：火山方舟 Ark，默认模型 `doubao-seed-2-0-pro-260215`
- JSON 修复：`jsonrepair`
- 存储：`localStorage` 存历史，`sessionStorage` 存最近一次结果
- 部署：腾讯云 EdgeOne Pages 为当前主要部署方向，保留 Vercel 配置

## 3. 运行方式

本地目录通常是：

```powershell
cd "D:\克劳德尝试\ai设计导师\ai-portfolio-tutor"
```

常用命令：

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

注意：在 Windows PowerShell 里优先用 `npm.cmd`，不要用 `npm`，因为 `npm.ps1` 可能受执行策略影响。

环境变量：

```env
ARK_API_KEY=<火山方舟 API Key，必须在部署平台配置，不要提交到仓库>
ARK_MODEL=doubao-seed-2-0-pro-260215
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

`GET /api/analyze` 可用于检查单作品 API 配置是否生效，会返回模型、host、timeout 等信息。

## 4. 当前部署状态

主要部署平台是腾讯云 EdgeOne Pages。

关键配置文件：

- `edgeone.json`
- `vercel.json`

`edgeone.json` 当前内容设置 Cloud Functions：

```json
{
  "cloudFunctions": {
    "mainlandRegions": ["ap-beijing"],
    "nodejs": {
      "maxDuration": 120
    }
  }
}
```

为什么用 EdgeOne：

- `.vercel.app` 在中国大陆访问不稳定。
- 单张图片和 PDF 多模态分析容易超过 Vercel Hobby 60 秒限制。
- EdgeOne 国内访问更适合当前用户场景，函数超时设置为 120 秒。

部署注意：

- 环境变量必须在 EdgeOne Pages 项目设置里配置。
- 预览链接可能带 `eo_token`，会过期，不适合长期分享。
- 长期分享应使用 EdgeOne 生成的生产可用域名或自定义域名。
- 用户曾遇到 `401 UNAUTHORIZED Access Restricted or Authentication Expired`，本质是访问了过期预览链接或受限预览域名。

## 5. 目录结构与职责

核心目录：

```text
app/
  page.tsx                       首页
  layout.tsx                     根布局，挂 AppLayout
  globals.css                    Tailwind v4 theme、glassmorphism 样式
  analyze/page.tsx               单作品评审页面
  portfolio/page.tsx             作品集评审页面
  result/[id]/page.tsx           结果页
  history/page.tsx               历史页
  api/analyze/route.ts           单作品 API
  api/analyze-portfolio/route.ts 作品集 API

components/
  analyze/                       单作品上传、类型选择、进度展示
  portfolio/                     PDF 上传、目标岗位输入
  result/                        分数、雷达图、导师点评、优缺点、建议
  history/                       历史列表
  home/                          首页模块
  layout/                        顶部/底部/AppLayout
  shared/                        通用 UI

hooks/
  useAnalysis.ts                 单作品评审状态机
  usePortfolioAnalysis.ts        作品集评审状态机
  useHistory.ts                  localStorage 历史
  useMediaQuery.ts               媒体查询 hook

lib/
  ai-analysis-single.ts          单作品 Prompt
  ai-analysis-portfolio.ts       作品集 Prompt
  ark-utils.ts                   Ark 请求、错误解析、JSON 提取/修复
  score-utils.ts                 权重、总分重算、红牌、高分校准
  single-work-scenario.ts        单作品场景与动态维度
  single-work-feedback.ts        单作品导师点评/优缺点/建议生成
  image-compress.ts              客户端图片压缩
  api-utils.ts                   客户端安全解析 API 响应
  fetch-utils.ts                 fetch timeout
  utils.ts                       颜色、标签、日期

types/index.ts                   全局类型
```

旧文档：

- `PROJECT.md` 和 `CLAUDE.md` 有历史价值，但部分内容过时。
- 例如旧文档曾描述 Vercel 为主部署、旧五档评分等。以后以当前代码和本文为准。

## 6. 核心类型

在 `types/index.ts`。

评分等级：

```ts
export type NewScore = 'S' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E'
```

模式：

```ts
export type AnalysisMode = 'single' | 'portfolio'
export type DesignType = 'commercial' | 'concept'
export type WorkForm = 'board' | 'physical_model' | 'ui' | 'poster' | 'packaging_brand' | 'other'
export type ReviewPurpose = 'course' | 'competition' | 'job' | 'practice'
```

`AnalysisResult` 是结果页、历史保存和 API 返回的核心结构，必须包含：

- `score`
- `scoreNumeric`
- `scoreLabel`
- `dimensions`
- `mentorReviews`
- `pros`
- `cons`
- `suggestions`
- `redFlags`
- `createdAt`
- `mode`

单作品还可能包含：

- `designType`
- `workForm`
- `reviewPurpose`

作品集还可能包含：

- `targetCompany`
- `targetRole`
- `jobDescription`

## 7. 单作品评审完整数据流

页面：`app/analyze/page.tsx`  
状态机：`hooks/useAnalysis.ts`  
API：`app/api/analyze/route.ts`

流程：

1. 用户上传 JPG/PNG。
2. `UploadZone` 将文件传给 `useAnalysis.handleFile()`。
3. 页面显示预览，并显示三类选择：
   - `DesignTypeToggle`：商业/落地、概念/实验
   - `ScenarioSelector`：作品形态
   - `ScenarioSelector`：评审目的
4. 点击“开始 AI 分析”后，`useAnalysis.startAnalysis()`：
   - 用 `compressImageClient(upload.file, 1024, 0.72)` 压缩图片。
   - 构造 FormData：`file`、`designType`、`workForm`、`reviewPurpose`。
   - 发起 `POST /api/analyze`。
   - 同时播放 7 维度分析进度动画，动画最多到 90%。
   - 客户端超时约 100 秒。
5. API 读取图片，转 base64 data URI。
6. `buildAnalysisPrompt(designType, workForm, reviewPurpose)` 生成 Prompt。
7. 调用 Ark Chat Completions：
   - endpoint：`${ARK_BASE_URL}/chat/completions`
   - image detail：`low`
   - `temperature: 0`
   - 第一次 `seed: 42`
   - `thinking: { type: 'disabled' }`
   - `response_format: { type: 'json_object' }`
   - `max_completion_tokens: 1800`
8. API 最多尝试 2 次。
   - 如果 JSON 无法 parse，会用 `jsonrepair` 修复。
   - 如果维度不完整，会重试一次。
   - 第二次仍不完整，返回错误，不再把缺失维度当 0 分。
9. 单作品 AI 现在只负责返回核心字段：
   - `score`
   - `scoreNumeric`
   - `redFlags`
   - `calibrationNote`
   - `dimensions`
10. 服务端用 `buildSingleWorkFeedback()` 生成：
    - `mentorReviews`
    - `pros`
    - `cons`
    - `suggestions`
    - fallback `calibrationNote`
11. `normalizeAnalysisResult()` 重算总分、套红牌和高分限制。
12. 前端收到结果后：
    - 用浏览器预览 URL 补回 `imageUrl`
    - 写入 `localStorage` 历史
    - 写入 `sessionStorage.lastAnalysis`
    - 跳转 `/result/[id]`

## 8. 单作品场景系统

文件：`lib/single-work-scenario.ts`

三类输入：

- `DesignType`
  - `commercial`：商业落地
  - `concept`：概念实验
- `WorkForm`
  - `board`：展板
  - `physical_model`：模型实物
  - `ui`：UI界面
  - `poster`：海报视觉
  - `packaging_brand`：包装品牌
  - `other`：其他
- `ReviewPurpose`
  - `course`：课程作业
  - `competition`：比赛投稿
  - `job`：求职展示
  - `practice`：个人练习

动态 7 维规则：

固定核心 5 维：

1. 创意与概念
2. 逻辑与叙事
3. 视觉表达
4. 专业完成度
5. 创新价值

第 6 维根据作品形态变化：

- 展板：信息组织与阅读性
- 模型实物：结构与工艺合理性
- UI界面：用户体验
- 海报视觉：传播与记忆点
- 包装品牌：品牌一致性
- 其他：使用场景适配度

第 7 维根据目的或类型变化：

- 概念实验：探索价值与思辨深度
- 非概念时：
  - 课程作业：方法掌握与学习完成度
  - 比赛投稿：主题冲击力与评审说服力
  - 求职展示：岗位相关性与面试表达性
  - 个人练习：成长价值与改进空间

权重总和仍为 100：

- 核心 5 维：15 + 15 + 20 + 15 + 10 = 75
- 形态维度：12
- 目的/概念维度：13

## 9. 单作品导师点评系统

文件：`lib/single-work-feedback.ts`

背景：为了减少 AI JSON 出错，单作品 API 不再要求 AI 返回导师点评、优缺点和建议。AI 只返回核心评分 JSON，服务端根据维度生成展示文案。

当前生成逻辑：

- 读取所有维度分数。
- 找最高维度、最低维度、次低维度、中间维度。
- 根据 `designType`、`workForm`、`reviewPurpose`、分数、维度描述、请求编号、文件名、文件大小生成 hash。
- 每个导师角色都有多套模板，通过 hash 选模板。

四个角色：

- 毕业导师：过程、依据、课程/学习视角
- 设计总监：视觉、卖点、专业完成度
- 企业面试官：作品集讲述、决策依据、改进计划
- 用户研究员：目标受众、情境、验证依据

已知风险：

- 这套文案仍然是服务端模板生成，不是真正让模型写长点评。
- 如果两张图 AI 返回的七维分数和维度描述高度相似，点评仍可能接近。
- 如果用户继续反馈“点评不够像看图”，下一步要考虑两阶段策略：
  - 第一阶段 AI 返回稳定核心 JSON。
  - 第二阶段用核心 JSON + 图片摘要生成短点评，但第二阶段必须有超时/失败兜底。

## 10. 作品集评审完整数据流

页面：`app/portfolio/page.tsx`  
状态机：`hooks/usePortfolioAnalysis.ts`  
API：`app/api/analyze-portfolio/route.ts`

流程：

1. 用户上传 PDF，最大 8MB。
2. `usePortfolioAnalysis.startAnalysis()` 发出第一轮 `POST /api/analyze-portfolio`。
3. 前端动画播放前 6 个维度。
4. 动画暂停，显示 `TargetInputCard`，让用户输入：
   - 目标公司
   - 目标岗位
   - JD
5. 用户提交或跳过后，动画继续到第 7 维。
6. 如果用户填写了目标公司或岗位，会发第二轮 API，带目标信息重新分析整份 PDF。
7. 若第二轮失败，保留第一轮结果。
8. 写入 `sessionStorage.lastAnalysis`，跳转结果页。

API 细节：

- 使用 Ark Responses API，不是 Chat Completions。
- endpoint：`${ARK_BASE_URL}/responses`
- PDF 作为 `input_file`，data URI base64 上传。
- prompt 来自 `buildPortfolioAnalysisPrompt()`
- `max_output_tokens: 2200`
- `thinking: { type: 'disabled' }`
- `AI_TIMEOUT_MS = 105_000`

重要区别：

- 单作品已经做了“核心 JSON + 服务端点评生成 + 维度完整性重试”。
- 作品集目前仍要求 AI 一次性返回完整结构，包括导师点评、优缺点、建议。
- 因此作品集稳定性比单作品弱，未来很可能也要迁移到“核心 JSON + 服务端文案生成/二阶段文案”的模式。

## 11. 评分体系

文件：`lib/score-utils.ts`

当前评分为七档：

| 等级 | 分数 |
|---|---|
| S | 93-100 |
| A+ | 88-92 |
| A | 82-87 |
| B | 74-81 |
| C | 67-73 |
| D | 60-66 |
| E | 0-59 |

总分不要相信 AI 的 `scoreNumeric`。服务端一定会：

1. clamp 每个维度到 0-100。
2. 用权重重算总分。
3. 套红牌上限。
4. 套高分区校准。
5. 重新推导等级和 `scoreLabel`。

红牌上限：

- 1 个 redFlag：最高 79
- 2 个 redFlags：最高 69
- 3 个及以上：最高 59

高分区校准重点：

- 视觉表达低于 70：最高 73
- 视觉表达低于 75：最高 79
- 视觉表达低于 80：最高 81
- 视觉表达低于 85：不能 A+
- 没有 90+ 维度：最高 87
- 强维度不足、弱维度过多，会压分
- S 级必须有多个 90+、多个 85+、至少一个 95+

注意：`calculateWeightedScore()` 会把 `null` 维度视为 N/A，并按比例重分配权重。

## 12. AI Prompt 现状

单作品 Prompt：`lib/ai-analysis-single.ts`

目标：

- 让 AI 只输出合法 JSON。
- 输出字段尽量少，降低结构错误。
- 场景维度动态生成。
- 商业/概念设计有不同标准。

当前单作品 Prompt 明确要求：

- 只返回 `score`、`scoreNumeric`、`redFlags`、`calibrationNote`、`dimensions`
- 不返回 `mentorReviews`、`pros`、`cons`、`suggestions`
- 每个维度描述不超过 20 个汉字

作品集 Prompt：`lib/ai-analysis-portfolio.ts`

仍要求完整结构：

- `score`
- `scoreNumeric`
- `scoreLabel`
- `redFlags`
- `calibrationNote`
- `dimensions`
- `mentorReviews`
- `pros`
- `cons`
- `suggestions`

如果后续作品集频繁报 JSON 不完整，应优先参考单作品 API 的稳定化模式。

## 13. Ark 工具层

文件：`lib/ark-utils.ts`

职责：

- `fetchArkWithRetry()`：
  - 对 429 和 5xx 重试一次。
  - 注意它内部每次使用 `fetchWithTimeout()`。
- `parseArkError()`：
  - 把 Ark 错误转换成中文用户提示。
- `extractResponsesText()`：
  - 从 Responses API 结果里提取 `output_text` 或 `output[].content[].text`。
- `parseArkJson()`：
  - 去除 markdown fence。
  - 截取第一个 `{` 到最后一个 `}`。
  - 先 `JSON.parse`。
  - 再尝试 `jsonrepair`。
  - 失败则抛出 `AI 返回的评审核心格式不完整，请重试`。

## 14. 前端状态和存储

历史：

- hook：`hooks/useHistory.ts`
- key：`design-review-lab-history`
- 旧 key：`ai-portfolio-tutor-history`
- 上限：50 条

结果页：

- 页面：`app/result/[id]/page.tsx`
- 只从 `sessionStorage.lastAnalysis` 读取。
- 如果刷新页面或换设备打开 `/result/[id]`，会显示“未找到分析结果”。

这是当前 MVP 的重要限制。若要做分享链接或长期保存，必须引入后端存储：

- IndexedDB 只能本机持久，不能跨设备分享。
- Supabase / Firebase / 腾讯云数据库 才能支持分享链接。

## 15. 当前已知问题

### 15.1 lint 当前失败

`npm.cmd run lint` 当前会失败，但这些问题是既有问题，不是最近导师点评修复引入的。

已知错误：

- `app/result/[id]/page.tsx`
  - `react-hooks/set-state-in-effect`
  - effect 中同步 `setResult` / `setLoading`
- `hooks/useHistory.ts`
  - `react-hooks/set-state-in-effect`
  - effect 中同步 `setItems`
- `hooks/useMediaQuery.ts`
  - `react-hooks/set-state-in-effect`
  - effect 中同步 `setMatches`

已知 warnings：

- `app/portfolio/page.tsx` 中 `PORTFOLIO_DIMENSIONS`、`result` 未使用
- `components/history/EmptyState.tsx` 中 `Link` 未使用
- `components/result/ScoreBadge.tsx` 中 `getScoreLabel` 未使用
- `lib/image-compress.ts` 中 `reject` 未使用

构建状态：

- 最近多次 `npm.cmd run build` 通过。
- 若下一个开发者修改前端状态逻辑，建议顺手清理 lint。

### 15.2 结果页不能刷新

原因：只依赖 `sessionStorage.lastAnalysis`。

优先级：中高。用户一旦想分享结果或刷新页面，这个问题会暴露。

### 15.3 单作品导师点评仍是模板生成

当前已做多模板和 hash 变体，但不是 AI 直接写作。

如果用户继续要求“更像真的看图”，可考虑：

- AI 第一阶段返回核心评分 JSON。
- 服务端第二阶段只生成导师点评文本，输入包括图片、维度、分数、场景。
- 第二阶段失败时用 `single-work-feedback.ts` 兜底。

### 15.4 单作品 AI 输出仍可能格式错误

当前已经：

- 简化 JSON
- `jsonrepair`
- 两次请求
- 检查完整维度
- 缺维度不再补 0

但多模态模型仍可能失败。不要承诺 100% 稳定。

### 15.5 作品集稳定性弱于单作品

作品集仍一次性要求 AI 返回大量结构化内容，PDF 也更重。

下一步如果优化稳定性，建议优先：

- 作品集也只让 AI 返回核心维度评分。
- 导师点评/建议服务端生成。
- 对作品集维度完整性做检查和重试。

### 15.6 EdgeOne 预览链接会失效

分享给朋友请用生产域名，不要用带 `eo_token` 的 preview URL。

### 15.7 文档存在历史不一致

`PROJECT.md`、`CLAUDE.md` 是旧阶段总结，不可完全照搬。以后以当前代码和 `PROJECT_HANDOVER.md` 为准。

## 16. 最近修复历史

最近重要提交：

```text
2d5a665 fix: vary single work mentor feedback
e7adab0 fix: retry incomplete single analysis dimensions
34dfafe fix: personalize single work feedback
250c5ee fix: reduce single analysis JSON output
89a6d96 fix: tolerate partial single analysis JSON
3c110a3 feat: add contextual single work review
4bf9125 feat: add visual quality score gates
c30da85 fix: repair malformed AI JSON responses
74d2544 fix: stabilize Ark analysis requests
1191a53 perf: speed up single work analysis
c9ae20c fix: correct EdgeOne function configuration
360a531 fix: prevent EdgeOne AI analysis timeouts
```

这些提交的背景：

- EdgeOne 504：函数超时、AI 分析过慢。
- JSON 格式不完整：模型输出截断或不合法。
- 单作品缺维度被补 0：导致假 E 级。
- 导师点评重复：服务端模板过于固定。
- 分数虚高：新增视觉审美 gates 和高分校准。
- 场景不够细：新增商业/概念、作品形态、评审目的。

## 17. 下一步开发建议

优先级 1：稳定性

- 作品集迁移到单作品同款稳定化模式。
- 为作品集添加维度完整性检查和重试。
- 对 Ark 响应内容做更详细日志，但不要记录用户敏感内容过多。

优先级 2：结果持久化

- 引入可持久存储，解决刷新丢失和分享问题。
- 最小可行方案：IndexedDB 保存本机结果。
- 更完整方案：云端 DB 保存结果，生成分享链接。

优先级 3：导师点评质量

- 若用户坚持“点评必须真正因图而异”，做二阶段 AI 文案生成。
- 保留当前模板系统作为 fallback。

优先级 4：清理 lint

- 解决 React 19/Next 16 新规则下的 `set-state-in-effect`。
- 清理未使用变量。

优先级 5：用户体验

- 上传后增加“当前部署版本/请求编号”显示，便于排查。
- 结果页显示 `calibrationNote`，当前页面没有明显展示它。
- 出错时引导用户压缩图片、换图、重试，而不是只显示技术错误。

## 18. 开发注意事项

1. 不要把 API Key 写入仓库。
2. 不要随便改 `score-utils.ts`，它是评分可信度核心。
3. 不要把缺失维度补成 0 分；这会制造假 E 级。
4. 单作品 Prompt 不要随便加回导师点评，容易重新引入 JSON 不完整问题。
5. 如果增加输出字段，先评估 token、超时和 JSON 稳定性。
6. EdgeOne 函数总时限是关键约束，API 超时不要超过平台上限。
7. Windows 下文件路径包含中文，命令要注意引号。
8. 读取 `app/result/[id]/page.tsx` 时 PowerShell 要用 `-LiteralPath`。
9. 当前项目没有单元测试，构建是主要验证手段。
10. 如果要上线给朋友测试，每次 push 后等 EdgeOne 自动部署完成再测。

## 19. 接手者快速路线

如果你要继续修“单作品评审”：

1. 先看 `hooks/useAnalysis.ts`
2. 再看 `app/api/analyze/route.ts`
3. 再看 `lib/ai-analysis-single.ts`
4. 再看 `lib/single-work-scenario.ts`
5. 再看 `lib/single-work-feedback.ts`
6. 最后看 `lib/score-utils.ts`

如果你要继续修“作品集评审”：

1. 先看 `hooks/usePortfolioAnalysis.ts`
2. 再看 `app/api/analyze-portfolio/route.ts`
3. 再看 `lib/ai-analysis-portfolio.ts`
4. 再看 `lib/score-utils.ts`
5. 对照单作品 API 学稳定化做法

如果你要修“结果页/历史/分享”：

1. 先看 `app/result/[id]/page.tsx`
2. 再看 `hooks/useHistory.ts`
3. 再看 `components/history/HistoryList.tsx`
4. 规划存储方案

如果你要修“UI/视觉”：

1. 先看 `app/globals.css`
2. 再看 `components/shared/*`
3. 再看具体页面组件

## 20. 最后的负责人提醒

这个项目真正难的不是页面，而是“AI 评审可信度”。用户会很敏感地观察：

- 分数是否虚高
- 差作品是否真的被打低
- 不同图片点评是否不同
- 报错是否频繁
- 结果是否像真的看过图

所以后续开发不要只追求“功能看起来有了”。每次改 Prompt、评分、导师点评，都要用多张明显不同质量的图片反复测试。  
尤其要警惕两类假象：

- AI 看起来说了很多，但其实套模板。
- 分数看起来精确，但其实是缺字段或权重计算导致。

项目目前已经能跑、能部署、能做基本评审，但距离稳定产品还有几步：作品集稳定化、结果持久化、导师点评更真实、lint 清理。接手时建议先稳住这些基础，再加新功能。
