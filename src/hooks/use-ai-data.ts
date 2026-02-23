import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as aiApi from '@/services/modules/ai'
import type {
  ModelProvision,
  PromptTemplate, PromptTemplateCreateRequest, PromptTemplateUpdateRequest,
  Tool, ToolCreateRequest, ToolUpdateRequest,
  McpServer, McpServerCreateRequest, McpServerUpdateRequest,
  Skill, SkillCreateRequest, SkillUpdateRequest,
  KnowledgeBase,
} from '@/services/modules/ai'

// ── ModelProvision（仅查看） ──

export function useModelProvisions() {
  const [items, setItems] = useState<ModelProvision[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await aiApi.listModelProvisions({ currentPage: 1, pageSize: 100 })
      setItems(res.records)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { items, loading, refresh }
}

// ── PromptTemplate（CRUD） ──

export function usePromptTemplates() {
  const [items, setItems] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await aiApi.listAllPromptTemplates()
      setItems(res)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = useCallback(async (data: PromptTemplateCreateRequest) => {
    await aiApi.createPromptTemplate(data)
    toast.success('Prompt 模板创建成功')
    await refresh()
  }, [refresh])

  const handleUpdate = useCallback(async (id: number, data: PromptTemplateUpdateRequest) => {
    await aiApi.updatePromptTemplate(id, data)
    toast.success('Prompt 模板更新成功')
    await refresh()
  }, [refresh])

  const handleDelete = useCallback(async (id: number) => {
    await aiApi.deletePromptTemplate(id)
    toast.success('Prompt 模板已删除')
    await refresh()
  }, [refresh])

  return { items, loading, refresh, handleCreate, handleUpdate, handleDelete }
}

// ── Tool（CRUD） ──

export function useTools() {
  const [items, setItems] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await aiApi.listAllTools()
      setItems(res)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = useCallback(async (data: ToolCreateRequest) => {
    await aiApi.createTool(data)
    toast.success('工具创建成功')
    await refresh()
  }, [refresh])

  const handleUpdate = useCallback(async (id: number, data: ToolUpdateRequest) => {
    await aiApi.updateTool(id, data)
    toast.success('工具更新成功')
    await refresh()
  }, [refresh])

  const handleDelete = useCallback(async (id: number) => {
    await aiApi.deleteTool(id)
    toast.success('工具已删除')
    await refresh()
  }, [refresh])

  return { items, loading, refresh, handleCreate, handleUpdate, handleDelete }
}

// ── McpServer（CRUD） ──

export function useMcpServers() {
  const [items, setItems] = useState<McpServer[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await aiApi.listAllMcpServers()
      setItems(res)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = useCallback(async (data: McpServerCreateRequest) => {
    await aiApi.createMcpServer(data)
    toast.success('MCP 服务器创建成功')
    await refresh()
  }, [refresh])

  const handleUpdate = useCallback(async (id: number, data: McpServerUpdateRequest) => {
    await aiApi.updateMcpServer(id, data)
    toast.success('MCP 服务器更新成功')
    await refresh()
  }, [refresh])

  const handleDelete = useCallback(async (id: number) => {
    await aiApi.deleteMcpServer(id)
    toast.success('MCP 服务器已删除')
    await refresh()
  }, [refresh])

  return { items, loading, refresh, handleCreate, handleUpdate, handleDelete }
}

// ── Skill（CRUD） ──

export function useSkills() {
  const [items, setItems] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await aiApi.listAllSkills()
      setItems(res)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = useCallback(async (data: SkillCreateRequest) => {
    await aiApi.createSkill(data)
    toast.success('技能创建成功')
    await refresh()
  }, [refresh])

  const handleUpdate = useCallback(async (id: number, data: SkillUpdateRequest) => {
    await aiApi.updateSkill(id, data)
    toast.success('技能更新成功')
    await refresh()
  }, [refresh])

  const handleDelete = useCallback(async (id: number) => {
    await aiApi.deleteSkill(id)
    toast.success('技能已删除')
    await refresh()
  }, [refresh])

  return { items, loading, refresh, handleCreate, handleUpdate, handleDelete }
}

// ── KnowledgeBase（仅查看，供 Skill 表单使用） ──

export function useKnowledgeBases() {
  const [items, setItems] = useState<KnowledgeBase[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await aiApi.listAllKnowledgeBases()
      setItems(res)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { items, loading, refresh }
}
