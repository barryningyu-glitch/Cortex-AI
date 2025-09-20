import { useState, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar,
  Clock,
  Flag
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const CalendarView = ({ tasks, projects, onEditTask, onNewTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // 获取当前月份的日期信息
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 获取当月第一天是星期几（0=周日，1=周一...）
    const firstDayOfWeek = firstDay.getDay()
    
    // 计算需要显示的日期范围
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDayOfWeek)
    
    const endDate = new Date(lastDay)
    const remainingDays = 6 - lastDay.getDay()
    endDate.setDate(endDate.getDate() + remainingDays)
    
    // 生成日期数组
    const dates = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return {
      year,
      month,
      dates,
      firstDay,
      lastDay
    }
  }, [currentDate])

  // 获取指定日期的任务
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => task.due_date === dateStr)
  }

  // 导航到上个月
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 导航到下个月
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 导航到今天
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // 检查是否是今天
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // 检查是否是当前月份
  const isCurrentMonth = (date) => {
    return date.getMonth() === calendarData.month
  }

  // 检查是否是选中的日期
  const isSelectedDate = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  // 获取项目信息
  const getProjectInfo = (projectId) => {
    return projects.find(p => p.id === projectId)
  }

  // 获取优先级颜色
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-green-400'
      default: return 'bg-gray-400'
    }
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="h-full flex flex-col">
      {/* 日历头部 */}
      <div className="eva-panel p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold">
              {calendarData.year}年 {monthNames[calendarData.month]}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                今天
              </Button>
            </div>
          </div>
          
          <Button onClick={onNewTask} className="eva-button" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      {/* 日历网格 */}
      <div className="flex-1 eva-panel p-4">
        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1 h-[calc(100%-2rem)]">
          {calendarData.dates.map((date, index) => {
            const dayTasks = getTasksForDate(date)
            const isCurrentMonthDate = isCurrentMonth(date)
            const isTodayDate = isToday(date)
            const isSelected = isSelectedDate(date)

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`
                  p-2 border border-border rounded-lg cursor-pointer transition-all hover:bg-accent/50
                  ${!isCurrentMonthDate ? 'opacity-40' : ''}
                  ${isTodayDate ? 'bg-primary/20 border-primary' : ''}
                  ${isSelected ? 'bg-accent border-accent-foreground' : ''}
                `}
              >
                {/* 日期数字 */}
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-primary' : ''
                }`}>
                  {date.getDate()}
                </div>

                {/* 任务列表 */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => {
                    const project = getProjectInfo(task.project_id)
                    
                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditTask(task)
                        }}
                        className={`
                          text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                          ${task.status === 'completed' ? 'bg-green-400/20 text-green-400' : 
                            task.status === 'in_progress' ? 'bg-blue-400/20 text-blue-400' : 
                            'bg-yellow-400/20 text-yellow-400'}
                        `}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          <span className="truncate flex-1">{task.title}</span>
                        </div>
                      </div>
                    )
                  })}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayTasks.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 选中日期的任务详情 */}
      {selectedDate && (
        <div className="eva-panel p-4 mt-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {selectedDate.toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {getTasksForDate(selectedDate).map(task => {
              const project = getProjectInfo(task.project_id)
              
              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
                >
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{task.title}</span>
                      {project && (
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                    task.status === 'in_progress' ? 'bg-blue-400/20 text-blue-400' :
                    'bg-yellow-400/20 text-yellow-400'
                  }`}>
                    {task.status === 'completed' ? '已完成' :
                     task.status === 'in_progress' ? '进行中' : '待开始'}
                  </div>
                </div>
              )
            })}
            
            {getTasksForDate(selectedDate).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">这一天没有安排任务</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView

