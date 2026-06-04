import { NextRequest, NextResponse } from 'next/server'
import { buildAnalysisPrompt } from '@/lib/ai-analysis-single'
import { normalizeAnalysisResult } from '@/lib/score-utils'
import { fetchWithTimeout } from '@/lib/fetch-utils'
import { DesignType } from '@/types'

export const maxDuration = 120

const ARK_API_KEY = process.env.ARK_API_KEY
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-pro-260215'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const AI_TIMEOUT_MS = 105_000

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

export async function GET() {
  return NextResponse.json({ ok: true, route: 'analyze', time: Date.now() })
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
    const rawDesignType = formData.get('designType')
    const designType: DesignType = rawDesignType === 'concept' ? 'concept' : 'commercial'

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
    const { system, user } = buildAnalysisPrompt(designType)

    console.log(
      `[analyze:${requestId}] Calling Doubao, file=${file.name}, bytes=${file.size}, type=${designType}`
    )

    const response = await fetchWithTimeout(
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
          max_tokens: 3072,
        }),
      },
      AI_TIMEOUT_MS
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[analyze:${requestId}] Doubao error`, response.status, errText)
      return NextResponse.json(
        {
          error: `AI 服务返回错误 (${response.status})，请稍后重试`,
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

    let jsonStr = content.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    }

    const rawResult = JSON.parse(jsonStr)
    rawResult.id = requestId
    rawResult.createdAt = new Date().toISOString()
    rawResult.mode = 'single'
    rawResult.designType = designType
    rawResult.imageUrl = ''
    rawResult.fileName = file.name

    const { result } = normalizeAnalysisResult(rawResult, { mode: 'single' })
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
