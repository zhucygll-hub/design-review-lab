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
    physical_model: `先检查比例、结构和材料表达，让${weakName}能被照片直接看出来`,
    ui: `先统一关键界面状态和流程反馈，让${weakName}服务于真实使用`,
    poster: `先统一主视觉、字号、留白和色彩关系，让${weakName}变成第一眼优势`,
    packaging_brand: `先收拢品牌调性、字体和图形系统，让${weakName}更像完整方案`,
    other: `先明确媒介和受众，再围绕${weakName}重排表达重点`,
  }
  return map[workForm]
}

function buildPurposeFocus(reviewPurpose: ReviewPurpose, strongName: string, weakName: string): string {
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
  const purposeFocus = buildPurposeFocus(input.reviewPurpose, strongest.name, weakest.name)
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

  const graduationTemplates = [
    `${scenario}里，${describeDimension(strongest)}是最能支撑成绩的部分；但${describeDimension(weakest)}还不够稳，建议补过程、依据和修改前后对比。`,
    `从课程导师视角看，这张图的优势在${strongestDetail}，短板集中在${weakestDetail}。下一版先把问题来源讲清楚，再补关键草图或推导证据。`,
    `这次评审不能只看完成度。${strongest.name}已经能撑住作品方向，但${weakest.name}会影响老师对方法掌握的判断，需要用更明确的过程材料补上。`,
  ]
  const directorTemplates = [
    `目前作品属于${band}状态。${formFocus}，再让${strongest.name}承担主卖点，整体观感会更像一个被设计过的结果。`,
    `设计总监会先看第一眼是否成立：${strongestDetail}是可用资产，但${weakestDetail}会削弱专业感。建议先收拢主视觉和层级，再处理细节。`,
    `这张图不宜平均用力。把${strongest.name}放到视觉中心，同时压掉影响${weakest.name}的杂信息，用户才会更快记住它。`,
  ]
  const interviewerTemplates = [
    `${purposeFocus}。面试或展示时不要只说“做了什么”，要说为什么这么判断，以及${secondWeakest.name}下一步怎么迭代。`,
    `如果把它放进作品集，需要准备一段解释：为什么${strongest.name}这样处理，以及${weakest.name}为什么还没到位。否则面试官会追问决策依据。`,
    `展示时可以先讲${strongestDetail}，再主动承认${weakestDetail}的不足，并给出下一版动作。这样比只展示成图更可信。`,
  ]
  const researchTemplates = [
    `${conceptPrefix}建议补一句目标受众或观看情境，再用${strongest.name}证明判断，用${weakest.name}暴露的问题反推下一步验证。`,
    `用户研究视角会问：谁在什么情境下看这张${WORK_FORM_LABELS[input.workForm]}？${middleDetail}可以作为观察点，${weakest.name}则需要更多验证依据。`,
    `现在的判断更多来自画面本身。建议补充观看对象、传播位置或使用情境，再检查${weakest.name}是否真的服务于这个情境。`,
  ]

  const mentorReviews: MentorReview[] = [
    {
      role: 'graduation_tutor',
      roleLabel: '毕业导师',
      content: pickVariant(graduationTemplates, seed, 0),
      highlights: [strongest.name, `补强${weakest.name}`],
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
      highlights: ['明确受众', '补充验证'],
    },
  ]

  const pros = [
    `${strongest.name}相对突出，能支撑作品的第一层价值`,
    `${secondWeakest.name === weakest.name ? '整体完成度' : secondWeakest.name}已经有继续深化的基础`,
    `${WORK_FORM_LABELS[input.workForm]}形式和${REVIEW_PURPOSE_LABELS[input.reviewPurpose]}目标之间有可优化空间`,
  ]

  const cons = [
    `${weakest.name}是当前最明显短板，容易拉低整体判断`,
    `${secondWeakest.name}还需要更明确的证据、层级或细节支撑`,
    `作品需要更清楚地说明它为什么适合${scenario}这个场景`,
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
    calibrationNote: `${band}：${strongest.name}较强，但${weakest.name}限制了最终分数。`,
  }
}
