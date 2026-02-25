import { useEffect, useRef } from 'react'
import { renderAsync } from 'docx-preview'

interface DocxPreviewProps {
  blob: Blob
}

export function DocxPreview({ blob }: DocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.innerHTML = ''
    renderAsync(blob, el, undefined, {
      className: 'docx-preview-wrapper',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: true,
      ignoreFonts: false,
      breakPages: true,
    }).catch(() => {
      el.innerHTML = '<p class="p-4 text-sm text-destructive">DOCX 渲染失败</p>'
    })
  }, [blob])

  return <div ref={containerRef} className="h-full overflow-auto p-2" />
}
