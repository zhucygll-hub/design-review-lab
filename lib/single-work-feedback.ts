import {
  AnalysisResult,
  DesignType,
  DimensionScore,
  MentorReview,
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

function buildFormFocus(workForm: WorkForm, weakName: string): string {
  const map: Record<WorkForm, string> = {
    board: `先重排阅读顺序和图文层级，让${weakName}不再拖慢观看节奏`,
    physical_model: `先确保造型比例、结构表达和表面处理清晰可见，让${weakName}不拖累整体形态判断`,
    ui: `先统一关键界面状态和流程反馈，让${weakName}服务于真实使用`,
    poster: `先统一主视觉、字号、留白和色彩关系，让${weakName}变成第一眼优势`,
    packaging_brand: `先收拢品牌调性、字体和图形系统，让${weakName}更像完整方案`,
    other: `先明确媒介和受众，再围绕${weakName}重排表达重点`,
  }
  return map[workForm]
}

function buildPurposeFocus(reviewPurpose: ReviewPurpose, strongName: string, weakName: string, workForm: WorkForm): string {
  if (workForm === 'physical_model') {
    const map: Record<ReviewPurpose, string> = {
      course: `课程作业里可以突出${strongName}的造型判断，同时补充${weakName}对应的制作过程和多角度展示`,
      competition: `比赛投稿要把${strongName}的形态亮点放到最显眼的位置，同时避免${weakName}削弱评委对造型的判断`,
      job: `求职展示要讲清${strongName}背后的形态决策，并准备解释${weakName}的改进方向和工艺选择`,
      practice: `个人练习要记录${strongName}的造型探索过程，再把${weakName}作为下一轮打样或修改的训练目标`,
    }
    return map[reviewPurpose]
  }
  const map: Record<ReviewPurpose, string> = {
    course: `课程作业里可以保留${strongName}，但要补足${weakName}对应的过程依据`,
    competition: `比赛投稿要把${strongName}放到最显眼的位置，同时避免${weakName}削弱评委第一判断`,
    job: `求职展示要讲清${strongName}背后的决策，并准备解释${weakName}的改进计划`,
    practice: `个人练习要记录${strongName}的形成过程，再把${weakName}作为下一轮训练目标`,
  }
  return map[reviewPurpose]
}

export function buildSingleWorkFeedback(input: FeedbackInput): GeneratedFeedback {
  const sorted = validDimensions(input.dimensions)
  const strongest = sorted[0] ?? { name: '核心表达', score: input.scoreNumeric, description: '' }
  const weakest = sorted[sorted.length - 1] ?? { name: '细节完成度', score: input.scoreNumeric, description: '' }
  const secondWeakest = sorted[sorted.length - 2] ?? weakest
  const middle = sorted[Math.floor(sorted.length / 2)] ?? strongest
  const scenario = `${DESIGN_TYPE_LABELS[input.designType]} / ${WORK_FORM_LABELS[input.workForm]} / ${REVIEW_PURPOSE_LABELS[input.reviewPurpose]}`
  const band = getBand(input.scoreNumeric)
  const formFocus = buildFormFocus(input.workForm, weakest.name)
  const purposeFocus = buildPurposeFocus(input.reviewPurpose, strongest.name, weakest.name, input.workForm)
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
  const conceptPrefix =
    input.designType === 'concept'
      ? '概念实验要让探索理由更清楚，不能只停在形式好看。'
      : '商业落地要让价值、对象和执行路径更清楚。'

  const isPhysicalModel = input.workForm === 'physical_model'

  const graduationTemplates = isPhysicalModel
    ? [
        `从模型照片看，${strongestDetail}体现了造型意识和动手能力，但${weakestDetail}影响了设计的完整表达。建议补充多角度照片、细节特写和尺度参考物来支撑答辩。`,
        `这个模型的${strongest.name}是亮点，但${weakest.name}会让导师追问制作决策。答辩时需准备：为什么选择这个形态？制作中做了哪些关键取舍？哪些部分是手工/3D打印/CNC？`,
        `模型实物的${strongestDetail}已能说明设计方向，但仅靠单张照片还不够——建议补充不同角度、细节特写和过程记录，才能在答辩中完整呈现设计思考。`,
      ]
    : [
        `在${scenario}这个场景中，${describeDimension(strongest)}是你最能用来说服评审的部分。但${describeDimension(weakest)}可能被追问——建议补一组过程对比图（原始状态→中间版本→当前版本，3张小图横向排列），让评审看到你是怎么得到当前结果的。`,
        `从课程导师视角看，这张图强在${strongestDetail}，但${weakestDetail}会成为一个被追问的点。下一版建议在画面空白区域补2-3张关键推导小图，标注关键决策点（为什么选这个方向、放弃过什么方案），让导师能看到你的设计判断过程。`,
        `这次评审不能只看完成度。${strongest.name}已经能撑住作品方向，但${weakest.name}会让导师质疑你的方法掌握程度。建议补充1-2张过程草图或方案对比，用箭头+简短标注连接从问题到方案的逻辑，放在当前版面的左下或右下空白区。`,
      ]
  const directorTemplates = [
    `目前作品属于${band}状态。${strongestDetail}是画面中最有价值的部分——可以把它作为主视觉锚点，放大到当前尺寸的1.5倍左右，并把${weakest.name}对应区域缩小或移到次要位置，整体节奏会更像经过专业判断的结果。`,
    `设计总监第一眼看的是视觉是否\"成立\"：${strongestDetail}可以保留，但${weakestDetail}会拉低整体印象。建议先确定一个主导色和辅助色的配比（不是改配色方案，而是控制各色块在画面中的面积比例），再统一${WORK_FORM_LABELS[input.workForm]}中最显眼的3-4个元素的视觉重量。`,
    `这张图不宜平均用力。把${strongest.name}对应的内容放大到视觉焦点位置，把${weakest.name}的内容缩小或降低对比度，阅读者会在3秒内找到入口。`,
  ]
  const interviewerTemplates = isPhysicalModel
    ? [
        `${purposeFocus}。面试时不要只说”做了个模型”，要说为什么选择这个形态、制作中遇到了什么取舍、以及${secondWeakest.name}下一步怎么迭代。`,
        `如果把这个模型照片放进作品集，需要准备：为什么这样做？比例和形态的决策依据是什么？${weakest.name}为什么是当前这个状态？否则面试官会觉得只有结果没有思考。`,
        `展示时可以先讲${strongestDetail}的造型逻辑，再主动说明${weakestDetail}在当前版本的限制和下一步改进方向。这种坦诚比只展示完美成图更有说服力。`,
      ]
    : [
        `${purposeFocus}。面试时要讲三个层次：看到了什么问题→尝试了哪些方向→为什么选了当前方案。把${strongest.name}的决策过程变成故事，把${secondWeakest.name}的不足变成”下一版计划”——面试官更看重思考路径而非完美结果。`,
        `如果把它放进作品集，需要配一段简短说明：当时为什么选择${strongest.name}这个处理方式，以及${weakest.name}为什么暂时是这个状态。不要只放成图——在图片旁边用3-4行文字标注关键决策点，面试时就能直接指着讲。`,
        `展示时可以先讲${strongestDetail}的优点和它的决策逻辑，再主动说明${weakestDetail}在哪些条件限制下达成了当前版本、下一步会怎么调整。提前准备一个”如果重来我会怎么改”的回答。`,
      ]
  const researchTemplates = isPhysicalModel
    ? [
        `从模型形态可以推断一些使用线索（体量、比例、握持方式），但照片提供的信息有限。如果这是产品模型，建议补充人机尺度参考和简要使用场景说明。`,
        `当前照片主要展示造型，无法判断目标用户和使用情境。这不一定有问题——模型实物本来就不需要在一张照片里回答所有问题。如需完整评审，建议搭配展板或设计说明。`,
        `从体量感和比例关系可以推测大致的使用方式，但目前的照片无法验证。建议在作品集中搭配不同角度、手持对比或环境摆放照片来补充信息。`,
      ]
    : [
        `${conceptPrefix}建议在画面中或作品说明里补充一句：这个设计是为谁在什么场景下使用的？然后用${strongest.name}作为你已经做到了的证据，用${weakest.name}暴露的问题来反推下一轮要验证什么。`,
        `用户研究视角会追问：谁在什么情境下看这张${WORK_FORM_LABELS[input.workForm]}？${middleDetail}目前是画面中可以支撑回答的部分，但${weakest.name}在没有受众信息的情况下难以判断是否合理——建议补充目标受众和使用场景的简短标注。`,
        `目前的分析只能基于画面本身。如果这是实际项目，建议在画面角落或说明文字中标注：目标受众是谁、观看距离/场景是什么。然后回头检查${weakest.name}是否真的服务于这个场景。`,
      ]

  const graduationHighlights = isPhysicalModel
    ? [strongest.name, `补多角度展示`]
    : [strongest.name, `补强${weakest.name}`]

  const researchHighlights = isPhysicalModel
    ? ['形态可推断的线索', '补充使用场景']
    : ['明确受众', '补充验证']

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
      highlights: [`强化${strongest.name}`, `处理${weakest.name}`],
    },
    {
      role: 'interviewer',
      roleLabel: '企业面试官',
      content: pickVariant(interviewerTemplates, seed, 2),
      highlights: ['讲清决策', `说明${secondWeakest.name}`],
    },
    {
      role: 'ux_researcher',
      roleLabel: '用户研究员',
      content: pickVariant(researchTemplates, seed, 3),
      highlights: researchHighlights,
    },
  ]

  const pros = isPhysicalModel
    ? [
        `${strongest.name}相对突出，能支撑作品的核心造型表达`,
        `${secondWeakest.name === weakest.name ? '模型整体完成度' : secondWeakest.name}已有继续深化的基础——可尝试不同的表面处理或展示角度`,
        `模型实物形式能直观展示空间思维和动手能力，在作品集中搭配展板使用效果更好`,
      ]
    : [
        `${strongest.name}在画面中有可见的表现，已经构成了作品的核心说服力——可以在这个方向继续深入`,
        `${secondWeakest.name === weakest.name ? '整体完成度' : secondWeakest.name}已经达到可用状态，不需要从零重做，而是需要局部调整`,
        `选择了${WORK_FORM_LABELS[input.workForm]}形式来表达这个${DESIGN_TYPE_LABELS[input.designType]}项目，这个载体本身是合适的选择`,
      ]

  const cons = isPhysicalModel
    ? [
        `${weakest.name}在照片中表现不足——可能是制作本身的问题，也可能是展示方式没拍出来。建议补拍${weakest.name}相关的细节特写`,
        `${secondWeakest.name}还有提升空间：可以从造型比例、表面处理或展示角度中选择一个最影响观感的方面优先调整`,
        `单张照片只能展示一个角度，限制了评审能看到的深度——至少补充正面/侧面/细节三张图`,
      ]
    : [
        `${weakest.name}在画面中的处理方式（大小、位置、精细度）目前不够突出——可以从这个角度优先调整`,
        `${secondWeakest.name}的处理还有提升空间：建议对比同类型优秀作品在这一点上的做法，然后有针对性地修改`,
        `作品在画面组织上还可以更清晰：读者目前可能需要花时间找到重点，重新安排各元素的视觉权重可以解决这个问题`,
      ]

  const suggestions: Suggestion[] = [
    {
      id: 's1',
      type: 'priority',
      content: formFocus,
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's2',
      type: 'priority',
      content: purposeFocus,
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's3',
      type: 'quick_fix',
      content: `保留${strongest.name}最有说服力的部分，删减会分散注意力的弱信息`,
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
      ? `${band}：${strongest.name}表现较好，但${weakest.name}和单张照片的展示方式限制了最终分数。`
      : `${band}：${strongest.name}较强，但${weakest.name}限制了最终分数。`,
  }
}

