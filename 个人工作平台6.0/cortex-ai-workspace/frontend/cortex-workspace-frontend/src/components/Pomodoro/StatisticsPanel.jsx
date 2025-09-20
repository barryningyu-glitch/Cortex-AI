import { X, TrendingUp, Clock, Target, Zap, Calendar, Award } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const StatisticsPanel = ({ stats, onClose }) => {
  // 模拟一周数据
  const weeklyData = [
    { day: '周一', sessions: 6, focusTime: 150 },
    { day: '周二', sessions: 4, focusTime: 100 },
    { day: '周三', sessions: 8, focusTime: 200 },
    { day: '周四', sessions: 5, focusTime: 125 },
    { day: '周五', sessions: 7, focusTime: 175 },
    { day: '周六', sessions: 3, focusTime: 75 },
    { day: '周日', sessions: 5, focusTime: 125 }
  ]

  // 模拟月度数据
  const monthlyStats = {
    totalSessions: 156,
    totalFocusTime: 3900, // 分钟
    averageSessionsPerDay: 5.2,
    bestStreak: 12,
    completionRate: 87
  }

  // 成就数据
  const achievements = [
    { 
      id: 1, 
      name: '专注新手', 
      description: '完成第一个番茄钟', 
      icon: '🍅', 
      unlocked: true,
      date: '2024-01-15'
    },
    { 
      id: 2, 
      name: '连击达人', 
      description: '连续完成5个番茄钟', 
      icon: '🔥', 
      unlocked: true,
      date: '2024-01-18'
    },
    { 
      id: 3, 
      name: '专注大师', 
      description: '单日完成10个番茄钟', 
      icon: '👑', 
      unlocked: true,
      date: '2024-01-22'
    },
    { 
      id: 4, 
      name: '坚持不懈', 
      description: '连续7天使用番茄钟', 
      icon: '💪', 
      unlocked: false,
      progress: 5,
      total: 7
    },
    { 
      id: 5, 
      name: '时间管理专家', 
      description: '累计专注时间达到100小时', 
      icon: '⏰', 
      unlocked: false,
      progress: 65,
      total: 100
    }
  ]

  // 格式化时间
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  // 计算最大值用于图表缩放
  const maxSessions = Math.max(...weeklyData.map(d => d.sessions))

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="eva-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">专注统计</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* 今日概览 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              今日概览
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="eva-panel p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats.completedSessions}
                </div>
                <div className="text-sm text-muted-foreground">完成番茄</div>
              </div>
              <div className="eva-panel p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {formatTime(stats.totalFocusTime)}
                </div>
                <div className="text-sm text-muted-foreground">专注时长</div>
              </div>
              <div className="eva-panel p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">当前连击</div>
              </div>
              <div className="eva-panel p-4 text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {stats.longestStreak}
                </div>
                <div className="text-sm text-muted-foreground">最长连击</div>
              </div>
            </div>
          </div>

          {/* 本周趋势 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              本周趋势
            </h3>
            <div className="eva-panel p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weeklyData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">
                      {day.day}
                    </div>
                    <div className="relative h-24 bg-muted/30 rounded-lg flex flex-col justify-end p-1">
                      <div 
                        className="bg-primary rounded transition-all duration-500"
                        style={{ 
                          height: `${(day.sessions / maxSessions) * 100}%`,
                          minHeight: day.sessions > 0 ? '8px' : '0'
                        }}
                      />
                    </div>
                    <div className="text-xs font-medium mt-2">
                      {day.sessions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(day.focusTime)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                本周总计：{weeklyData.reduce((sum, day) => sum + day.sessions, 0)} 个番茄钟，
                {formatTime(weeklyData.reduce((sum, day) => sum + day.focusTime, 0))} 专注时间
              </div>
            </div>
          </div>

          {/* 月度统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              月度统计
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="eva-panel p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-medium">总完成数</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {monthlyStats.totalSessions}
                </div>
                <div className="text-sm text-muted-foreground">
                  个番茄钟
                </div>
              </div>

              <div className="eva-panel p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="font-medium">总专注时长</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.floor(monthlyStats.totalFocusTime / 60)}
                </div>
                <div className="text-sm text-muted-foreground">
                  小时
                </div>
              </div>

              <div className="eva-panel p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">日均完成</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">
                  {monthlyStats.averageSessionsPerDay}
                </div>
                <div className="text-sm text-muted-foreground">
                  个/天
                </div>
              </div>

              <div className="eva-panel p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">最佳连击</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {monthlyStats.bestStreak}
                </div>
                <div className="text-sm text-muted-foreground">
                  连续完成
                </div>
              </div>

              <div className="eva-panel p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">完成率</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {monthlyStats.completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  计划达成
                </div>
              </div>
            </div>
          </div>

          {/* 成就系统 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              成就徽章
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`
                    eva-panel p-4 transition-all
                    ${achievement.unlocked 
                      ? 'border-primary/50 shadow-lg shadow-primary/10' 
                      : 'opacity-60'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      text-3xl p-2 rounded-lg
                      ${achievement.unlocked ? 'bg-primary/20' : 'bg-muted/50'}
                    `}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        {achievement.unlocked && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      
                      {achievement.unlocked ? (
                        <div className="text-xs text-primary">
                          已解锁 · {achievement.date}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>进度</span>
                            <span>{achievement.progress}/{achievement.total}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(achievement.progress / achievement.total) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 使用建议 */}
          <div className="eva-panel p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              专注建议
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">📈 提升效率</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 保持每日至少4个番茄钟的节奏</li>
                  <li>• 在专注时间关闭所有通知</li>
                  <li>• 休息时间进行轻度活动</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">🎯 优化习惯</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 根据精力状态调整工作时长</li>
                  <li>• 记录每个番茄钟的完成情况</li>
                  <li>• 定期回顾和调整目标</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            导出数据
          </Button>
          <Button onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StatisticsPanel

