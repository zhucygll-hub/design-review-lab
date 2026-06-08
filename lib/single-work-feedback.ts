import {
  AnalysisResult,
  DesignType,
  DimensionScore,
  MentorReview,
  PortfolioPurpose,
  ReviewPurpose,
  Suggestion,
  WorkForm,
} from '@/types'
import {
  DESIGN_TYPE_LABELS,
  REVIEW_PURPOSE_LABELS,
  WORK_FORM_LABELS,
} from '@/lib/single-work-scenario'

type FeedbackInput = {
  dimensions: DimensionScore[]
  scoreNumeric: number
  designType: DesignType
  workForm: WorkForm
  reviewPurpose: ReviewPurpose
  seedKey?: string
}

type GeneratedFeedback = Pick<AnalysisResult, 'mentorReviews' | 'pros' | 'cons' | 'suggestions'> & {
  calibrationNote: string
}

function validDimensions(dimensions: DimensionScore[]): Array<DimensionScore & { score: number }> {
  return dimensions
    .filter((d): d is DimensionScore & { score: number } => typeof d.score === 'number')
    .sort((a, b) => b.score - a.score)
}

function getBand(score: number): string {
  if (score >= 90) return '高完成度'
  if (score >= 82) return '较成熟'
  if (score >= 75) return '有基础'
  if (score >= 65) return '待打磨'
  return '问题较明显'
}

function describeDimension(dimension: DimensionScore & { score: number }): string {
  const detail = dimension.description?.replace(/[。.!！?？]$/u, '')
  return detail ? `${dimension.name}（${detail}）` : dimension.name
}

function hashText(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return hash
}

function pickVariant<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length]
}

function compactDetail(dimension: DimensionScore & { score: number }): string {
  const detail = dimension.description?.replace(/[。.!！?？]$/u, '').trim()
  return detail && !detail.includes('AI 未返回') ? detail : `${dimension.name}${dimension.score}分`
}

// ============================================================
// WorkForm-specific concrete zone names
// ============================================================

function zoneNames(workForm: WorkForm): {
  primary: string
  secondary: string
  weakZone: string
} {
  const map: Record<WorkForm, { primary: string; secondary: string; weakZone: string }> = {
    board: { primary: '版面主视觉区域', secondary: '辅助说明区', weakZone: '版面信息较弱的区域' },
    physical_model: { primary: '模型的正面/主展示面', secondary: '模型侧面或细节', weakZone: '拍照中表现不充分的区域' },
    poster: { primary: '海报的视觉焦点位置', secondary: '正文/副标题区域', weakZone: '容易被忽略的边角信息' },
    ui: { primary: '界面的主操作区', secondary: '导航/标签栏', weakZone: '状态反馈或次要页面区域' },
    packaging_brand: { primary: '包装正面主展示区', secondary: '侧面或背面信息', weakZone: '品牌一致性较弱的触点' },
    other: { primary: '画面的视觉重心', secondary: '次要信息区', weakZone: '画面中表现较弱的区域' },
  }
  return map[workForm]
}

// ============================================================
// Per-workForm concrete suggestion verbs & targets
// ============================================================

function buildFormSuggestion(workForm: WorkForm, strongest: DimensionScore & { score: number }, weakest: DimensionScore & { score: number }): string {
  const z = zoneNames(workForm)
  const map: Record<WorkForm, string> = {
    board: `先重排版面的阅读顺序：把${strongest.name}对应的内容放到${z.primary}（约占版面60%面积），把${weakest.name}相关的次要信息缩小到${z.secondary}并低于主区域，形成F型阅读路径`,
    physical_model: `从${z.primary}开始重新拍摄：确保${strongest.name}相关的造型特征处于最佳光线和角度，同时补拍${weakest.name}的局部细节特写（建议3-4张不同角度，附一把尺子或常见物品作为尺度参照）`,
    poster: `重建信息层级：把${strongest.name}的主视觉元素放大到${z.primary}，把正文缩小2级字号并下移到画面下1/3区域，确保3米外能看清标题、1米内能读正文`,
    ui: `统一关键界面的视觉规范：保持${strongest.name}对应的页面状态，补全${weakest.name}涉及的加载/空/错误/成功四种状态截图，并以当前页面的间距和色彩规范保持一致`,
    packaging_brand: `先收紧品牌核心识别：把${strongest.name}对应的品牌元素（logo/主色/主字体）统一应用在所有触点，把${weakest.name}涉及的次要信息（侧面文字、成分表、条码）缩小字号并降低色彩对比度`,
    other: `先确定1个主视觉焦点：把${strongest.name}对应的内容作为核心锚点，放大到画面显眼位置，把${weakest.name}对应区域的元素缩小或移到边缘`,
  }
  return map[workForm]
}

