import { NextRequest, NextResponse } from 'next/server'
import { buildPortfolioAnalysisPrompt } from '@/lib/ai-analysis-portfolio'
import { normalizeAnalysisResult } from '@/lib/score-utils'
import { fetchWithTimeout } from '@/lib/fetch-utils'

export const maxDuration = 120

const ARK_API_KEY = process.env.ARK_API_KEY
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-pro-260215'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'

// Edge-compatible base64 encoder (no Buffer API in Edge Functions)
function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Note: pdf-parse (CommonJS with native deps) and sharp (C++ native)
// are NOT available in Edge Functions. We send the raw PDF as base64
// data URI and let Doubao's multimodal vision handle it directly.

export async function POST(request: NextRequest) {
  if (!ARK_API_KEY || ARK_API_KEY === 'your-api-key-here') {
    return NextResponse.json(
      { error: '请先配置 ARK_API_KEY 环境变量' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetCompany = (formData.get('targetCompany') as string) || undefined
    const targetRole = (formData.get('targetRole') as string) || undefined
    const jobDescription = (formData.get('jobDescription') as string) || undefined

    if (!file) {
      return NextResponse.json({ error: '未收到文件' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: '作品集评审仅支持 PDF 格式，请上传 PDF 文件' },
        { status: 400 }
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

    // Build user message: PDF as image (Doubao multimodal vision can read PDF pages)
    const userContent: Array<Record<string, unknown>> = [
      {
        type: 'image_url',
        image_url: { url: dataUri, detail: 'low' },
      },
      { type: 'text', text: userText },
    ]

    // Call Doubao via Volcano Ark
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
            { role: 'user', content: userContent },
          ],
          temperature: 0,
          seed: 42,
          max_tokens: 4096,
        }),
      },
      105000 // Return JSON before EdgeOne's 120s Cloud Functions limit
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Doubao API error:', response.status, errText)
      return NextResponse.json(
        { error: `AI 服务返回错误 (${response.status}): ${errText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('Empty response from Doubao:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'AI 返回内容为空' },
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
    rawResult.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    rawResult.createdAt = new Date().toISOString()
    rawResult.mode = 'portfolio'
    rawResult.targetCompany = targetCompany
    rawResult.targetRole = targetRole
    rawResult.jobDescription = jobDescription
    rawResult.imageUrl = ''
    rawResult.fileName = file.name

    // NORMALIZE
    const { result } = normalizeAnalysisResult(rawResult, { mode: 'portfolio' })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Portfolio analysis error:', err)
    const message = err instanceof Error ? err.message : '分析失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
