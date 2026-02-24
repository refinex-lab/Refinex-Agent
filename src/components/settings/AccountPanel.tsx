import { useEffect, useRef, useState } from 'react'
import { Camera, Eye, EyeOff, KeyRound, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/auth'
import type { UserInfo } from '@/services/modules/user'

export function AccountPanel() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // inline edit states
  const [editingField, setEditingField] = useState<'nickname' | 'displayName' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  // avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // change password dialog
  const [changePwdOpen, setChangePwdOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changePwdLoading, setChangePwdLoading] = useState(false)
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  // reset password dialog
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetPwdLoading, setResetPwdLoading] = useState(false)
  const [showResetNewPwd, setShowResetNewPwd] = useState(false)
  const [showResetConfirmPwd, setShowResetConfirmPwd] = useState(false)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  async function fetchUserInfo() {
    setLoading(true)
    try {
      const { userApi } = await import('@/services')
      const info = await userApi.getCurrentUserInfo()
      setUserInfo(info)
    } catch {
      // 全局拦截器已处理
    } finally {
      setLoading(false)
    }
  }

  function startEdit(field: 'nickname' | 'displayName') {
    if (!userInfo) return
    setEditingField(field)
    setEditValue(field === 'nickname' ? (userInfo.nickname ?? '') : userInfo.displayName)
  }

  async function saveEdit() {
    if (!userInfo || !editingField) return
    const trimmed = editValue.trim()
    if (editingField === 'displayName' && !trimmed) {
      toast.error('显示名称不能为空')
      return
    }
    setSaving(true)
    try {
      const { userApi } = await import('@/services')
      const updated = await userApi.updateProfile({
        displayName: editingField === 'displayName' ? trimmed : userInfo.displayName,
        nickname: editingField === 'nickname' ? trimmed : userInfo.nickname,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        birthday: userInfo.birthday,
      })
      setUserInfo(updated)
      setEditingField(null)
      toast.success('保存成功')
      useAuthStore.getState().fetchUser()
    } catch {
      // 全局拦截器已处理
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('头像文件大小不能超过 5MB')
      return
    }
    setUploadingAvatar(true)
    try {
      const { userApi } = await import('@/services')
      const updated = await userApi.uploadAvatar(file)
      setUserInfo(updated)
      toast.success('头像更新成功')
      useAuthStore.getState().fetchUser()
    } catch {
      // 全局拦截器已处理
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleChangePassword() {
    if (!newPassword || !oldPassword) {
      toast.error('请填写完整')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }
    if (newPassword.length < 6) {
      toast.error('新密码长度不能少于 6 个字符')
      return
    }
    setChangePwdLoading(true)
    try {
      const { userApi } = await import('@/services')
      await userApi.changePassword({ oldPassword, newPassword })
      toast.success('密码修改成功')
      setChangePwdOpen(false)
      resetChangePwdForm()
    } catch {
      // 全局拦截器已处理
    } finally {
      setChangePwdLoading(false)
    }
  }

  function resetChangePwdForm() {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowOldPwd(false)
    setShowNewPwd(false)
    setShowConfirmPwd(false)
  }

  async function handleResetPassword() {
    if (!resetNewPassword) {
      toast.error('请输入新密码')
      return
    }
    if (resetNewPassword !== resetConfirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }
    if (resetNewPassword.length < 6) {
      toast.error('新密码长度不能少于 6 个字符')
      return
    }
    setResetPwdLoading(true)
    try {
      const { userApi } = await import('@/services')
      await userApi.resetPassword({ newPassword: resetNewPassword })
      toast.success('密码重置成功')
      setResetPwdOpen(false)
      resetResetPwdForm()
    } catch {
      // 全局拦截器已处理
    } finally {
      setResetPwdLoading(false)
    }
  }

  function resetResetPwdForm() {
    setResetNewPassword('')
    setResetConfirmPassword('')
    setShowResetNewPwd(false)
    setShowResetConfirmPwd(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm text-muted-foreground">无法获取用户信息</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* 头像区域 */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="size-16">
              <AvatarImage src={userInfo.avatarUrl} alt={userInfo.displayName} />
              <AvatarFallback className="text-lg">
                {userInfo.displayName?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="上传头像"
            >
              <Camera className="size-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="text-base font-medium">{userInfo.displayName}</p>
            <p className="text-sm text-muted-foreground">{userInfo.userCode}</p>
          </div>
        </div>

        <Separator />

        {/* 基本信息（只读） */}
        <div className="space-y-1">
          <InfoRow label="用户名" value={userInfo.username || '-'} />
          <InfoRow label="手机号" value={userInfo.primaryPhone || '-'} />
          <InfoRow label="邮箱" value={userInfo.primaryEmail || '-'} />
        </div>

        <Separator />

        {/* 可编辑信息 */}
        <div className="space-y-1">
          <EditableRow
            label="显示名称"
            value={userInfo.displayName}
            editing={editingField === 'displayName'}
            editValue={editValue}
            saving={saving}
            onEdit={() => startEdit('displayName')}
            onChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
          />
          <EditableRow
            label="昵称"
            value={userInfo.nickname || '-'}
            editing={editingField === 'nickname'}
            editValue={editValue}
            saving={saving}
            onEdit={() => startEdit('nickname')}
            onChange={setEditValue}
            onSave={saveEdit}
            onCancel={() => setEditingField(null)}
          />
        </div>

        <Separator />

        {/* 密码区域 */}
        <div className="space-y-1">
          <div className="flex items-center justify-between rounded-lg px-1 py-3">
            <div className="flex items-center gap-3">
              <KeyRound className="size-4 text-muted-foreground" />
              <span className="text-sm">修改密码</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setChangePwdOpen(true)}>
              修改
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg px-1 py-3">
            <div className="flex items-center gap-3">
              <RotateCcw className="size-4 text-muted-foreground" />
              <span className="text-sm">重置密码</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setResetPwdOpen(true)}>
              重置
            </Button>
          </div>
        </div>
      </div>

      {/* 修改密码对话框 */}
      <Dialog open={changePwdOpen} onOpenChange={(open) => { setChangePwdOpen(open); if (!open) resetChangePwdForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>请输入旧密码和新密码</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>旧密码</Label>
              <PasswordInput value={oldPassword} onChange={setOldPassword} show={showOldPwd} onToggle={() => setShowOldPwd(!showOldPwd)} placeholder="请输入旧密码" />
            </div>
            <div className="space-y-2">
              <Label>新密码</Label>
              <PasswordInput value={newPassword} onChange={setNewPassword} show={showNewPwd} onToggle={() => setShowNewPwd(!showNewPwd)} placeholder="请输入新密码（至少 6 位）" />
            </div>
            <div className="space-y-2">
              <Label>确认新密码</Label>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} show={showConfirmPwd} onToggle={() => setShowConfirmPwd(!showConfirmPwd)} placeholder="请再次输入新密码" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePwdOpen(false)}>取消</Button>
            <Button onClick={handleChangePassword} disabled={changePwdLoading}>
              {changePwdLoading ? '提交中...' : '确认修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码对话框 */}
      <Dialog open={resetPwdOpen} onOpenChange={(open) => { setResetPwdOpen(open); if (!open) resetResetPwdForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>重置后将直接使用新密码，无需验证旧密码</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>新密码</Label>
              <PasswordInput value={resetNewPassword} onChange={setResetNewPassword} show={showResetNewPwd} onToggle={() => setShowResetNewPwd(!showResetNewPwd)} placeholder="请输入新密码（至少 6 位）" />
            </div>
            <div className="space-y-2">
              <Label>确认新密码</Label>
              <PasswordInput value={resetConfirmPassword} onChange={setResetConfirmPassword} show={showResetConfirmPwd} onToggle={() => setShowResetConfirmPwd(!showResetConfirmPwd)} placeholder="请再次输入新密码" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwdOpen(false)}>取消</Button>
            <Button onClick={handleResetPassword} disabled={resetPwdLoading}>
              {resetPwdLoading ? '提交中...' : '确认重置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── 子组件 ──────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-1 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function EditableRow({
  label, value, editing, editValue, saving,
  onEdit, onChange, onSave, onCancel,
}: {
  label: string
  value: string
  editing: boolean
  editValue: string
  saving: boolean
  onEdit: () => void
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  if (editing) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg px-1 py-2">
        <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 w-48"
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel() }}
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>取消</Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between rounded-lg px-1 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm">{value}</span>
        <Button variant="ghost" size="sm" onClick={onEdit}>编辑</Button>
      </div>
    </div>
  )
}

function PasswordInput({
  value, onChange, show, onToggle, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? '隐藏密码' : '显示密码'}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
