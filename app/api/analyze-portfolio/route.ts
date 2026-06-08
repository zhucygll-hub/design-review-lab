import { NextRequest, NextResponse } from 'next/server'
import { buildPortfolioAnalysisPrompt } from '@/lib/ai-analysis-portfolio'
import { normalizeAnalysisResult, getBoundaryProximity } from '@/lib/score-utils'
import {
  extractResponsesText,
  fetchArkWithRetry,
  parseArkError,
  parseArkJson,
} from '@/lib/ark-utils'
import { buildPortfolioFeedbackFallback } from '@/lib/single-work-feedback'
import { shouldUseAIReviews, validateMentorReviews, shouldUseAIFeedback, validateFeedbackContent } from '@/lib/mentor-review-quality'
import { AnalysisResult } from '@/types'

export const maxDuration = 120

const ARK_API_KEY = process.env.ARK_API_KEY
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-pro-260215'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
// 12MB safe ceiling for PDF: EdgeOne Functions allow ~20MB request body.
// Base64 encoding adds ~1.33×, so 12MB original → ~16MB base64 + ~1MB JSON = ~17MB < 20MB.
// Files >12MB should be handled client-side via image conversion before reaching this route.
const MAX_PDF_BYTES = 12 * 1024 * 1024
const AI_TIMEOUT_MS = 105_000

// Edge-compatible base64 encoder (no Buffer API in Edge Functions)
function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function createRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function softenSampledEvidenceClaim(text: string): string {
  return text
    .replace(/作品集没有(调研|研究|建模|草图|过程|推导|文字说明|设计思维)/g, '重点分析页中未看到$1')
    .replace(/用户没有(调研|研究|建模|草图|过程|推导|文字说明|设计思维)/g, '重点分析页中未看到$1')
    .replace(/没有明确的(调研|研究|建模|草图|过程|推导|文字说明|设计思维)/g, '重点分析页中未看到明确的$1')
    .replace(/缺少(调研|研究|建模|草图|过程|推导|文字说明|设计思维)/g, '重点分析页中未看到$1')
    .replace(/无(调研|研究|建模|草图|过程|推导|文字说明|设计思维)/g, '重点分析页中未看到$1')
}

