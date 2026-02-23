"use client"

import * as React from "react"
import {
  Bell,
  Bot,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AiSettingsPanel } from "./ai/AiSettingsPanel"

const data = {
  nav: [
    { name: "通知", icon: Bell },
    { name: "导航", icon: Menu },
    { name: "主页", icon: Home },
    { name: "外观", icon: Paintbrush },
    { name: "消息与媒体", icon: MessageCircle },
    { name: "语言与地区", icon: Globe },
    { name: "辅助功能", icon: Keyboard },
    { name: "已读标记", icon: Check },
    { name: "音频与视频", icon: Video },
    { name: "关联账号", icon: Link },
    { name: "隐私与可见性", icon: Lock },
    { name: "AI 配置", icon: Bot },
    { name: "高级设置", icon: Settings },
  ],
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeItem, setActiveItem] = React.useState("通知")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogTitle className="sr-only">设置</DialogTitle>
        <DialogDescription className="sr-only">
          自定义你的设置
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeItem}
                          onClick={() => setActiveItem(item.name)}
                        >
                          <button type="button">
                            <item.icon />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[580px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">设置</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeItem}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {activeItem === "AI 配置" ? (
                <AiSettingsPanel />
              ) : (
                Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video max-w-3xl rounded-xl bg-muted/50"
                  />
                ))
              )}
            </div>
          </main>    </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
