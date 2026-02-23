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
  Tool,
  ToolCreateRequest,
  ToolUpdateRequest,
} from '@/services/modules/ai'

interface ToolFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: Tool | null
  onCreate: (data: ToolCreateRequest) => Promise<void>
  onUpdate: (id: number, data: ToolUpdateRequest) => Promise<void>
}

export function ToolForm({
  open,
  onOpenChange,
  editItem,
  onCreate,
  onUpdate,
}: ToolFormProps) {
  const isEdit = !!editItem

  const [toolCode, setToolCode] = useState('')
  const [toolName, setToolName] = useState('')
  const [toolType, setToolType] = useState('FUNCTION')
  const [description, setDescription] = useState('')
  const [inputSchema, setInputSchema] = useState('')
  const [outputSchema, setOutputSchema] = useState('')
  const [handlerRef, setHandlerRef] = useState('')
  const [requireConfirm, setRequireConfirm] = useState(false)
  const [status, setStatus] = useState(true)
  const [sort, setSort] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && editItem) {
      setToolCode(editItem.toolCode)
      setToolName(editItem.toolName)
      setToolType(editItem.toolType || 'FUNCTION')
      setDescription(editItem.description || '')
      setInputSchema(editItem.inputSchema || '')
      setOutputSchema(editItem.outputSchema || '')
      setHandlerRef(editItem.handlerRef || '')
      setRequireConfirm(editItem.requireConfirm === 1)
      setStatus(editItem.status === 1)
      setSort(editItem.sort || 0)
    } else if (open) {
      setToolCode('')
      setToolName('')
      setToolType('FUNCTION')
      setDescription('')
      setInputSchema('')
      setOutputSchema('')
      setHandlerRef('')
      setRequireConfirm(false)
      setStatus(true)
      setSort(0)
    }
  }, [open, editItem])

  const handleSave = async () => {
    if (!toolCode.trim() || !toolName.trim() || !toolType) return
    setSaving(true)
    try {
      const payload = {
        toolName,
        toolType,
        description: description || undefined,
        inputSchema: inputSchema || undefined,
        outputSchema: outputSchema || undefined,
        handlerRef: handlerRef || undefined,
        requireConfirm: requireConfirm ? 1 : 0,
        status: status ? 1 : 0,
        sort,
      }
      if (isEdit) {
        await onUpdate(editItem.id, payload)
      } else {
        await onCreate({ toolCode, ...payload })
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
          <SheetTitle>{isEdit ? '编辑' : '新建'}工具</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>工具编码 *</Label>
            <Input
              value={toolCode}
              onChange={(e) => setToolCode(e.target.value)}
              disabled={isEdit}
              placeholder="如 web-search"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>工具名称 *</Label>
            <Input
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="如 网页搜索"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label>工具类型 *</Label>
              <Select value={toolType} onValueChange={setToolType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FUNCTION">FUNCTION</SelectItem>
                  <SelectItem value="MCP">MCP</SelectItem>
                  <SelectItem value="HTTP">HTTP</SelectItem>
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
          </div>
          <div className="flex flex-col gap-2">
            <Label>描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="工具功能描述"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>输入 Schema (JSON)</Label>
            <Textarea
              value={inputSchema}
              onChange={(e) => setInputSchema(e.target.value)}
              className="min-h-[100px] font-mono text-xs"
              placeholder='{"type": "object", "properties": {...}}'
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>输出 Schema (JSON)</Label>
            <Textarea
              value={outputSchema}
              onChange={(e) => setOutputSchema(e.target.value)}
              className="min-h-[100px] font-mono text-xs"
              placeholder='{"type": "object", "properties": {...}}'
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>处理器引用</Label>
            <Input
              value={handlerRef}
              onChange={(e) => setHandlerRef(e.target.value)}
              placeholder="如 bean:webSearchTool"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label>需要确认</Label>
              <Switch checked={requireConfirm} onCheckedChange={setRequireConfirm} />
            </div>
            <div className="flex items-center gap-2">
              <Label>启用</Label>
              <Switch checked={status} onCheckedChange={setStatus} />
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
