import { get, post, put, del } from '@/services/request'
import service from '@/services/request'
import { env } from '@/config/env'
import type { PageParams } from '@/types/api'

// ── 通用分页响应（拦截器已解包） ──────────────────────────

export interface PageData<T> {
  records: T[]
  total: number
  totalPage: number
  page: number
  size: number
}

// ══════════════════════════════════════════════════════════
// Provider（供应商）
// ══════════════════════════════════════════════════════════

export interface Provider {
  id: number
  providerCode: string
  providerName: string
  protocol: string
  baseUrl: string
  iconUrl: string
  status: number
  sort: number
  remark: string
  extJson: string
}

export interface ProviderListQuery extends PageParams {
  status?: number
  keyword?: string
}

export interface ProviderCreateRequest {
  providerCode: string
  providerName: string
  protocol?: string
  baseUrl?: string
  iconUrl?: string
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface ProviderUpdateRequest {
  providerName: string
  protocol?: string
  baseUrl?: string
  iconUrl?: string
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

// ══════════════════════════════════════════════════════════
// Model（模型）
// ══════════════════════════════════════════════════════════

export interface Model {
  id: number
  providerId: number
  modelCode: string
  modelName: string
  modelType: number
  capVision: number
  capToolCall: number
  capStructuredOutput: number
  capStreaming: number
  capReasoning: number
  maxContextWindow: number
  maxOutputTokens: number
  inputPrice: string
  outputPrice: string
  status: number
  sort: number
  remark: string
  extJson: string
}

export interface ModelListQuery extends PageParams {
  providerId?: number
  modelType?: number
  status?: number
  keyword?: string
}

export interface ModelCreateRequest {
  providerId: number
  modelCode: string
  modelName: string
  modelType?: number
  capVision?: number
  capToolCall?: number
  capStructuredOutput?: number
  capStreaming?: number
  capReasoning?: number
  maxContextWindow?: number
  maxOutputTokens?: number
  inputPrice?: string
  outputPrice?: string
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface ModelUpdateRequest {
  modelName: string
  modelType?: number
  capVision?: number
  capToolCall?: number
  capStructuredOutput?: number
  capStreaming?: number
  capReasoning?: number
  maxContextWindow?: number
  maxOutputTokens?: number
  inputPrice?: string
  outputPrice?: string
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

// ══════════════════════════════════════════════════════════
// ModelProvision（租户模型开通）
// ══════════════════════════════════════════════════════════

export interface ModelProvision {
  id: number
  estabId: number
  modelId: number
  providerId: number
  providerCode: string
  modelCode: string
  modelName: string
  apiKeyMasked: string
  apiBaseUrl: string
  dailyQuota: number | null
  monthlyQuota: number | null
  isDefault: number
  status: number
  remark: string
  extJson: string
}

export interface ModelProvisionListQuery extends PageParams {
  estabId?: number
  modelId?: number
  status?: number
}

export interface ModelProvisionCreateRequest {
  estabId: number
  modelId: number
  apiKey?: string
  apiBaseUrl?: string
  dailyQuota?: number
  monthlyQuota?: number
  isDefault?: number
  status?: number
  remark?: string
  extJson?: string
}

export interface ModelProvisionUpdateRequest {
  apiKey?: string
  apiBaseUrl?: string
  dailyQuota?: number
  monthlyQuota?: number
  isDefault?: number
  status?: number
  remark?: string
  extJson?: string
}

// ══════════════════════════════════════════════════════════
// PromptTemplate（Prompt 模板）
// ══════════════════════════════════════════════════════════

export interface PromptTemplate {
  id: number
  estabId: number
  promptCode: string
  promptName: string
  category: string
  content: string
  variables: string
  varOpen: string
  varClose: string
  language: string
  isBuiltin: number
  status: number
  sort: number
  remark: string
  extJson: string
}

export interface PromptTemplateListQuery extends PageParams {
  status?: number
  category?: string
  keyword?: string
}

export interface PromptTemplateCreateRequest {
  promptCode: string
  promptName: string
  category?: string
  content?: string
  variables?: string
  varOpen?: string
  varClose?: string
  language?: string
  isBuiltin?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface PromptTemplateUpdateRequest {
  promptName: string
  category?: string
  content?: string
  variables?: string
  varOpen?: string
  varClose?: string
  language?: string
  isBuiltin?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

// ══════════════════════════════════════════════════════════
// Tool（工具）
// ══════════════════════════════════════════════════════════

export interface Tool {
  id: number
  estabId: number
  toolCode: string
  toolName: string
  toolType: string
  description: string
  inputSchema: string
  outputSchema: string
  handlerRef: string
  requireConfirm: number
  isBuiltin: number
  status: number
  sort: number
  remark: string
  extJson: string
}

export interface ToolListQuery extends PageParams {
  toolType?: string
  status?: number
  keyword?: string
}

export interface ToolCreateRequest {
  toolCode: string
  toolName: string
  toolType: string
  description?: string
  inputSchema?: string
  outputSchema?: string
  handlerRef?: string
  requireConfirm?: number
  isBuiltin?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface ToolUpdateRequest {
  toolName: string
  toolType: string
  description?: string
  inputSchema?: string
  outputSchema?: string
  handlerRef?: string
  requireConfirm?: number
  isBuiltin?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

// ══════════════════════════════════════════════════════════
// McpServer（MCP 服务器）
// ══════════════════════════════════════════════════════════

export interface McpServer {
  id: number
  estabId: number
  serverCode: string
  serverName: string
  transportType: string
  endpointUrl: string
  command: string
  args: string
  envVarsMasked: string
  status: number
  sort: number
  remark: string
  extJson: string
}

export interface McpServerListQuery extends PageParams {
  transportType?: string
  status?: number
  keyword?: string
}

export interface McpServerCreateRequest {
  serverCode: string
  serverName: string
  transportType: string
  endpointUrl?: string
  command?: string
  args?: string
  envVars?: string
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface McpServerUpdateRequest {
  serverName: string
  transportType: string
  endpointUrl?: string
  command?: string
  args?: string
  envVars?: string
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

// ══════════════════════════════════════════════════════════
// Skill（技能）
// ══════════════════════════════════════════════════════════

export interface Skill {
  id: number
  estabId: number
  skillCode: string
  skillName: string
  description: string
  icon: string
  modelId: number
  promptTemplateId: number
  temperature: string
  topP: string
  maxTokens: number
  isBuiltin: number
  status: number
  sort: number
  remark: string
  extJson: string
  toolIds: number[]
  knowledgeBaseIds: number[]
}

export interface SkillListQuery extends PageParams {
  status?: number
  keyword?: string
}

export interface SkillCreateRequest {
  skillCode: string
  skillName: string
  description?: string
  icon?: string
  modelId?: number
  promptTemplateId?: number
  temperature?: string
  topP?: string
  maxTokens?: number
  isBuiltin?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
  toolIds?: number[]
  knowledgeBaseIds?: number[]
}

export interface SkillUpdateRequest {
  skillName: string
  description?: string
  icon?: string
  modelId?: number
  promptTemplateId?: number
  temperature?: string
  topP?: string
  maxTokens?: number
  isBuiltin?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
  toolIds?: number[]
  knowledgeBaseIds?: number[]
}

// ══════════════════════════════════════════════════════════
// Conversation（对话）
// ══════════════════════════════════════════════════════════

export interface Conversation {
  conversationId: string
  title: string
  modelId: number
  pinned: number
  status: number
  gmtCreate: string
  gmtModified: string
}

export interface ConversationDetail extends Conversation {
  systemPrompt: string
  extJson: string
  messages: ChatMessage[]
}

export interface ChatMessage {
  type: string
  content: string
  timestamp: string
  reasoningContent: string
}

export interface ConversationListQuery {
  currentPage?: number
  pageSize?: number
  status?: number
}

export interface ChatRequest {
  conversationId?: string
  message?: string
  modelId?: number
  promptTemplateId?: number
  templateVariables?: Record<string, string>
  systemPrompt?: string
  imageUrls?: string[]
  audioUrl?: string
  knowledgeBaseIds?: number[]
  ragTopK?: number
  ragSimilarityThreshold?: number
}

export interface ConversationTitleUpdateRequest {
  title: string
}

// ══════════════════════════════════════════════════════════
// KnowledgeBase（知识库）
// ══════════════════════════════════════════════════════════

export interface KnowledgeBase {
  id: number
  estabId: number
  kbCode: string
  kbName: string
  description: string
  icon: string
  visibility: number
  vectorized: number
  embeddingModelId: number
  chunkSize: number
  chunkOverlap: number
  docCount: number
  status: number
  sort: number
  remark: string
  extJson: string
}

export interface KnowledgeBaseListQuery extends PageParams {
  status?: number
  keyword?: string
}

export interface KnowledgeBaseCreateRequest {
  kbCode: string
  kbName: string
  description?: string
  icon?: string
  visibility?: number
  vectorized?: number
  embeddingModelId?: number
  chunkSize?: number
  chunkOverlap?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface KnowledgeBaseUpdateRequest {
  kbName: string
  description?: string
  icon?: string
  visibility?: number
  vectorized?: number
  embeddingModelId?: number
  chunkSize?: number
  chunkOverlap?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface Folder {
  id: number
  knowledgeBaseId: number
  parentId: number
  folderName: string
  sort: number
  remark: string
  extJson: string
}

export interface FolderCreateRequest {
  parentId?: number
  folderName: string
  sort?: number
  remark?: string
  extJson?: string
}

export interface FolderUpdateRequest {
  folderName: string
  sort?: number
  remark?: string
  extJson?: string
}

export interface Document {
  id: number
  knowledgeBaseId: number
  folderId: number
  docName: string
  docType: string
  fileUrl: string
  fileSize: number
  charCount: number
  tokenCount: number
  vectorStatus: number
  vectorError: string
  chunkCount: number
  lastVectorizedAt: string
  status: number
  sort: number
  remark: string
  extJson: string
}

export interface DocumentListQuery extends PageParams {
  folderId?: number
  status?: number
  keyword?: string
}

export interface DocumentCreateRequest {
  folderId?: number
  docName: string
  docType?: string
  fileUrl?: string
  fileSize?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface DocumentUpdateRequest {
  docName: string
  folderId?: number
  status?: number
  sort?: number
  remark?: string
  extJson?: string
}

export interface DocumentChunk {
  id: number
  chunkIndex: number
  content: string
  tokenCount: number
  startOffset: number
  endOffset: number
  embeddingId: string
}

export interface SearchResult {
  content: string
  score: number
  metadata: Record<string, unknown>
}

export interface KbSearchRequest {
  query: string
  topK?: number
  similarityThreshold?: number
}

export interface SortItem {
  id: number
  type: string
  sort: number
}

export interface SortRequest {
  items: SortItem[]
}

// ══════════════════════════════════════════════════════════
// Audio（音频）
// ══════════════════════════════════════════════════════════

export interface TtsRequest {
  text: string
  modelId?: number
  voice?: string
  speed?: number
}

// ══════════════════════════════════════════════════════════
// API 方法
// ══════════════════════════════════════════════════════════

const PREFIX = env.API_PREFIX_AI

// ── Provider ──

/** 查询供应商分页列表 */
export function listProviders(params?: ProviderListQuery) {
  return get<PageData<Provider>>(`${PREFIX}/providers`, params as Record<string, unknown>)
}

/** 查询全部供应商（不分页） */
export function listAllProviders(status?: number) {
  return get<Provider[]>(`${PREFIX}/providers/all`, status != null ? { status } : undefined)
}

/** 查询供应商详情 */
export function getProvider(providerId: number) {
  return get<Provider>(`${PREFIX}/providers/${providerId}`)
}

/** 创建供应商 */
export function createProvider(data: ProviderCreateRequest) {
  return post<Provider>(`${PREFIX}/providers`, data)
}

/** 更新供应商 */
export function updateProvider(providerId: number, data: ProviderUpdateRequest) {
  return put<Provider>(`${PREFIX}/providers/${providerId}`, data)
}

/** 删除供应商 */
export function deleteProvider(providerId: number) {
  return del<void>(`${PREFIX}/providers/${providerId}`)
}

// ── Model ──

/** 查询模型分页列表 */
export function listModels(params?: ModelListQuery) {
  return get<PageData<Model>>(`${PREFIX}/models`, params as Record<string, unknown>)
}

/** 查询指定供应商下的全部模型（不分页） */
export function listModelsByProviderId(providerId: number) {
  return get<Model[]>(`${PREFIX}/models/by-provider/${providerId}`)
}

/** 查询模型详情 */
export function getModel(modelId: number) {
  return get<Model>(`${PREFIX}/models/${modelId}`)
}

/** 创建模型 */
export function createModel(data: ModelCreateRequest) {
  return post<Model>(`${PREFIX}/models`, data)
}

/** 更新模型 */
export function updateModel(modelId: number, data: ModelUpdateRequest) {
  return put<Model>(`${PREFIX}/models/${modelId}`, data)
}

/** 删除模型 */
export function deleteModel(modelId: number) {
  return del<void>(`${PREFIX}/models/${modelId}`)
}

// ── ModelProvision ──

/** 查询租户模型开通分页列表 */
export function listModelProvisions(params?: ModelProvisionListQuery) {
  return get<PageData<ModelProvision>>(`${PREFIX}/model-provisions`, params as Record<string, unknown>)
}

/** 查询租户模型开通详情 */
export function getModelProvision(provisionId: number) {
  return get<ModelProvision>(`${PREFIX}/model-provisions/${provisionId}`)
}

/** 创建租户模型开通 */
export function createModelProvision(data: ModelProvisionCreateRequest) {
  return post<ModelProvision>(`${PREFIX}/model-provisions`, data)
}

/** 更新租户模型开通 */
export function updateModelProvision(provisionId: number, data: ModelProvisionUpdateRequest) {
  return put<ModelProvision>(`${PREFIX}/model-provisions/${provisionId}`, data)
}

/** 删除租户模型开通 */
export function deleteModelProvision(provisionId: number) {
  return del<void>(`${PREFIX}/model-provisions/${provisionId}`)
}

// ── PromptTemplate ──

/** 查询Prompt模板分页列表 */
export function listPromptTemplates(params?: PromptTemplateListQuery) {
  return get<PageData<PromptTemplate>>(`${PREFIX}/prompt-templates`, params as Record<string, unknown>)
}

/** 查询全部Prompt模板（不分页） */
export function listAllPromptTemplates(status?: number) {
  return get<PromptTemplate[]>(`${PREFIX}/prompt-templates/all`, status != null ? { status } : undefined)
}

/** 查询Prompt模板详情 */
export function getPromptTemplate(promptTemplateId: number) {
  return get<PromptTemplate>(`${PREFIX}/prompt-templates/${promptTemplateId}`)
}

/** 创建Prompt模板 */
export function createPromptTemplate(data: PromptTemplateCreateRequest) {
  return post<PromptTemplate>(`${PREFIX}/prompt-templates`, data)
}

/** 更新Prompt模板 */
export function updatePromptTemplate(promptTemplateId: number, data: PromptTemplateUpdateRequest) {
  return put<PromptTemplate>(`${PREFIX}/prompt-templates/${promptTemplateId}`, data)
}

/** 删除Prompt模板 */
export function deletePromptTemplate(promptTemplateId: number) {
  return del<void>(`${PREFIX}/prompt-templates/${promptTemplateId}`)
}

// ── Tool ──

/** 查询工具分页列表 */
export function listTools(params?: ToolListQuery) {
  return get<PageData<Tool>>(`${PREFIX}/tools`, params as Record<string, unknown>)
}

/** 查询全部工具（不分页） */
export function listAllTools(status?: number) {
  return get<Tool[]>(`${PREFIX}/tools/all`, status != null ? { status } : undefined)
}

/** 查询工具详情 */
export function getTool(toolId: number) {
  return get<Tool>(`${PREFIX}/tools/${toolId}`)
}

/** 创建工具 */
export function createTool(data: ToolCreateRequest) {
  return post<Tool>(`${PREFIX}/tools`, data)
}

/** 更新工具 */
export function updateTool(toolId: number, data: ToolUpdateRequest) {
  return put<Tool>(`${PREFIX}/tools/${toolId}`, data)
}

/** 删除工具 */
export function deleteTool(toolId: number) {
  return del<void>(`${PREFIX}/tools/${toolId}`)
}

// ── McpServer ──

/** 查询MCP服务器分页列表 */
export function listMcpServers(params?: McpServerListQuery) {
  return get<PageData<McpServer>>(`${PREFIX}/mcp-servers`, params as Record<string, unknown>)
}

/** 查询全部MCP服务器（不分页） */
export function listAllMcpServers(params?: { transportType?: string; status?: number }) {
  return get<McpServer[]>(`${PREFIX}/mcp-servers/all`, params as Record<string, unknown>)
}

/** 查询MCP服务器详情 */
export function getMcpServer(mcpServerId: number) {
  return get<McpServer>(`${PREFIX}/mcp-servers/${mcpServerId}`)
}

/** 创建MCP服务器 */
export function createMcpServer(data: McpServerCreateRequest) {
  return post<McpServer>(`${PREFIX}/mcp-servers`, data)
}

/** 更新MCP服务器 */
export function updateMcpServer(mcpServerId: number, data: McpServerUpdateRequest) {
  return put<McpServer>(`${PREFIX}/mcp-servers/${mcpServerId}`, data)
}

/** 删除MCP服务器 */
export function deleteMcpServer(mcpServerId: number) {
  return del<void>(`${PREFIX}/mcp-servers/${mcpServerId}`)
}

// ── Skill ──

/** 查询技能分页列表 */
export function listSkills(params?: SkillListQuery) {
  return get<PageData<Skill>>(`${PREFIX}/skills`, params as Record<string, unknown>)
}

/** 查询全部技能（不分页） */
export function listAllSkills(status?: number) {
  return get<Skill[]>(`${PREFIX}/skills/all`, status != null ? { status } : undefined)
}

/** 查询技能详情 */
export function getSkill(skillId: number) {
  return get<Skill>(`${PREFIX}/skills/${skillId}`)
}

/** 创建技能 */
export function createSkill(data: SkillCreateRequest) {
  return post<Skill>(`${PREFIX}/skills`, data)
}

/** 更新技能 */
export function updateSkill(skillId: number, data: SkillUpdateRequest) {
  return put<Skill>(`${PREFIX}/skills/${skillId}`, data)
}

/** 删除技能 */
export function deleteSkill(skillId: number) {
  return del<void>(`${PREFIX}/skills/${skillId}`)
}

// ── Conversation ──

/** 流式对话（SSE），返回 EventSource URL，由调用方处理 SSE 流 */
export function getChatStreamUrl() {
  return `${env.API_BASE_URL}${PREFIX}/conversations/chat`
}

/** 查询对话分页列表 */
export function listConversations(params?: ConversationListQuery) {
  return get<PageData<Conversation>>(`${PREFIX}/conversations`, params as Record<string, unknown>)
}

/** 查询对话详情（含消息历史） */
export function getConversation(conversationId: string) {
  return get<ConversationDetail>(`${PREFIX}/conversations/${conversationId}`)
}

/** 删除对话 */
export function deleteConversation(conversationId: string) {
  return del<void>(`${PREFIX}/conversations/${conversationId}`)
}

/** 更新对话标题 */
export function updateConversationTitle(conversationId: string, data: ConversationTitleUpdateRequest) {
  return put<void>(`${PREFIX}/conversations/${conversationId}/title`, data)
}

/** 切换对话置顶状态 */
export function toggleConversationPin(conversationId: string) {
  return put<void>(`${PREFIX}/conversations/${conversationId}/pin`)
}

/** 切换对话归档状态 */
export function toggleConversationArchive(conversationId: string) {
  return put<void>(`${PREFIX}/conversations/${conversationId}/archive`)
}

/** 归档所有进行中的对话 */
export function archiveAllConversations() {
  return put<void>(`${PREFIX}/conversations/archive-all`)
}

/** 删除所有对话 */
export function deleteAllConversations() {
  return del<void>(`${PREFIX}/conversations/all`)
}

// ── KnowledgeBase ──

/** 查询知识库分页列表 */
export function listKnowledgeBases(params?: KnowledgeBaseListQuery) {
  return get<PageData<KnowledgeBase>>(`${PREFIX}/knowledge-bases`, params as Record<string, unknown>)
}

/** 查询全部知识库（不分页） */
export function listAllKnowledgeBases(status?: number) {
  return get<KnowledgeBase[]>(`${PREFIX}/knowledge-bases/all`, status != null ? { status } : undefined)
}

/** 查询知识库详情 */
export function getKnowledgeBase(kbId: number) {
  return get<KnowledgeBase>(`${PREFIX}/knowledge-bases/${kbId}`)
}

/** 创建知识库 */
export function createKnowledgeBase(data: KnowledgeBaseCreateRequest) {
  return post<KnowledgeBase>(`${PREFIX}/knowledge-bases`, data)
}

/** 更新知识库 */
export function updateKnowledgeBase(kbId: number, data: KnowledgeBaseUpdateRequest) {
  return put<KnowledgeBase>(`${PREFIX}/knowledge-bases/${kbId}`, data)
}

/** 删除知识库 */
export function deleteKnowledgeBase(kbId: number) {
  return del<void>(`${PREFIX}/knowledge-bases/${kbId}`)
}

// ── Folder ──

/** 查询目录列表（全量） */
export function listFolders(kbId: number) {
  return get<Folder[]>(`${PREFIX}/knowledge-bases/${kbId}/folders`)
}

/** 创建目录 */
export function createFolder(kbId: number, data: FolderCreateRequest) {
  return post<Folder>(`${PREFIX}/knowledge-bases/${kbId}/folders`, data)
}

/** 更新目录 */
export function updateFolder(kbId: number, folderId: number, data: FolderUpdateRequest) {
  return put<Folder>(`${PREFIX}/knowledge-bases/${kbId}/folders/${folderId}`, data)
}

/** 删除目录 */
export function deleteFolder(kbId: number, folderId: number) {
  return del<void>(`${PREFIX}/knowledge-bases/${kbId}/folders/${folderId}`)
}

// ── Document ──

/** 查询文档分页列表 */
export function listDocuments(kbId: number, params?: DocumentListQuery) {
  return get<PageData<Document>>(`${PREFIX}/knowledge-bases/${kbId}/documents`, params as Record<string, unknown>)
}

/** 查询文档详情 */
export function getDocument(kbId: number, docId: number) {
  return get<Document>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}`)
}

/** 获取文档内容 */
export function getDocumentContent(kbId: number, docId: number) {
  return get<string>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}/content`)
}

/** 创建文档 */
export function createDocument(kbId: number, data: DocumentCreateRequest) {
  return post<Document>(`${PREFIX}/knowledge-bases/${kbId}/documents`, data)
}

/** 更新文档 */
export function updateDocument(kbId: number, docId: number, data: DocumentUpdateRequest) {
  return put<Document>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}`, data)
}

/** 更新文档内容（纯文本） */
export function updateDocumentContent(kbId: number, docId: number, content: string) {
  return put<Document>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}/content`, { content })
}

/** 删除文档 */
export function deleteDocument(kbId: number, docId: number) {
  return del<void>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}`)
}

// ── Sort ──

/** 拖拽排序（目录+文档混合） */
export function sortItems(kbId: number, data: SortRequest) {
  return post<void>(`${PREFIX}/knowledge-bases/${kbId}/sort`, data)
}

// ── Vectorization ──

/** 触发单文档向量化 */
export function vectorizeDocument(kbId: number, docId: number) {
  return post<void>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}/vectorize`)
}

/** 批量向量化知识库全部文档 */
export function vectorizeKnowledgeBase(kbId: number) {
  return post<void>(`${PREFIX}/knowledge-bases/${kbId}/vectorize`)
}

/** 移除文档向量 */
export function devectorizeDocument(kbId: number, docId: number) {
  return del<void>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}/vectors`)
}

/** 查看文档切片列表 */
export function listDocumentChunks(kbId: number, docId: number) {
  return get<DocumentChunk[]>(`${PREFIX}/knowledge-bases/${kbId}/documents/${docId}/chunks`)
}

/** 测试 RAG 检索 */
export function searchKnowledgeBase(kbId: number, data: KbSearchRequest) {
  return post<SearchResult[]>(`${PREFIX}/knowledge-bases/${kbId}/search`, data)
}

// ── Audio ──

/** 文字转语音 */
export function textToSpeech(data: TtsRequest) {
  return post<string>(`${PREFIX}/audio/tts`, data)
}

// ── File Upload ──

/** 上传文件（返回 CDN URL） */
export function uploadFile(file: File, category = 'chat'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  return service.post(`${PREFIX}/files/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }).then((res: any) => res.data ?? res)
}
