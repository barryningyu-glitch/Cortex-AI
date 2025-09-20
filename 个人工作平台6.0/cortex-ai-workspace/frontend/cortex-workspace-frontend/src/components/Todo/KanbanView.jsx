import { useState } from 'react'
import { 
  MoreHorizontal, 
  Calendar, 
  Flag, 
  User, 
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const KanbanView = ({ tasks, projects, tags, onEditTask, onDeleteTask, onUpdateStatus }) => {
  const [draggedTask, setDraggedTask] = useState(null)

  const columns = [
    { id: 'todo', title: '待开始', color: 'border-yellow-400', bgColor: 'bg-yellow-400/10' },
    { id: 'in_progress', title: '进行中', color: 'border-blue-400', bgColor: 'bg-blue-400/10' },
    { id: 'completed', title: '已完成', color: 'border-green-400', bgColor: 'bg-green-400/10' }
  ]

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <Flag className="w-4 h-4 text-red-400" />
      case 'medium':
        return <Flag className="w-4 h-4 text-yellow-400" />
      case 'low':
        return <Flag className="w-4 h-4 text-green-400" />
      default:
        return null
    }
  }

  const getProjectInfo = (projectId) => {
    return projects.find(p => p.id === projectId)
  }

  const isOverdue = (dueDate, status) => {
    return status !== 'completed' && new Date(dueDate) < new Date()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '明天'
    if (diffDays === -1) return '昨天'
    if (diffDays > 0) return `${diffDays}天后`
    if (diffDays < 0) return `${Math.abs(diffDays)}天前`
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      onUpdateStatus(draggedTask.id, newStatus)
    }
    setDraggedTask(null)
  }

  const TaskCard = ({ task }) => {
    const project = getProjectInfo(task.project_id)
    const overdue = isOverdue(task.due_date, task.status)
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0
    const totalSubtasks = task.subtasks?.length || 0

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        className={`eva-panel p-4 mb-3 cursor-move hover:scale-105 transition-transform ${
          draggedTask?.id === task.id ? 'opacity-50' : ''
        }`}
      >
        {/* 任务标题和优先级 */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm line-clamp-2 flex-1 pr-2">
            {task.title}
          </h4>
          <div className="flex items-center gap-1">
            {getPriorityIcon(task.priority)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTask(task)}
              className="w-6 h-6 p-0"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 任务描述 */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* 子任务进度 */}
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {completedSubtasks}/{totalSubtasks} 子任务
            </span>
            <div className="flex-1 bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all"
                style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 项目标识 */}
            {project && (
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.color }}
                title={project.name}
              />
            )}
            
            {/* 标签 */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag.id}
                    className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded"
                  >
                    {tag.name}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 截止日期 */}
          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${
              overdue ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {overdue && <AlertTriangle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id)
          
          return (
            <div key={column.id} className="flex flex-col h-full">
              {/* 列标题 */}
              <div className={`eva-panel p-4 mb-4 border-l-4 ${column.color} ${column.bgColor}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* 任务列表 */}
              <div
                className="flex-1 overflow-y-auto pr-2"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Circle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无任务</p>
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default KanbanView

