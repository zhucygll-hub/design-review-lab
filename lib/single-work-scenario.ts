import { DimensionScore, DesignType, ReviewPurpose, WorkForm } from '@/types'

export const WORK_FORM_LABELS: Record<WorkForm, string> = {
  board: '展板',
  physical_model: '模型实物',
  ui: 'UI界面',
  poster: '海报视觉',
  packaging_brand: '包装品牌',
  other: '其他',
}

export const REVIEW_PURPOSE_LABELS: Record<ReviewPurpose, string> = {
  course: '课程作业',
  competition: '比赛投稿',
  job: '求职展示',
  practice: '个人练习',
}

export const DESIGN_TYPE_LABELS: Record<DesignType, string> = {
  commercial: '商业落地',
  concept: '概念实验',
}

const CORE_DIMENSIONS: DimensionScore[] = [
  { name: '创意与概念', score: 0, description: '想法、主题、记忆点', weight: 15 },
  { name: '逻辑与叙事', score: 0, description: '思路、信息组织、表达完整性', weight: 15 },
  { name: '视觉表达', score: 0, description: '色彩、排版、构图、层级、统一性', weight: 20 },
  { name: '专业完成度', score: 0, description: '细节、规范、成熟度', weight: 15 },
  { name: '创新价值', score: 0, description: '突破性、原创性、探索意识', weight: 10 },
]

const FORM_DIMENSIONS: Record<WorkForm, DimensionScore> = {
  board: { name: '信息组织与阅读性', score: 0, description: '展板阅读路径、信息层级、图文关系', weight: 12 },
  physical_model: { name: '结构与工艺合理性', score: 0, description: '造型结构、材料工艺、制作合理性', weight: 12 },
  ui: { name: '用户体验', score: 0, description: '易用性、流程、交互反馈、界面一致性', weight: 12 },
  poster: { name: '传播与记忆点', score: 0, description: '传播效率、视觉冲击、记忆识别度', weight: 12 },
  packaging_brand: { name: '品牌一致性', score: 0, description: '品牌调性、系统一致性、识别度', weight: 12 },
  other: { name: '使用场景适配度', score: 0, description: '作品与目标场景、媒介和受众的匹配', weight: 12 },
}

const PURPOSE_DIMENSIONS: Record<ReviewPurpose, DimensionScore> = {
  course: { name: '方法掌握与学习完成度', score: 0, description: '是否掌握课程方法并完成教学目标', weight: 13 },
  competition: { name: '主题冲击力与评审说服力', score: 0, description: '是否抓住命题并能打动竞赛评委', weight: 13 },
  job: { name: '岗位相关性与面试表达性', score: 0, description: '是否能证明岗位能力并支撑面试讲述', weight: 13 },
  practice: { name: '成长价值与改进空间', score: 0, description: '练习目标、能力提升和下一步价值', weight: 13 },
}

const CONCEPT_PURPOSE_DIMENSION: DimensionScore = {
  name: '探索价值与思辨深度',
  score: 0,
  description: '思想深度、边界探索、实验性价值',
  weight: 13,
}

export function buildSingleWorkDimensions(
  designType: DesignType,
  workForm: WorkForm,
  reviewPurpose: ReviewPurpose
): DimensionScore[] {
  return [
    ...CORE_DIMENSIONS,
    FORM_DIMENSIONS[workForm],
    designType === 'concept' ? CONCEPT_PURPOSE_DIMENSION : PURPOSE_DIMENSIONS[reviewPurpose],
  ]
}

export function buildSingleWorkWeightTable(
  designType: DesignType,
  workForm: WorkForm,
  reviewPurpose: ReviewPurpose
): Record<string, number> {
  return Object.fromEntries(
    buildSingleWorkDimensions(designType, workForm, reviewPurpose).map((d) => [d.name, d.weight ?? 1])
  )
}

export function buildScenarioSummary(
  designType: DesignType,
  workForm: WorkForm,
  reviewPurpose: ReviewPurpose
): string {
  return `${DESIGN_TYPE_LABELS[designType]} / ${WORK_FORM_LABELS[workForm]} / ${REVIEW_PURPOSE_LABELS[reviewPurpose]}`
}
