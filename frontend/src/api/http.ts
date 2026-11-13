// 第一版使用浏览器自带的 fetch，只集中处理 JSON、错误和超时。
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
    })
    // DELETE 成功使用 204，没有正文，不能继续解析 JSON。
    if (response.status === 204) return undefined as T
    const body = await response.json()
    if (!response.ok) {
      const message =
        typeof body.detail === 'string' ? body.detail : '提交内容不符合要求，请检查后重试'
      throw new Error(message)
    }
    return body as T
  } catch (error) {
    if (controller.signal.aborted) throw new Error('请求超时，请检查后端是否正常运行')
    if (error instanceof TypeError || error instanceof SyntaxError) {
      throw new Error('无法连接服务，请确认后端已启动，然后重试')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
