/**
 * Safely parse an API response, handling platform HTML error pages gracefully.
 * Returns { ok, data, error } — always safe, never throws.
 */
type ApiParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function parseApiResponse<T>(response: Response): Promise<ApiParseResult<T>> {
  // Read body as text first
  let text: string
  try {
    text = await response.text()
  } catch {
    return { ok: false, error: '无法读取服务器响应，请检查网络连接' }
  }

  // Try to parse as JSON
  let data: T
  try {
    data = JSON.parse(text) as T
  } catch {
    if (response.status === 504) {
      return {
        ok: false,
        error: 'AI 分析超过 EdgeOne 函数执行时限。请确认 edgeone.json 已部署，并稍后重试。',
      }
    }

    if (response.status === 413) {
      return { ok: false, error: '上传文件过大，请缩小文件后重试。' }
    }

    // The hosting platform returned an HTML error page.
    const preview =
      text
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 200) || '未知错误'
    return { ok: false, error: `服务器返回异常 (${response.status}): ${preview}` }
  }

  if (!response.ok) {
    const serverError =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'string'
        ? data.error
        : undefined
    return { ok: false, error: serverError || `服务器错误 (${response.status})，请重试` }
  }

  return { ok: true, data }
}
