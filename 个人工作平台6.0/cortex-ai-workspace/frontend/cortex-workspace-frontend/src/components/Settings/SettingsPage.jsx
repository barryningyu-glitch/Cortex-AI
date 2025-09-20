import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Palette, 
  Globe, 
  Bell, 
  Timer, 
  Brain,
  Save,
  RotateCcw,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'

const SettingsPage = ({ currentUser, onThemeChange }) => {
  const [settings, setSettings] = useState({
    // 个人信息
    username: '',
    email: '',
    
    // 界面设置
    theme: 'dark',
    language: 'zh-CN',
    
    // AI设置
    default_ai_model: 'openai/gpt-5',
    ai_auto_enhance: true,
    ai_smart_categorize: true,
    
    // 番茄钟设置
    pomodoro_work_time: 25,
    pomodoro_short_break: 5,
    pomodoro_long_break: 15,
    pomodoro_theme: 'classic',
    pomodoro_sound_enabled: true,
    pomodoro_sound_volume: 50,
    pomodoro_auto_start: false,
    
    // 通知设置
    notifications_enabled: true,
    email_notifications: false,
    task_reminders: true,
    pomodoro_notifications: true,
    
    // 隐私设置
    data_sharing: false,
    analytics: true
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // AI模型选项
  const aiModels = [
    { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', color: 'bg-green-500' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', color: 'bg-blue-500' },
    { id: 'anthropic/claude-4', name: 'Claude-4', provider: 'Anthropic', color: 'bg-purple-500' },
    { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek V3', provider: 'DeepSeek', color: 'bg-orange-500' }
  ]

  // 番茄钟主题
  const pomodoroThemes = {
    classic: { name: '经典红', color: 'bg-red-500' },
    forest: { name: '森林绿', color: 'bg-green-500' },
    ocean: { name: '海洋蓝', color: 'bg-blue-500' },
    sunset: { name: '日落橙', color: 'bg-orange-500' },
    lavender: { name: '薰衣草', color: 'bg-purple-500' },
    midnight: { name: '午夜黑', color: 'bg-gray-800' }
  }

  // 语言选项
  const languages = [
    { id: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { id: 'en-US', name: 'English', flag: '🇺🇸' },
    { id: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { id: 'ko-KR', name: '한국어', flag: '🇰🇷' }
  ]

  // 初始化
  useEffect(() => {
    loadSettings()
  }, [])

  // 监听设置变化
  useEffect(() => {
    setHasChanges(true)
  }, [settings])

  // 加载用户设置
  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 加载用户信息
      const userResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setSettings(prev => ({
          ...prev,
          username: userData.username,
          email: userData.email || ''
        }))
      }

      // 加载番茄钟设置
      const pomodoroResponse = await fetch('/api/pomodoro/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (pomodoroResponse.ok) {
        const pomodoroData = await pomodoroResponse.json()
        setSettings(prev => ({
          ...prev,
          pomodoro_work_time: pomodoroData.work_time,
          pomodoro_short_break: pomodoroData.short_break,
          pomodoro_long_break: pomodoroData.long_break,
          pomodoro_theme: pomodoroData.theme,
          pomodoro_sound_enabled: pomodoroData.sound_enabled,
          pomodoro_sound_volume: pomodoroData.sound_volume,
          pomodoro_auto_start: pomodoroData.auto_start
        }))
      }

      // 从localStorage加载其他设置
      const savedTheme = localStorage.getItem('theme') || 'dark'
      const savedLanguage = localStorage.getItem('language') || 'zh-CN'
      const savedAIModel = localStorage.getItem('default_ai_model') || 'openai/gpt-5'
      
      setSettings(prev => ({
        ...prev,
        theme: savedTheme,
        language: savedLanguage,
        default_ai_model: savedAIModel
      }))
      
      setHasChanges(false)
    } catch (error) {
      console.error('加载设置失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 保存设置
  const saveSettings = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const token = localStorage.getItem('token')
      
      // 保存番茄钟设置
      await fetch('/api/pomodoro/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          work_time: settings.pomodoro_work_time,
          short_break: settings.pomodoro_short_break,
          long_break: settings.pomodoro_long_break,
          theme: settings.pomodoro_theme,
          sound_enabled: settings.pomodoro_sound_enabled,
          sound_volume: settings.pomodoro_sound_volume,
          auto_start: settings.pomodoro_auto_start
        })
      })

      // 保存到localStorage
      localStorage.setItem('theme', settings.theme)
      localStorage.setItem('language', settings.language)
      localStorage.setItem('default_ai_model', settings.default_ai_model)
      
      // 应用主题变化
      if (onThemeChange) {
        onThemeChange(settings.theme)
      }
      
      setHasChanges(false)
      setSaveMessage('设置已保存')
      
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('保存设置失败:', error)
      setSaveMessage('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  // 重置设置
  const resetSettings = () => {
    if (confirm('确定要重置所有设置吗？')) {
      loadSettings()
    }
  }

  // 更新设置
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>加载设置中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="eva-panel m-2 lg:m-4 mb-2 p-3 lg:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">系统设置</h2>
              <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">个性化您的工作台体验</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2">
            {saveMessage && (
              <div className="flex items-center gap-1 lg:gap-2 text-green-600">
                <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm hidden sm:inline">{saveMessage}</span>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={resetSettings}
              disabled={isSaving}
              size="sm"
              className="h-8 lg:h-10"
            >
              <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden lg:inline">重置</span>
            </Button>
            
            <Button
              onClick={saveSettings}
              disabled={!hasChanges || isSaving}
              className="eva-button h-8 lg:h-10"
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2 animate-spin" />
              ) : (
                <Save className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              )}
              <span className="hidden lg:inline">保存设置</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="flex-1 eva-panel m-2 lg:m-4 mt-2 overflow-y-auto">
        <Tabs defaultValue="general" className="h-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 lg:gap-0">
            <TabsTrigger value="general" className="text-xs lg:text-sm">
              <User className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline">通用</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs lg:text-sm">
              <Palette className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline">外观</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs lg:text-sm">
              <Brain className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="pomodoro" className="text-xs lg:text-sm">
              <Timer className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline">番茄钟</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs lg:text-sm">
              <Bell className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline">通知</span>
            </TabsTrigger>
          </TabsList>

          {/* 通用设置 */}
          <TabsContent value="general" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">个人信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div>
                  <label className="text-xs lg:text-sm font-medium">用户名</label>
                  <Input
                    value={settings.username}
                    onChange={(e) => updateSetting('username', e.target.value)}
                    className="eva-input mt-1 lg:mt-2"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">用户名暂时无法修改</p>
                </div>
                
                <div>
                  <label className="text-xs lg:text-sm font-medium">邮箱</label>
                  <Input
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    placeholder="输入邮箱地址"
                    className="eva-input mt-1 lg:mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">语言和地区</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div>
                  <label className="text-xs lg:text-sm font-medium">界面语言</label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger className="eva-input mt-1 lg:mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span className="text-xs lg:text-sm">{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">主题设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div>
                  <label className="text-xs lg:text-sm font-medium">主题模式</label>
                  <div className="grid grid-cols-2 gap-2 lg:gap-4 mt-2">
                    <button
                      onClick={() => updateSetting('theme', 'light')}
                      className={`p-3 lg:p-4 rounded-lg border-2 transition-colors ${
                        settings.theme === 'light' ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      <Sun className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-1 lg:mb-2" />
                      <div className="text-xs lg:text-sm font-medium">浅色模式</div>
                    </button>
                    
                    <button
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`p-3 lg:p-4 rounded-lg border-2 transition-colors ${
                        settings.theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      <Moon className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-1 lg:mb-2" />
                      <div className="text-xs lg:text-sm font-medium">深色模式</div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI设置 */}
          <TabsContent value="ai" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">AI模型设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div>
                  <label className="text-xs lg:text-sm font-medium">默认AI模型</label>
                  <Select value={settings.default_ai_model} onValueChange={(value) => updateSetting('default_ai_model', value)}>
                    <SelectTrigger className="eva-input mt-1 lg:mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${model.color}`}></div>
                            <span className="text-xs lg:text-sm">{model.name}</span>
                            <Badge variant="secondary" className="text-xs">{model.provider}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">AI功能设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm lg:text-base font-medium">自动文本增强</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">编辑笔记时自动提供AI增强建议</div>
                  </div>
                  <Switch
                    checked={settings.ai_auto_enhance}
                    onCheckedChange={(checked) => updateSetting('ai_auto_enhance', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm lg:text-base font-medium">智能分类</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">自动为笔记和任务推荐分类</div>
                  </div>
                  <Switch
                    checked={settings.ai_smart_categorize}
                    onCheckedChange={(checked) => updateSetting('ai_smart_categorize', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 番茄钟设置 */}
          <TabsContent value="pomodoro" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">时间设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                  <div>
                    <label className="text-xs lg:text-sm font-medium">工作时间</label>
                    <Select 
                      value={settings.pomodoro_work_time.toString()} 
                      onValueChange={(value) => updateSetting('pomodoro_work_time', parseInt(value))}
                    >
                      <SelectTrigger className="eva-input mt-1 lg:mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[15, 20, 25, 30, 45, 60].map(time => (
                          <SelectItem key={time} value={time.toString()}>
                            {time}分钟
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs lg:text-sm font-medium">短休息</label>
                    <Select 
                      value={settings.pomodoro_short_break.toString()} 
                      onValueChange={(value) => updateSetting('pomodoro_short_break', parseInt(value))}
                    >
                      <SelectTrigger className="eva-input mt-1 lg:mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 5, 10, 15].map(time => (
                          <SelectItem key={time} value={time.toString()}>
                            {time}分钟
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs lg:text-sm font-medium">长休息</label>
                    <Select 
                      value={settings.pomodoro_long_break.toString()} 
                      onValueChange={(value) => updateSetting('pomodoro_long_break', parseInt(value))}
                    >
                      <SelectTrigger className="eva-input mt-1 lg:mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[15, 20, 25, 30].map(time => (
                          <SelectItem key={time} value={time.toString()}>
                            {time}分钟
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">主题配色</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                  {Object.entries(pomodoroThemes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => updateSetting('pomodoro_theme', key)}
                      className={`p-2 lg:p-3 rounded-lg border-2 transition-colors ${
                        settings.pomodoro_theme === key ? 'border-primary' : 'border-border'
                      }`}
                    >
                      <div className={`w-6 h-6 lg:w-8 lg:h-8 ${theme.color} rounded-full mx-auto mb-1 lg:mb-2`}></div>
                      <div className="text-xs lg:text-sm">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">声音和行为</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    {settings.pomodoro_sound_enabled ? (
                      <Volume2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    ) : (
                      <VolumeX className="w-3 h-3 lg:w-4 lg:h-4" />
                    )}
                    <div>
                      <div className="text-sm lg:text-base font-medium">提示音</div>
                      <div className="text-xs lg:text-sm text-muted-foreground">会话完成时播放提示音</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pomodoro_sound_enabled}
                    onCheckedChange={(checked) => updateSetting('pomodoro_sound_enabled', checked)}
                  />
                </div>
                
                {settings.pomodoro_sound_enabled && (
                  <div>
                    <label className="text-xs lg:text-sm font-medium">音量: {settings.pomodoro_sound_volume}%</label>
                    <Slider
                      value={[settings.pomodoro_sound_volume]}
                      onValueChange={([value]) => updateSetting('pomodoro_sound_volume', value)}
                      max={100}
                      step={10}
                      className="mt-1 lg:mt-2"
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm lg:text-base font-medium">自动开始</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">自动开始下一个会话</div>
                  </div>
                  <Switch
                    checked={settings.pomodoro_auto_start}
                    onCheckedChange={(checked) => updateSetting('pomodoro_auto_start', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">通知设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm lg:text-base font-medium">浏览器通知</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">允许显示桌面通知</div>
                  </div>
                  <Switch
                    checked={settings.notifications_enabled}
                    onCheckedChange={(checked) => updateSetting('notifications_enabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm lg:text-base font-medium">任务提醒</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">任务截止日期提醒</div>
                  </div>
                  <Switch
                    checked={settings.task_reminders}
                    onCheckedChange={(checked) => updateSetting('task_reminders', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm lg:text-base font-medium">番茄钟通知</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">番茄钟会话完成通知</div>
                  </div>
                  <Switch
                    checked={settings.pomodoro_notifications}
                    onCheckedChange={(checked) => updateSetting('pomodoro_notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">隐私设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm lg:text-base font-medium">使用统计</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">帮助改进产品体验</div>
                  </div>
                  <Switch
                    checked={settings.analytics}
                    onCheckedChange={(checked) => updateSetting('analytics', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default SettingsPage

