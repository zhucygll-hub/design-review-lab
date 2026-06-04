import { NextRequest, NextResponse } from 'next/server'
import { buildAnalysisPrompt } from '@/lib/ai-analysis-single'
import { normalizeAnalysisResult } from '@/lib/score-utils'
import { DesignType } from '@/types'
import sharp from 'sharp'

const ARK_API_KEY = process.env.ARK_API_KEY
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-pro-260215'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'

async function compressImage(buffer: Buffer, mimeType: string): Promise<{ dataUri: string }> {
  try {
    let sharpInstance = sharp(buffer)

    // Resize to max 1024px on longest edge, keep aspect ratio
    sharpInstance = sharpInstance.resize(1024, 1024, {
      fit: 'inside',
      withoutEnlargement: true,
    })

    // Convert to JPEG for smaller size
    const compressed = await sharpInstance.jpeg({ quality: 80 }).toBuffer()
    const base64 = compressed.toString('base64')
    return { dataUri: `data:image/jpeg;base64,${base64}` }
  } catch {
    // If sharp fails (e.g. PDF or unsupported), use original
    const base64 = buffer.toString('base64')
    return { dataUri: `data:${mimeType};base64,${base64}` }
  }
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
    const designType = (formData.get('designType') as string) || 'commercial'

    if (!file) {
      return NextResponse.json({ error: '未收到文件' }, { status: 400 })
    }

    // PDF is not supported — Doubao image_url only accepts image formats
    if (file.type === 'application/pdf') {
      return NextResponse.json(
        { error: '暂不支持 PDF 格式，请将作品导出为 JPG 或 PNG 后上传' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type || 'image/png'

    // Compress image before sending (reduces API latency significantly)
    const { dataUri } = await compressImage(buffer, mimeType)

    // Build prompts
    const { system, user } = buildAnalysisPrompt(designType as DesignType)

    // Call Doubao via Volcano Ark (OpenAI-compatible)
    // temperature=0 for maximum determinism; seed=42 for reproducibility
    const response = await fetch(`${ARK_BASE_URL}/chat/completions`, {
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
        max_tokens: 4096,
      }),
    })

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

    // Parse the JSON from the response (strip possible markdown fences)
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    }

    const rawResult = JSON.parse(jsonStr)

    // Add metadata
    rawResult.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
    rawResult.createdAt = new Date().toISOString()
    rawResult.mode = 'single'
    rawResult.designType = designType as DesignType
    rawResult.imageUrl = ''    // placeholder — client fills from sessionStorage
    rawResult.fileName = file.name

    // === NORMALIZE: recalculate score, apply red flag caps, fix tier ===
    const { result } = normalizeAnalysisResult(rawResult, { mode: 'single' })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Analysis error:', err)
    const message = err instanceof Error ? err.message : '分析失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
