import { ExternalLink } from 'lucide-react'

/** 常见邮箱后缀 → webmail 地址映射 */
const WEBMAIL_MAP: Record<string, { name: string; url: string }> = {
  'qq.com': { name: 'QQ 邮箱', url: 'https://mail.qq.com' },
  'foxmail.com': { name: 'Foxmail', url: 'https://mail.qq.com' },
  '163.com': { name: '网易邮箱', url: 'https://mail.163.com' },
  '126.com': { name: '126 邮箱', url: 'https://mail.126.com' },
  'yeah.net': { name: 'Yeah 邮箱', url: 'https://mail.yeah.net' },
  'sina.com': { name: '新浪邮箱', url: 'https://mail.sina.com.cn' },
  'sina.cn': { name: '新浪邮箱', url: 'https://mail.sina.com.cn' },
  'sohu.com': { name: '搜狐邮箱', url: 'https://mail.sohu.com' },
  'aliyun.com': { name: '阿里邮箱', url: 'https://mail.aliyun.com' },
  'gmail.com': { name: 'Gmail', url: 'https://mail.google.com' },
  'outlook.com': { name: 'Outlook', url: 'https://outlook.live.com' },
  'hotmail.com': { name: 'Outlook', url: 'https://outlook.live.com' },
  'live.com': { name: 'Outlook', url: 'https://outlook.live.com' },
  'icloud.com': { name: 'iCloud', url: 'https://www.icloud.com/mail' },
  'me.com': { name: 'iCloud', url: 'https://www.icloud.com/mail' },
  'yahoo.com': { name: 'Yahoo', url: 'https://mail.yahoo.com' },
}

/** 根据邮箱地址解析 webmail 信息 */
export function getWebmailInfo(email: string) {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return null
  return WEBMAIL_MAP[domain] ?? null
}

/** 验证码已发送后的邮箱快捷跳转提示 */
export function EmailSentTip({ email }: { email: string }) {
  const info = getWebmailInfo(email)
  if (!info) return null

  return (
    <a
      href={info.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
    >
      前往{info.name}查看验证码
      <ExternalLink className="size-3" />
    </a>
  )
}
