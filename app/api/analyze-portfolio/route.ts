import { NextRequest, NextResponse } from 'next/server'
import { buildPortfolioAnalysisPrompt } from '@/lib/ai-analysis-portfolio'
import { normalizeAnalysisResult } from '@/lib/score-utils'
import { fetchWithTimeout } from '@/lib/fetch-utils'

export const maxDuration = 90 // EdgeOne: up to 900s, generous safety margin

const ARK_API_KEY = process.env.ARK_API_KEY
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-pro-260215'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Note: pdf-parse may not work on all EdgeOne environments.
    // It requires full Node.js runtime, not Edge Functions.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
    const pdfData = await pdfParse(buffer)
    return (pdfData.text || '').slice(0, 8000)
  } catch {
    console.warn('[portfolio] pdf-parse not available in this environment, text extraction skipped')
    return ''
  }
}

// PDF page rendering requires sharp (native module).
// On EdgeOne Pages, sharp is not available in Edge Functions mode.
// Text-only analysis will be used instead.
async function renderPdfPages(_buffer: Buffer): Promise<string[]> {
  console.warn('[portfolio] sharp not available — using text-only analysis')
  return []
}

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

    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract text and render pages in parallel
    const [extractedText, pageImages] = await Promise.all([
      extractPdfText(buffer),
      renderPdfPages(buffer),
    ])

    // Build prompts
    const { system, user: baseUser } = buildPortfolioAnalysisPrompt(
      targetCompany,
      targetRole,
      jobDescription
    )

    // Embed extracted text into prompt
    let userText = ''
    if (extractedText) {
      userText += `【作品集文本内容】\n${extractedText}\n\n`
    }
    userText += baseUser

    // Build user message: images (if any rendered) + text
    const userContent: Array<Record<string, unknown>> = pageImages.map((dataUri) => ({
      type: 'image_url',
      image_url: { url: dataUri, detail: 'low' },
    }))
    userContent.push({ type: 'text', text: userText })

    // Call Doubao via Volcano Ark with 40s timeout
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
      85000 // 85s timeout, EdgeOne has 900s limit
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

    // === NORMALIZE: recalculate score, apply red flag caps, fix tier ===
    const { result } = normalizeAnalysisResult(rawResult, { mode: 'portfolio' })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Portfolio analysis error:', err)
    const message = err instanceof Error ? err.message : '分析失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