function buildPurposeSuggestion(
  workForm: WorkForm,
  reviewPurpose: ReviewPurpose,
  strongest: DimensionScore & { score: number },
  weakest: DimensionScore & { score: number }
): string {
  const z = zoneNames(workForm)

  if (workForm === 'physical_model') {
    const map: Record<ReviewPurpose, string> = {
      course: `课程答辩用：在${z.primary}补充一张标注图，用箭头标出${strongest.name}相关的3个造型决策点，并在${z.secondary}附2-3张制作过程快照（原始材料→中间状态→当前成品），让导师看到动手过程和形态判断`,
      competition: `比赛投稿用：把${strongest.name}的最佳角度照片放大到${z.primary}，用干净的中性灰背景，补充一张细节特写和一张尺度对比图，去掉所有干扰视觉判断的背景杂物`,
      job: `求职展示用：在模型照片旁边用3-4行文字标注：为什么选择这个形态？制作中做了哪2-3个关键取舍？${weakest.name}下一步怎么改进？让面试官看到思考路径而非只有结果`,
      practice: `个人练习用：记录${strongest.name}从草图到成品的3个关键版本（每个版本1张照片+1句话说明改了什么），把${weakest.name}作为下一轮练习的具体目标写下来`,
    }
    return map[reviewPurpose]
  }

  const map: Record<ReviewPurpose, string> = {
    course: `课程答辩用：在${z.primary}补1-2张过程草图或方案对比，用箭头连接从问题到当前方案的关键决策点，放在${z.secondary}，让导师能看到你的设计判断过程`,
    competition: `比赛投稿用：把${strongest.name}相关的最强视觉效果放大到${z.primary}，检查${weakest.name}是否在1米外仍清晰可辨——如果不能，缩小或重新处理该区域`,
    job: `求职展示用：在画面空白处添加3-4行标注，说明${strongest.name}的决策逻辑和${weakest.name}的改进方向，面试时可以直接指着这些标注讲`,
    practice: `个人练习用：把${strongest.name}作为已完成的部分存档，把${weakest.name}的具体改进目标写在画面下方作为下一轮训练清单`,
  }
  return map[reviewPurpose]
}

function buildQuickFixSuggestion(workForm: WorkForm, strongest: DimensionScore & { score: number }): string {
  const z = zoneNames(workForm)
  const map: Record<WorkForm, string> = {
    board: `快速调整：保留${z.primary}的${strongest.name}相关内容，缩小或去色处理${z.weakZone}的冗余元素，让读者在3秒内找到入口`,
    physical_model: `快速调整：清理拍摄背景（纯色或中性灰），确保${z.primary}的${strongest.name}特征无阴影遮挡，补一张侧面角度`,
    poster: `快速调整：检查标题在缩略图尺寸（约300px宽）下是否仍可读——如果不能，把标题字号至少加大1级`,
    ui: `快速调整：截取${strongest.name}最完整的一个页面状态作为首图，确保所有按钮和文字在该尺寸下可读`,
    packaging_brand: `快速调整：确保${z.primary}的品牌logo和产品名在缩略图尺寸下仍可辨识——如果logo太小，在当前版本中单独放大logo区域`,
    other: `快速调整：保留${z.primary}的${strongest.name}相关内容，删减${z.weakZone}会分散注意力的元素，让画面有明确的视觉重心`,
  }
  return map[workForm]
}

