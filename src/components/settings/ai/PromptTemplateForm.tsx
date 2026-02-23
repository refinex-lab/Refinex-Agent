import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  PromptTemplate,
  PromptTemplateCreateRequest,
  PromptTemplateUpdateRequest,
} from '@/services/modules/ai'

interface PromptTemplateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: PromptTemplate | null
  onCreate: (data: PromptTemplateCreateRequest) => Promise<void>
  onUpdate: (id: number, data: PromptTemplateUpdateRequest) => Promise<void>
}

export function PromptTemplateForm({
  open,
  onOpenChange,
  editItem,
  onCreate,
  onUpdate,
}: PromptTemplateFormProps) {
  const isEdit = !!editItem

  const [promptCode, setPromptCode] = useState('')
  const [promptName, setPromptName] = useState('')
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState('zh')
  const [content, setContent] = useState('')
  const [variables, setVariables] = useState('')
  const [varOpen, setVarOpen] = useState('{{')
  const [varClose, setVarClose] = useState('}}')
  const [status, setStatus] = useState(true)
  const [sort, setSort] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && editItem) {
      setPromptCode(editItem.promptCode)
      setPromptName(editItem.promptName)
      setCategory(editItem.category || '')
      setLanguage(editItem.language || 'zh')
      setContent(editItem.content || '')
      setVariables(editItem.variables || '')
      setVarOpen(editItem.varOpen || '{{')
      setVarClose(editItem.varClose || '}}')
      setStatus(editItem.status === 1)
      setSort(editItem.sort || 0)
    } else if (open) {
      setPromptCode('')
      setPromptName('')
      setCategory('')
      setLanguage('zh')
      setContent('')
      setVariables('')
      setVarOpen('{{')
      setVarClose('}}')
      setStatus(true)
      setSort(0)
    }
  }, [open, editItem])

  const handleSave = async () => {
    if (!promptCode.trim() || !promptName.trim()) return
    setSaving(true)
    try {
      if (isEdit) {
        await onUpdate(editItem.id, {
          promptName,
          category: category || undefined,
          content: content || undefined,
          variables: variables || undefined,
          varOpen: varOpen || undefined,
          varClose: varClose || undefined,
          language: language || undefined,
          status: status ? 1 : 0,
          sort,
        })
      } else {
        await onCreate({
          promptCode,
          promptName,
          category: category || undefined,
          content: content || undefined,
          variables: variables || undefined,
          varOpen: varOpen || undefined,
          varClose: varClose || undefined,
          language: language || undefined,
          status: status ? 1 : 0,
          sort,
        })
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? '编辑' : '新建'} Prompt 模板</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>模板编码 *</Label>
            <Input
              value={promptCode}
              onChange={(e) => setPromptCode(e.target.value)}
              disabled={isEdit}
              placeholder="如 chat-default"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>模板名称 *</Label>
            <Input
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
              placeholder="如 默认对话模板"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>分类</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="如 chat, rag, agent"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label>语言</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={sort}
                onChange={(e) => setSort(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>启用</Label>
              <div className="flex h-9 items-center">
                <Switch checked={status} onCheckedChange={setStatus} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>模板内容</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[180px] font-mono text-xs"
              placeholder="输入 Prompt 模板内容..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>变量（逗号分隔）</Label>
            <Input
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder="如 name, topic, language"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label>变量开标记</Label>
              <Input
                value={varOpen}
                onChange={(e) => setVarOpen(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label>变量闭标记</Label>
              <Input
                value={varClose}
                onChange={(e) => setVarClose(e.target.value)}
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
