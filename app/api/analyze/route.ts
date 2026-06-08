import { NextRequest, NextResponse } from 'next/server'
import { buildAnalysisPrompt } from '@/lib/ai-analysis-single'
import { getScoreLabel, normalizeAnalysisResult, numericToScore, getBoundaryProximity } from '@/lib/score-utils'
import { fetchArkWithRetry, parseArkError, parseArkJson } from '@/lib/ark-utils'
import { buildSingleWorkFeedback } from '@/lib/single-work-feedback'
import { buildSingleWorkWeightTable } from '@/lib/single-work-scenario'
import { shouldUseAIReviews, validateMentorReviews, shouldUseAIFeedback, validateFeedbackContent } from '@/lib/mentor-review-quality'
import {
  AnalysisResult,
  DesignType,
  PartialAnalysisResult,
  ReviewPurpose,
  WorkForm,
} from '@/types'

export const maxDuration = 120

const ARK_API_KEY = process.env.ARK_API_KEY
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-pro-260215'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const AI_TIMEOUT_MS = 90_000

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function arrayBufferToDataUri(bytes: Uint8Array, mimeType: string): string {
  return `data:${mimeType};base64,${arrayBufferToBase64(bytes)}`
}

function createRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function parseDesignType(value: FormDataEntryValue | null): DesignType {
  return value === 'concept' ? 'concept' : 'commercial'
}

function parseWorkForm(value: FormDataEntryValue | null): WorkForm {
  const allowed: WorkForm[] = ['board', 'physical_model', 'ui', 'poster', 'packaging_brand', 'other']
  return allowed.includes(value as WorkForm) ? (value as WorkForm) : 'board'
}

function parseReviewPurpose(value: FormDataEntryValue | null): ReviewPurpose {
  const allowed: ReviewPurpose[] = ['course', 'competition', 'job', 'practice']
  return allowed.includes(value as ReviewPurpose) ? (value as ReviewPurpose) : 'course'
}

