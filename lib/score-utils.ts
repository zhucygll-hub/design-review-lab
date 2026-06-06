import { AnalysisResult, DimensionScore, NewScore } from '@/types'

// ============================================================
// Fixed weight tables
// ============================================================

// Single work review dimension weights (must sum to 100)
export const SINGLE_WORK_DIMENSION_NAMES = [
  '创意与概念',
  '逻辑与叙事',
  '视觉表达',
  '用户体验',
  '专业完成度',
  '创新价值',
  '商业与现实价值',
] as const

export const SINGLE_WORK_WEIGHTS: Record<string, number> = {
  '创意与概念': 15,
  '逻辑与叙事': 15,
  '视觉表达': 20,
  '用户体验': 10,
  '专业完成度': 15,
  '创新价值': 10,
  '商业与现实价值': 15,
}

// Portfolio review dimension weights (must sum to 100)
export const PORTFOLIO_DIMENSION_NAMES = [
  '项目质量',
  '项目完整度',
  '设计思维',
  '专业能力',
  '视觉表达能力',
  '差异化竞争力',
  '岗位匹配度',
] as const

export const PORTFOLIO_WEIGHTS: Record<string, number> = {
  '项目质量': 20,
  '项目完整度': 15,
  '设计思维': 20,
  '专业能力': 15,
  '视觉表达能力': 10,
  '差异化竞争力': 10,
  '岗位匹配度': 10,
}

// ============================================================
// Core calculation
// ============================================================

/**
 * Calculate weighted score from dimensions.
 * If a dimension's score is null (N/A), its weight is redistributed
 * proportionally among the remaining dimensions.
 */
export function calculateWeightedScore(
  dimensions: DimensionScore[],
  weightTable: Record<string, number>
): number {
  const valid = dimensions.filter((d) => d.score !== null && d.score !== undefined)
  if (valid.length === 0) return 0

  // Sum base weights of valid dimensions
  const validBaseWeight = valid.reduce((sum, d) => sum + (weightTable[d.name] ?? 0), 0)
  const totalBaseWeight = dimensions.reduce((sum, d) => sum + (weightTable[d.name] ?? 0), 0)

  // Redistribute N/A weight proportionally
  const redistributionFactor = totalBaseWeight > 0 ? totalBaseWeight / Math.max(validBaseWeight, 1) : 1

  let totalWeightedSum = 0
  let totalAppliedWeight = 0

  for (const d of valid) {
    const baseWeight = weightTable[d.name] ?? 0
    const adjustedWeight = baseWeight * redistributionFactor
    totalWeightedSum += d.score! * adjustedWeight
    totalAppliedWeight += adjustedWeight
  }

  return totalAppliedWeight > 0 ? Math.round(totalWeightedSum / totalAppliedWeight) : 0
}

// ============================================================
// Tier mapping
// ============================================================

export function numericToScore(numeric: number): NewScore {
  if (numeric >= 93) return 'S'
  if (numeric >= 88) return 'A+'
  if (numeric >= 82) return 'A'
  if (numeric >= 74) return 'B'
  if (numeric >= 67) return 'C'
  if (numeric >= 60) return 'D'
  return 'E'
}

export function getScoreLabel(score: NewScore): string {
  switch (score) {
    case 'S':  return '卓越 / Superlative'
    case 'A+': return '优异 / Outstanding'
    case 'A':  return '优秀 / Excellent'
    case 'B':  return '良好 / Good'
    case 'C':  return '一般 / Average'
    case 'D':  return '需改进 / Needs Improvement'
    case 'E':  return '不足 / Inadequate'
  }
}

export function getScoreTierDescription(score: NewScore): string {
  switch (score) {
    case 'S':  return '93-100分：国际顶级竞赛水准'
    case 'A+': return '88-92分：全国级/国际普通优秀'
    case 'A':  return '82-87分：校级优秀水准'
    case 'B':  return '74-81分：正常设计学生水平'
    case 'C':  return '67-73分：低于竞争线'
    case 'D':  return '60-66分：毫无竞争力'
    case 'E':  return '0-59分：无法称之为作品'
  }
}

// ============================================================
// Boundary proximity detection
// ============================================================

