import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModelProvisionPanel } from './ModelProvisionPanel'
import { PromptTemplatePanel } from './PromptTemplatePanel'
import { ToolPanel } from './ToolPanel'
import { McpServerPanel } from './McpServerPanel'
import { SkillPanel } from './SkillPanel'

export function AiSettingsPanel() {
  return (
    <Tabs defaultValue="model-provision" className="flex h-full flex-col">
      <TabsList variant="line" className="shrink-0">
        <TabsTrigger value="model-provision">模型开通</TabsTrigger>
        <TabsTrigger value="prompt-template">Prompt 模板</TabsTrigger>
        <TabsTrigger value="tool">工具</TabsTrigger>
        <TabsTrigger value="mcp-server">MCP 服务器</TabsTrigger>
        <TabsTrigger value="skill">技能</TabsTrigger>
      </TabsList>
      <TabsContent value="model-provision" className="flex-1 overflow-hidden">
        <ModelProvisionPanel />
      </TabsContent>
      <TabsContent value="prompt-template" className="flex-1 overflow-hidden">
        <PromptTemplatePanel />
      </TabsContent>
      <TabsContent value="tool" className="flex-1 overflow-hidden">
        <ToolPanel />
      </TabsContent>
      <TabsContent value="mcp-server" className="flex-1 overflow-hidden">
        <McpServerPanel />
      </TabsContent>
      <TabsContent value="skill" className="flex-1 overflow-hidden">
        <SkillPanel />
      </TabsContent>
    </Tabs>
  )
}
