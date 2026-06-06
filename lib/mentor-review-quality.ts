import { MentorReview } from '@/types'

// ============================================================
// Mentor review quality validation
// ============================================================

export interface QualityIssue {
  type: 'too_short' | 'no_visual_evidence' | 'cross_role_similar' | 'generic_template'
  detail: string
}

export interface QualityReport {
  passed: boolean
  score: number           // 0-100 quality score
  issues: QualityIssue[]
  reviews: MentorReview[]
}

// Minimum characters per review (Chinese chars, ~2-3 sentences of substance)
const MIN_REVIEW_LENGTH = 40

// Visual evidence patterns — review must contain at least 1 of these
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
]

// Generic template phrases that indicate lack of visual specificity
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

/**
 * Calculate similarity between two review texts using character bigram overlap.
 * Returns 0-1, where >0.7 is suspiciously similar.
 */
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

/**
 * Validate mentor reviews for quality:
 * 1. Each review must be at least MIN_REVIEW_LENGTH Chinese chars
 * 2. Each review must contain at least 1 visual evidence marker
 * 3. No two reviews should be >60% bigram-similar
 * 4. No review should contain only generic template phrases
 *
 * Returns a QualityReport with pass/fail and specific issues.
 */
export function validateMentorReviews(reviews: MentorReview[]): QualityReport {
  const issues: QualityIssue[] = []

  if (!reviews || reviews.length < 4) {
    return { passed: false, score: 0, issues: [{ type: 'too_short', detail: `仅 ${reviews?.length ?? 0} 条点评，需要 4 条` }], reviews }
  }

  // Check each review individually
  for (const review of reviews) {
    const charCount = countChineseChars(review.content)
    const hasVisual = hasVisualEvidence(review.content)
    const hasGeneric = hasGenericPhrases(review.content)

    if (charCount < MIN_REVIEW_LENGTH) {
      issues.push({
        type: 'too_short',
        detail: `「${review.roleLabel}」点评仅 ${charCount} 个汉字，需要至少 ${MIN_REVIEW_LENGTH} 字`,
      })
    }

    if (!hasVisual) {
      issues.push({
        type: 'no_visual_evidence',
        detail: `「${review.roleLabel}」点评缺少具体画面证据（版式/色彩/构图/元素/层级等）`,
      })
    }

    if (hasGeneric && charCount < 60) {
      issues.push({
        type: 'generic_template',
        detail: `「${review.roleLabel}」点评包含模板化措辞，缺乏针对具体画面的判断`,
      })
    }
  }

  // Check cross-role similarity
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

  // Score: start at 100, deduct for each issue
  const deductions = issues.length * 25
  const score = Math.max(0, 100 - deductions)
  const passed = issues.length === 0

  return { passed, score, issues, reviews }
}

/**
 * Quick check: can we use these AI-generated reviews, or should we fall back to templates?
 * More lenient than validateMentorReviews — allows minor issues.
 */
export function shouldUseAIReviews(reviews: MentorReview[]): { usable: boolean; reason?: string } {
  if (!reviews || reviews.length < 4) {
    return { usable: false, reason: '点评数量不足 4 条' }
  }

  const shortCount = reviews.filter((r) => countChineseChars(r.content) < 20).length
  if (shortCount >= 2) {
    return { usable: false, reason: `${shortCount} 条点评过短（<20 字）` }
  }

  // Check if ALL reviews lack visual evidence
  const withVisual = reviews.filter((r) => hasVisualEvidence(r.content)).length
  if (withVisual === 0) {
    return { usable: false, reason: '所有点评均无具体画面证据' }
  }

  // Check if reviews are just the role name or empty
  const emptyLike = reviews.filter((r) => r.content.trim().length < 10).length
  if (emptyLike > 0) {
    return { usable: false, reason: '存在空或几乎为空的点评' }
  }

  return { usable: true }
}