const TIER_BOUNDARIES: Array<{ threshold: number; label: string }> = [
  { threshold: 93, label: 'S/A+' },
  { threshold: 88, label: 'A+/A' },
  { threshold: 82, label: 'A/B' },
  { threshold: 74, label: 'B/C' },
  { threshold: 67, label: 'C/D' },
  { threshold: 60, label: 'D/E' },
]

/**
 * If the final score is within ±3 of a tier boundary, returns the boundary label
 * (e.g. "C/D"), otherwise null. Helps explain why re-running the same image
 * might flip between adjacent tiers due to normal AI scoring variance.
 */
export function getBoundaryProximity(finalScore: number): string | null {
  const PROXIMITY = 3
  let closest: { boundary: string; distance: number } | null = null

  for (const { threshold, label } of TIER_BOUNDARIES) {
    const distance = Math.abs(finalScore - threshold)
    if (distance <= PROXIMITY) {
      if (!closest || distance < closest.distance) {
        closest = { boundary: label, distance }
      }
    }
  }

  return closest?.boundary ?? null
}

// ============================================================
// Red flag cap rules
// ============================================================

/**
 * Apply red flag score cap.
 * - >= 3 redFlags → max 59
 * - >= 2 redFlags → max 69
 * - >= 1 redFlags → max 79
 */
export function applyRedFlagCap(score: number, redFlags: string[]): number {
  const count = redFlags.length
  if (count >= 3) return Math.min(score, 59)
  if (count >= 2) return Math.min(score, 69)
  if (count >= 1) return Math.min(score, 79)
  return score
}

// ============================================================
// High-score calibration — prevents "good" from beating "excellent"
// ============================================================

/**
 * Apply high-score calibration rules.
 * This ensures that a merely "good" work cannot accidentally score
 * higher than a truly excellent one.
 *
 * All rules are purely numeric — no NLP or semantic judgment.
 */
