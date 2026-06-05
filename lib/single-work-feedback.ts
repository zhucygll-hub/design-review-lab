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
  const scenario = `${DESIGN_TYPE_LABELS[input.designType]} / ${WORK_FORM_LABELS[input.workForm]} / ${REVIEW_PURPOSE_LABELS[input.reviewPurpose]}`
  const band = getBand(input.scoreNumeric)
  const formFocus = buildFormFocus(input.workForm, weakest.name)
  const purposeFocus = buildPurposeFocus(input.reviewPurpose, strongest.name, weakest.name)
  const conceptPrefix =
    input.designType === 'concept'
      ? '概念实验要让探索理由更清楚，不能只停在形式好看。'
      : '商业落地要让价值、对象和执行路径更清楚。'

  const mentorReviews: MentorReview[] = [
    {
      role: 'graduation_tutor',
      roleLabel: '毕业导师',
      content: `${scenario}这个场景下，${describeDimension(strongest)}是亮点；但${describeDimension(weakest)}还不够稳，需要补过程、依据和修改前后对比。`,
      highlights: [strongest.name, `补强${weakest.name}`],
    },
    {
      role: 'design_director',
      roleLabel: '设计总监',
      content: `目前作品属于${band}状态。${formFocus}，再让${strongest.name}承担主卖点，整体观感会更像一个被设计过的结果。`,
      highlights: [`强化${strongest.name}`, `处理${weakest.name}`],
    },
    {
      role: 'interviewer',
      roleLabel: '企业面试官',
      content: `${purposeFocus}。面试或展示时不要只说“做了什么”，要说为什么这么判断，以及${secondWeakest.name}下一步怎么迭代。`,
      highlights: ['讲清决策', `说明${secondWeakest.name}`],
    },
    {
      role: 'ux_researcher',
      roleLabel: '用户研究员',
      content: `${conceptPrefix}建议补一句目标受众或观看情境，再用${strongest.name}证明判断，用${weakest.name}暴露的问题反推下一步验证。`,
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
