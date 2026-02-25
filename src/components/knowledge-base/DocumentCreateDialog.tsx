import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface DocumentCreateDialogProps {
  kbId: number
  folderId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function DocumentCreateDialog({ kbId, folderId, open, onOpenChange, onCreated }: DocumentCreateDialogProps) {
  const [tab, setTab] = useState<string>('empty')
  const [docName, setDocName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleOpenChange = (v: boolean) => {
    if (v) {
      setDocName('')
      setFile(null)
      setTab('empty')
    }
    onOpenChange(v)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { aiApi } = await import('@/services')

      if (tab === 'upload' && file) {
        const fileUrl = await aiApi.uploadFile(file, 'kb')
        const ext = file.name.split('.').pop()?.toUpperCase() ?? 'TXT'
        await aiApi.createDocument(kbId, {
          docName: file.name,
          docType: ext === 'MD' ? 'MARKDOWN' : ext,
          fileUrl,
          fileSize: file.size,
          ...(folderId ? { folderId } : {}),
        })
        toast.success('文档已上传')
      } else {
        if (!docName.trim()) {
          toast.error('请输入文档名称')
          setSubmitting(false)
          return
        }
        await aiApi.createDocument(kbId, {
          docName: docName.trim().endsWith('.md') ? docName.trim() : `${docName.trim()}.md`,
          docType: 'MARKDOWN',
          ...(folderId ? { folderId } : {}),
        })
        toast.success('文档已创建')
      }
      onOpenChange(false)
      onCreated()
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新建文档</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="empty" className="flex-1">空白文档</TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">上传文件</TabsTrigger>
          </TabsList>
          <TabsContent value="empty" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="doc-name">文档名称</Label>
              <Input
                id="doc-name"
                placeholder="例如：产品介绍（默认 .md 格式）"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              />
            </div>
          </TabsContent>
          <TabsContent value="upload" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>选择文件</Label>
              <Input
                type="file"
                accept=".md,.txt,.pdf,.docx,.xlsx,.csv,.html,.json"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                支持 Markdown、TXT、PDF、DOCX、XLSX、CSV、HTML、JSON
              </p>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (tab === 'upload' && !file) || (tab === 'empty' && !docName.trim())}
          >
            {submitting ? '创建中...' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
