import { useState, useEffect } from 'react'
import { User, Bell, Lock, Palette, Save, Moon, Sun } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/contexts/ToastContext'

const NOTIFICATIONS_KEY = 'edushield_notification_prefs'

const defaultNotifications = {
  email: true,
  push: true,
  sms: false,
  riskAlerts: true,
  weeklyReport: true,
}

type NotificationPrefs = typeof defaultNotifications

function loadNotifications(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    if (raw) return { ...defaultNotifications, ...(JSON.parse(raw) as Partial<NotificationPrefs>) }
  } catch {
    // ignore corrupted storage and fall back to defaults
  }
  return defaultNotifications
}

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { addToast } = useToast()
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [notifications, setNotifications] = useState(loadNotifications)
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // The user can arrive from the auth bootstrap, so keep the form in sync with it
  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  // Persist notification preferences so they survive a refresh
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
    } catch {
      // storage may be unavailable (private mode) - preferences stay session-only
    }
  }, [notifications])

  const handleSaveProfile = async () => {
    if (!profile.full_name.trim()) {
      addToast('error', 'Full name is required')
      return
    }
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      addToast('error', 'Please enter a valid email address')
      return
    }

    setIsSaving(true)
    try {
      await updateProfile({
        full_name: profile.full_name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      })
      addToast('success', 'Profile updated successfully')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast('error', typeof detail === 'string' ? detail : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!password.current) {
      addToast('error', 'Current password is required')
      return
    }
    if (password.new.length < 8) {
      addToast('error', 'New password must be at least 8 characters')
      return
    }
    if (password.new !== password.confirm) {
      addToast('error', 'Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword(password.current, password.new)
      addToast('success', 'Password changed successfully')
      setPassword({ current: '', new: '', confirm: '' })
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      addToast('error', typeof detail === 'string' ? detail : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Manage your account and application preferences"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {user?.full_name}
                  </p>
                  <p className="text-slate-500 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-slate-500">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(v) => setNotifications((p) => ({ ...p, push: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">SMS Notifications</p>
                  <p className="text-sm text-slate-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(v) => setNotifications((p) => ({ ...p, sms: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Risk Alerts</p>
                  <p className="text-sm text-slate-500">Get alerted about high-risk students</p>
                </div>
                <Switch
                  checked={notifications.riskAlerts}
                  onCheckedChange={(v) => setNotifications((p) => ({ ...p, riskAlerts: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Weekly Report</p>
                  <p className="text-sm text-slate-500">Receive weekly analytics report</p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(v) => setNotifications((p) => ({ ...p, weeklyReport: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                <Lock className="w-4 h-4 mr-2" />
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-slate-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Switch between light and dark themes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
