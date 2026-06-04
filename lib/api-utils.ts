/**
 * Safely parse an API response, handling Vercel HTML error pages gracefully.
 * Returns { ok, data, error } — always safe, never throws.
 */
export async function parseApiResponse(response: Response): Promise<{
  ok: boolean
  data?: any
  error?: string
}> {
  // Read body as text first
  let text: string
  try {
    text = await response.text()
  } catch {
    return { ok: false, error: '无法读取服务器响应，请检查网络连接' }
  }

  // Try to parse as JSON
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    // Vercel returned HTML error page (e.g. timeout, body too large)
    const preview =
      text
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 200) || '未知错误'
    return { ok: false, error: `服务器返回异常 (${response.status}): ${preview}` }
  }

  if (!response.ok) {
    return { ok: false, error: data?.error || `服务器错误 (${response.status})，请重试` }
  }

  return { ok: true, data }
}
