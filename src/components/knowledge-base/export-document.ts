import { toast } from 'sonner'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 导出原始 Markdown 文件 */
export function exportMarkdown(markdown: string, filename: string) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, filename.endsWith('.md') ? filename : `${filename}.md`)
}

// ─── 自包含样式（HTML / PDF 共用） ──────────────────────────────────────────
const STANDALONE_STYLES = `
  :root { color-scheme: light; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    max-width: 800px; margin: 2rem auto; padding: 0 1.5rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif;
    font-size: 16px; line-height: 1.7; color: #1a1a1a; background: #fff;
  }
  h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.3; margin: 1.5rem 0 0.75rem; }
  h2 { font-size: 1.5rem; font-weight: 600; line-height: 1.35; margin: 1.25rem 0 0.5rem; }
  h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; margin: 1rem 0 0.5rem; }
  h4 { font-size: 1.125rem; font-weight: 600; line-height: 1.4; margin: 0.75rem 0 0.25rem; }
  h5 { font-size: 1rem; font-weight: 600; line-height: 1.4; margin: 0.75rem 0 0.25rem; }
  h6 { font-size: 0.875rem; font-weight: 600; line-height: 1.4; margin: 0.75rem 0 0.25rem; }
  p { margin: 0.5rem 0; line-height: 1.7; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  a { color: #0969da; text-decoration: underline; text-underline-offset: 2px; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.875em; padding: 0.15em 0.4em; border-radius: 4px;
    background: #f4f4f5; color: #1a1a1a;
  }
  pre {
    margin: 0.75rem 0; padding: 0.75rem 1rem; border-radius: 8px;
    background: #f4f4f5; overflow-x: auto;
  }
  pre code { padding: 0; background: transparent; font-size: 0.85em; line-height: 1.6; }
  blockquote {
    margin: 0.75rem 0; padding-left: 1rem;
    border-left: 3px solid #e4e4e7; color: #71717a;
  }
  ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
  ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
  li { margin: 0.25rem 0; }
  li > p { margin: 0; }
  hr { margin: 1.5rem 0; border: none; border-top: 1px solid #e4e4e7; }
  img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
  table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
  th, td { border: 1px solid #e4e4e7; padding: 0.5rem 0.75rem; text-align: left; }
  th { font-weight: 600; background: #f4f4f5; }
`

function getCleanHTML(editorContainer: HTMLElement): string {
  const clone = editorContainer.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'))
  clone.querySelectorAll('[class]').forEach((el) => el.removeAttribute('class'))
  return clone.innerHTML
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildStandaloneHTML(bodyHTML: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${STANDALONE_STYLES}</style>
</head>
<body>
${bodyHTML}
</body>
</html>`
}

export function exportHTML(editorContainer: HTMLElement, title: string) {
  const html = buildStandaloneHTML(getCleanHTML(editorContainer), title)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${title}.html`)
}

// ─── PDF 导出 ─────────────────────────────────────────────────────────────
// 使用 html2canvas-pro（原生支持 oklch）+ jsPDF 直接生成 PDF。

async function renderPDFInIframe(fullHTML: string, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:600px;border:none;'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    throw new Error('无法创建导出环境')
  }

  iframeDoc.open()
  iframeDoc.write(fullHTML)
  iframeDoc.close()

  await new Promise<void>((resolve) => {
    if (iframeDoc.readyState === 'complete') resolve()
    else iframe.onload = () => resolve()
  })
  await new Promise((r) => requestAnimationFrame(r))

  try {
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 900,
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    const contentHeight = pageHeight - margin * 2

    const imgWidth = contentWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

    let remainingHeight = imgHeight
    let sourceY = 0

    while (remainingHeight > 0) {
      if (sourceY > 0) pdf.addPage()

      const drawHeight = Math.min(contentHeight, remainingHeight)
      const sourceHeight = (drawHeight / imgHeight) * canvas.height

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeight
      const ctx = pageCanvas.getContext('2d')!
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)

      const pageData = pageCanvas.toDataURL('image/jpeg', 0.98)
      pdf.addImage(pageData, 'JPEG', margin, margin, imgWidth, drawHeight)

      sourceY += sourceHeight
      remainingHeight -= drawHeight
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(iframe)
  }
}

export async function exportPDF(editorContainer: HTMLElement, title: string) {
  const bodyHTML = getCleanHTML(editorContainer)
  const fullHTML = buildStandaloneHTML(bodyHTML, title)
  await renderPDFInIframe(fullHTML, `${title}.pdf`)
}

async function exportPDFFromMarkdown(markdown: string, title: string) {
  const bodyHTML = markdownToSimpleHTML(markdown)
  const fullHTML = buildStandaloneHTML(bodyHTML, title)
  await renderPDFInIframe(fullHTML, `${title}.pdf`)
}

// ─── DOCX 导出 ────────────────────────────────────────────────────────────

