import { MentorReview, Suggestion } from '@/types'

// ============================================================
// Mentor review quality validation
// ============================================================

export interface QualityIssue {
  type: 'too_short' | 'no_visual_evidence' | 'cross_role_similar' | 'generic_template' | 'abstract_only' | 'no_concrete_action' | 'no_location_reference' | 'vague_comparison'
  detail: string
}

export interface QualityReport {
  passed: boolean
  score: number
  issues: QualityIssue[]
  reviews: MentorReview[]
}

export interface FeedbackQualityReport {
  passed: boolean
  score: number
  issues: QualityIssue[]
}

// Minimum characters per review (Chinese chars)
const MIN_REVIEW_LENGTH = 40

// Location reference patterns — reviews must mention WHERE in the image
const LOCATION_PATTERNS = [
  // Board/Poster/General
  /(?:版面|画面|展板|海报|页[面数])[的]*(?:左上|右上|左下|右下|中央|中间|上方|下方|左侧|右侧|顶部|底部|边[缘角栏]|主视觉|标题|正文|背景|前景|页眉|页脚)/,
  /(?:主视觉区|标题区|辅助说明区|图纸区|图表区|信息栏|空白区|留白区)/,
  // Model
  /(?:模型|实物|作品)[的]*(?:正面|侧面|背面|顶面|底面|边缘|接缝|表面|底座|把手|开口|转轴|曲[面线]|轮[廓]|体[块])/,
  /(?:造型|比例|材质|工艺|涂装|表面处理|接缝|结构)/,
  // UI
  /(?:导航栏|主内容区|底部Tab|按钮|卡片|列表|搜索框|弹窗|工具栏|状态栏)/,
  // Packaging
  /(?:包装|盒)[的]*(?:正面|侧面|背面|顶盖|底标|封口|标签|条码|品牌区|产品名|说明文字)/,
  // Portfolio
  /(?:作品集|PDF)[的]*(?:封面|目录|第[一二三四五六七八九十\d]+[个页]|分隔页|尾页|首页|过程页|成果页|项目)/,
  // Position words
  /(?:放大|缩小|移[到动至开]|删[除减]|放[在到]|加[在上入]|标[注出]|补[充拍]|替[换]|重[排新]|统[一]|合[并]|拆[分]|调[整]|改[为成]|换[成到])/,
]

// Visual evidence patterns
const VISUAL_PATTERNS = [
  /版[式面]/,
  /排[版列]/,
  /构[图成]/,
  /色[彩调]/,
  /字[体号]/,
  /图[片形像]/,
  /元[素件]/,
  /主[次视]/,
  /视[觉角]/,
  /焦[点点]/,
  /层[级次]/,
  /留[白空]/,
  /对[比比齐]/,
  /网[格线]/,
  /图[标案]/,
  /背[景]/,
  /间[距]/,
  /比[例]/,
  /造[型]/,
  /材[质]/,
  /光[影]/,
  /透[视]/,
  /密[度]/,
  /顺[序]/,
  /草[图]/,
  /过[程]/,
  /迭[代]/,
  /项[目目]/,
  /封[面]/,
  /目[录]/,
  // Model-specific
  /体[块量]/,
  /曲[面线]/,
  /轮[廓]/,
  /表[面]/,
  /接[缝]/,
  /工[艺]/,
  /打[样模]/,
  /制[作]/,
  /拍[摄]/,
  /角[度]/,
  /尺[度寸]/,
  /展[示]/,
  /原[型]/,
  /手[工]/,
  /3[Dd]/,
  /CNC/,
  /打[印]/,
  /涂[装]/,
  /喷[漆涂]/,
]

