import { fetchWithTimeout } from '@/lib/fetch-utils'
import { jsonrepair } from 'jsonrepair'

interface ArkErrorBody {
  error?: {
    code?: string
    message?: string
    type?: string
  }
}

export async function fetchArkWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  logPrefix: string
): Promise<Response> {
  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetchWithTimeout(url, options, timeoutMs)
    const retryable = response.status === 429 || response.status >= 500

    if (!retryable || attempt === maxAttempts) {
      return response
    }

    console.warn(`${logPrefix} Ark transient error ${response.status}, retrying`)
    await new Promise((resolve) => setTimeout(resolve, 800))
  }

  throw new Error('AI 服务请求失败')
}

export function parseArkError(status: number, text: string, requestId: string): string {
  let code = ''
  let message = ''

  try {
    const body = JSON.parse(text) as ArkErrorBody
    code = body.error?.code || body.error?.type || ''
    message = body.error?.message || ''
  } catch {
    message = text.replace(/<[^>]*>/g, '').trim().slice(0, 160)
  }

  const suffix = `请求编号: ${requestId}`

  if (status === 429) {
    return `AI 服务当前请求较多，请稍后重试。${suffix}`
  }

  if (status >= 500) {
    return `AI 服务暂时不可用，请稍后重试。${suffix}`
  }

  if (code === 'InvalidParameter' || status === 400) {
    return `AI 无法处理当前文件或请求参数，请尝试更小、更规范的文件。错误码: ${code || status}。${suffix}`
  }

  if (status === 401 || status === 403) {
    return `AI 服务鉴权失败，请联系站点管理员检查 API Key 和模型权限。${suffix}`
  }

  return `AI 服务返回错误 (${status}${code ? ` / ${code}` : ''})${message ? `: ${message}` : ''}。${suffix}`
}

export function extractResponsesText(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined

  const response = data as {
    output_text?: unknown
    output?: Array<{ content?: Array<{ type?: string; text?: unknown }> }>
  }

  if (typeof response.output_text === 'string') {
    return response.output_text
  }

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        return content.text
      }
    }
  }

  return undefined
}

export function parseArkJson<T>(content: string, logPrefix: string): T {
  let jsonText = content.trim()

  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }

  const objectStart = jsonText.indexOf('{')
  const objectEnd = jsonText.lastIndexOf('}')
  if (objectStart >= 0 && objectEnd > objectStart) {
    jsonText = jsonText.slice(objectStart, objectEnd + 1)
  }

  try {
    return JSON.parse(jsonText) as T
  } catch (initialError) {
    console.warn(
      `${logPrefix} Invalid JSON from Ark, attempting repair, chars=${jsonText.length}`,
      initialError
    )
  }

  try {
    return JSON.parse(jsonrepair(jsonText)) as T
  } catch (repairError) {
    console.error(
      `${logPrefix} JSON repair failed, chars=${jsonText.length}, startsWithObject=${jsonText.startsWith('{')}, endsWithObject=${jsonText.endsWith('}')}`,
      repairError
    )
    throw new Error('AI 返回的评审结果格式不完整，请重试')
  }
}
