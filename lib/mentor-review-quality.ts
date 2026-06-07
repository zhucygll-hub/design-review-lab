import { MentorReview, Suggestion } from '@/types'

// ============================================================
// Mentor review quality validation
// ============================================================

export interface QualityIssue {
  type: 'too_short' | 'no_visual_evidence' | 'cross_role_similar' | 'generic_template' | 'abstract_only' | 'no_concrete_action'
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

// Generic template phrases
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
]

// Abstract words that signal "官话" when NOT followed by concrete actions
const ABSTRACT_PATTERNS = [
  /加强(?!.*(具体|调整|缩小|放大|移动|删除|添加|替换|重排|统一|标注|合并|拆[分解]|缩小|增加|减少|修改))/,
  /提升(?!.*(具体|调整|缩小|放大|移动|删除|添加|替换|重排|统一|标注|合并|拆[分解]|缩小|增加|减少|修改))/,
  /优化(?!.*(具体|调整|缩小|放大|移动|删除|添加|替换|重排|统一|标注|合并|拆[分解]|缩小|增加|减少|修改))/,
  /增强(?!.*(具体|调整|缩小|放大|移动|删除|添加|替换|重排|统一|标注|合并|拆[分解]|缩小|增加|减少|修改))/,
  /完善(?!.*(具体|调整|缩小|放大|移动|删除|添加|替换|重排|统一|标注|合并|拆[分解]|缩小|增加|减少|修改))/,
  /深化(?!.*(具体|调整|缩小|放大|移动|删除|添加|替换|重排|统一|标注|合并|拆[分解]|缩小|增加|减少|修改))/,
  /更需要.*(证据|支撑|表达|细节|层级)/,
  /有待.*(提高|加强|提升|完善)/,
  /还需.*(打磨|加强|提升|优化)/,
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

    if (charCount < MIN_REVIEW_LENGTH) {
      issues.push({
        type: 'too_short',
        detail: `「${review.roleLabel}」点评仅 ${charCount} 汉字，需至少 ${MIN_REVIEW_LENGTH} 字`,
      })
    }

    if (!hasVisual) {
      issues.push({
        type: 'no_visual_evidence',
        detail: `「${review.roleLabel}」点评缺少具体画面证据（版式/色彩/构图/造型/材质等）`,
      })
    }

    if (hasGeneric && charCount < 60) {
      issues.push({
        type: 'generic_template',
        detail: `「${review.roleLabel}」点评包含模板化措辞`,
      })
    }

    // New: detect abstract-only reviews (no concrete action)
    if (hasAbstract && !hasAction) {
      issues.push({
        type: 'abstract_only',
        detail: `「${review.roleLabel}」点评使用抽象建议但未给出具体修改动作（如调整/缩小/放大/移动/替换等）`,
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

  const withVisual = reviews.filter((r) => hasVisualEvidence(r.content)).length
  if (withVisual === 0) {
    return { usable: false, reason: '所有点评均无具体画面证据' }
  }

  const emptyLike = reviews.filter((r) => r.content.trim().length < 10).length
  if (emptyLike > 0) {
    return { usable: false, reason: '存在空或几乎为空的点评' }
  }

  // New: reject if ALL reviews are abstract without concrete actions
  const withAction = reviews.filter((r) => hasConcreteAction(r.content)).length
  const allAbstract = reviews.filter((r) => hasAbstractPhrases(r.content)).length
  if (allAbstract >= 3 && withAction === 0) {
    return { usable: false, reason: '所有点评均为抽象建议，无具体修改动作' }
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
      if (!hasVisualEvidence(p) && !hasConcreteAction(p)) {
        issues.push({ type: 'no_visual_evidence', detail: `优点${i + 1}缺少具体画面元素引用` })
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
      if (!hasVisualEvidence(c)) {
        issues.push({ type: 'no_visual_evidence', detail: `缺点${i + 1}缺少具体画面元素引用` })
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
    return { usable: false, reason: `仅 ${actionableSuggestions} 条建议包含具体操作动作` }
  }

  // Must have at least 2 pros with visual evidence
  const specificPros = pros.filter((p) => hasVisualEvidence(p) || hasConcreteAction(p)).length
  if (specificPros < 2) {
    return { usable: false, reason: `仅 ${specificPros} 条优点引用具体元素` }
  }

  return { usable: true }
}
