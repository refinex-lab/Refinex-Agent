import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  McpServer,
  McpServerCreateRequest,
  McpServerUpdateRequest,
} from '@/services/modules/ai'

interface McpServerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: McpServer | null
  onCreate: (data: McpServerCreateRequest) => Promise<void>
  onUpdate: (id: number, data: McpServerUpdateRequest) => Promise<void>
}

interface EnvVar {
  key: string
  value: string
}

function parseEnvVars(json: string): EnvVar[] {
  try {
    const obj = JSON.parse(json)
    return Object.entries(obj).map(([key, value]) => ({
      key,
      value: String(value),
    }))
  } catch {
    return []
  }
}

function serializeEnvVars(vars: EnvVar[]): string | undefined {
  const filtered = vars.filter((v) => v.key.trim())
  if (filtered.length === 0) return undefined
  const obj: Record<string, string> = {}
  for (const v of filtered) {
    obj[v.key] = v.value
  }
  return JSON.stringify(obj)
}

export function McpServerForm({
  open,
  onOpenChange,
  editItem,
  onCreate,
  onUpdate,
}: McpServerFormProps) {
  const isEdit = !!editItem

  const [serverCode, setServerCode] = useState('')
  const [serverName, setServerName] = useState('')
  const [transportType, setTransportType] = useState('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [endpointUrl, setEndpointUrl] = useState('')
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [status, setStatus] = useState(true)
  const [sort, setSort] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && editItem) {
      setServerCode(editItem.serverCode)
      setServerName(editItem.serverName)
      setTransportType(editItem.transportType || 'stdio')
      setCommand(editItem.command || '')
      setArgs(editItem.args || '')
      setEndpointUrl(editItem.endpointUrl || '')
      setEnvVars(
        editItem.envVarsMasked ? parseEnvVars(editItem.envVarsMasked) : [],
      )
      setStatus(editItem.status === 1)
      setSort(editItem.sort || 0)
    } else if (open) {
      setServerCode('')
      setServerName('')
      setTransportType('stdio')
      setCommand('')
      setArgs('')
      setEndpointUrl('')
      setEnvVars([])
      setStatus(true)
      setSort(0)
    }
  }, [open, editItem])

  const addEnvVar = () => setEnvVars([...envVars, { key: '', value: '' }])

  const removeEnvVar = (index: number) =>
    setEnvVars(envVars.filter((_, i) => i !== index))

  const updateEnvVar = (index: number, field: 'key' | 'value', val: string) =>
    setEnvVars(envVars.map((v, i) => (i === index ? { ...v, [field]: val } : v)))

  const handleSave = async () => {
    if (!serverCode.trim() || !serverName.trim() || !transportType) return
    setSaving(true)
    try {
      const payload = {
        serverName,
        transportType,
        command: transportType === 'stdio' ? command || undefined : undefined,
        args: transportType === 'stdio' ? args || undefined : undefined,
        endpointUrl:
          transportType === 'sse' ? endpointUrl || undefined : undefined,
        envVars: serializeEnvVars(envVars),
        status: status ? 1 : 0,
        sort,
      }
      if (isEdit) {
        await onUpdate(editItem.id, payload)
      } else {
        await onCreate({ serverCode, ...payload })
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
          <SheetTitle>{isEdit ? '编辑' : '新建'} MCP 服务器</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>服务器编码 *</Label>
            <Input
              value={serverCode}
              onChange={(e) => setServerCode(e.target.value)}
              disabled={isEdit}
              placeholder="如 context7"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>服务器名称 *</Label>
            <Input
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="如 Context7 文档服务"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <Label>传输类型 *</Label>
              <Select value={transportType} onValueChange={setTransportType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stdio">stdio</SelectItem>
                  <SelectItem value="sse">sse</SelectItem>
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

          {transportType === 'stdio' ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>命令</Label>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="如 npx"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>参数</Label>
                <Input
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  placeholder="如 -y @context7/mcp-server"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Label>端点 URL</Label>
              <Input
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="如 http://localhost:3000/sse"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>环境变量</Label>
              <Button variant="ghost" size="sm" onClick={addEnvVar}>
                <Plus className="mr-1 size-3.5" />
                添加
              </Button>
            </div>
            {envVars.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={v.key}
                  onChange={(e) => updateEnvVar(i, 'key', e.target.value)}
                  placeholder="KEY"
                  className="flex-1"
                />
                <Input
                  value={v.value}
                  onChange={(e) => updateEnvVar(i, 'value', e.target.value)}
                  placeholder="VALUE"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEnvVar(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Label>启用</Label>
            <Switch checked={status} onCheckedChange={setStatus} />
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
