import { DesignType, ReviewPurpose, WorkForm } from '@/types'

export interface AnalysisProgressStep {
  label: string
  detail: string
}

const WORK_FORM_STEPS: Record<WorkForm, AnalysisProgressStep[]> = {
  board: [
    { label: '梳理展板阅读顺序', detail: '检查标题、主视觉、图纸和说明文字的先后关系' },
    { label: '检查图文层级', detail: '判断哪些信息抢焦点，哪些信息需要弱化或重排' },
    { label: '定位主视觉问题', detail: '观察核心图、渲染图或图纸是否承担了第一眼表达' },
  ],
  physical_model: [
    { label: '观察模型造型比例', detail: '检查体块、轮廓、尺度和重心是否稳定' },
    { label: '判断结构与工艺表达', detail: '查看连接、材质、边缘细节和制作完成度' },
    { label: '分析展示角度', detail: '判断照片是否清楚呈现模型重点和局部细节' },
  ],
  ui: [
    { label: '梳理界面信息层级', detail: '检查页面主次、导航入口和关键内容是否清楚' },
    { label: '检查交互路径', detail: '判断用户从进入页面到完成目标的路径是否顺畅' },
    { label: '审阅组件一致性', detail: '查看按钮、卡片、状态反馈和间距是否统一' },
  ],
  poster: [
    { label: '识别海报主标题', detail: '判断主题信息是否能在第一眼被读到' },
    { label: '检查视觉焦点', detail: '观察画面中最吸引注意力的位置是否服务传播目标' },
    { label: '分析字体与色彩关系', detail: '判断文字对比、色彩情绪和传播记忆点是否成立' },
  ],
  packaging_brand: [
    { label: '检查品牌识别', detail: '判断标志、字体、色彩和图形系统是否统一' },
    { label: '评估包装正面信息', detail: '查看品名、卖点、层级和货架识别是否清楚' },
    { label: '分析系列与落地感', detail: '判断材质、结构和系列延展是否能支撑商业使用' },
  ],
  other: [
    { label: '识别作品核心对象', detail: '先判断图片中最主要的设计对象和表达载体' },
    { label: '检查可见画面证据', detail: '只基于图片中能看到的构图、细节和信息做判断' },
    { label: '整理主要问题位置', detail: '把问题定位到画面区域，而不是只给抽象结论' },
  ],
}

const PURPOSE_STEP: Record<ReviewPurpose, AnalysisProgressStep> = {
  course: { label: '对照课程作业目标', detail: '判断作品是否回应了课程方法和完成要求' },
  competition: { label: '判断比赛表达力度', detail: '检查主题冲击力、传播主张和评委可读性' },
  job: { label: '评估作品集呈现价值', detail: '判断这张作品能否证明岗位相关能力' },
  practice: { label: '判断练习改进方向', detail: '区分可以保留的训练成果和下一步短板' },
}

export function buildSingleWorkProgressSteps(
  designType: DesignType,
  workForm: WorkForm,
  reviewPurpose: ReviewPurpose
): AnalysisProgressStep[] {
  return [
    {
      label: '理解评审场景',
      detail:
        designType === 'concept'
          ? '按概念实验标准判断探索价值，不套用商业落地标准'
          : '按商业落地标准判断完成度、识别度和可执行性',
    },
    ...WORK_FORM_STEPS[workForm],
    PURPOSE_STEP[reviewPurpose],
    { label: '生成修改路线', detail: '把最大问题、保留优势和下一版优先动作整理成报告' },
  ]
}

export function buildPortfolioProgressSteps(): AnalysisProgressStep[] {
  return [
    { label: '检查项目完整度', detail: '浏览作品集结构、项目数量和页面组织' },
    { label: '判断项目质量', detail: '区分核心项目、弱项目和需要删减的页面' },
    { label: '审阅设计思维', detail: '查看问题定义、过程证据和方案取舍是否清楚' },
    { label: '分析视觉表达能力', detail: '判断版式、图像、字体和整体调性是否稳定' },
    { label: '评估差异化竞争力', detail: '寻找能让作品集被记住的能力证明' },
    { label: '匹配目标岗位', detail: '结合岗位或公司信息判断项目排序和表达重点' },
    { label: '生成作品集修改路线', detail: '整理优先删改页面、补充内容和面试表达建议' },
  ]
}
