import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  useModelProvisions,
  usePromptTemplates,
  useTools,
  useKnowledgeBases,
} from '@/hooks/use-ai-data'
import type {
  Skill,
  SkillCreateRequest,
  SkillUpdateRequest,
} from '@/services/modules/ai'

interface SkillFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: Skill | null
  onCreate: (data: SkillCreateRequest) => Promise<void>
  onUpdate: (id: number, data: SkillUpdateRequest) => Promise<void>
}

export function SkillForm({
  open,
  onOpenChange,
  editItem,
  onCreate,
  onUpdate,
}: SkillFormProps) {
  const isEdit = !!editItem

  const { items: models } = useModelProvisions()
  const { items: prompts } = usePromptTemplates()
  const { items: tools } = useTools()
  const { items: knowledgeBases } = useKnowledgeBases()

  const [skillCode, setSkillCode] = useState('')
  const [skillName, setSkillName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [status, setStatus] = useState(true)
  const [sort, setSort] = useState(0)
  const [modelId, setModelId] = useState<string>('')
  const [promptTemplateId, setPromptTemplateId] = useState<string>('')
  const [temperature, setTemperature] = useState('')
  const [topP, setTopP] = useState('')
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined)
  const [toolIds, setToolIds] = useState<number[]>([])
  const [knowledgeBaseIds, setKnowledgeBaseIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [kbOpen, setKbOpen] = useState(false)

  useEffect(() => {
    if (open && editItem) {
      setSkillCode(editItem.skillCode)
      setSkillName(editItem.skillName)
      setDescription(editItem.description || '')
      setIcon(editItem.icon || '')
      setStatus(editItem.status === 1)
      setSort(editItem.sort || 0)
      setModelId(editItem.modelId ? String(editItem.modelId) : '')
      setPromptTemplateId(
        editItem.promptTemplateId ? String(editItem.promptTemplateId) : '',
      )
      setTemperature(editItem.temperature || '')
      setTopP(editItem.topP || '')
      setMaxTokens(editItem.maxTokens || undefined)
      setToolIds(editItem.toolIds || [])
      setKnowledgeBaseIds(editItem.knowledgeBaseIds || [])
    } else if (open) {
      setSkillCode('')
      setSkillName('')
      setDescription('')
      setIcon('')
      setStatus(true)
      setSort(0)
      setModelId('')
      setPromptTemplateId('')
      setTemperature('')
      setTopP('')
      setMaxTokens(undefined)
      setToolIds([])
      setKnowledgeBaseIds([])
    }
  }, [open, editItem])

  const toggleTool = (id: number) => {
    setToolIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleKb = (id: number) => {
    setKnowledgeBaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleSave = async () => {
    if (!skillCode.trim() || !skillName.trim()) return
    setSaving(true)
    try {
      const payload = {
        skillName,
        description: description || undefined,
        icon: icon || undefined,
        modelId: modelId ? Number(modelId) : undefined,
        promptTemplateId: promptTemplateId
          ? Number(promptTemplateId)
          : undefined,
        temperature: temperature || undefined,
        topP: topP || undefined,
        maxTokens: maxTokens || undefined,
        status: status ? 1 : 0,
        sort,
        toolIds: toolIds.length > 0 ? toolIds : undefined,
        knowledgeBaseIds:
          knowledgeBaseIds.length > 0 ? knowledgeBaseIds : undefined,
      }
      if (isEdit) {
        await onUpdate(editItem.id, payload)
      } else {
        await onCreate({ skillCode, ...payload })
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? '编辑' : '新建'}技能</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          {/* 基本信息 */}
          <div className="text-sm font-medium text-muted-foreground">
            基本信息
          </div>
          <div className="flex flex-col gap-2">
            <Label>技能编码 *</Label>
            <Input
              value={skillCode}
              onChange={(e) => setSkillCode(e.target.value)}
              disabled={isEdit}
              placeholder="如 code-review"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>技能名称 *</Label>
            <Input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="如 代码审查"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="技能功能描述"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>图标</Label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="如 code, search, brain"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>启用</Label>
            <Switch checked={status} onCheckedChange={setStatus} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>排序</Label>
            <Input
              type="number"
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
            />
          </div>

          <Separator />

          {/* 模型配置 */}
          <div className="text-sm font-medium text-muted-foreground">
            模型配置
          </div>
          <div className="flex flex-col gap-2">
            <Label>模型</Label>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.modelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Prompt 模板</Label>
            <Select
              value={promptTemplateId}
              onValueChange={setPromptTemplateId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择模板" />
              </SelectTrigger>
              <SelectContent>
                {prompts.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.promptName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label>Temperature</Label>
              <Input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="0.7"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label>Top P</Label>
              <Input
                type="number"
                step="0.1"
                value={topP}
                onChange={(e) => setTopP(e.target.value)}
                placeholder="0.9"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>最大 Tokens</Label>
            <Input
              type="number"
              value={maxTokens ?? ''}
              onChange={(e) =>
                setMaxTokens(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="如 4096"
            />
          </div>

          <Separator />

          {/* 工具与知识库 */}
          <div className="text-sm font-medium text-muted-foreground">
            工具与知识库
          </div>

          <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  工具
                  {toolIds.length > 0 && (
                    <Badge variant="secondary">{toolIds.length}</Badge>
                  )}
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="mt-2 max-h-[140px] rounded-md border p-2">
                {tools.length === 0 ? (
                  <div className="py-2 text-center text-xs text-muted-foreground">
                    暂无可用工具
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {tools.map((t) => (
                      <label
                        key={t.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={toolIds.includes(t.id)}
                          onCheckedChange={() => toggleTool(t.id)}
                        />
                        <span className="text-sm">{t.toolName}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {t.toolType}
                        </Badge>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={kbOpen} onOpenChange={setKbOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  知识库
                  {knowledgeBaseIds.length > 0 && (
                    <Badge variant="secondary">
                      {knowledgeBaseIds.length}
                    </Badge>
                  )}
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${kbOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="mt-2 max-h-[140px] rounded-md border p-2">
                {knowledgeBases.length === 0 ? (
                  <div className="py-2 text-center text-xs text-muted-foreground">
                    暂无可用知识库
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {knowledgeBases.map((kb) => (
                      <label
                        key={kb.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={knowledgeBaseIds.includes(kb.id)}
                          onCheckedChange={() => toggleKb(kb.id)}
                        />
                        <span className="text-sm">{kb.kbName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
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
