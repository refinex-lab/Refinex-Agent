import { useState } from 'react'
import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface GeneratedImageProps {
  url: string
}

export function GeneratedImage({ url }: GeneratedImageProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="group relative mt-2 inline-block">
        <img
          src={url}
          alt="AI 生成图片"
          className="max-w-md cursor-pointer rounded-lg"
          onClick={() => setOpen(true)}
        />
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="secondary" size="icon-sm">
            <DownloadIcon className="size-4" />
          </Button>
        </a>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">图片预览</DialogTitle>
          <img src={url} alt="AI 生成图片" className="w-full rounded" />
        </DialogContent>
      </Dialog>
    </>
  )
}
