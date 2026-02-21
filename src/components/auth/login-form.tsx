import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Smartphone, Mail, ShieldCheck, LogIn, Loader2 } from 'lucide-react'
import { authApi } from '@/services'
import { IdentityType, CodeScene } from '@/services/modules/auth'
import { useAuthStore } from '@/stores/auth'
import { EmailSentTip } from '@/components/auth/email-sent-tip'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [method, setMethod] = useState<'phone' | 'email'>('phone')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  async function handleSendCode() {
    if (countdown > 0 || sendingCode || !identifier) return
    setSendingCode(true)
    try {
      if (method === 'phone') {
        await authApi.sendSms({ phone: identifier, scene: CodeScene.LOGIN })
      } else {
        await authApi.sendEmail({ email: identifier, scene: CodeScene.LOGIN })
      }
      setCountdown(60)
      setCodeSent(true)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      // 错误已由请求拦截器统一 toast 提示
    } finally {
      setSendingCode(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login({
        loginType: method === 'phone' ? IdentityType.PHONE : IdentityType.EMAIL,
        identifier,
        code,
        sourceType: 1,
      })
      const from = (location.state as { from?: Location })?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch {
      // 错误已由请求拦截器统一 toast 提示
    } finally {
      setLoading(false)
    }
  }

  function switchMethod() {
    setMethod(method === 'phone' ? 'email' : 'phone')
    setIdentifier('')
    setCode('')
    setCodeSent(false)
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">登录到您的账户</h1>
        <p className="text-muted-foreground text-sm text-balance">
          输入{method === 'phone' ? '手机号' : '邮箱'}和验证码登录
        </p>
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel>
            {method === 'phone' ? (
              <><Smartphone className="size-4" />手机号</>
            ) : (
              <><Mail className="size-4" />邮箱</>
            )}
          </FieldLabel>
          {method === 'phone' ? (
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          ) : (
            <Input
              type="email"
              placeholder="请输入邮箱地址"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          )}
        </Field>
        <Field>
          <FieldLabel>
            <ShieldCheck className="size-4" />验证码
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="请输入验证码"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              disabled={countdown > 0 || sendingCode || !identifier}
              onClick={handleSendCode}
            >
              {sendingCode ? (
                <Loader2 className="size-4 animate-spin" />
              ) : countdown > 0 ? (
                `${countdown}s`
              ) : (
                '获取验证码'
              )}
            </Button>
          </div>
          {method === 'email' && codeSent && (
            <EmailSentTip email={identifier} />
          )}
        </Field>
        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="text-sm underline underline-offset-4"
          >
            忘记密码？
          </a>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          登录
        </Button>
        <FieldSeparator>
          {method === 'phone' ? '使用邮箱登录' : '使用手机号登录'}
        </FieldSeparator>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={switchMethod}
        >
          {method === 'phone' ? (
            <><Mail className="size-4" />邮箱登录</>
          ) : (
            <><Smartphone className="size-4" />手机号登录</>
          )}
        </Button>
        <div className="text-center text-sm">
          还没有账户？{' '}
          <a href="/register" className="underline underline-offset-4">
            立即注册
          </a>
        </div>
      </FieldGroup>
    </form>
  )
}