// Generic template phrases — expanded with user-reported "官话"
const GENERIC_PATTERNS = [
  /结合维度评价/,
  /提升视觉完成度/,
  /加强逻辑表达/,
  /建议进一步优化/,
  /仍有改进空间/,
  /整体表现一般/,
  /需要继续努力/,
  /可以继续深化/,
  /建议多加练习/,
  /注意细节处理/,
  // User-reported "官话" patterns
  /在画面中的处理方式[^\w]{0,5}(?:目前)?不够突出/,
  /的处理还有提升空间/,
  /在画面组织上还可以更清晰/,
  /建议对比同类型优秀作品/,
  /具有进一步优化[的]*空间/,
  /需要更(?:明确|清晰|强|多)的/,
  /可以从这个角度/,
  /建议(?:进一步|继续|多加)/,
]

// Abstract words that signal "官话" when NOT followed by concrete actions
const ABSTRACT_PATTERNS = [
  /加强(?!.{0,30}(调整|缩小|放大|移[动到]|删[除减]|添?加|替换|重排|统一|标注|合并|拆[分解]|增大|减小|修改|补[充拍]|改[为成]|放[在到]|换成|降低|增强|去掉))/,
  /提升(?!.{0,30}(调整|缩小|放大|移[动到]|删[除减]|添?加|替换|重排|统一|标注|合并|拆[分解]|增大|减小|修改|补[充拍]|改[为成]|放[在到]|换成|降低|增强|去掉))/,
  /优化(?!.{0,30}(调整|缩小|放大|移[动到]|删[除减]|添?加|替换|重排|统一|标注|合并|拆[分解]|增大|减小|修改|补[充拍]|改[为成]|放[在到]|换成|降低|增强|去掉))/,
  /增强(?!.{0,30}(调整|缩小|放大|移[动到]|删[除减]|添?加|替换|重排|统一|标注|合并|拆[分解]|增大|减小|修改|补[充拍]|改[为成]|放[在到]|换成|降低|增强|去掉))/,
  /完善(?!.{0,30}(调整|缩小|放大|移[动到]|删[除减]|添?加|替换|重排|统一|标注|合并|拆[分解]|增大|减小|修改|补[充拍]|改[为成]|放[在到]|换成|降低|增强|去掉))/,
  /深化(?!.{0,30}(调整|缩小|放大|移[动到]|删[除减]|添?加|替换|重排|统一|标注|合并|拆[分解]|增大|减小|修改|补[充拍]|改[为成]|放[在到]|换成|降低|增强|去掉))/,
  /更需要.*(证据|支撑|表达|细节|层级|突出)/,
  /有待.*(提高|加强|提升|完善)/,
  /还需.*(打磨|加强|提升|优化)/,
  // User-reported "官话" patterns — expanded
  /不够(?:突出|明确|清晰|充分|完整)/,
  /(?:相对|比较|较为)(?:突出|好|强|弱|差)/,
  /(?:可读性|阅读性|说服力|识别性|完整性|层次感)(?!.{0,20}(调整|缩小|放大|移[动到]|改[为成]))/,
  /可以(?:继续|进一步|更加)(?:深入|加强|提升|优化)/,
]

// Vague comparison — "建议对比同类型优秀作品" without specifying WHAT to compare
const VAGUE_COMPARISON_PATTERNS = [
  /对比.*优秀作品(?!.*(?:排版|网格|字体|色彩|比例|层级|留白|标题|主视觉|阅读顺序))/,
  /参考.*同类(?!.*(?:排版|网格|字体|色彩|比例|层级|留白|标题|主视觉|阅读顺序))/,
]

// Concrete action verbs — text should contain at least some of these
const CONCRETE_ACTION_PATTERNS = [
  /调整/,
  /缩小/,
  /放大/,
  /移到/,
  /删除/,
  /添加/,
  /替换/,
  /重排/,
  /统一/,
  /标注/,
  /合并/,
  /拆分/,
  /增加/,
  /减少/,
  /修改/,
  /补[充加]/,
  /改[为成]/,
  /放[在到]/,
  /换[成]/,
]

