import { NextRequest, NextResponse } from 'next/server'
import { buildPortfolioAnalysisPrompt } from '@/lib/ai-analysis-portfolio'
import { normalizeAnalysisResult } from '@/lib/score-utils'
import { extractResponsesText, fetchArkWithRetry, parseArkError } from '@/lib/ark-utils'

export const maxDuration = 120

const ARK_API_KEY = process.env.ARK_API_KEY
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-pro-260215'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
const MAX_PDF_BYTES = 8 * 1024 * 1024
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

    if (!file) {
      return NextResponse.json({ error: '未收到文件', requestId }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: '作品集评审仅支持 PDF 格式，请上传 PDF 文件', requestId },
        { status: 400 }
      )
    }

    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json(
        { error: 'PDF 文件超过 8MB，请压缩后重试', requestId },
        { status: 413 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const dataUri = `data:application/pdf;base64,${arrayBufferToBase64(bytes)}`

    // Build prompts
    const { system, user: baseUser } = buildPortfolioAnalysisPrompt(
      targetCompany,
      targetRole,
      jobDescription
    )

    const userText = baseUser

    console.log(
      `[portfolio:${requestId}] Calling Doubao Responses API, file=${file.name}, bytes=${file.size}`
    )

    // PDF document understanding is supported through Responses API input_file.
    const response = await fetchArkWithRetry(
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
                  filename: file.name,
                },
                { type: 'input_text', text: userText },
              ],
            },
          ],
          thinking: { type: 'disabled' },
          max_output_tokens: 2200,
        }),
      },
      AI_TIMEOUT_MS,
      `[portfolio:${requestId}]`
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[portfolio:${requestId}] Doubao error`, response.status, errText)
      return NextResponse.json(
        { error: parseArkError(response.status, errText, requestId), requestId },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = extractResponsesText(data)

    if (!content) {
      console.error(`[portfolio:${requestId}] Empty Doubao response`, JSON.stringify(data))
      return NextResponse.json(
        { error: `AI 返回内容为空。请求编号: ${requestId}`, requestId },
        { status: 502 }
      )
    }

    // Parse JSON (strip possible markdown fences)
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    }

    const rawResult = JSON.parse(jsonStr)

    // Add metadata
    rawResult.id = requestId
    rawResult.createdAt = new Date().toISOString()
    rawResult.mode = 'portfolio'
    rawResult.targetCompany = targetCompany
    rawResult.targetRole = targetRole
    rawResult.jobDescription = jobDescription
    rawResult.imageUrl = ''
    rawResult.fileName = file.name

    // NORMALIZE
    const { result } = normalizeAnalysisResult(rawResult, { mode: 'portfolio' })

    console.log(
      `[portfolio:${requestId}] Success, tier=${result.score}, elapsed=${Date.now() - startedAt}ms`
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
