import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { KnowledgeBase } from '@/services/modules/ai'
import { KbIconPicker } from './KbIconPicker'
import { DEFAULT_KB_ICON } from './kb-icons'

interface KbCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editKb?: KnowledgeBase
  onCreated: () => void
}

export function KbCreateDialog({ open, onOpenChange, editKb, onCreated }: KbCreateDialogProps) {
  const isEdit = !!editKb
  const [icon, setIcon] = useState(DEFAULT_KB_ICON)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 当 Dialog 打开时，根据是否编辑模式同步表单状态
  useEffect(() => {
    if (!open) return
    if (editKb) {
      setIcon(editKb.icon || DEFAULT_KB_ICON)
      setName(editKb.kbName)
      setCode(editKb.kbCode)
      setDescription(editKb.description ?? '')
    } else {
      setIcon(DEFAULT_KB_ICON)
      setName('')
      setCode('')
      setDescription('')
    }
  }, [open, editKb])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入知识库名称')
      return
    }
    if (!isEdit && !code.trim()) {
      toast.error('请输入知识库编码')
      return
    }
    setSubmitting(true)
    try {
      const { aiApi } = await import('@/services')
      if (isEdit) {
        await aiApi.updateKnowledgeBase(editKb.id, {
          kbName: name.trim(),
          description: description.trim(),
          icon,
        })
        toast.success('知识库已更新')
      } else {
        await aiApi.createKnowledgeBase({
          kbCode: code.trim(),
          kbName: name.trim(),
          description: description.trim(),
          icon,
        })
        toast.success('知识库已创建')
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑知识库' : '新建知识库'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>图标</Label>
            <KbIconPicker value={icon} onChange={setIcon} />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="kb-code">编码</Label>
              <Input
                id="kb-code"
                placeholder="唯一编码，如 my-kb"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="kb-name">名称</Label>
            <Input
              id="kb-name"
              placeholder="知识库名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kb-desc">描述</Label>
            <Textarea
              id="kb-desc"
              placeholder="可选，简要描述知识库用途"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '提交中...' : isEdit ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