function countChineseChars(text: string): number {
  const matches = text.match(/[一-鿿]/g)
  return matches ? matches.length : 0
}

function hasVisualEvidence(text: string): boolean {
  return VISUAL_PATTERNS.some((p) => p.test(text))
}

function hasGenericPhrases(text: string): boolean {
  return GENERIC_PATTERNS.some((p) => p.test(text))
}

function hasAbstractPhrases(text: string): boolean {
  return ABSTRACT_PATTERNS.some((p) => p.test(text))
}

function hasConcreteAction(text: string): boolean {
  return CONCRETE_ACTION_PATTERNS.some((p) => p.test(text))
}

function hasLocationReference(text: string): boolean {
  return LOCATION_PATTERNS.some((p) => p.test(text))
}

function hasVagueComparison(text: string): boolean {
  return VAGUE_COMPARISON_PATTERNS.some((p) => p.test(text))
}

function textSimilarity(a: string, b: string): number {
  const bigrams = (s: string) => {
    const set = new Set<string>()
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.slice(i, i + 2))
    }
    return set
  }

  const setA = bigrams(a)
  const setB = bigrams(b)

  if (setA.size === 0 || setB.size === 0) return 0

  let overlap = 0
  for (const bg of setA) {
    if (setB.has(bg)) overlap++
  }

  return overlap / Math.min(setA.size, setB.size)
}

export function validateMentorReviews(reviews: MentorReview[]): QualityReport {
  const issues: QualityIssue[] = []

  if (!reviews || reviews.length < 4) {
    return { passed: false, score: 0, issues: [{ type: 'too_short', detail: `仅 ${reviews?.length ?? 0} 条点评，需要 4 条` }], reviews }
  }

  for (const review of reviews) {
    const charCount = countChineseChars(review.content)
    const hasVisual = hasVisualEvidence(review.content)
    const hasGeneric = hasGenericPhrases(review.content)
    const hasAbstract = hasAbstractPhrases(review.content)
    const hasAction = hasConcreteAction(review.content)
    const hasLocation = hasLocationReference(review.content)
    const hasVague = hasVagueComparison(review.content)

    if (charCount < MIN_REVIEW_LENGTH) {
      issues.push({
        type: 'too_short',
        detail: `「${review.roleLabel}」点评仅 ${charCount} 汉字，需至少 ${MIN_REVIEW_LENGTH} 字`,
      })
    }

    if (!hasVisual && !hasLocation) {
      issues.push({
        type: 'no_visual_evidence',
        detail: `「${review.roleLabel}」点评缺少具体画面证据或位置引用`,
      })
    }

    if (hasGeneric && charCount < 60) {
      issues.push({
        type: 'generic_template',
        detail: `「${review.roleLabel}」点评包含模板化措辞`,
      })
    }

    // Detect abstract-only reviews (no concrete action)
    if (hasAbstract && !hasAction) {
      issues.push({
        type: 'abstract_only',
        detail: `「${review.roleLabel}」点评使用抽象建议但未给出具体修改动作`,
      })
    }

    // Missing location reference
    if (!hasLocation && charCount >= MIN_REVIEW_LENGTH) {
      issues.push({
        type: 'no_location_reference',
        detail: `「${review.roleLabel}」点评未引用画面中的具体位置（如"版面左上角"、"标题区"、"模型正面"）`,
      })
    }

    // Vague comparison without specifics
    if (hasVague) {
      issues.push({
        type: 'vague_comparison',
        detail: `「${review.roleLabel}」建议对比优秀作品但未说明参考什么具体方面`,
      })
    }
  }

  // Cross-role similarity
  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      const similarity = textSimilarity(reviews[i].content, reviews[j].content)
      if (similarity > 0.6) {
        issues.push({
          type: 'cross_role_similar',
          detail: `「${reviews[i].roleLabel}」与「${reviews[j].roleLabel}」点评内容过于相似（${Math.round(similarity * 100)}%）`,
        })
      }
    }
  }

  const deductions = issues.length * 25
  const score = Math.max(0, 100 - deductions)
  const passed = issues.length === 0

  return { passed, score, issues, reviews }
}