function getMissingDimensionNames(
  result: PartialAnalysisResult,
  requiredDimensions: Record<string, number>
): string[] {
  const dimensions = result.dimensions ?? []

  return Object.keys(requiredDimensions).filter((name) => {
    const dimension = dimensions.find((d) => d.name === name)
    return !dimension || typeof dimension.score !== 'number'
  })
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'analyze',
    configured: Boolean(ARK_API_KEY && ARK_API_KEY !== 'your-api-key-here'),
    model: ARK_MODEL,
    baseUrlHost: new URL(ARK_BASE_URL).host,
    aiTimeoutMs: AI_TIMEOUT_MS,
    time: Date.now(),
  })
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId()
  const startedAt = Date.now()

  if (!ARK_API_KEY || ARK_API_KEY === 'your-api-key-here') {
    return NextResponse.json(
      { error: '请先在 EdgeOne Pages 中配置 ARK_API_KEY 环境变量', requestId },
      { status: 500 }
    )
  }

  try {
    console.log(`[analyze:${requestId}] Reading form data`)
    const formData = await request.formData()
    const designType = parseDesignType(formData.get('designType'))
    const workForm = parseWorkForm(formData.get('workForm'))
    const reviewPurpose = parseReviewPurpose(formData.get('reviewPurpose'))

    // Accept multiple files (1-3 images for single work)
    const files = formData.getAll('files') as File[]
    if (files.length === 0) {
      return NextResponse.json({ error: '未收到文件', requestId }, { status: 400 })
    }

    // Validate each file
    for (const file of files) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        return NextResponse.json(
          { error: '作品评审仅支持 JPG 或 PNG 图片', requestId },
          { status: 400 }
        )
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: '压缩后的图片仍超过 5MB，请缩小图片尺寸后重试', requestId },
          { status: 413 }
        )
      }
    }

    // Build data URIs for all images
    const dataUris = await Promise.all(
      files.map(async (file) => {
        const bytes = new Uint8Array(await file.arrayBuffer())
        return arrayBufferToDataUri(bytes, file.type)
      })
    )

    const imageCount = dataUris.length
    const { system, user } = buildAnalysisPrompt(designType, workForm, reviewPurpose, imageCount)
    const weightTable = buildSingleWorkWeightTable(designType, workForm, reviewPurpose)

    console.log(
      `[analyze:${requestId}] Calling Doubao, files=${files.length}, fileNames=${files.map(f => f.name).join(',')}, totalBytes=${files.reduce((s, f) => s + f.size, 0)}, type=${designType}, form=${workForm}, purpose=${reviewPurpose}`
    )

    const requiredDimensions = buildSingleWorkWeightTable(designType, workForm, reviewPurpose)
    let rawResult: PartialAnalysisResult | null = null
    let lastFormatError = 'AI 返回的评审核心格式不完整，请重试'

    for (let attempt = 1; attempt <= 2; attempt++) {
      const imageLabel = imageCount === 1 ? '图片' : `${imageCount} 张图片`
      const retryInstruction =
        attempt === 1
          ? ''
          : `\n\n上一次返回格式不完整。请重新分析同一${imageLabel}，只返回一个 JSON 对象；dimensions 必须完整包含以下 ${Object.keys(requiredDimensions).length} 个维度，且每个 score 必须是 0-100 的整数：${Object.keys(requiredDimensions).join('、')}。`

      // Build user message content with multiple image_url blocks
      const imageBlocks = dataUris.map((uri) => ({
        type: 'image_url' as const,
        image_url: { url: uri, detail: 'low' as const },
      }))

      const response = await fetchArkWithRetry(
        `${ARK_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ARK_API_KEY}`,
          },
          body: JSON.stringify({
            model: ARK_MODEL,
            messages: [
              { role: 'system', content: system },
              {
                role: 'user',
                content: [
                  ...imageBlocks,
                  { type: 'text', text: user + retryInstruction },
                ],
              },
            ],
            temperature: 0,
            top_p: 1,
            seed: 42,
            thinking: { type: 'disabled' },
            response_format: { type: 'json_object' },
            max_completion_tokens: 2600,
          }),
        },
        AI_TIMEOUT_MS,
        `[analyze:${requestId}:attempt${attempt}]`
      )

      if (!response.ok) {
        const errText = await response.text()
        console.error(`[analyze:${requestId}] Doubao error`, response.status, errText)
        return NextResponse.json(
          {
            error: parseArkError(response.status, errText, requestId),
            requestId,
          },
          { status: 502 }
        )
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        console.error(`[analyze:${requestId}] Empty Doubao response`, JSON.stringify(data))
        lastFormatError = 'AI 返回内容为空，请重试'
        continue
      }

      try {
        const parsed = parseArkJson<PartialAnalysisResult>(content, `[analyze:${requestId}:attempt${attempt}]`)
        const missingDimensions = getMissingDimensionNames(parsed, requiredDimensions)

        if (missingDimensions.length > 0) {
          lastFormatError = `AI 未完整返回维度评分：${missingDimensions.join('、')}`
          console.warn(`[analyze:${requestId}] Incomplete dimensions on attempt ${attempt}: ${missingDimensions.join(', ')}`)
          continue
        }

        rawResult = parsed
        break
      } catch (err) {
        lastFormatError = err instanceof Error ? err.message : lastFormatError
      }
    }

    if (!rawResult) {
      throw new Error(lastFormatError)
    }

    rawResult.dimensions = Object.entries(requiredDimensions).map(([name, weight]) => {
      const existing = rawResult.dimensions?.find((d) => d.name === name)
      return {
        name,
        score: existing?.score ?? null,
        description: existing?.description || 'AI 未返回该维度说明',
        weight,
      }
    })
    rawResult.id = requestId
    rawResult.createdAt = new Date().toISOString()
    rawResult.mode = 'single'
    rawResult.designType = designType
    rawResult.workForm = workForm
    rawResult.reviewPurpose = reviewPurpose
    rawResult.imageUrl = ''
    rawResult.fileName = files[0].name
    rawResult.scoreNumeric = rawResult.scoreNumeric ?? 0
    rawResult.score = rawResult.score ?? numericToScore(rawResult.scoreNumeric)
    rawResult.scoreLabel = rawResult.scoreLabel ?? getScoreLabel(rawResult.score)
    rawResult.redFlags = rawResult.redFlags ?? []
    const generatedFeedback = buildSingleWorkFeedback({
      dimensions: rawResult.dimensions,
      scoreNumeric: rawResult.scoreNumeric,
      designType,
      workForm,
      reviewPurpose,
      seedKey: `${requestId}:${files[0].name}:${files[0].size}`,
    })

    // ── Mentor review quality control ──
    const aiReviews = rawResult.mentorReviews
    if (aiReviews && aiReviews.length === 4) {
      const qualityCheck = shouldUseAIReviews(aiReviews)
      if (qualityCheck.usable) {
        const fullReport = validateMentorReviews(aiReviews)
        rawResult.mentorReviews = aiReviews
        console.log(
          `[analyze:${requestId}] AI mentor reviews accepted (quality=${fullReport.score}/100, issues=${fullReport.issues.length})`
        )
        if (fullReport.issues.length > 0) {
          console.warn(
            `[analyze:${requestId}] Mentor review minor issues:`,
            fullReport.issues.map((i) => i.detail)
          )
        }
      } else {
        console.warn(
          `[analyze:${requestId}] AI mentor reviews rejected: ${qualityCheck.reason}. Falling back to templates.`
        )
        rawResult.mentorReviews = generatedFeedback.mentorReviews
      }
    } else {
      console.log(
        `[analyze:${requestId}] AI returned ${aiReviews?.length ?? 0} mentor reviews, using template fallback`
      )
      rawResult.mentorReviews = generatedFeedback.mentorReviews
    }

    // pros/cons/suggestions: prefer AI, fall back to template
    const aiPros = rawResult.pros
    const aiCons = rawResult.cons
    const aiSuggestions = rawResult.suggestions
    if (aiPros && aiCons && aiSuggestions) {
      const feedbackCheck = shouldUseAIFeedback(aiPros, aiCons, aiSuggestions)
      if (feedbackCheck.usable) {
        const feedbackReport = validateFeedbackContent(aiPros, aiCons, aiSuggestions)
        rawResult.pros = aiPros
        rawResult.cons = aiCons
        rawResult.suggestions = aiSuggestions
        console.log(
          `[analyze:${requestId}] AI pros/cons/suggestions accepted (quality=${feedbackReport.score}/100, issues=${feedbackReport.issues.length})`
        )
        if (feedbackReport.issues.length > 0) {
          console.warn(
            `[analyze:${requestId}] Feedback minor issues:`,
            feedbackReport.issues.map((i) => i.detail)
          )
        }
      } else {
        console.warn(
          `[analyze:${requestId}] AI pros/cons/suggestions rejected: ${feedbackCheck.reason}. Using template fallback.`
        )
        rawResult.pros = generatedFeedback.pros
        rawResult.cons = generatedFeedback.cons
        rawResult.suggestions = generatedFeedback.suggestions
      }
    } else {
      console.log(
        `[analyze:${requestId}] AI returned incomplete pros/cons/suggestions, using template fallback`
      )
      rawResult.pros = generatedFeedback.pros
      rawResult.cons = generatedFeedback.cons
      rawResult.suggestions = generatedFeedback.suggestions
    }
    rawResult.calibrationNote = rawResult.calibrationNote || generatedFeedback.calibrationNote

    const { result, debugInfo } = normalizeAnalysisResult(rawResult as AnalysisResult, { mode: 'single', weightTable })
    result.scoreBreakdown = {
      rawWeightedScore: debugInfo.recalculatedScore,
      afterRedFlagCap: debugInfo.afterRedFlagCap,
      afterCalibration: debugInfo.afterCalibration,
      redFlagCount: debugInfo.aiRawRedFlags.length,
      wasRedFlagCapped: debugInfo.afterRedFlagCap !== debugInfo.recalculatedScore,
      wasHighScoreCalibrated: debugInfo.wasCalibrated,
      boundaryProximity: getBoundaryProximity(debugInfo.afterStabilityZone),
      stabilityZoneApplied: debugInfo.wasStabilityApplied,
    }

    // Build multi-image fields
    if (files.length > 1) {
      result.imageUrls = dataUris // base64 data URIs for preview (client-side overrides with blob URLs)
      result.fileNames = files.map((f) => f.name)
    }

    console.log(
      `[analyze:${requestId}] Success, tier=${result.score}, images=${files.length}, elapsed=${Date.now() - startedAt}ms`
    )

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    console.error(`[analyze:${requestId}] Failed after ${Date.now() - startedAt}ms`, err)

    return NextResponse.json(
      {
        error: message.includes('请求超时')
          ? 'AI 分析时间过长，请稍后重试或上传更清晰、内容更聚焦的图片'
          : `分析失败: ${message}`,
        requestId,
      },
      { status: 500 }
    )
  }
}
