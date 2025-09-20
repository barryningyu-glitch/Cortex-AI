import React, { useState, useEffect, useRef } from 'react'
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  BarChart3,
  X,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const FloatingPomodoroTimerReal = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25分钟
  const [currentSession, setCurrentSession] = useState('work') // work, short_break, long_break
  const [sessionCount, setSessionCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  
  // 设置状态
  const [settings, setSettings] = useState({
    work_time: 25,
    short_break: 5,
    long_break: 15,
    theme: 'classic',
    sound_enabled: true,
    sound_volume: 50,
    auto_start: false
  })
  
  // 统计数据
  const [stats, setStats] = useState(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // 主题配置
  const themes = {
    classic: { name: '经典红', color: 'bg-red-500', textColor: 'text-red-600' },
    forest: { name: '森林绿', color: 'bg-green-500', textColor: 'text-green-600' },
    ocean: { name: '海洋蓝', color: 'bg-blue-500', textColor: 'text-blue-600' },
    sunset: { name: '日落橙', color: 'bg-orange-500', textColor: 'text-orange-600' },
    lavender: { name: '薰衣草', color: 'bg-purple-500', textColor: 'text-purple-600' },
    midnight: { name: '午夜黑', color: 'bg-gray-800', textColor: 'text-gray-700' }
  }

  // 会话类型配置
  const sessionTypes = {
    work: { name: '工作', icon: Zap, color: 'text-red-500' },
    short_break: { name: '短休息', icon: Coffee, color: 'text-green-500' },
    long_break: { name: '长休息', icon: Coffee, color: 'text-blue-500' }
  }

  // 初始化
  useEffect(() => {
    if (isOpen) {
      loadSettings()
      loadStats()
    }
  }, [isOpen])

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft])

  // 加载用户设置
  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pomodoro/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        // 如果当前是工作时间，更新时间
        if (currentSession === 'work') {
          setTimeLeft(data.work_time * 60)
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  // 保存用户设置
  const saveSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pomodoro/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      })
      
      if (response.ok) {
        setSettings(newSettings)
        // 更新当前时间
        updateTimeForSession(currentSession, newSettings)
      }
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    setIsLoadingStats(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pomodoro/stats?days=7', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('加载统计失败:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // 创建番茄钟会话
  const createSession = async (sessionType, duration, completed = false) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pomodoro/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_type: sessionType,
          duration: Math.round(duration / 60), // 转换为分钟
          completed,
          theme: settings.theme
        })
      })
      
      if (response.ok) {
        const session = await response.json()
        setCurrentSessionId(session.id)
        return session
      }
    } catch (error) {
      console.error('创建会话失败:', error)
    }
    return null
  }

  // 更新会话状态
  const updateSession = async (sessionId, updates) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/pomodoro/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('更新会话失败:', error)
    }
  }

  // 开始计时
  const startTimer = async () => {
    if (!isRunning) {
      setIsRunning(true)
      startTimeRef.current = Date.now()
      
      // 创建新会话
      if (!currentSessionId) {
        const duration = getSessionDuration(currentSession)
        await createSession(currentSession, duration * 60)
      }
    }
  }

  // 暂停计时
  const pauseTimer = () => {
    setIsRunning(false)
  }

  // 停止计时
  const stopTimer = async () => {
    setIsRunning(false)
    
    // 更新会话为未完成
    if (currentSessionId) {
      const actualDuration = Math.round((getSessionDuration(currentSession) * 60 - timeLeft) / 60)
      await updateSession(currentSessionId, {
        completed: false,
        duration: actualDuration
      })
      setCurrentSessionId(null)
    }
    
    // 重置时间
    resetTimer()
  }

  // 重置计时器
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(getSessionDuration(currentSession) * 60)
    setCurrentSessionId(null)
  }

  // 会话完成处理
  const handleSessionComplete = async () => {
    setIsRunning(false)
    
    // 更新会话为已完成
    if (currentSessionId) {
      await updateSession(currentSessionId, {
        completed: true,
        duration: getSessionDuration(currentSession)
      })
      setCurrentSessionId(null)
    }
    
    // 播放提示音
    if (settings.sound_enabled) {
      playNotificationSound()
    }
    
    // 显示完成通知
    showCompletionNotification()
    
    // 自动切换到下一个会话
    if (currentSession === 'work') {
      setSessionCount(prev => prev + 1)
      const nextSession = (sessionCount + 1) % 4 === 0 ? 'long_break' : 'short_break'
      switchSession(nextSession)
    } else {
      switchSession('work')
    }
    
    // 自动开始下一个会话
    if (settings.auto_start) {
      setTimeout(() => {
        startTimer()
      }, 2000)
    }
    
    // 刷新统计数据
    loadStats()
  }

  // 切换会话类型
  const switchSession = (sessionType) => {
    setCurrentSession(sessionType)
    setTimeLeft(getSessionDuration(sessionType) * 60)
    setIsRunning(false)
    setCurrentSessionId(null)
  }

  // 获取会话时长
  const getSessionDuration = (sessionType) => {
    switch (sessionType) {
      case 'work':
        return settings.work_time
      case 'short_break':
        return settings.short_break
      case 'long_break':
        return settings.long_break
      default:
        return 25
    }
  }

  // 更新会话时间
  const updateTimeForSession = (sessionType, newSettings) => {
    if (!isRunning) {
      setTimeLeft(getSessionDuration(sessionType) * 60)
    }
  }

  // 播放提示音
  const playNotificationSound = () => {
    // 简单的提示音实现
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(settings.sound_volume / 100, audioContext.currentTime)
    
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  // 显示完成通知
  const showCompletionNotification = () => {
    if (Notification.permission === 'granted') {
      const sessionName = sessionTypes[currentSession].name
      new Notification(`${sessionName}完成！`, {
        body: `恭喜完成一个${sessionName}会话`,
        icon: '/favicon.ico'
      })
    }
  }

  // 请求通知权限
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取当前主题
  const currentTheme = themes[settings.theme] || themes.classic

  // 浮动按钮
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => {
            setIsOpen(true)
            requestNotificationPermission()
          }}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${currentTheme.color} text-white`}
          size="lg"
        >
          <Timer className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  // 最小化状态
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className={`rounded-full shadow-lg ${currentTheme.color} text-white px-4 py-2`}
          size="sm"
        >
          <Timer className="w-4 h-4 mr-2" />
          {formatTime(timeLeft)}
        </Button>
      </div>
    )
  }

  // 完整计时器界面
  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 eva-panel shadow-2xl rounded-lg">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${currentTheme.color} rounded-full flex items-center justify-center`}>
            <Timer className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">番茄钟</h3>
            <p className="text-xs text-muted-foreground">
              {sessionTypes[currentSession].name} · {currentTheme.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(true)}
            className="w-8 h-8 p-0"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 p-0"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 p-0"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 计时器显示 */}
      <div className="p-6 text-center">
        <div className={`text-6xl font-mono font-bold mb-4 ${currentTheme.textColor}`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="secondary" className={`${currentTheme.color} text-white`}>
            {sessionTypes[currentSession].name}
          </Badge>
          {sessionCount > 0 && (
            <Badge variant="outline">
              第 {sessionCount + 1} 个番茄钟
            </Badge>
          )}
        </div>

        {/* 进度条 */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${currentTheme.color}`}
            style={{ 
              width: `${((getSessionDuration(currentSession) * 60 - timeLeft) / (getSessionDuration(currentSession) * 60)) * 100}%` 
            }}
          />
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`eva-button ${currentTheme.color} text-white`}
            size="lg"
          >
            {isRunning ? (
              <Pause className="w-5 h-5 mr-2" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {isRunning ? '暂停' : '开始'}
          </Button>
          
          <Button
            onClick={stopTimer}
            variant="outline"
            size="lg"
            disabled={!isRunning && timeLeft === getSessionDuration(currentSession) * 60}
          >
            <Square className="w-5 h-5 mr-2" />
            停止
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            disabled={isRunning}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            重置
          </Button>
        </div>
      </div>

      {/* 会话切换 */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(sessionTypes).map(([key, type]) => (
            <Button
              key={key}
              variant={currentSession === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchSession(key)}
              disabled={isRunning}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <type.icon className="w-4 h-4" />
              <span className="text-xs">{type.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>番茄钟设置</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 时间设置 */}
              <div className="space-y-4">
                <h4 className="font-medium">时间设置</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm">工作时间</label>
                    <Select 
                      value={settings.work_time.toString()} 
                      onValueChange={(value) => saveSettings({...settings, work_time: parseInt(value)})}
                    >
                      <SelectTrigger className="eva-input">
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
                    <label className="text-sm">短休息</label>
                    <Select 
                      value={settings.short_break.toString()} 
                      onValueChange={(value) => saveSettings({...settings, short_break: parseInt(value)})}
                    >
                      <SelectTrigger className="eva-input">
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
                    <label className="text-sm">长休息</label>
                    <Select 
                      value={settings.long_break.toString()} 
                      onValueChange={(value) => saveSettings({...settings, long_break: parseInt(value)})}
                    >
                      <SelectTrigger className="eva-input">
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
              </div>

              {/* 主题设置 */}
              <div>
                <h4 className="font-medium mb-3">主题配色</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => saveSettings({...settings, theme: key})}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        settings.theme === key ? 'border-primary' : 'border-border'
                      }`}
                    >
                      <div className={`w-6 h-6 ${theme.color} rounded-full mx-auto mb-1`}></div>
                      <div className="text-xs">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 声音设置 */}
              <div className="space-y-3">
                <h4 className="font-medium">声音设置</h4>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">启用提示音</label>
                  <Switch
                    checked={settings.sound_enabled}
                    onCheckedChange={(checked) => saveSettings({...settings, sound_enabled: checked})}
                  />
                </div>
                
                {settings.sound_enabled && (
                  <div>
                    <label className="text-sm">音量: {settings.sound_volume}%</label>
                    <Slider
                      value={[settings.sound_volume]}
                      onValueChange={([value]) => saveSettings({...settings, sound_volume: value})}
                      max={100}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* 其他设置 */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">自动开始下一个会话</label>
                  <Switch
                    checked={settings.auto_start}
                    onCheckedChange={(checked) => saveSettings({...settings, auto_start: checked})}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 统计弹窗 */}
      {showStats && (
        <Dialog open={showStats} onOpenChange={setShowStats}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>番茄钟统计</DialogTitle>
            </DialogHeader>
            
            {isLoadingStats ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* 总体统计 */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{stats.today_sessions}</div>
                      <div className="text-sm text-muted-foreground">今日番茄钟</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.today_focus_time}</div>
                      <div className="text-sm text-muted-foreground">今日专注时间(分钟)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{stats.work_sessions}</div>
                      <div className="text-sm text-muted-foreground">7天工作会话</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{stats.completion_rate}%</div>
                      <div className="text-sm text-muted-foreground">完成率</div>
                    </CardContent>
                  </Card>
                </div>

                {/* 每日统计 */}
                <div>
                  <h4 className="font-medium mb-3">最近7天</h4>
                  <div className="space-y-2">
                    {stats.daily_stats.map(day => (
                      <div key={day.date} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{day.sessions} 个番茄钟</span>
                          <span>{day.focus_time} 分钟</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 主题使用统计 */}
                {Object.keys(stats.theme_stats).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">主题使用</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.theme_stats).map(([theme, count]) => (
                        <div key={theme} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 ${themes[theme]?.color || 'bg-gray-500'} rounded`}></div>
                            <span className="text-sm">{themes[theme]?.name || theme}</span>
                          </div>
                          <span className="text-sm">{count} 次</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无统计数据
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default FloatingPomodoroTimerReal