export function shouldUseAIReviews(reviews: MentorReview[]): { usable: boolean; reason?: string } {
  if (!reviews || reviews.length < 4) {
    return { usable: false, reason: '点评数量不足 4 条' }
  }

  const shortCount = reviews.filter((r) => countChineseChars(r.content) < 20).length
  if (shortCount >= 2) {
    return { usable: false, reason: `${shortCount} 条点评过短（<20 字）` }
  }

  const withVisual = reviews.filter((r) => hasVisualEvidence(r.content) || hasLocationReference(r.content)).length
  if (withVisual === 0) {
    return { usable: false, reason: '所有点评均无具体画面证据或位置引用' }
  }

  const emptyLike = reviews.filter((r) => r.content.trim().length < 10).length
  if (emptyLike > 0) {
    return { usable: false, reason: '存在空或几乎为空的点评' }
  }

  // Reject if ALL reviews are abstract without concrete actions
  const withAction = reviews.filter((r) => hasConcreteAction(r.content)).length
  const allAbstract = reviews.filter((r) => hasAbstractPhrases(r.content)).length
  if (allAbstract >= 3 && withAction === 0) {
    return { usable: false, reason: '所有点评均为抽象建议，无具体修改动作' }
  }

  // New: require at least 2 reviews to have location references
  const withLocation = reviews.filter((r) => hasLocationReference(r.content)).length
  if (withLocation < 2) {
    return { usable: false, reason: `仅 ${withLocation} 条点评引用了画面具体位置（需≥2）` }
  }

  // New: reject if 2+ reviews contain vague comparisons without specifics
  const vagueCount = reviews.filter((r) => hasVagueComparison(r.content)).length
  if (vagueCount >= 2) {
    return { usable: false, reason: `${vagueCount} 条点评使用模糊对比（建议对比优秀作品但不说参考什么）` }
  }

  return { usable: true }
}

// ============================================================
// Pros / cons / suggestions quality validation
// ============================================================

/**
 * Validate AI-generated pros/cons/suggestions for concreteness.
 * Returns a FeedbackQualityReport.
 */