export async function exportDOCX(markdown: string, title: string) {
  const { default: markdownDocx, Packer, styles } = await import('markdown-docx')

  styles.colors.heading1 = '1a1a1a'
  styles.colors.heading2 = '1a1a1a'
  styles.colors.heading3 = '1a1a1a'
  styles.colors.heading4 = '3f3f46'
  styles.colors.heading5 = '3f3f46'
  styles.colors.heading6 = '52525b'
  styles.colors.link = '0969da'
  styles.colors.code = '1a1a1a'
  styles.colors.codespan = 'c7254e'
  styles.colors.codeBackground = 'f4f4f5'
  styles.colors.blockquote = '71717a'
  styles.colors.blockquoteBackground = 'fafafa'
  styles.colors.border = 'e4e4e7'
  styles.colors.hr = 'd4d4d8'
  styles.colors.del = 'a1a1aa'
  styles.colors.tableHeaderBackground = 'f4f4f5'

  styles.colors.heading1Size = 56
  styles.colors.heading2Size = 48
  styles.colors.heading3Size = 40
  styles.colors.heading4Size = 36
  styles.colors.heading5Size = 32
  styles.colors.heading6Size = 28
  styles.colors.codeSize = 20
  styles.colors.spaceSize = 120

  styles.default = {
    ...styles.default,
    document: {
      run: {
        size: 24,
        font: {
          ascii: 'Calibri',
          hAnsi: 'Calibri',
          eastAsia: 'Microsoft YaHei',
          cs: 'Calibri',
        },
      },
      paragraph: {
        spacing: { before: 60, after: 60, line: 360 },
      },
    },
    heading1: {
      run: {
        bold: true,
        size: 56,
        font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei', cs: 'Calibri' },
      },
      paragraph: { spacing: { before: 360, after: 160 } },
    },
    heading2: {
      run: {
        bold: true,
        size: 48,
        font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei', cs: 'Calibri' },
      },
      paragraph: { spacing: { before: 300, after: 120 } },
    },
    heading3: {
      run: {
        bold: true,
        size: 40,
        font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei', cs: 'Calibri' },
      },
      paragraph: { spacing: { before: 240, after: 100 } },
    },
    heading4: {
      run: {
        bold: true,
        size: 36,
        font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei', cs: 'Calibri' },
      },
      paragraph: { spacing: { before: 200, after: 80 } },
    },
    heading5: {
      run: {
        bold: true,
        size: 32,
        font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei', cs: 'Calibri' },
      },
      paragraph: { spacing: { before: 160, after: 60 } },
    },
    heading6: {
      run: {
        bold: true,
        size: 28,
        font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei', cs: 'Calibri' },
      },
      paragraph: { spacing: { before: 160, after: 60 } },
    },
    hyperlink: {
      run: { color: '0969da' },
    },
  }

  if (styles.markdown.code) {
    styles.markdown.code.run = {
      ...styles.markdown.code.run,
      font: {
        ascii: 'Cascadia Code',
        hAnsi: 'Cascadia Code',
        eastAsia: 'Microsoft YaHei',
        cs: 'Consolas',
      },
      size: 20,
    }
    styles.markdown.code.paragraph = {
      ...styles.markdown.code.paragraph,
      shading: { fill: 'f4f4f5', type: 'clear' as const, color: 'auto' },
      spacing: { before: 40, after: 40, line: 300 },
    }
  }

  if (styles.markdown.codespan) {
    styles.markdown.codespan.run = {
      ...styles.markdown.codespan.run,
      font: {
        ascii: 'Cascadia Code',
        hAnsi: 'Cascadia Code',
        eastAsia: 'Microsoft YaHei',
        cs: 'Consolas',
      },
      size: 21,
      color: 'c7254e',
      shading: { fill: 'f4f4f5', type: 'clear' as const, color: 'auto' },
    }
  }

  const doc = await markdownDocx(markdown, {
    gfm: true,
    ignoreImage: false,
    document: { title, creator: 'Refinex' },
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${title}.docx`)
}

export type ExportFormat = 'md' | 'html' | 'pdf' | 'docx'

const MARKDOWN_TYPES = new Set(['MARKDOWN', 'MD', 'TXT'])

export function isMarkdownDoc(docType: string | undefined): boolean {
  return !!docType && MARKDOWN_TYPES.has(docType.toUpperCase())
}

export async function exportDocument(
  format: ExportFormat,
  markdown: string,
  editorContainer: HTMLElement | null,
  title: string,
) {
  try {
    switch (format) {
      case 'md':
        exportMarkdown(markdown, title)
        break
      case 'html': {
        if (editorContainer) {
          exportHTML(editorContainer, title)
        } else {
          const html = buildStandaloneHTML(markdownToSimpleHTML(markdown), title)
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
          downloadBlob(blob, `${title}.html`)
        }
        break
      }
      case 'pdf': {
        if (editorContainer) {
          await exportPDF(editorContainer, title)
        } else {
          await exportPDFFromMarkdown(markdown, title)
        }
        break
      }
      case 'docx':
        await exportDOCX(markdown, title)
        break
    }
    toast.success('导出成功')
  } catch (e) {
    toast.error(`导出失败：${e instanceof Error ? e.message : '未知错误'}`)
  }
}

// ─── 简易 markdown → HTML（侧边栏场景，无编辑器 DOM） ─────────────────────

function markdownToSimpleHTML(md: string): string {
  let html = escapeHtml(md)

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
    `<pre><code>${code}</code></pre>`
  )

  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  html = html.replace(/^---+$/gm, '<hr>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>')
  html = html.replace(/^(?!<[a-z])((?!<\/)[^\n]+)$/gm, '<p>$1</p>')
  html = html.replace(/\n{3,}/g, '\n\n')

  return html
}
