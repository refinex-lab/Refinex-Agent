import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Smartphone, Mail, ShieldCheck, RotateCcw, Lock, LockKeyhole, Loader2 } from 'lucide-react'
import { authApi } from '@/services'
import { IdentityType, CodeScene } from '@/services/modules/auth'
import { EmailSentTip } from '@/components/auth/email-sent-tip'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const [method, setMethod] = useState<'phone' | 'email'>('phone')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  async function handleSendCode() {
    if (countdown > 0 || sendingCode || !identifier) return
    setSendingCode(true)
    try {
      if (method === 'phone') {
        await authApi.sendSms({ phone: identifier, scene: CodeScene.RESET })
      } else {
        await authApi.sendEmail({ email: identifier, scene: CodeScene.RESET })
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
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword({
        resetType: method === 'phone' ? IdentityType.PHONE : IdentityType.EMAIL,
        identifier,
        code,
        newPassword,
      })
      navigate('/login', { replace: true })
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
        <h1 className="text-2xl font-bold">重置密码</h1>
        <p className="text-muted-foreground text-sm text-balance">
          通过{method === 'phone' ? '手机号' : '邮箱'}验证身份后重置密码
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
              placeholder="请输入注册时的手机号"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          ) : (
            <Input
              type="email"
              placeholder="请输入注册时的邮箱地址"
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
        <Field>
          <FieldLabel>
            <Lock className="size-4" />新密码
          </FieldLabel>
          <Input
            type="password"
            placeholder="请设置新密码"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel>
            <LockKeyhole className="size-4" />确认新密码
          </FieldLabel>
          <Input
            type="password"
            placeholder="请再次输入新密码"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
          重置密码
        </Button>
        <FieldSeparator>
          {method === 'phone' ? '使用邮箱验证' : '使用手机号验证'}
        </FieldSeparator>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={switchMethod}
        >
          {method === 'phone' ? (
            <><Mail className="size-4" />邮箱验证</>
          ) : (
            <><Smartphone className="size-4" />手机号验证</>
          )}
        </Button>
        <div className="text-center text-sm">
          想起密码了？{' '}
          <a href="/login" className="underline underline-offset-4">
            返回登录
          </a>
        </div>
      </FieldGroup>
    </form>
  )
}