function applySampledEvidenceBoundary(result: AnalysisResult): void {
  result.redFlags = (result.redFlags ?? []).map(softenSampledEvidenceClaim)
  result.calibrationNote = result.calibrationNote
    ? softenSampledEvidenceClaim(result.calibrationNote)
    : result.calibrationNote
  result.dimensions = (result.dimensions ?? []).map((dimension) => ({
    ...dimension,
    description: softenSampledEvidenceClaim(dimension.description),
  }))
  result.mentorReviews = (result.mentorReviews ?? []).map((review) => ({
    ...review,
    content: softenSampledEvidenceClaim(review.content),
    highlights: (review.highlights ?? []).map(softenSampledEvidenceClaim),
  }))
  result.pros = (result.pros ?? []).map(softenSampledEvidenceClaim)
  result.cons = (result.cons ?? []).map(softenSampledEvidenceClaim)
  result.suggestions = (result.suggestions ?? []).map((suggestion) => ({
    ...suggestion,
    content: softenSampledEvidenceClaim(suggestion.content),
  }))
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId()
  const startedAt = Date.now()

  if (!ARK_API_KEY || ARK_API_KEY === 'your-api-key-here') {
    return NextResponse.json(
      { error: '请先配置 ARK_API_KEY 环境变量', requestId },
      { status: 500 }
    )
  }

  try {
    console.log(`[portfolio:${requestId}] Reading form data`)
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetCompany = (formData.get('targetCompany') as string) || undefined
    const targetRole = (formData.get('targetRole') as string) || undefined
    const jobDescription = (formData.get('jobDescription') as string) || undefined

    // Check for image-based submission (large PDF converted client-side)
    const imageFiles = formData.getAll('images') as File[]
    const isImageMode = imageFiles.length > 0
    const renderedPages = parseInt((formData.get('renderedPages') as string) || '0', 10)
    const totalPdfPages = parseInt((formData.get('totalPdfPages') as string) || '0', 10)
    const selectedPages = ((formData.get('selectedPages') as string) || '')
      .split(',')
      .map((page) => parseInt(page, 10))
      .filter((page) => Number.isFinite(page) && page > 0)
    const reviewScopeNote = (formData.get('reviewScopeNote') as string) || ''

    if (!file && !isImageMode) {
      return NextResponse.json({ error: '未收到文件', requestId }, { status: 400 })
    }

    // Build prompts (same for both modes)
    const { system, user: baseUser } = buildPortfolioAnalysisPrompt(
      targetCompany,
      targetRole,
      jobDescription
    )

    let response: Response
    let content: string | undefined

    if (isImageMode) {
      // ── Image mode: large PDF converted to JPEG pages client-side ──
      console.log(
        `[portfolio:${requestId}] Image mode, pages=${imageFiles.length}, renderedFrom=${renderedPages}`
      )

      // Convert each image to base64 data URI
      const imageUris: string[] = []
      for (const img of imageFiles) {
        if (!img.type.startsWith('image/')) continue
        const bytes = new Uint8Array(await img.arrayBuffer())
        imageUris.push(`data:${img.type};base64,${arrayBufferToBase64(bytes)}`)
      }

      if (imageUris.length === 0) {
        return NextResponse.json(
          { error: '图片处理失败，请重试', requestId },
          { status: 400 }
        )
      }

      const userText =
        baseUser +
        `\n\n【评审范围说明】` +
        `\n原始 PDF 共 ${totalPdfPages || renderedPages || imageFiles.length} 页。` +
        `\n本次不是只提取前几页，而是智能抽样 ${imageFiles.length} 页进行重点评审。` +
        `\n抽样页码：${selectedPages.length > 0 ? selectedPages.join('、') : '未提供页码，请按图片顺序判断'}` +
        `\n图片顺序与上述页码一一对应，例如第 1 张图片代表 PDF 第 ${selectedPages[0] ?? 1} 页。` +
        `\n${reviewScopeNote || '请基于这些代表性页面评价作品集整体结构、项目顺序、视觉一致性和关键短板，并在文字中明确引用页码。'}` +
        `\n证据边界：凡是涉及调研、建模、过程、文字说明、项目完整度的判断，只能写"本次抽样页中未看到/重点分析页中未呈现"，不得写成"作品集没有/用户没有"。如果某些内容可能存在于未抽样页面，请建议用户把它前置到项目首页或关键页旁。`

      // Use Chat Completions API with image_url (same as single-work mode)
      const imageContentBlocks = imageUris.map((uri) => ({
        type: 'image_url' as const,
        image_url: { url: uri, detail: 'auto' as const },
      }))

      console.log(
        `[portfolio:${requestId}] Calling Doubao Chat Completions (image mode), images=${imageUris.length}`
      )

      const apiResponse = await fetchArkWithRetry(
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
                content: [...imageContentBlocks, { type: 'text', text: userText }],
              },
            ],
            temperature: 0,
            top_p: 1,
            seed: 42,
            thinking: { type: 'disabled' },
            response_format: { type: 'json_object' },
            max_completion_tokens: 3000,
          }),
        },
        AI_TIMEOUT_MS,
        `[portfolio:${requestId}]`
      )

      if (!apiResponse.ok) {
        const errText = await apiResponse.text()
        console.error(`[portfolio:${requestId}] Doubao Chat error`, apiResponse.status, errText)
        return NextResponse.json(
          { error: parseArkError(apiResponse.status, errText, requestId), requestId },
          { status: 502 }
        )
      }

      const data = await apiResponse.json()
      content = data.choices?.[0]?.message?.content
    } else {
      // ── PDF mode: direct upload (≤12MB) via Responses API ──
      if (file!.type !== 'application/pdf') {
        return NextResponse.json(
          { error: '作品集评审仅支持 PDF 格式，请上传 PDF 文件', requestId },
          { status: 400 }
        )
      }

      if (file!.size > MAX_PDF_BYTES) {
        return NextResponse.json(
          { error: 'PDF 文件超过 12MB，请减少页数或导出较低分辨率版本后重试', requestId },
          { status: 413 }
        )
      }

      const arrayBuffer = await file!.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      const dataUri = `data:application/pdf;base64,${arrayBufferToBase64(bytes)}`
      const userText = baseUser

      console.log(
        `[portfolio:${requestId}] Calling Doubao Responses API, file=${file!.name}, bytes=${file!.size}`
      )

      const apiResponse = await fetchArkWithRetry(
        `${ARK_BASE_URL}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ARK_API_KEY}`,
          },
          body: JSON.stringify({
            model: ARK_MODEL,
            input: [
              { role: 'system', content: system },
              {
                role: 'user',
                content: [
                  {
                    type: 'input_file',
                    file_data: dataUri,
                    filename: file!.name,
                  },
                  { type: 'input_text', text: userText },
                ],
              },
            ],
            thinking: { type: 'disabled' },
            top_p: 1,
            max_output_tokens: 3000,
          }),
        },
        AI_TIMEOUT_MS,
        `[portfolio:${requestId}]`
      )

      if (!apiResponse.ok) {
        const errText = await apiResponse.text()
        console.error(`[portfolio:${requestId}] Doubao error`, apiResponse.status, errText)
        return NextResponse.json(
          { error: parseArkError(apiResponse.status, errText, requestId), requestId },
          { status: 502 }
        )
      }

      const data = await apiResponse.json()
      content = extractResponsesText(data)
    }

    if (!content) {
      console.error(`[portfolio:${requestId}] Empty Doubao response`)
      return NextResponse.json(
        { error: `AI 返回内容为空。请求编号: ${requestId}`, requestId },
        { status: 502 }
      )
    }

    const rawResult = parseArkJson<AnalysisResult>(content, `[portfolio:${requestId}]`)

    // Add metadata
    rawResult.id = requestId
    rawResult.createdAt = new Date().toISOString()
    rawResult.mode = 'portfolio'
    rawResult.targetCompany = targetCompany
    rawResult.targetRole = targetRole
    rawResult.jobDescription = jobDescription
    rawResult.imageUrl = ''
    rawResult.fileName = file?.name ?? `作品集（${imageFiles.length} 页图片）`

    // NORMALIZE
    const { result, debugInfo } = normalizeAnalysisResult(rawResult, { mode: 'portfolio' })

    if (isImageMode) {
      result.portfolioReviewScope = {
        totalPages: totalPdfPages || renderedPages || imageFiles.length,
        analyzedPages: selectedPages.length > 0
          ? selectedPages
          : Array.from({ length: imageFiles.length }, (_, index) => index + 1),
        analyzedPageCount: imageFiles.length,
        strategy: 'smart_sample',
        note: reviewScopeNote || `已智能抽样 ${imageFiles.length} 页进行重点评审。涉及未抽样页面的信息，系统不会做绝对判断。`,
      }
      applySampledEvidenceBoundary(result)
    }

    // ── Mentor review quality control ──
    const aiReviews = result.mentorReviews
    if (aiReviews && aiReviews.length === 4) {
      const qualityCheck = shouldUseAIReviews(aiReviews)
      if (qualityCheck.usable) {
        const fullReport = validateMentorReviews(aiReviews)
        console.log(
          `[portfolio:${requestId}] AI mentor reviews accepted (quality=${fullReport.score}/100, issues=${fullReport.issues.length})`
        )
        if (fullReport.issues.length > 0) {
          console.warn(
            `[portfolio:${requestId}] Mentor review minor issues:`,
            fullReport.issues.map((i) => i.detail)
          )
        }
      } else {
        console.warn(
          `[portfolio:${requestId}] AI mentor reviews rejected: ${qualityCheck.reason}. Using template fallback.`
        )
        const fallback = buildPortfolioFeedbackFallback({
          dimensions: result.dimensions,
          scoreNumeric: result.scoreNumeric,
          targetCompany: result.targetCompany,
          targetRole: result.targetRole,
        })
        result.mentorReviews = fallback.mentorReviews
        result.pros = result.pros ?? fallback.pros
        result.cons = result.cons ?? fallback.cons
        result.suggestions = result.suggestions ?? fallback.suggestions
        result.calibrationNote = result.calibrationNote || fallback.calibrationNote
      }
    } else {
      console.log(
        `[portfolio:${requestId}] AI returned ${aiReviews?.length ?? 0} mentor reviews, using template fallback`
      )
      const fallback = buildPortfolioFeedbackFallback({
        dimensions: result.dimensions,
        scoreNumeric: result.scoreNumeric,
        targetCompany: result.targetCompany,
        targetRole: result.targetRole,
      })
      result.mentorReviews = fallback.mentorReviews
      result.pros = result.pros ?? fallback.pros
      result.cons = result.cons ?? fallback.cons
      result.suggestions = result.suggestions ?? fallback.suggestions
      result.calibrationNote = result.calibrationNote || fallback.calibrationNote
    }

    // ── Pros/cons/suggestions quality control ──
    const aiPortfolioPros = result.pros
    const aiPortfolioCons = result.cons
    const aiPortfolioSuggestions = result.suggestions
    if (aiPortfolioPros && aiPortfolioCons && aiPortfolioSuggestions) {
      const feedbackCheck = shouldUseAIFeedback(aiPortfolioPros, aiPortfolioCons, aiPortfolioSuggestions)
      if (!feedbackCheck.usable) {
        console.warn(
          `[portfolio:${requestId}] AI pros/cons/suggestions rejected: ${feedbackCheck.reason}. Using template fallback.`
        )
        const fallback = buildPortfolioFeedbackFallback({
          dimensions: result.dimensions,
          scoreNumeric: result.scoreNumeric,
          targetCompany: result.targetCompany,
          targetRole: result.targetRole,
        })
        if (aiPortfolioPros === result.pros) result.pros = fallback.pros
        if (aiPortfolioCons === result.cons) result.cons = fallback.cons
        if (aiPortfolioSuggestions === result.suggestions) result.suggestions = fallback.suggestions
      } else {
        const feedbackReport = validateFeedbackContent(aiPortfolioPros, aiPortfolioCons, aiPortfolioSuggestions)
        console.log(
          `[portfolio:${requestId}] AI pros/cons/suggestions accepted (quality=${feedbackReport.score}/100, issues=${feedbackReport.issues.length})`
        )
      }
    }

    if (isImageMode) {
      applySampledEvidenceBoundary(result)
    }

    result.scoreBreakdown = {
      rawWeightedScore: debugInfo.recalculatedScore,
      afterRedFlagCap: debugInfo.afterRedFlagCap,
      afterCalibration: debugInfo.afterCalibration,
      redFlagCount: debugInfo.aiRawRedFlags.length,
      wasRedFlagCapped: debugInfo.afterRedFlagCap !== debugInfo.recalculatedScore,
      wasHighScoreCalibrated: debugInfo.wasCalibrated,
      boundaryProximity: getBoundaryProximity(debugInfo.afterCalibration),
    }

    console.log(
      `[portfolio:${requestId}] Success, tier=${result.score}, mode=${isImageMode ? 'image' : 'pdf'}, elapsed=${Date.now() - startedAt}ms`
    )
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : '分析失败'
    console.error(`[portfolio:${requestId}] Failed after ${Date.now() - startedAt}ms`, err)
    return NextResponse.json(
      {
        error: message.includes('请求超时')
          ? `作品集分析时间过长，请压缩 PDF 后重试。请求编号: ${requestId}`
          : `分析失败: ${message}。请求编号: ${requestId}`,
        requestId,
      },
      { status: 500 }
    )
  }
}
