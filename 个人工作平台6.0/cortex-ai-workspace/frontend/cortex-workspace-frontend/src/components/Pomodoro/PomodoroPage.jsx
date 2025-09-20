import { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Palette,
  BarChart3,
  Target,
  Coffee,
  Brain,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import TimerDisplay from './TimerDisplay.jsx'
import ThemeSelector from './ThemeSelector.jsx'
import StatisticsPanel from './StatisticsPanel.jsx'
import SettingsModal from './SettingsModal.jsx'

const PomodoroPage = () => {
  // 计时器状态
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25分钟，以秒为单位
  const [currentMode, setCurrentMode] = useState('work') // work, shortBreak, longBreak
  const [currentSession, setCurrentSession] = useState(1)
  const [completedSessions, setCompletedSessions] = useState(0)
  
  // 设置
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartWork: false,
    soundEnabled: true,
    soundVolume: 50,
    notifications: true
  })
  
  // UI状态
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('eva')
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  
  // 统计数据
  const [todayStats, setTodayStats] = useState({
    completedSessions: 3,
    totalFocusTime: 75, // 分钟
    totalBreakTime: 15,
    longestStreak: 5,
    currentStreak: 2
  })
  
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // 模式配置
  const modes = {
    work: {
      name: '专注工作',
      icon: Brain,
      duration: settings.workDuration,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      description: '保持专注，高效工作'
    },
    shortBreak: {
      name: '短休息',
      icon: Coffee,
      duration: settings.shortBreakDuration,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: '短暂休息，恢复精力'
    },
    longBreak: {
      name: '长休息',
      icon: Zap,
      duration: settings.longBreakDuration,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: '充分休息，准备下一轮'
    }
  }

  // 主题配置
  const themes = {
    eva: {
      name: 'EVA机甲',
      primary: '#00ff88',
      secondary: '#0066cc',
      accent: '#ff6600',
      background: 'from-slate-900 to-slate-800'
    },
    forest: {
      name: '森林绿意',
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#65a30d',
      background: 'from-green-900 to-emerald-800'
    },
    ocean: {
      name: '深海蓝调',
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#0ea5e9',
      background: 'from-blue-900 to-cyan-800'
    },
    sunset: {
      name: '日落橙红',
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#dc2626',
      background: 'from-orange-900 to-red-800'
    },
    purple: {
      name: '神秘紫罗兰',
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      background: 'from-purple-900 to-violet-800'
    }
  }

  // 初始化计时器
  useEffect(() => {
    const duration = modes[currentMode].duration * 60
    setTimeLeft(duration)
  }, [currentMode, settings])

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
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

  // 计时器完成处理
  const handleTimerComplete = () => {
    setIsRunning(false)
    playNotificationSound()
    
    if (currentMode === 'work') {
      setCompletedSessions(prev => prev + 1)
      
      // 决定下一个模式
      const nextMode = (completedSessions + 1) % settings.sessionsUntilLongBreak === 0 
        ? 'longBreak' 
        : 'shortBreak'
      
      if (settings.autoStartBreaks) {
        setTimeout(() => {
          setCurrentMode(nextMode)
          setIsRunning(true)
        }, 1000)
      } else {
        setCurrentMode(nextMode)
      }
    } else {
      // 休息结束，回到工作模式
      if (settings.autoStartWork) {
        setTimeout(() => {
          setCurrentMode('work')
          setIsRunning(true)
        }, 1000)
      } else {
        setCurrentMode('work')
      }
    }
    
    // 发送通知
    if (settings.notifications && 'Notification' in window) {
      new Notification(`${modes[currentMode].name}完成！`, {
        body: currentMode === 'work' ? '休息一下吧' : '开始下一轮专注',
        icon: '/favicon.ico'
      })
    }
  }

  // 播放提示音
  const playNotificationSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.volume = settings.soundVolume / 100
      audioRef.current.play().catch(console.error)
    }
  }

  // 开始/暂停
  const handlePlayPause = () => {
    setIsRunning(!isRunning)
  }

  // 停止
  const handleStop = () => {
    setIsRunning(false)
    const duration = modes[currentMode].duration * 60
    setTimeLeft(duration)
  }

  // 重置
  const handleReset = () => {
    setIsRunning(false)
    setCompletedSessions(0)
    setCurrentSession(1)
    setCurrentMode('work')
    const duration = modes.work.duration * 60
    setTimeLeft(duration)
  }

  // 切换模式
  const handleModeChange = (mode) => {
    setIsRunning(false)
    setCurrentMode(mode)
  }

  // 更新设置
  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings)
    setShowSettings(false)
  }

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 计算进度百分比
  const getProgress = () => {
    const totalDuration = modes[currentMode].duration * 60
    return ((totalDuration - timeLeft) / totalDuration) * 100
  }

  const currentModeConfig = modes[currentMode]
  const currentTheme = themes[selectedTheme]

  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-gradient-to-br ${currentTheme.background} relative overflow-hidden`}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/20 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-secondary/20 blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/10 blur-2xl"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">专注番茄钟</h1>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>第 {currentSession} 轮</span>
              <span>·</span>
              <span>已完成 {completedSessions} 个番茄</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThemeSelector(true)}
            >
              <Palette className="w-4 h-4 mr-2" />
              主题
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(true)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              统计
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              设置
            </Button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：模式选择 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">选择模式</h3>
              {Object.entries(modes).map(([key, mode]) => {
                const Icon = mode.icon
                return (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    className={`
                      w-full p-4 rounded-lg border transition-all
                      ${currentMode === key 
                        ? `${mode.bgColor} border-primary/50 shadow-lg` 
                        : 'eva-panel hover:bg-accent/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${currentMode === key ? mode.color : 'text-muted-foreground'}`} />
                      <div className="text-left">
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {mode.duration} 分钟
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}

              {/* 今日统计 */}
              <div className="eva-panel p-4 mt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  今日成果
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>完成番茄:</span>
                    <span className="text-primary font-medium">{todayStats.completedSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>专注时长:</span>
                    <span className="text-primary font-medium">{todayStats.totalFocusTime}分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span>当前连击:</span>
                    <span className="text-primary font-medium">{todayStats.currentStreak}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 中间：计时器显示 */}
            <div className="flex flex-col items-center justify-center">
              <TimerDisplay
                timeLeft={timeLeft}
                progress={getProgress()}
                mode={currentMode}
                theme={currentTheme}
                isRunning={isRunning}
              />

              {/* 控制按钮 */}
              <div className="flex items-center gap-4 mt-8">
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="eva-button w-16 h-16 rounded-full"
                >
                  {isRunning ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                
                <Button
                  onClick={handleStop}
                  variant="outline"
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  <Square className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="w-12 h-12 rounded-full"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              {/* 模式描述 */}
              <div className="text-center mt-6">
                <h2 className={`text-xl font-semibold ${currentModeConfig.color} mb-2`}>
                  {currentModeConfig.name}
                </h2>
                <p className="text-muted-foreground">
                  {currentModeConfig.description}
                </p>
              </div>
            </div>

            {/* 右侧：快捷操作和信息 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">快捷操作</h3>
              
              {/* 音量控制 */}
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">提示音</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  >
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {settings.soundEnabled && (
                  <Slider
                    value={[settings.soundVolume]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, soundVolume: value }))}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                )}
              </div>

              {/* 快速设置 */}
              <div className="eva-panel p-4">
                <h4 className="font-medium mb-3">快速设置</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">自动开始休息</span>
                    <Button
                      variant={settings.autoStartBreaks ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, autoStartBreaks: !prev.autoStartBreaks }))}
                    >
                      {settings.autoStartBreaks ? '开启' : '关闭'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">自动开始工作</span>
                    <Button
                      variant={settings.autoStartWork ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, autoStartWork: !prev.autoStartWork }))}
                    >
                      {settings.autoStartWork ? '开启' : '关闭'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 进度指示器 */}
              <div className="eva-panel p-4">
                <h4 className="font-medium mb-3">本轮进度</h4>
                <div className="flex items-center gap-2">
                  {Array.from({ length: settings.sessionsUntilLongBreak }, (_, i) => (
                    <div
                      key={i}
                      className={`
                        w-3 h-3 rounded-full
                        ${i < completedSessions % settings.sessionsUntilLongBreak
                          ? 'bg-primary' 
                          : 'bg-muted'
                        }
                      `}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {settings.sessionsUntilLongBreak - (completedSessions % settings.sessionsUntilLongBreak)} 个番茄后长休息
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 模态框 */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showThemeSelector && (
        <ThemeSelector
          themes={themes}
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      {showStats && (
        <StatisticsPanel
          stats={todayStats}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* 音频元素 */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
        <source src="/notification.ogg" type="audio/ogg" />
      </audio>
    </div>
  )
}

export default PomodoroPage

