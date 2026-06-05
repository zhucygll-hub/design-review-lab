import { NextRequest, NextResponse } from 'next/server'
import { buildAnalysisPrompt } from '@/lib/ai-analysis-single'
import { getScoreLabel, normalizeAnalysisResult, numericToScore } from '@/lib/score-utils'
import { fetchArkWithRetry, parseArkError, parseArkJson } from '@/lib/ark-utils'
import { buildSingleWorkWeightTable } from '@/lib/single-work-scenario'
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
    const file = formData.get('file') as File | null
    const designType = parseDesignType(formData.get('designType'))
    const workForm = parseWorkForm(formData.get('workForm'))
    const reviewPurpose = parseReviewPurpose(formData.get('reviewPurpose'))

    if (!file) {
      return NextResponse.json({ error: '未收到文件', requestId }, { status: 400 })
    }

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

    const bytes = new Uint8Array(await file.arrayBuffer())
    const dataUri = arrayBufferToDataUri(bytes, file.type)
    const { system, user } = buildAnalysisPrompt(designType, workForm, reviewPurpose)
    const weightTable = buildSingleWorkWeightTable(designType, workForm, reviewPurpose)

    console.log(
      `[analyze:${requestId}] Calling Doubao, file=${file.name}, bytes=${file.size}, type=${designType}, form=${workForm}, purpose=${reviewPurpose}`
    )

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
                { type: 'image_url', image_url: { url: dataUri, detail: 'low' } },
                { type: 'text', text: user },
              ],
            },
          ],
          temperature: 0,
          seed: 42,
          thinking: { type: 'disabled' },
          response_format: { type: 'json_object' },
          max_completion_tokens: 1200,
        }),
      },
      AI_TIMEOUT_MS,
      `[analyze:${requestId}]`
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
      return NextResponse.json(
        { error: 'AI 返回内容为空，请重试', requestId },
        { status: 502 }
      )
    }

    const rawResult = parseArkJson<PartialAnalysisResult>(content, `[analyze:${requestId}]`)
    const requiredDimensions = buildSingleWorkWeightTable(designType, workForm, reviewPurpose)
    rawResult.dimensions = Object.entries(requiredDimensions).map(([name, weight]) => {
      const existing = rawResult.dimensions?.find((d) => d.name === name)
      return {
        name,
        score: existing?.score ?? 0,
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
    rawResult.fileName = file.name
    rawResult.scoreNumeric = rawResult.scoreNumeric ?? 0
    rawResult.score = rawResult.score ?? numericToScore(rawResult.scoreNumeric)
    rawResult.scoreLabel = rawResult.scoreLabel ?? getScoreLabel(rawResult.score)
    rawResult.redFlags = rawResult.redFlags ?? []
    rawResult.mentorReviews = rawResult.mentorReviews ?? [
      {
        role: 'graduation_tutor',
        roleLabel: '毕业导师',
        content: '该作品需要结合维度评分进一步完善设计逻辑和表达质量。',
        highlights: ['补充过程', '强化表达'],
      },
      {
        role: 'design_director',
        roleLabel: '设计总监',
        content: '建议优先处理视觉完成度、核心卖点和整体一致性问题。',
        highlights: ['统一视觉', '突出重点'],
      },
      {
        role: 'interviewer',
        roleLabel: '企业面试官',
        content: '请准备清楚说明设计目标、关键决策和最终效果之间的关系。',
        highlights: ['讲清目标', '说明决策'],
      },
      {
        role: 'ux_researcher',
        roleLabel: '用户研究员',
        content: '若作品涉及使用场景，应补充用户、情境和验证依据。',
        highlights: ['明确用户', '补充依据'],
      },
    ]
    rawResult.pros = rawResult.pros ?? ['有一定完成度', '具备继续优化基础', '能看出设计意图']
    rawResult.cons = rawResult.cons ?? ['表达重点不够集中', '细节说服力不足', '需要强化场景依据']
    rawResult.suggestions = rawResult.suggestions ?? [
      {
        id: 's1',
        type: 'priority',
        content: '先明确核心设计目标，再围绕目标重排信息和视觉重点。',
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 's2',
        type: 'priority',
        content: '优化版式层级、配色统一性和关键视觉焦点。',
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 's3',
        type: 'quick_fix',
        content: '删减弱信息，保留最能证明设计价值的内容。',
        effort: 'low',
        impact: 'medium',
      },
    ]
    rawResult.calibrationNote =
      rawResult.calibrationNote || '该评分由维度得分和代码层校准规则综合计算。'

    const { result } = normalizeAnalysisResult(rawResult as AnalysisResult, { mode: 'single', weightTable })
    console.log(
      `[analyze:${requestId}] Success, tier=${result.score}, elapsed=${Date.now() - startedAt}ms`
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
