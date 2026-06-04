/**
 * Fetch with timeout. Falls back to returning a proper error string
 * instead of crashing with "Failed to fetch".
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`请求超时 (${timeoutMs / 1000}秒)`)
    }
    // Network error (DNS, connection refused, etc.)
    const message = err instanceof Error ? err.message : '未知网络错误'
    throw new Error(`网络请求失败: ${message}`)
  } finally {
    clearTimeout(timer)
  }
}
