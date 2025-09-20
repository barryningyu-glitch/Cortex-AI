import { useState } from 'react'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flag, 
  Calendar,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'

const ListView = ({ tasks, projects, tags, onEditTask, onDeleteTask, onUpdateStatus }) => {
  const [sortBy, setSortBy] = useState('due_date')
  const [sortOrder, setSortOrder] = useState('asc')
  const [expandedTasks, setExpandedTasks] = useState(new Set())

  // 排序任务
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'due_date':
        aValue = new Date(a.due_date || '9999-12-31')
        bValue = new Date(b.due_date || '9999-12-31')
        break
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        aValue = priorityOrder[a.priority] || 0
        bValue = priorityOrder[b.priority] || 0
        break
      case 'status':
        const statusOrder = { todo: 1, in_progress: 2, completed: 3 }
        aValue = statusOrder[a.status] || 0
        bValue = statusOrder[b.status] || 0
        break
      case 'created_at':
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
      default:
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // 获取项目信息
  const getProjectInfo = (projectId) => {
    return projects.find(p => p.id === projectId)
  }

  // 获取优先级信息
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { icon: <Flag className="w-4 h-4 text-red-400" />, text: '高', color: 'text-red-400' }
      case 'medium':
        return { icon: <Flag className="w-4 h-4 text-yellow-400" />, text: '中', color: 'text-yellow-400' }
      case 'low':
        return { icon: <Flag className="w-4 h-4 text-green-400" />, text: '低', color: 'text-green-400' }
      default:
        return { icon: <Flag className="w-4 h-4 text-gray-400" />, text: '-', color: 'text-gray-400' }
    }
  }

  // 获取状态信息
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, 
          text: '已完成', 
          color: 'text-green-400',
          bgColor: 'bg-green-400/10'
        }
      case 'in_progress':
        return { 
          icon: <Clock className="w-4 h-4 text-blue-400" />, 
          text: '进行中', 
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10'
        }
      case 'todo':
        return { 
          icon: <Circle className="w-4 h-4 text-yellow-400" />, 
          text: '待开始', 
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10'
        }
      default:
        return { 
          icon: <Circle className="w-4 h-4 text-gray-400" />, 
          text: '未知', 
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10'
        }
    }
  }

  // 检查是否逾期
  const isOverdue = (dueDate, status) => {
    return status !== 'completed' && new Date(dueDate) < new Date()
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '明天'
    if (diffDays === -1) return '昨天'
    
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }

  // 切换任务展开状态
  const toggleTaskExpanded = (taskId) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  // 处理排序
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 排序控制 */}
      <div className="eva-panel p-4 mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">排序方式：</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="eva-input px-3 py-1 text-sm"
          >
            <option value="due_date-asc">截止日期 ↑</option>
            <option value="due_date-desc">截止日期 ↓</option>
            <option value="priority-desc">优先级 ↓</option>
            <option value="priority-asc">优先级 ↑</option>
            <option value="status-asc">状态 ↑</option>
            <option value="status-desc">状态 ↓</option>
            <option value="title-asc">标题 A-Z</option>
            <option value="title-desc">标题 Z-A</option>
            <option value="created_at-desc">创建时间 ↓</option>
            <option value="created_at-asc">创建时间 ↑</option>
          </select>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 eva-panel overflow-hidden">
        {/* 表头 */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-1">状态</div>
          <div className="col-span-4">任务</div>
          <div className="col-span-2">项目</div>
          <div className="col-span-1">优先级</div>
          <div className="col-span-2">截止日期</div>
          <div className="col-span-1">标签</div>
          <div className="col-span-1">操作</div>
        </div>

        {/* 任务行 */}
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无任务</p>
            </div>
          ) : (
            sortedTasks.map(task => {
              const project = getProjectInfo(task.project_id)
              const priorityInfo = getPriorityInfo(task.priority)
              const statusInfo = getStatusInfo(task.status)
              const overdue = isOverdue(task.due_date, task.status)
              const isExpanded = expandedTasks.has(task.id)
              const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
              const totalSubtasks = task.subtasks?.length || 0

              return (
                <div key={task.id} className="border-b border-border last:border-b-0">
                  {/* 主任务行 */}
                  <div className="grid grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors">
                    {/* 状态 */}
                    <div className="col-span-1 flex items-center">
                      <button
                        onClick={() => {
                          const newStatus = task.status === 'completed' ? 'todo' : 'completed'
                          onUpdateStatus(task.id, newStatus)
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        {statusInfo.icon}
                      </button>
                    </div>

                    {/* 任务信息 */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        {totalSubtasks > 0 && (
                          <button
                            onClick={() => toggleTaskExpanded(task.id)}
                            className="hover:bg-accent rounded p-1"
                          >
                            {isExpanded ? 
                              <ChevronDown className="w-3 h-3" /> : 
                              <ChevronRight className="w-3 h-3" />
                            }
                          </button>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm truncate ${
                            task.status === 'completed' ? 'line-through opacity-60' : ''
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {task.description}
                            </p>
                          )}
                          {totalSubtasks > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {completedSubtasks}/{totalSubtasks} 子任务
                              </span>
                              <div className="w-16 bg-muted rounded-full h-1">
                                <div 
                                  className="bg-primary h-1 rounded-full transition-all"
                                  style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 项目 */}
                    <div className="col-span-2 flex items-center gap-2">
                      {project && (
                        <>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-sm truncate">{project.name}</span>
                        </>
                      )}
                    </div>

                    {/* 优先级 */}
                    <div className="col-span-1 flex items-center gap-1">
                      {priorityInfo.icon}
                      <span className={`text-sm ${priorityInfo.color}`}>
                        {priorityInfo.text}
                      </span>
                    </div>

                    {/* 截止日期 */}
                    <div className="col-span-2 flex items-center gap-1">
                      {overdue && <AlertTriangle className="w-3 h-3 text-destructive" />}
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className={`text-sm ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formatDate(task.due_date)}
                      </span>
                    </div>

                    {/* 标签 */}
                    <div className="col-span-1">
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1">
                          {task.tags.slice(0, 1).map(tag => (
                            <span
                              key={tag.id}
                              className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {task.tags.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.tags.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 操作 */}
                    <div className="col-span-1 flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTask(task)}
                        className="w-8 h-8 p-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 子任务列表 */}
                  {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                    <div className="bg-muted/30 px-4 pb-4">
                      {task.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-3 py-2 pl-8">
                          <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={(checked) => {
                              // 这里可以添加子任务状态更新逻辑
                              console.log('Update subtask:', subtask.id, checked)
                            }}
                          />
                          <span className={`text-sm flex-1 ${
                            subtask.completed ? 'line-through opacity-60' : ''
                          }`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default ListView