export function buildSingleWorkFeedback(input: FeedbackInput): GeneratedFeedback {
  const sorted = validDimensions(input.dimensions)
  const strongest = sorted[0] ?? { name: '核心表达', score: input.scoreNumeric, description: '' }
  const weakest = sorted[sorted.length - 1] ?? { name: '细节完成度', score: input.scoreNumeric, description: '' }
  const secondWeakest = sorted[sorted.length - 2] ?? weakest
  const middle = sorted[Math.floor(sorted.length / 2)] ?? strongest
  const scenario = `${DESIGN_TYPE_LABELS[input.designType]} / ${WORK_FORM_LABELS[input.workForm]} / ${REVIEW_PURPOSE_LABELS[input.reviewPurpose]}`
  const band = getBand(input.scoreNumeric)
  const z = zoneNames(input.workForm)
  const seed = hashText(
    [
      input.seedKey,
      input.scoreNumeric,
      input.designType,
      input.workForm,
      input.reviewPurpose,
      input.dimensions.map((d) => `${d.name}:${d.score}:${d.description}`).join('|'),
    ].join('|')
  )
  const strongestDetail = compactDetail(strongest)
  const weakestDetail = compactDetail(weakest)
  const middleDetail = compactDetail(middle)

  const isPhysicalModel = input.workForm === 'physical_model'

  // ============================================================
  // Mentor review templates — each follows 3-step structure:
  // ① observation → ② judgment → ③ concrete action
  // ============================================================

  const graduationTemplates = isPhysicalModel
    ? [
        `从${z.primary}看，${strongestDetail}说明你有基本的造型意识和动手能力。但${z.weakZone}（${weakestDetail}）会让导师在答辩时追问——建议补拍3个以上角度（正面/侧面/细节特写），并在照片旁标注比例尺或参照物，让评审能完整判断你的形态决策和制作水平。`,
        `这个模型的${strongest.name}（${strongestDetail}）是你答辩中最能用来论证的论点。但${weakest.name}（${weakestDetail}）目前从照片上表达不够充分——答辩时需准备回答：为什么选择这个形态？制作中做了哪些取舍？是手工/3D打印/CNC？建议在作品集中配合1-2张过程照片和简短说明。`,
        `${z.primary}中${strongestDetail}已经能支撑核心设计判断。但仅靠单张照片去答辩是不够的——建议补充${weakest.name}的局部特写、不同光照条件下的多角度照片、以及简要的制作过程记录（3-4张过程照+1句话说明每张改了什么），才能完整呈现你的设计思考。`,
      ]
    : [
        `从${z.primary}看，${describeDimension(strongest)}是你最能用来回答导师追问的部分。但${z.secondary}中${describeDimension(weakest)}的处理可能被导师点名质疑——建议在${z.weakZone}补一组过程对比图（原始状态→中间版本→当前版本，3张小图横向排列），用箭头标注每个版本的关键变化，让导师看到你是怎么从A走到B的。`,
        `从课程导师视角，这张${WORK_FORM_LABELS[input.workForm]}在${strongestDetail}上有可见的处理意识，但${weakestDetail}会成为答辩追问点。下一版建议在${z.secondary}补2-3张关键推导小图，每张标注1句话说明当时的决策取舍（"选了方向X而不是Y，因为……"），让导师能判断你的方法论掌握程度。`,
        `答辩不能只看完成度。${z.primary}中${strongest.name}（${strongestDetail}）已经能撑住作品的基本方向，但${weakest.name}（${weakestDetail}）暗示你可能跳过了某些设计步骤。建议在${z.weakZone}补充1-2张草图或方案对比，用箭头+简短标注连接从问题到方案的逻辑——导师看到这个，就知道你不是画完才知道"为什么"的。`,
      ]

  const directorTemplates = [
    `${z.primary}中${strongestDetail}是画面里最值得留下的部分——把它放大到当前尺寸的约1.5倍，把${z.weakZone}中${weakestDetail}对应的元素缩小或移到${z.secondary}，整体画面会在3秒内建立清晰的视觉入口。不用改内容，改大小和位置就行。`,
    `设计总监第一眼看的是视觉是否能"立住"：${z.primary}中${strongestDetail}可以保留并加强，但${z.weakZone}中${weakestDetail}会拖累整体印象。建议先确定一个主导色和一个辅助色的面积比例（不是换配色方案，是控制各色块在画面中的占比），然后用这个比例统一${WORK_FORM_LABELS[input.workForm]}中最显眼的3-4个元素。`,
    `这张${WORK_FORM_LABELS[input.workForm]}不宜平均用力。把${z.primary}中${strongest.name}对应的内容放大到视觉焦点，把${z.weakZone}中${weakest.name}的内容缩小并降低色彩对比度——读者会在第一眼就找到正确的阅读起点。`,
  ]

  const interviewerTemplates = isPhysicalModel
    ? [
        `${buildPurposeSuggestion(input.workForm, input.reviewPurpose, strongest, weakest)}面试时不要只说"我做了一个模型"——要讲清为什么选这个形态、制作中遇到了什么取舍、以及${secondWeakest.name}下一步打算怎么迭代。提前准备一个"如果重来我会怎么改"的2-3句话回答。`,
        `如果把这个模型照片放进作品集，需要准备三个问题的回答：①为什么是这种形态而不是别的？②制作过程中最大的一个取舍是什么？③${weakest.name}为什么是当前这个状态、下一版怎么改？否则面试官会说"只有结果没有思考"。建议在照片旁标注这3个问题的简短回答。`,
        `展示时可以先从${z.primary}中${strongestDetail}讲起——这是你最有把握的部分。然后主动说明${z.weakZone}中${weakestDetail}在当前版本的状态和限制，以及下一步的改进方向。这种"我做了什么→为什么→哪里还不满意→下一步怎么做"的坦率，比只展示完美成图更有说服力。`,
      ]
    : [
        `${buildPurposeSuggestion(input.workForm, input.reviewPurpose, strongest, weakest)}面试时要讲三个层次：看到了什么问题→尝试了哪些方向→为什么选了当前方案。把${strongest.name}的决策过程变成"当时我遇到了X，试了Y和Z，最终选了Z因为……"的故事，把${secondWeakest.name}的不足变成"下一版我打算做ABC"的计划——面试官看重的是思考路径，不是完美结果。`,
        `如果把它放进作品集，光放成图不够。在${z.secondary}用3-4行文字标注：当时为什么选择${strongest.name}这个处理方式？${weakest.name}为什么暂时是这个状态？面试时可以直接指着这些文字讲，让面试官感觉你在复盘自己的设计，而不是在展示别人的作品。`,
        `展示时可以先从${z.primary}中${strongestDetail}讲起，讲清楚它的决策逻辑和上下文。然后主动说明${z.weakZone}中${weakestDetail}——"这部分在XX条件限制下达成了当前版本，如果条件允许我下一步会改ABC"。提前准备好这个"如果重来"的回答，面试官会认为你有复盘能力。`,
      ]

  const researchTemplates = isPhysicalModel
    ? [
        `从${z.primary}的体量和比例可以推断一些使用线索（握持方式、摆放姿态、人机关系），但单张照片提供的信息有限。如果这是产品模型，建议补充一个常见物品（如手机/手掌/椅子）作为尺度参照，并在作品集中标注目标使用场景的简短说明。`,
        `${z.primary}主要展示造型，无法从照片判断目标用户和使用情境——这不一定是问题，模型实物本来就不需要在一张照片里回答所有问题。如需完整评审人机尺度或使用逻辑，建议搭配展板或设计说明，标注目标人群和使用场景。`,
        `从${strongestDetail}可以推测大致的使用方向，但${z.weakZone}的信息不足以验证。建议在作品集中搭配不同角度照片、手持/环境对比照片，并在模型旁边标注"目标用户：XX | 使用场景：XX | 关键人机尺度：XXmm"，让评审能判断形态决策是否合理。`,
      ]
    : [
        `${z.primary}中${strongestDetail}可以从用户视角继续深挖——建议在${z.secondary}用1-2句话补充：这个设计是为谁在什么场景下使用的？然后用${strongest.name}作为你已经做到了的证据，用${weakest.name}暴露的问题来反推下一轮用户验证要测什么。`,
        `用户研究视角会追问：${z.primary}中的信息在目标受众的观看距离/时长下是否可读？${middleDetail}目前是画面中可以支撑回答的部分，但${weakestDetail}在没有受众信息的情况下难以判断是否合理——建议在${z.secondary}标注目标受众和观看场景，然后回头检查${weakest.name}是否真的服务于这个场景。`,
        `目前只能基于画面本身做判断。如果这是实际项目，建议在${z.secondary}标注：目标受众是谁？观看距离/场景是什么？然后检查${z.weakZone}中${weakest.name}在标注的受众和场景下是否合理。这不是在说"缺信息所以低分"，而是"有了这些信息才能判断这个设计决策对不对"。`,
      ]

  const graduationHighlights = isPhysicalModel
    ? [strongest.name, `补多角度展示+过程记录`]
    : [strongest.name, `在${zoneNames(input.workForm).weakZone}补过程对比图`]

  const researchHighlights = isPhysicalModel
    ? ['从形态推断使用线索', '补充尺度参照+使用场景标注']
    : ['在画面中标注目标受众', `检查${weakest.name}是否服务该受众`]

  const mentorReviews: MentorReview[] = [
    {
      role: 'graduation_tutor',
      roleLabel: '毕业导师',
      content: pickVariant(graduationTemplates, seed, 0),
      highlights: graduationHighlights,
    },
    {
      role: 'design_director',
      roleLabel: '设计总监',
      content: pickVariant(directorTemplates, seed, 1),
      highlights: [`${z.primary}的${strongest.name}放大并强化`, `${z.weakZone}的${weakest.name}缩小或移除`],
    },
    {
      role: 'interviewer',
      roleLabel: '企业面试官',
      content: pickVariant(interviewerTemplates, seed, 2),
      highlights: ['准备设计决策的故事', `说明${secondWeakest.name}的改进计划`],
    },
    {
      role: 'ux_researcher',
      roleLabel: '用户研究员',
      content: pickVariant(researchTemplates, seed, 3),
      highlights: researchHighlights,
    },
  ]

  // ============================================================
  // Pros — must reference specific visual zones
  // ============================================================

  // Pre-compute pros variants
  const prosThirdPhysicalModel =
    secondWeakest.name === weakest.name
      ? `${z.primary}的造型语言已具备继续深化的基础`
      : `${secondWeakest.name}已有可辨识的处理——保持当前的${secondWeakest.name}方向，优先调整${weakest.name}`

  const prosThirdGeneral =
    secondWeakest.name === weakest.name
      ? `整体${z.primary}已达到可用状态——不需要从零重做，只需要局部调整${z.weakZone}`
      : `${z.secondary}中${secondWeakest.name}的处理已达到可用状态——不需要从零重做，只需要局部调整${z.weakZone}`

  const pros = isPhysicalModel
    ? [
        `${z.primary}中${strongestDetail}已经能支撑作品的核心造型表达——保留当前拍摄角度作为主图，继续在这个形态方向上深化`,
        `${strongest.name}（${strongestDetail}）是你作品中已经"立住"的部分——在作品集中把这张照片放大到主图位置，搭配展板一起使用`,
        prosThirdPhysicalModel,
      ]
    : [
        `${z.primary}中${strongestDetail}已构成作品的核心说服力——保留该区域的视觉处理，可以在这个方向上继续深入`,
        prosThirdGeneral,
        `选择用${WORK_FORM_LABELS[input.workForm]}来表达${DESIGN_TYPE_LABELS[input.designType]}项目——这个载体本身适合你的内容，保留这个形式`,
      ]

  // ============================================================
  // Cons — must specify: which zone + what problem + why it matters
  // ============================================================

  // Pre-compute cons variants to avoid complex nested ternaries in template literals
  const consSecondPhysicalModel =
    secondWeakest.name === weakest.name
      ? `仅有一张照片严重限制了评审能看到的深度`
      : `${secondWeakest.name}（${z.secondary}）还有提升空间——从造型比例、表面处理或展示角度中选一个最影响观感的方面，优先调整后重新拍摄`

  const consSecondGeneral =
    secondWeakest.name === weakest.name
      ? `${z.primary}中各元素的视觉权重分配不够有意图——读者需要自己找重点`
      : `${z.secondary}中${secondWeakest.name}的处理可以更明确——具体参考同类型优秀${WORK_FORM_LABELS[input.workForm]}在${secondWeakest.name}上的排布方式，重点看它的元素大小比例和位置关系`

  const cons = isPhysicalModel
    ? [
        `${z.weakZone}中${weakestDetail}在照片中没有充分表达——可能是制作本身需要改进，也可能是拍摄角度没拍出来。建议补拍${weakest.name}的局部特写（近距离、良好光线），区分"做得不好"还是"没拍出来"`,
        consSecondPhysicalModel,
        `单张照片只能展示一个侧面——评审无法判断模型的背面/顶面/底面处理质量。至少补充正面、侧面、细节特写三张图，并在至少一张中放入尺度参照物`,
      ]
    : [
        `${z.weakZone}中${weakestDetail}当前不够突出——把这个区域的元素缩小或移离${z.primary}，让${strongest.name}成为无可争议的第一眼入口`,
        consSecondGeneral,
        `${z.primary}与${z.secondary}之间的视觉层级不够清楚——读者目前需要花时间判断先看哪里。重新安排各元素的尺寸比例和位置，让${strongest.name}明显大于其他元素`,
      ]

  // ============================================================
  // Suggestions — each must have: what → why → how → where
  // ============================================================

  const suggestions: Suggestion[] = [
    {
      id: 's1',
      type: 'priority',
      content: buildFormSuggestion(input.workForm, strongest, weakest),
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's2',
      type: 'priority',
      content: buildPurposeSuggestion(input.workForm, input.reviewPurpose, strongest, weakest),
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's3',
      type: 'quick_fix',
      content: buildQuickFixSuggestion(input.workForm, strongest),
      effort: 'low',
      impact: 'medium',
    },
  ]

  return {
    mentorReviews,
    pros,
    cons,
    suggestions,
    calibrationNote: isPhysicalModel
      ? `${band}：${strongest.name}（${strongestDetail}）表现较好，但${weakest.name}（${weakestDetail}）和单张照片的展示方式限制了最终分数。`
      : `${band}：${z.primary}中${strongest.name}（${strongestDetail}）是核心优势，但${z.weakZone}中${weakest.name}（${weakestDetail}）拖累了整体评价。`,
  }
}