// ============================================================
// Portfolio fallback — used when AI-generated reviews fail quality check
// ============================================================

type PortfolioFeedbackInput = {
  dimensions: DimensionScore[]
  scoreNumeric: number
  targetCompany?: string
  targetRole?: string
}

export function buildPortfolioFeedbackFallback(input: PortfolioFeedbackInput): GeneratedFeedback {
  const sorted = validDimensions(input.dimensions)
  const strongest = sorted[0] ?? { name: '项目质量', score: input.scoreNumeric, description: '' }
  const weakest = sorted[sorted.length - 1] ?? { name: '差异化竞争力', score: input.scoreNumeric, description: '' }
  const secondWeakest = sorted[sorted.length - 2] ?? weakest
  const strongestDetail = compactDetail(strongest)
  const weakestDetail = compactDetail(weakest)
  const target = input.targetRole || input.targetCompany || '目标岗位'

  const mentorReviews: MentorReview[] = [
    {
      role: 'graduation_tutor',
      roleLabel: '毕业导师',
      content: `这份作品集的${strongestDetail}完成度较好，但从学术角度看，${weakestDetail}还需要更多过程性材料支撑。建议补充设计推导、草图迭代和决策依据，让评审老师能看到完整的方法论。`,
      highlights: [strongest.name, `补过程依据`],
    },
    {
      role: 'design_director',
      roleLabel: '设计总监',
      content: `作品集整体视觉表达已具备基本意识，${strongest.name}是可用资产。但${weakest.name}会削弱专业感，建议统一作品集版式、字体层级和色彩系统，确保翻页观感一致。`,
      highlights: [`强化${strongest.name}`, `统一视觉语言`],
    },
    {
      role: 'interviewer',
      roleLabel: '企业面试官',
      content: `如果投递${target}，${strongest.name}会是面试中的正面的讨论点。但需要准备解释${weakest.name}的设计决策——面试官会追问"为什么这样处理"以及"如果重来会怎么改"。`,
      highlights: ['准备决策解释', `说明${secondWeakest.name}改进计划`],
    },
    {
      role: 'ux_researcher',
      roleLabel: '用户研究员',
      content: `从用户视角看，作品集的信息架构需要更清晰：阅读者能否快速判断你的设计方向？${strongestDetail}可以作为锚点项目，但要确保每个项目都能在 10 秒内传达核心价值。`,
      highlights: ['优化信息架构', '明确受众'],
    },
  ]

  const pros = [
    `${strongest.name}相对突出，能支撑作品集的核心价值`,
    `${secondWeakest.name === weakest.name ? '多个项目' : secondWeakest.name}展示了持续的设计能力`,
    `作品集整体结构具有进一步优化的空间`,
  ]

  const cons = [
    `${weakest.name}是当前最明显短板，容易影响整体判断`,
    `${secondWeakest.name}还需要更充分的证据或更深入的展示`,
    `作品集需要更清晰的叙事线和受众定位`,
  ]

  const suggestions: Suggestion[] = [
    {
      id: 's1',
      type: 'priority',
      content: `优先补强${weakest.name}，增加过程展示和决策依据`,
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's2',
      type: 'priority',
      content: `统一作品集的视觉语言和版式系统，提高专业感`,
      effort: 'medium',
      impact: 'high',
    },
    {
      id: 's3',
      type: 'quick_fix',
      content: `为每个项目添加简短的设计说明和关键决策点`,
      effort: 'low',
      impact: 'medium',
    },
  ]

  return {
    mentorReviews,
    pros,
    cons,
    suggestions,
    calibrationNote: `作品集${strongest.name}表现较好，但${weakest.name}限制了整体竞争力。`,
  }
}