export function validateFeedbackContent(
  pros: string[],
  cons: string[],
  suggestions: Suggestion[]
): FeedbackQualityReport {
  const issues: QualityIssue[] = []

  // Check pros
  if (!pros || pros.length < 3) {
    issues.push({ type: 'too_short', detail: `优点仅 ${pros?.length ?? 0} 条，需 3 条` })
  } else {
    for (let i = 0; i < pros.length; i++) {
      const p = pros[i]
      const chars = countChineseChars(p)
      if (chars < 10) {
        issues.push({ type: 'too_short', detail: `优点${i + 1}仅 ${chars} 汉字，过于简短` })
      }
      if (!hasVisualEvidence(p) && !hasConcreteAction(p) && !hasLocationReference(p)) {
        issues.push({ type: 'no_visual_evidence', detail: `优点${i + 1}缺少具体画面元素或位置引用` })
      }
      if (hasAbstractPhrases(p) && !hasConcreteAction(p)) {
        issues.push({ type: 'abstract_only', detail: `优点${i + 1}使用抽象措辞但未具体说明好在哪里` })
      }
    }
  }

  // Check cons
  if (!cons || cons.length < 3) {
    issues.push({ type: 'too_short', detail: `缺点仅 ${cons?.length ?? 0} 条，需 3 条` })
  } else {
    for (let i = 0; i < cons.length; i++) {
      const c = cons[i]
      const chars = countChineseChars(c)
      if (chars < 10) {
        issues.push({ type: 'too_short', detail: `缺点${i + 1}仅 ${chars} 汉字，过于简短` })
      }
      if (hasAbstractPhrases(c) && !hasConcreteAction(c)) {
        issues.push({ type: 'abstract_only', detail: `缺点${i + 1}使用抽象措辞但未说明具体问题` })
      }
      if (!hasVisualEvidence(c) && !hasLocationReference(c)) {
        issues.push({ type: 'no_location_reference', detail: `缺点${i + 1}缺少具体画面位置引用` })
      }
      if (hasVagueComparison(c)) {
        issues.push({ type: 'vague_comparison', detail: `缺点${i + 1}建议对比但未说明参考什么具体方面` })
      }
    }
  }

  // Check suggestions
  if (!suggestions || suggestions.length < 3) {
    issues.push({ type: 'too_short', detail: `建议仅 ${suggestions?.length ?? 0} 条，需 3 条` })
  } else {
    for (let i = 0; i < suggestions.length; i++) {
      const s = suggestions[i]
      const chars = countChineseChars(s.content)
      if (chars < 15) {
        issues.push({ type: 'too_short', detail: `建议${i + 1}仅 ${chars} 汉字，过于简短` })
      }
      if (!hasConcreteAction(s.content)) {
        issues.push({ type: 'no_concrete_action', detail: `建议${i + 1}缺少具体操作动词（调整/缩小/放大/移动/替换/重排等）` })
      }
    }
  }

  // Cross-check: are cons and suggestions too similar? (same abstract language)
  if (cons && suggestions) {
    const abstractCons = cons.filter((c) => hasAbstractPhrases(c) && !hasConcreteAction(c)).length
    const vagueSuggestions = suggestions.filter((s) => !hasConcreteAction(s.content)).length
    if (abstractCons >= 2 && vagueSuggestions >= 2) {
      issues.push({
        type: 'abstract_only',
        detail: `多条优缺点和建议均为抽象措辞，缺乏具体修改动作`,
      })
    }
  }

  const deductions = issues.length * 20
  const score = Math.max(0, 100 - deductions)
  const passed = issues.filter((i) => i.type === 'no_concrete_action' || i.type === 'abstract_only').length === 0

  return { passed, score, issues }
}

/**
 * Quick check: should we use AI-generated pros/cons/suggestions?
 */
export function shouldUseAIFeedback(
  pros: string[],
  cons: string[],
  suggestions: Suggestion[]
): { usable: boolean; reason?: string } {
  if (!pros || pros.length < 3) return { usable: false, reason: '优点数量不足' }
  if (!cons || cons.length < 3) return { usable: false, reason: '缺点数量不足' }
  if (!suggestions || suggestions.length < 3) return { usable: false, reason: '建议数量不足' }

  // Must have at least 2 suggestions with concrete actions
  const actionableSuggestions = suggestions.filter((s) => hasConcreteAction(s.content)).length
  if (actionableSuggestions < 2) {
    return { usable: false, reason: `仅 ${actionableSuggestions} 条建议包含具体操作动作（需≥2）` }
  }

  // Must have at least 2 pros with visual evidence or location reference
  const specificPros = pros.filter((p) => hasVisualEvidence(p) || hasConcreteAction(p) || hasLocationReference(p)).length
  if (specificPros < 2) {
    return { usable: false, reason: `仅 ${specificPros} 条优点引用具体元素或位置（需≥2）` }
  }

  // Must have at least 2 cons with location or visual evidence
  const specificCons = cons.filter((c) => hasVisualEvidence(c) || hasLocationReference(c)).length
  if (specificCons < 2) {
    return { usable: false, reason: `仅 ${specificCons} 条缺点引用具体画面位置（需≥2）` }
  }

  // Reject if pros contain vague comparisons
  const vaguePros = pros.filter((p) => hasVagueComparison(p)).length
  if (vaguePros >= 2) {
    return { usable: false, reason: `${vaguePros} 条优点使用模糊对比` }
  }

  return { usable: true }
}
