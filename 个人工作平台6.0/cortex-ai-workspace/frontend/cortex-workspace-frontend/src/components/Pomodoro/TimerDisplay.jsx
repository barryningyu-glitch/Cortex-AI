import { useState, useEffect } from 'react'

const TimerDisplay = ({ timeLeft, progress, mode, theme, isRunning }) => {
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    }
  }

  // 脉冲动画效果
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setPulseAnimation(true)
        setTimeout(() => setPulseAnimation(false), 200)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning])

  const { minutes, seconds } = formatTime(timeLeft)
  const circumference = 2 * Math.PI * 120 // 半径120的圆周长
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // 根据模式确定颜色
  const getColorByMode = () => {
    switch (mode) {
      case 'work':
        return {
          primary: '#ef4444', // red-500
          secondary: '#fca5a5', // red-300
          glow: 'rgba(239, 68, 68, 0.3)'
        }
      case 'shortBreak':
        return {
          primary: '#22c55e', // green-500
          secondary: '#86efac', // green-300
          glow: 'rgba(34, 197, 94, 0.3)'
        }
      case 'longBreak':
        return {
          primary: '#3b82f6', // blue-500
          secondary: '#93c5fd', // blue-300
          glow: 'rgba(59, 130, 246, 0.3)'
        }
      default:
        return {
          primary: theme.primary,
          secondary: theme.secondary,
          glow: `${theme.primary}33`
        }
    }
  }

  const colors = getColorByMode()

  return (
    <div className="relative flex items-center justify-center">
      {/* 外圈发光效果 */}
      <div 
        className={`
          absolute inset-0 rounded-full blur-xl transition-all duration-1000
          ${isRunning ? 'opacity-60' : 'opacity-30'}
          ${pulseAnimation ? 'scale-110' : 'scale-100'}
        `}
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          width: '320px',
          height: '320px'
        }}
      />

      {/* 主要计时器容器 */}
      <div className="relative">
        {/* SVG 进度圆环 */}
        <svg
          width="280"
          height="280"
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(0 0 20px ${colors.glow})` }}
        >
          {/* 背景圆环 */}
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          
          {/* 进度圆环 */}
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke={colors.primary}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 10px ${colors.primary})`
            }}
          />
          
          {/* 内圈装饰 */}
          <circle
            cx="140"
            cy="140"
            r="100"
            stroke={colors.secondary}
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            strokeDasharray="5,5"
            className={isRunning ? 'animate-spin' : ''}
            style={{ animationDuration: '20s' }}
          />
        </svg>

        {/* 时间显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`
            text-6xl font-mono font-bold tracking-wider transition-all duration-300
            ${pulseAnimation ? 'scale-105' : 'scale-100'}
          `}>
            <span 
              className="text-white"
              style={{ 
                textShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}` 
              }}
            >
              {minutes}
            </span>
            <span 
              className={`mx-2 ${isRunning ? 'animate-pulse' : ''}`}
              style={{ color: colors.primary }}
            >
              :
            </span>
            <span 
              className="text-white"
              style={{ 
                textShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}` 
              }}
            >
              {seconds}
            </span>
          </div>
          
          {/* 进度百分比 */}
          <div className="mt-4 text-sm text-muted-foreground font-medium">
            {Math.round(progress)}% 完成
          </div>
          
          {/* 状态指示器 */}
          <div className="mt-2 flex items-center gap-2">
            <div 
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${isRunning ? 'animate-pulse' : ''}
              `}
              style={{ backgroundColor: colors.primary }}
            />
            <span className="text-xs text-muted-foreground">
              {isRunning ? '专注中' : '已暂停'}
            </span>
          </div>
        </div>

        {/* 装饰性元素 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 顶部装饰 */}
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-6 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          
          {/* 底部装饰 */}
          <div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1 h-6 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          
          {/* 左侧装饰 */}
          <div 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-1 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          
          {/* 右侧装饰 */}
          <div 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-1 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        </div>

        {/* 外圈刻度 */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) - 90 // 从顶部开始，每30度一个刻度
            const radian = (angle * Math.PI) / 180
            const x = 140 + 130 * Math.cos(radian)
            const y = 140 + 130 * Math.sin(radian)
            
            return (
              <div
                key={i}
                className="absolute w-1 h-3 bg-white/20 rounded-full"
                style={{
                  left: `${x - 2}px`,
                  top: `${y - 6}px`,
                  transform: `rotate(${angle + 90}deg)`
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TimerDisplay

