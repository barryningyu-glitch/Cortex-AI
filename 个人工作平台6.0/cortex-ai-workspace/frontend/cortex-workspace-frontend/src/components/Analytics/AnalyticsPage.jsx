import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Brain, 
  Timer,
  Calendar,
  Target,
  Zap,
  Award,
  Activity,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'

const AnalyticsPage = ({ currentUser }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7')
  const [analytics, setAnalytics] = useState({
    overview: {
      total_notes: 0,
      total_tasks: 0,
      completed_tasks: 0,
      pomodoro_sessions: 0,
      ai_interactions: 0,
      focus_time: 0
    },
    productivity: {
      completion_rate: 0,
      daily_average: 0,
      streak_days: 0,
      efficiency_score: 0
    },
    ai_usage: {
      total_requests: 0,
      favorite_model: '',
      enhancement_count: 0,
      chat_messages: 0
    },
    time_distribution: {
      work: 0,
      study: 0,
      life: 0
    },
    daily_stats: [],
    weekly_trends: [],
    achievements: []
  })

  // 时间范围选项
  const timeRanges = [
    { value: '7', label: '最近7天' },
    { value: '30', label: '最近30天' },
    { value: '90', label: '最近90天' },
    { value: '365', label: '最近一年' }
  ]

  // 成就配置
  const achievementTypes = {
    task_master: { name: '任务大师', icon: Target, color: 'text-blue-500' },
    focus_champion: { name: '专注冠军', icon: Timer, color: 'text-red-500' },
    ai_explorer: { name: 'AI探索者', icon: Brain, color: 'text-purple-500' },
    streak_keeper: { name: '连击保持者', icon: Zap, color: 'text-yellow-500' },
    productivity_guru: { name: '效率大师', icon: TrendingUp, color: 'text-green-500' }
  }

  // 初始化
  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  // 加载分析数据
  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 并行加载各种统计数据
      const [
        taskStatsResponse,
        pomodoroStatsResponse,
        notesStatsResponse
      ] = await Promise.all([
        fetch(`/api/tasks/stats/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/pomodoro/stats?days=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/notes/stats?days=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false })) // 如果接口不存在则忽略
      ])

      let taskStats = {}
      let pomodoroStats = {}
      let notesStats = {}

      if (taskStatsResponse.ok) {
        taskStats = await taskStatsResponse.json()
      }

      if (pomodoroStatsResponse.ok) {
        pomodoroStats = await pomodoroStatsResponse.json()
      }

      if (notesStatsResponse.ok) {
        notesStats = await notesStatsResponse.json()
      }

      // 合并数据
      const combinedAnalytics = {
        overview: {
          total_notes: notesStats.total_notes || 0,
          total_tasks: taskStats.total_tasks || 0,
          completed_tasks: taskStats.completed_tasks || 0,
          pomodoro_sessions: pomodoroStats.work_sessions || 0,
          ai_interactions: (notesStats.ai_enhancements || 0) + (taskStats.ai_generated_tasks || 0),
          focus_time: pomodoroStats.total_focus_time || 0
        },
        productivity: {
          completion_rate: taskStats.completion_rate || 0,
          daily_average: pomodoroStats.average_daily_sessions || 0,
          streak_days: calculateStreak(pomodoroStats.daily_stats || []),
          efficiency_score: calculateEfficiencyScore(taskStats, pomodoroStats)
        },
        ai_usage: {
          total_requests: (notesStats.ai_enhancements || 0) + (taskStats.ai_generated_tasks || 0),
          favorite_model: 'GPT-5',
          enhancement_count: notesStats.ai_enhancements || 0,
          chat_messages: 0 // 需要从聊天API获取
        },
        time_distribution: {
          work: taskStats.category_stats?.work || 0,
          study: taskStats.category_stats?.study || 0,
          life: taskStats.category_stats?.life || 0
        },
        daily_stats: pomodoroStats.daily_stats || [],
        weekly_trends: generateWeeklyTrends(pomodoroStats.daily_stats || []),
        achievements: generateAchievements(taskStats, pomodoroStats, notesStats)
      }

      setAnalytics(combinedAnalytics)
    } catch (error) {
      console.error('加载分析数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 计算连续天数
  const calculateStreak = (dailyStats) => {
    if (!dailyStats.length) return 0
    
    let streak = 0
    const sortedStats = [...dailyStats].sort((a, b) => new Date(b.date) - new Date(a.date))
    
    for (const day of sortedStats) {
      if (day.sessions > 0) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  // 计算效率分数
  const calculateEfficiencyScore = (taskStats, pomodoroStats) => {
    const completionRate = taskStats.completion_rate || 0
    const pomodoroRate = pomodoroStats.completion_rate || 0
    const aiUsageRate = taskStats.ai_usage_rate || 0
    
    // 综合评分：任务完成率40% + 番茄钟完成率30% + AI使用率30%
    return Math.round(completionRate * 0.4 + pomodoroRate * 0.3 + aiUsageRate * 0.3)
  }

  // 生成周趋势
  const generateWeeklyTrends = (dailyStats) => {
    if (!dailyStats.length) return []
    
    const weeks = []
    const sortedStats = [...dailyStats].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    for (let i = 0; i < sortedStats.length; i += 7) {
      const weekData = sortedStats.slice(i, i + 7)
      const weekSessions = weekData.reduce((sum, day) => sum + day.sessions, 0)
      const weekFocusTime = weekData.reduce((sum, day) => sum + day.focus_time, 0)
      
      weeks.push({
        week: Math.floor(i / 7) + 1,
        sessions: weekSessions,
        focus_time: weekFocusTime,
        average_daily: Math.round(weekSessions / weekData.length * 10) / 10
      })
    }
    
    return weeks
  }

  // 生成成就
  const generateAchievements = (taskStats, pomodoroStats, notesStats) => {
    const achievements = []
    
    // 任务大师
    if (taskStats.completed_tasks >= 50) {
      achievements.push({
        type: 'task_master',
        title: '任务大师',
        description: `完成了 ${taskStats.completed_tasks} 个任务`,
        level: taskStats.completed_tasks >= 200 ? 'gold' : taskStats.completed_tasks >= 100 ? 'silver' : 'bronze',
        unlocked_at: new Date().toISOString()
      })
    }
    
    // 专注冠军
    if (pomodoroStats.work_sessions >= 25) {
      achievements.push({
        type: 'focus_champion',
        title: '专注冠军',
        description: `完成了 ${pomodoroStats.work_sessions} 个番茄钟`,
        level: pomodoroStats.work_sessions >= 100 ? 'gold' : pomodoroStats.work_sessions >= 50 ? 'silver' : 'bronze',
        unlocked_at: new Date().toISOString()
      })
    }
    
    // AI探索者
    const aiUsage = (notesStats.ai_enhancements || 0) + (taskStats.ai_generated_tasks || 0)
    if (aiUsage >= 10) {
      achievements.push({
        type: 'ai_explorer',
        title: 'AI探索者',
        description: `使用AI功能 ${aiUsage} 次`,
        level: aiUsage >= 100 ? 'gold' : aiUsage >= 50 ? 'silver' : 'bronze',
        unlocked_at: new Date().toISOString()
      })
    }
    
    return achievements
  }

  // 导出数据
  const exportData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // 获取番茄钟导出数据
      const response = await fetch(`/api/pomodoro/export?days=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cortex-analytics-${timeRange}days.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('导出数据失败:', error)
    }
  }

  // 格式化时间
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
  }

  // 获取成就等级颜色
  const getAchievementColor = (level) => {
    switch (level) {
      case 'gold': return 'text-yellow-500'
      case 'silver': return 'text-gray-400'
      case 'bronze': return 'text-orange-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="eva-panel m-4 mb-2 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">数据分析</h2>
              <p className="text-sm text-muted-foreground">深入了解您的工作效率和使用习惯</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="eva-input w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={loadAnalytics}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            
            <Button
              variant="outline"
              onClick={exportData}
            >
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </div>
      </div>

      {/* 分析内容 */}
      <div className="flex-1 eva-panel m-4 mt-2 overflow-y-auto">
        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="w-4 h-4 mr-2" />
              总览
            </TabsTrigger>
            <TabsTrigger value="productivity">
              <TrendingUp className="w-4 h-4 mr-2" />
              效率分析
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="w-4 h-4 mr-2" />
              AI使用
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="w-4 h-4 mr-2" />
              成就
            </TabsTrigger>
          </TabsList>

          {/* 总览 */}
          <TabsContent value="overview" className="space-y-6 p-6">
            {/* 核心指标 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.overview.total_notes}</div>
                  <div className="text-sm text-muted-foreground">笔记数量</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.overview.completed_tasks}</div>
                  <div className="text-sm text-muted-foreground">完成任务</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{analytics.overview.pomodoro_sessions}</div>
                  <div className="text-sm text-muted-foreground">番茄钟</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.overview.ai_interactions}</div>
                  <div className="text-sm text-muted-foreground">AI交互</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{formatTime(analytics.overview.focus_time)}</div>
                  <div className="text-sm text-muted-foreground">专注时间</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{analytics.productivity.efficiency_score}</div>
                  <div className="text-sm text-muted-foreground">效率分数</div>
                </CardContent>
              </Card>
            </div>

            {/* 时间分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  任务分类分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>工作</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(analytics.time_distribution.work / (analytics.overview.total_tasks || 1)) * 100} className="w-24" />
                      <span className="text-sm font-medium">{analytics.time_distribution.work}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>学习</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(analytics.time_distribution.study / (analytics.overview.total_tasks || 1)) * 100} className="w-24" />
                      <span className="text-sm font-medium">{analytics.time_distribution.study}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span>生活</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(analytics.time_distribution.life / (analytics.overview.total_tasks || 1)) * 100} className="w-24" />
                      <span className="text-sm font-medium">{analytics.time_distribution.life}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 每日趋势 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  每日专注趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.daily_stats.slice(-7).map(day => (
                    <div key={day.date} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{day.sessions} 个番茄钟</span>
                        <span>{formatTime(day.focus_time)}</span>
                        <Progress value={(day.sessions / 8) * 100} className="w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 效率分析 */}
          <TabsContent value="productivity" className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.productivity.completion_rate}%</div>
                  <div className="text-sm text-muted-foreground">任务完成率</div>
                  <Progress value={analytics.productivity.completion_rate} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{analytics.productivity.daily_average}</div>
                  <div className="text-sm text-muted-foreground">日均番茄钟</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{analytics.productivity.streak_days}</div>
                  <div className="text-sm text-muted-foreground">连续专注天数</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{analytics.productivity.efficiency_score}</div>
                  <div className="text-sm text-muted-foreground">综合效率分数</div>
                  <Progress value={analytics.productivity.efficiency_score} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* 周趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>周趋势分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.weekly_trends.map(week => (
                    <div key={week.week} className="flex items-center justify-between p-3 rounded bg-muted/50">
                      <div className="font-medium">第 {week.week} 周</div>
                      <div className="flex items-center gap-6 text-sm">
                        <span>{week.sessions} 个番茄钟</span>
                        <span>{formatTime(week.focus_time)}</span>
                        <span>日均 {week.average_daily}</span>
                        <Progress value={(week.sessions / 35) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI使用 */}
          <TabsContent value="ai" className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{analytics.ai_usage.total_requests}</div>
                  <div className="text-sm text-muted-foreground">AI请求总数</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{analytics.ai_usage.enhancement_count}</div>
                  <div className="text-sm text-muted-foreground">文本增强次数</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold text-green-600">{analytics.ai_usage.favorite_model}</div>
                  <div className="text-sm text-muted-foreground">常用模型</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{analytics.ai_usage.chat_messages}</div>
                  <div className="text-sm text-muted-foreground">聊天消息数</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI功能使用分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>文本增强</span>
                    <div className="flex items-center gap-2">
                      <Progress value={60} className="w-32" />
                      <span className="text-sm">60%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>任务解析</span>
                    <div className="flex items-center gap-2">
                      <Progress value={25} className="w-32" />
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>智能聊天</span>
                    <div className="flex items-center gap-2">
                      <Progress value={15} className="w-32" />
                      <span className="text-sm">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 成就 */}
          <TabsContent value="achievements" className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.achievements.map((achievement, index) => {
                const config = achievementTypes[achievement.type]
                const Icon = config?.icon || Award
                
                return (
                  <Card key={index} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${getAchievementColor(achievement.level)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <Badge variant="secondary" className={getAchievementColor(achievement.level)}>
                              {achievement.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            获得于 {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {analytics.achievements.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">暂无成就</p>
                  <p className="text-sm mt-2">继续使用系统来解锁更多成就</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AnalyticsPage

