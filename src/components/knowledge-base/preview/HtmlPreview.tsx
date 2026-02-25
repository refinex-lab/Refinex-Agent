import { useEffect, useState } from 'react'

interface HtmlPreviewProps {
  blob: Blob
}

/** 注入基础样式，让裸 HTML 片段也有合理的排版 */
function wrapHtml(raw: string): string {
  // 如果已经有完整的 <html> 或 <head>，只补充 base style
  const hasHead = /<head[\s>]/i.test(raw)
  const hasHtml = /<html[\s>]/i.test(raw)

  const baseStyle = `<style>
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 14px; }
    body {
      margin: 0; padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6; color: #1a1a1a; word-wrap: break-word;
    }
    img, video { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    blockquote { margin: 8px 0; padding: 8px 16px; border-left: 3px solid #ddd; color: #555; }
    a { color: #2563eb; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; line-height: 1.3; }
  </style>`

  if (hasHtml && hasHead) {
    // 在 </head> 前插入样式
    return raw.replace(/<\/head>/i, `${baseStyle}</head>`)
  }
  if (hasHtml) {
    // 有 <html> 但没 <head>，在 <html> 后插入
    return raw.replace(/<html([^>]*)>/i, `<html$1><head>${baseStyle}</head>`)
  }
  // 裸片段，包一层完整结构
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${baseStyle}</head><body>${raw}</body></html>`
}

export function HtmlPreview({ blob }: HtmlPreviewProps) {
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    blob.text().then((text) => setHtml(wrapHtml(text)))
  }, [blob])

  if (!html) return <p className="p-4 text-sm text-muted-foreground">加载 HTML 中…</p>

  return (
    <iframe
      srcDoc={html}
      sandbox="allow-same-origin"
      className="h-full w-full border-0"
      title="HTML 预览"
    />
  )
}
