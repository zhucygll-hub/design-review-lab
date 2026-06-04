import { AnalysisResult, MentorReview } from '@/types'

const mockMentorReviews: Record<string, MentorReview> = {
  graduation_tutor: {
    role: 'graduation_tutor',
    roleLabel: '毕业导师',
    content:
      '从毕业设计角度来看，整体完成度较高。色彩搭配成熟，版式结构清晰，体现了良好的专业素养。但在设计理念的表达上还可以更加深入，特别是视觉层级的信息传递需要进一步强化。建议在核心信息点的强调上做更多尝试，让作品在答辩时更有说服力。',
    highlights: ['整体完成度较高', '色彩搭配成熟', '版式结构清晰', '需强化信息传递'],
  },
  design_director: {
    role: 'design_director',
    roleLabel: '设计总监',
    content:
      '这版作品有很好的基础，审美在线。视觉语言的使用有一定成熟度，但在商业落地的考虑上还有提升空间。从行业标准看，设计语言的统一性和品牌一致性可以进一步加强。建议在实际项目中多考虑用户场景和交互细节，让设计方案更具可执行性。',
    highlights: ['审美在线', '视觉语言成熟', '商业落地待提升', '考虑用户场景'],
  },
  interviewer: {
    role: 'interviewer',
    roleLabel: '企业面试官',
    content:
      '如果这是求职作品集的一部分，整体展现出了一定的设计功底。但我建议更注重设计过程的呈现——不仅仅是最终效果图，更要展示你的思考路径和决策依据。在企业面试中，我们更看重你"为什么这么做"而非单纯的"做成什么样"。建议补充设计推导和用户研究的环节。',
    highlights: ['有一定设计功底', '需展示设计过程', '补充决策依据', '重视思考路径'],
  },
  ux_researcher: {
    role: 'ux_researcher',
    roleLabel: '用户研究员',
    content:
      '从用户体验角度看，信息架构和导航逻辑基本合理。但在用户旅程的关键触点上还有优化空间。建议进行简单的可用性测试来验证当前方案。特别关注信息密度的平衡——当前某些区域信息过载，而有些重要信息却被弱化了。用户体验的细节往往决定了作品集给评审者的整体印象。',
    highlights: ['信息架构基本合理', '优化关键触点', '平衡信息密度', '进行可用性测试'],
  },
}

export function getMockAnalysisResult(imageUrl: string, fileName: string): AnalysisResult {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
    imageUrl,
    fileName,
    score: 'A' as const,
    scoreNumeric: 87,
    scoreLabel: '优秀 / Excellent',
    mode: 'single' as const,
    redFlags: [],
    dimensions: [
      { name: '创意与概念', score: 85, description: '想法有独特性，主题表达清晰，有一定记忆点' },
      { name: '逻辑与叙事', score: 88, description: '设计思路清晰，信息组织合理，表达完整' },
      { name: '视觉表达', score: 90, description: '色彩和谐度高，排版紧凑有序，构图有层次' },
      { name: '用户体验', score: 84, description: '交互逻辑清晰，信息导航路径合理' },
      { name: '专业完成度', score: 82, description: '细节处理到位，接近专业水准' },
      { name: '创新价值', score: 78, description: '遵循主流趋势，个人风格可更大胆' },
      { name: '商业与现实价值', score: 80, description: '设计方案可实现，市场价值较好' },
    ],
    mentorReviews: Object.values(mockMentorReviews),
    pros: [
      '色彩搭配和谐且富有层次',
      '版式布局清晰，留白节奏得当',
      '视觉语言成熟，有专业感',
      '整体完成度高，接近行业水准',
    ],
    cons: [
      '视觉层级的主次关系可以更加明确',
      '部分区域信息密度过高',
      '设计理念的表达不够深入',
      '缺少设计过程和推导环节',
    ],
    suggestions: [
      {
        id: 's1',
        type: 'priority',
        content: '强化核心视觉焦点，通过大小对比或色彩引导优化视觉层级',
        effort: 'low',
        impact: 'high',
      },
      {
        id: 's2',
        type: 'priority',
        content: '补充关键区域的设计说明和推导过程，让作品更有说服力',
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 's3',
        type: 'quick_fix',
        content: '适当降低高信息密度区域的元素数量，增加留白以提升呼吸感',
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 's4',
        type: 'quick_fix',
        content: '统一细微元素的设计语言，确保图标、间距、圆角等细节一致',
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 's5',
        type: 'priority',
        content: '增加一个简要的用户旅程图，展示设计如何解决用户核心痛点',
        effort: 'medium',
        impact: 'high',
      },
    ],
    createdAt: new Date().toISOString(),
  }
}

export const homePageCases = [
  {
    title: '品牌视觉设计',
    description: '一套完整的品牌识别系统',
    highlight: '视觉表达获得 A 评级',
  },
  {
    title: '移动端 UI 设计',
    description: '社交应用界面设计稿',
    highlight: '用户体验获得 A 评级',
  },
  {
    title: '产品海报设计',
    description: '系列产品宣传海报',
    highlight: '创意与概念获得 A 评级',
  },
]

export const testimonials = [
  {
    content: 'AI 给出的反馈非常专业，很多点都是我导师提过的。但 AI 更及时，凌晨提交也能立刻得到分析。',
    author: '张同学',
    role: '工业设计专业 · 大四',
  },
  {
    content: '作为视觉传达的学生，最怕的就是作品集盲目自信。这个工具帮我发现了几个一直忽略的问题。',
    author: '陈同学',
    role: '视觉传达专业 · 研二',
  },
  {
    content: '准备秋招作品集的时候用了这个，面试官真的问到了类似 AI 指出的问题。作品集评审模式对我帮助很大。',
    author: '李同学',
    role: 'UI/UX设计师 · 已入职字节',
  },
]
