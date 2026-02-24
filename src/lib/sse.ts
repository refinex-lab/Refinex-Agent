// ── SSE 流式请求工具（fetch + ReadableStream） ──────────

interface SSECallbacks {
  onEvent: (event: string, data: string) => void
  onError: (error: Error) => void
  onDone: () => void
}

export async function fetchSSE(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  signal: AbortSignal,
  callbacks: SSECallbacks,
): Promise<void> {
  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        ...headers,
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (signal.aborted) return
    callbacks.onError(err instanceof Error ? err : new Error('网络请求失败'))
    return
  }

  if (!response.ok) {
    callbacks.onError(new Error(`HTTP ${response.status}: ${response.statusText}`))
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError(new Error('响应体不可读'))
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按 SSE 帧分割（双换行）
      const frames = buffer.split('\n\n')
      // 最后一段可能不完整，保留在 buffer
      buffer = frames.pop() ?? ''

      for (const frame of frames) {
        if (!frame.trim()) continue

        let eventName = 'message'
        const dataLines: string[] = []

        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5))
          }
        }

        // SSE 规范：多行 data: 之间用 \n 连接
        const data = dataLines.join('\n')

        if (eventName === 'done' || data === '[DONE]') {
          callbacks.onDone()
          return
        }

        if (data) {
          callbacks.onEvent(eventName, data)
        }
      }
    }

    // 流正常结束但没收到 done 事件
    callbacks.onDone()
  } catch (err) {
    if (signal.aborted) return
    callbacks.onError(err instanceof Error ? err : new Error('流读取异常'))
  }
}
