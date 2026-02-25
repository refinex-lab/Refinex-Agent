import type { LucideIcon } from 'lucide-react'
import {
  // 知识文档
  LibraryBig, BookOpen, FileText, Notebook, ScrollText, BookMarked,
  // 教育研究
  GraduationCap, School, BookOpenCheck, Lightbulb, Brain, Microscope,
  // 科学实验
  FlaskConical, Atom, Dna, TestTubeDiagonal, Orbit, Telescope,
  // 技术开发
  Code, Terminal, Database, Server, Cpu, Globe,
  // 商业金融
  Briefcase, TrendingUp, DollarSign, PieChart, Building2, Landmark,
  // 医疗健康
  Heart, Stethoscope, Pill, Activity, ShieldCheck, Cross,
  // 创意媒体
  Palette, Camera, Music, Film, Pen, ImageIcon,
  // 出行导航
  Map, Compass, Navigation, Plane, Ship, Car,
  // 沟通社交
  MessageCircle, Users, Mail, Phone, Share2, Megaphone,
  // 工具设置
  Wrench, Settings, Cog, Hammer, SlidersHorizontal, Zap,
  // 自然环境
  Leaf, TreePine, Sun, Cloud, Droplets, Mountain,
  // 其他
  Star, Bookmark, Tag, Archive, Box, Layers,
} from 'lucide-react'

export interface IconItem {
  name: string
  icon: LucideIcon
}

export interface IconCategory {
  label: string
  icons: IconItem[]
}

export const KB_ICON_CATEGORIES: IconCategory[] = [
  {
    label: '知识文档',
    icons: [
      { name: 'library-big', icon: LibraryBig },
      { name: 'book-open', icon: BookOpen },
      { name: 'file-text', icon: FileText },
      { name: 'notebook', icon: Notebook },
      { name: 'scroll-text', icon: ScrollText },
      { name: 'book-marked', icon: BookMarked },
    ],
  },
  {
    label: '教育研究',
    icons: [
      { name: 'graduation-cap', icon: GraduationCap },
      { name: 'school', icon: School },
      { name: 'book-open-check', icon: BookOpenCheck },
      { name: 'lightbulb', icon: Lightbulb },
      { name: 'brain', icon: Brain },
      { name: 'microscope', icon: Microscope },
    ],
  },
  {
    label: '科学实验',
    icons: [
      { name: 'flask-conical', icon: FlaskConical },
      { name: 'atom', icon: Atom },
      { name: 'dna', icon: Dna },
      { name: 'test-tube-diagonal', icon: TestTubeDiagonal },
      { name: 'orbit', icon: Orbit },
      { name: 'telescope', icon: Telescope },
    ],
  },
  {
    label: '技术开发',
    icons: [
      { name: 'code', icon: Code },
      { name: 'terminal', icon: Terminal },
      { name: 'database', icon: Database },
      { name: 'server', icon: Server },
      { name: 'cpu', icon: Cpu },
      { name: 'globe', icon: Globe },
    ],
  },
  {
    label: '商业金融',
    icons: [
      { name: 'briefcase', icon: Briefcase },
      { name: 'trending-up', icon: TrendingUp },
      { name: 'dollar-sign', icon: DollarSign },
      { name: 'pie-chart', icon: PieChart },
      { name: 'building-2', icon: Building2 },
      { name: 'landmark', icon: Landmark },
    ],
  },
  {
    label: '医疗健康',
    icons: [
      { name: 'heart', icon: Heart },
      { name: 'stethoscope', icon: Stethoscope },
      { name: 'pill', icon: Pill },
      { name: 'activity', icon: Activity },
      { name: 'shield-check', icon: ShieldCheck },
      { name: 'cross', icon: Cross },
    ],
  },
  {
    label: '创意媒体',
    icons: [
      { name: 'palette', icon: Palette },
      { name: 'camera', icon: Camera },
      { name: 'music', icon: Music },
      { name: 'film', icon: Film },
      { name: 'pen', icon: Pen },
      { name: 'image', icon: ImageIcon },
    ],
  },
  {
    label: '出行导航',
    icons: [
      { name: 'map', icon: Map },
      { name: 'compass', icon: Compass },
      { name: 'navigation', icon: Navigation },
      { name: 'plane', icon: Plane },
      { name: 'ship', icon: Ship },
      { name: 'car', icon: Car },
    ],
  },
  {
    label: '沟通社交',
    icons: [
      { name: 'message-circle', icon: MessageCircle },
      { name: 'users', icon: Users },
      { name: 'mail', icon: Mail },
      { name: 'phone', icon: Phone },
      { name: 'share-2', icon: Share2 },
      { name: 'megaphone', icon: Megaphone },
    ],
  },
  {
    label: '工具设置',
    icons: [
      { name: 'wrench', icon: Wrench },
      { name: 'settings', icon: Settings },
      { name: 'cog', icon: Cog },
      { name: 'hammer', icon: Hammer },
      { name: 'sliders-horizontal', icon: SlidersHorizontal },
      { name: 'zap', icon: Zap },
    ],
  },
  {
    label: '自然环境',
    icons: [
      { name: 'leaf', icon: Leaf },
      { name: 'tree-pine', icon: TreePine },
      { name: 'sun', icon: Sun },
      { name: 'cloud', icon: Cloud },
      { name: 'droplets', icon: Droplets },
      { name: 'mountain', icon: Mountain },
    ],
  },
  {
    label: '其他',
    icons: [
      { name: 'star', icon: Star },
      { name: 'bookmark', icon: Bookmark },
      { name: 'tag', icon: Tag },
      { name: 'archive', icon: Archive },
      { name: 'box', icon: Box },
      { name: 'layers', icon: Layers },
    ],
  },
]

export const DEFAULT_KB_ICON = 'library-big'

const iconMap: Record<string, LucideIcon> = {}
for (const cat of KB_ICON_CATEGORIES) {
  for (const item of cat.icons) {
    iconMap[item.name] = item.icon
  }
}

export function getKbIcon(name?: string | null): LucideIcon {
  if (name && iconMap[name]) {
    return iconMap[name]
  }
  return LibraryBig
}
