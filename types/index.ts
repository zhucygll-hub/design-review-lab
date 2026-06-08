export interface DimensionScore {
  name: string
  score: number | null // null = N/A (auto-skipped dimension, e.g. UX for static work)
  description: string
  weight?: number // only used in portfolio mode
}

export type MentorRole =
  | 'graduation_tutor'
  | 'design_director'
  | 'interviewer'
  | 'ux_researcher'

export interface MentorReview {
  role: MentorRole
  roleLabel: string
  content: string
  highlights: string[]
}

export interface Suggestion {
  id: string
  type: 'priority' | 'quick_fix'
  content: string
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
}

// 7-tier score system: S > A+ > A > B > C > D > E
export type NewScore = 'S' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E'

// Legacy scores from old analyses, kept for history backward compat
export type LegacyScore = 'A+' | 'A' | 'B+' | 'B' | 'C'

// Storage-level union — both old and new scores accepted
export type Score = NewScore | LegacyScore

export type AnalysisMode = 'single' | 'portfolio'
export type DesignType = 'commercial' | 'concept'
export type WorkForm = 'board' | 'physical_model' | 'ui' | 'poster' | 'packaging_brand' | 'other'
export type ReviewPurpose = 'course' | 'competition' | 'job' | 'practice'

export interface ScoreBreakdown {
  rawWeightedScore: number       // 七维加权原始分（红牌封顶前）
  afterRedFlagCap: number        // 红牌封顶后分数（与 raw 相同则为未触发）
  afterCalibration: number       // 最终校准后分数
  redFlagCount: number           // 触发红牌数量
  wasRedFlagCapped: boolean      // 是否因红牌被封顶
  wasHighScoreCalibrated: boolean // 是否触发高分校准
  boundaryProximity: string | null // 若最终分在档位边界 ±3 内，描述该边界（如 "C/D"），否则 null
}

export interface PortfolioReviewScope {
  totalPages: number
  analyzedPages: number[]
  analyzedPageCount: number
  strategy: 'full_pdf' | 'smart_sample'
  note: string
}

export interface AnalysisResult {
  id: string
  imageUrl: string
  fileName: string
  score: NewScore
  scoreNumeric: number
  scoreLabel: string
  mode: AnalysisMode
  dimensions: DimensionScore[]
  redFlags: string[]          // AI-detected red flag issues
  mentorReviews: MentorReview[]
  pros: string[]
  cons: string[]
  suggestions: Suggestion[]
  createdAt: string
  // Design type (single mode only)
  designType?: DesignType     // 'commercial' (default) | 'concept'
  workForm?: WorkForm
  reviewPurpose?: ReviewPurpose
  // Portfolio-specific
  targetCompany?: string
  targetRole?: string
  jobDescription?: string
  portfolioReviewScope?: PortfolioReviewScope
  // Calibration
  calibrationNote?: string   // AI-generated explanation of why this score tier
  scoreBreakdown?: ScoreBreakdown  // server-side calibration trace
}

export interface HistoryItem {
  id: string
  imageUrl: string
  fileName: string
  score: Score // legacy union for backward compat
  scoreNumeric: number
  mode: AnalysisMode
  designType?: DesignType
  workForm?: WorkForm
  reviewPurpose?: ReviewPurpose
  createdAt: string
}

export type PartialAnalysisResult = Partial<AnalysisResult> & {
  dimensions?: DimensionScore[]
}