function highScoreCalibration(
  score: number,
  dimensions: DimensionScore[],
  redFlags: string[]
): number {
  // Only applies to A-tier and above (82+)
  if (score < 82) return score

  // Red flags: any red flag = not truly excellent, cap at B max
  if (redFlags.length >= 1) return Math.min(score, 79)

  const valid = dimensions.filter((d) => d.score !== null) as Array<{ score: number }>
  const scores = valid.map((d) => d.score)
  const getDimensionScore = (name: string) =>
    dimensions.find((d) => d.name === name)?.score ?? null

  const visualScore =
    getDimensionScore('视觉表达') ??
    getDimensionScore('视觉表达能力')
  const completionScore =
    getDimensionScore('专业完成度') ??
    getDimensionScore('项目完整度')

  const highDims = scores.filter((s) => s >= 90).length        // 90+
  const strongDims = scores.filter((s) => s >= 85).length       // 85+
  const weakDims = scores.filter((s) => s < 70).length          // below 70
  const hasBreakthrough = scores.some((s) => s >= 95)           // any dim at 95+

  // Rule 0: Aesthetic gate. High completion cannot compensate for weak visual taste.
  if (visualScore !== null) {
    if (visualScore < 70) return Math.min(score, 73)
    if (visualScore < 75) return Math.min(score, 79)
    if (visualScore < 80) return Math.min(score, 81)
    if (visualScore < 82 && completionScore !== null && completionScore >= 85) {
      return Math.min(score, 81)
    }
    if (visualScore < 85 && score >= 88) {
      return Math.min(score, 87)
    }
  }

  // Rule 1: No dimension reaches 90 → cannot be A+ or above
  if (highDims === 0) {
    return Math.min(score, 87)  // max A
  }

  // Rule 2: Only 1 strong dimension + multiple weak → cap at A
  if (highDims <= 1 && weakDims >= 3) {
    return Math.min(score, 87)
  }

  // Rule 3: Lacking breadth — fewer than 3 strong dimensions → max A+
  if (strongDims < 3 && score >= 90) {
    return Math.min(score, 89)
  }

  // Rule 4: Multiple weak dimensions prevent A+
  if (weakDims >= 2 && score >= 88) {
    return Math.min(score, 87)
  }

  // Rule 5: S-tier (93+) requires: 3+ dims at 90+, 5+ strong, breakthrough proof
  if (score >= 93) {
    if (highDims < 3 || strongDims < 5 || !hasBreakthrough) {
      return Math.min(score, 92)  // cap at A+ max
    }
  }

  return score
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ============================================================
// Normalization — the main stability function
// ============================================================

export interface NormalizeOptions {
  mode: 'single' | 'portfolio'
  weightTable?: Record<string, number>
  /** Debug: if true, prints recalculation info to server console */
  debug?: boolean
}

export interface NormalizeResult {
  result: AnalysisResult
  debugInfo: {
    aiRawScore: number
    aiRawDimensions: Array<{ name: string; score: number | null }>
    aiRawRedFlags: string[]
    recalculatedScore: number
    afterRedFlagCap: number
    afterCalibration: number
    wasCalibrated: boolean
    finalTier: NewScore
  }
}

/**
 * Normalize an AI analysis result for stability:
 * 1. Clamp all dimension scores to 0-100
 * 2. Recalculate total score from dimensions (ignore AI's scoreNumeric)
 * 3. Re-derive tier from recalculated score
 * 4. Apply red flag score caps
 * 5. Fix scoreLabel
 */
export function normalizeAnalysisResult(
  raw: AnalysisResult,
  opts: NormalizeOptions
): NormalizeResult {
  const weightTable = opts.weightTable ?? (opts.mode === 'portfolio' ? PORTFOLIO_WEIGHTS : SINGLE_WORK_WEIGHTS)

  // --- Capture raw AI values before modification ---
  const aiRawScore = raw.scoreNumeric ?? 0
  const aiRawDimensions = (raw.dimensions ?? []).map((d) => ({
    name: d.name,
    score: d.score,
  }))
  const aiRawRedFlags = [...(raw.redFlags ?? [])]

  // --- Step 1: Clamp dimension scores ---
  const clampedDimensions: DimensionScore[] = (raw.dimensions ?? []).map((d) => {
    const clamped = d.score !== null ? clamp(Math.round(d.score), 0, 100) : null
    return {
      ...d,
      score: clamped,
      weight: weightTable[d.name] ?? d.weight ?? 1,
    }
  })

  // --- Step 2: Recalculate total score ---
  const recalculatedScore = calculateWeightedScore(clampedDimensions, weightTable)

  // --- Step 3: Apply red flag cap ---
  const afterRedFlagCap = applyRedFlagCap(recalculatedScore, raw.redFlags ?? [])

  // --- Step 4: Apply high-score calibration ---
  const afterCalibration = highScoreCalibration(afterRedFlagCap, clampedDimensions, raw.redFlags ?? [])
  const wasCalibrated = afterCalibration !== afterRedFlagCap

  // --- Step 5: Derive tier ---
  const finalTier = numericToScore(afterCalibration)

  // --- Step 6: Fix scoreLabel ---
  const finalLabel = getScoreLabel(finalTier)

  // --- Step 7: Assemble normalized result ---
  const normalized: AnalysisResult = {
    ...raw,
    dimensions: clampedDimensions,
    score: finalTier,
    scoreNumeric: afterCalibration,
    scoreLabel: finalLabel,
    redFlags: raw.redFlags ?? [],
    calibrationNote: raw.calibrationNote,
  }

  const debugInfo = {
    aiRawScore,
    aiRawDimensions,
    aiRawRedFlags,
    recalculatedScore,
    afterRedFlagCap,
    afterCalibration,
    wasCalibrated,
    finalTier,
  }

  // --- Debug logging ---
  if (opts.debug || process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[normalizeAnalysisResult] Mode:', opts.mode)
    console.log('  AI raw scoreNumeric:', aiRawScore)
    console.log('  AI raw dimension scores:', aiRawDimensions.map((d) => `${d.name}=${d.score}`).join(', '))
    console.log('  AI raw redFlags:', aiRawRedFlags.length > 0 ? aiRawRedFlags : '(none)')
    console.log('  Recalculated weighted score:', recalculatedScore)
    if (aiRawRedFlags.length > 0) {
      console.log('  After redFlag cap (' + aiRawRedFlags.length + ' flags):', afterRedFlagCap)
    }
    if (wasCalibrated) {
      console.log('  After highScore calibration:', afterCalibration, '(was', afterRedFlagCap, ')')
    }
    console.log('  Final tier:', finalTier, '| Final numeric:', afterCalibration)
    console.log('  Deviation (AI vs final):', aiRawScore - afterCalibration > 0 ? '+' + (aiRawScore - afterCalibration) : aiRawScore - afterCalibration)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  return { result: normalized, debugInfo }
}