// ============================================================
// Portfolio fallback — used when AI-generated reviews fail quality check
// ============================================================

type PortfolioFeedbackInput = {
  dimensions: DimensionScore[]
  scoreNumeric: number
  portfolioPurpose?: PortfolioPurpose
  targetCompany?: string
  targetRole?: string
  targetSchool?: string
  targetMajor?: string
}

export function buildPortfolioFeedbackFallback(input: PortfolioFeedbackInput): GeneratedFeedback {
  const sorted = validDimensions(input.dimensions)
  const strongest = sorted[0] ?? { name: '项目质量', score: input.scoreNumeric, description: '' }
  const weakest = sorted[sorted.length - 1] ?? { name: '差异化竞争力', score: input.scoreNumeric, description: '' }
  const secondWeakest = sorted[sorted.length - 2] ?? weakest
  const strongestDetail = compactDetail(strongest)
  const weakestDetail = compactDetail(weakest)
  const purpose = input.portfolioPurpose ?? 'unsure'
  const target =
    purpose === 'job'
      ? input.targetRole || input.targetCompany || '求职方向'
      : purpose === 'graduate'
        ? input.targetMajor || input.targetSchool || '申请方向'
        : purpose === 'course'
          ? '课程作业目标'
          : purpose === 'competition'
            ? '比赛投稿目标'
            : purpose === 'showcase'
              ? '视觉展示目标'
              : '当前目标场景'
  const interviewerLead =
    purpose === 'job'
      ? `如果投递${target}`
      : `如果用于${target}`
  const interviewerFocus =
    purpose === 'job'
      ? '面试官判断你的设计决策'
      : purpose === 'graduate'
        ? '导师判断你的研究潜力和方向一致性'
        : purpose === 'competition'
          ? '评委快速理解你的主题和差异点'
          : purpose === 'showcase'
            ? '观看者判断你的视觉风格和系列能力'
            : '评审者判断这份作品集是否适合当前用途'

  const mentorReviews: MentorReview[] = [
    {
      role: 'graduation_tutor',
      roleLabel: '毕业导师',
      content: `这份作品集中${strongestDetail}完成度较好，但当前可见页面里${weakestDetail}会让导师追问方法论。建议在${weakest.name}相关项目的首页或关键成果页旁补充：设计推导过程（问题→调研→方向→方案，各1-2页）、关键决策依据（每个主要设计选择附1句话说明为什么）、以及至少一轮反馈或测试结果。若这些内容已在其他页面存在，也应前置索引。`,
      highlights: [strongest.name, `把${weakest.name}过程证据前置到项目首页`],
    },
    {
      role: 'design_director',
      roleLabel: '设计总监',
      content: `作品集整体视觉已具备基本意识，${strongest.name}（${strongestDetail}）是可用的核心资产。但${weakest.name}（${weakestDetail}）会削弱翻页时的专业感——建议先统一3个要素：①确定1个正文字体+1个标题字体（全作品集不变）；②确定1个主色+1个辅助色（所有页面用这个配比）；③确定统一的页边距和网格（封面/目录/项目页/尾页一致）。`,
      highlights: [`强化${strongest.name}项目作为锚点`, '统一字体+色彩+网格三大视觉系统'],
    },
    {
      role: 'interviewer',
      roleLabel: '企业面试官',
      content: `${interviewerLead}，${strongest.name}（${strongestDetail}）会是有力的讨论素材。但当前可见页面里${weakest.name}（${weakestDetail}）不足以支撑${interviewerFocus}——建议在每个项目首页加3-4行文字标注：问题是什么→你做了什么→结果是什么→你学到了什么。`,
      highlights: ['每个项目首页加决策标注', `准备${secondWeakest.name}的解释材料`],
    },
    {
      role: 'ux_researcher',
      roleLabel: '用户研究员',
      content: `从用户视角看，作品集的信息架构需要更清晰：${strongestDetail}可以作为锚点项目——把它放在作品集最前面（封面之后第一个），确保阅读者在翻到第3页之前就能判断你的核心设计方向。其余项目按"最能展示设计思维"到"最能展示视觉执行力"的顺序排列，不要按完成时间排。`,
      highlights: ['把最强项目放到封面后第一位', '项目按能力展示维度重排'],
    },
  ]

  const pfProsSecond =
    secondWeakest.name === weakest.name
      ? `多个项目展示了持续的设计执行能力——保持这些项目在作品集中的位置，围绕它补充${weakest.name}相关的内容`
      : `${secondWeakest.name}展示了持续的设计执行能力——保持这个项目在作品集中的位置，围绕它补充${weakest.name}相关的内容`

  const pfProsThirdSuffix =
    secondWeakest.name === weakest.name ? '完成度' : secondWeakest.name

  const pros = [
    `${strongest.name}（${strongestDetail}）相对突出——把这个项目放到作品集最前面做锚点，它能代表你的核心能力`,
    pfProsSecond,
    `作品集整体结构具有进一步优化的基础——当前的${strongest.name}和${pfProsThirdSuffix}是有效的，只需要补充${weakest.name}和统一视觉系统`,
  ]

  const pfConsSecond =
    secondWeakest.name === weakest.name
      ? `多个项目的过程展示不充分`
      : `${secondWeakest.name}（${compactDetail(secondWeakest)}）还需要更充分的证据——在相关项目中增加1-2页推导或验证内容`

  const cons = [
    `${weakest.name}（${weakestDetail}）是当前可见页面中最明显的问题——优先在这个维度涉及的1-2个项目首页补充过程记录入口和决策依据，避免评审者在未看到完整过程时误判为"只有结果没有思考"`,
    pfConsSecond.replace('还需要更充分的证据', '在当前可见页面中还需要更充分的证据'),
    `作品集的视觉系统（字体/色彩/网格）在不同页面之间不够统一——选定一套规范后逐页检查，不一致的页面手动调整到统一标准`,
  ]

  const suggestions: Suggestion[] = [
    {
      id: 's1',
      type: 'priority',
      content: `优先补强${weakest.name}：在${weakest.name}最弱的1-2个项目首页，增加过程记录索引（草图/研究/迭代/验证）和关键决策说明`,
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's2',
      type: 'priority',
      content: `统一作品集视觉系统：锁定1个正文字体+1个标题字体、1个主色+1个辅助色、统一页边距和网格，逐页检查并调整不一致的页面`,
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's3',
      type: 'quick_fix',
      content: `重排项目顺序：把${strongest.name}项目放到封面后第一位，其余项目按"最能展示设计思维→最能展示执行力"排列，每个项目首页加1句话的项目简介`,
      effort: 'low',
      impact: 'medium',
    },
  ]

  return {
    mentorReviews,
    pros,
    cons,
    suggestions,
    calibrationNote: `作品集${strongest.name}（${strongestDetail}）表现较好，但${weakest.name}（${weakestDetail}）限制了整体竞争力。`,
  }
}
