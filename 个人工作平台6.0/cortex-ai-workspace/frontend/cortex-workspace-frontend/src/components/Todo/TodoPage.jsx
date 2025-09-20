import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  List,
  LayoutGrid,
  Brain,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const TodoPageReal = ({ currentUser }) => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [aiText, setAiText] = useState('')
  const [aiModel, setAiModel] = useState('openai/gpt-5')
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [stats, setStats] = useState(null)

  // 任务表单状态
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: 'work',
    due_date: '',
    estimated_time: '',
    tags: [],
    subtasks: []
  })

  // 分类和状态配置
  const categories = [
    { id: 'work', name: '工作', icon: '💼', color: 'bg-blue-500' },
    { id: 'study', name: '学习', icon: '📚', color: 'bg-green-500' },
    { id: 'life', name: '生活', icon: '🏠', color: 'bg-purple-500' }
  ]

  const priorities = [
    { id: 'high', name: '高优先级', color: 'bg-red-500' },
    { id: 'medium', name: '中优先级', color: 'bg-yellow-500' },
    { id: 'low', name: '低优先级', color: 'bg-gray-500' }
  ]

  const statuses = [
    { id: 'todo', name: '待办', icon: Circle },
    { id: 'in_progress', name: '进行中', icon: Clock },
    { id: 'completed', name: '已完成', icon: CheckCircle2 }
  ]

  // 初始化数据
  useEffect(() => {
    loadTasks()
    loadStats()
  }, [])

  // 过滤任务
  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, filterStatus, filterCategory, filterPriority])

  // 加载任务列表
  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        console.error('加载任务失败')
      }
    } catch (error) {
      console.error('加载任务失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 加载统计信息
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('加载统计信息失败:', error)
    }
  }

  // 过滤任务
  const filterTasks = () => {
    let filtered = [...tasks]

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }

    // 分类过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(task => task.category === filterCategory)
    }

    // 优先级过滤
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority)
    }

    setFilteredTasks(filtered)
  }

  // 创建任务
  const createTask = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskForm,
          due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
          estimated_time: taskForm.estimated_time ? parseInt(taskForm.estimated_time) : null
        })
      })

      if (response.ok) {
        const newTask = await response.json()
        setTasks([newTask, ...tasks])
        setShowTaskModal(false)
        resetTaskForm()
        loadStats()
      } else {
        alert('创建任务失败')
      }
    } catch (error) {
      console.error('创建任务失败:', error)
      alert('创建任务失败')
    }
  }

  // 更新任务
  const updateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task))
        loadStats()
      } else {
        alert('更新任务失败')
      }
    } catch (error) {
      console.error('更新任务失败:', error)
      alert('更新任务失败')
    }
  }

  // 删除任务
  const deleteTask = async (taskId) => {
    if (!confirm('确定要删除这个任务吗？')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId))
        loadStats()
      } else {
        alert('删除任务失败')
      }
    } catch (error) {
      console.error('删除任务失败:', error)
      alert('删除任务失败')
    }
  }

  // 切换任务状态
  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 
                     task.status === 'todo' ? 'in_progress' : 'completed'
    await updateTask(task.id, { status: newStatus })
  }

  // AI解析任务
  const parseTasksWithAI = async () => {
    if (!aiText.trim()) {
      alert('请输入要解析的文本')
      return
    }

    setIsAIProcessing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks/parse-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: aiText,
          model: aiModel
        })
      })

      if (response.ok) {
        const result = await response.json()
        setTasks([...result.tasks, ...tasks])
        setShowAIModal(false)
        setAiText('')
        loadStats()
        alert(`成功创建了 ${result.total_count} 个任务！`)
      } else {
        alert('AI解析失败')
      }
    } catch (error) {
      console.error('AI解析失败:', error)
      alert('AI解析失败')
    } finally {
      setIsAIProcessing(false)
    }
  }

  // 重置任务表单
  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: 'work',
      due_date: '',
      estimated_time: '',
      tags: [],
      subtasks: []
    })
    setEditingTask(null)
  }

  // 编辑任务
  const editTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      estimated_time: task.estimated_time?.toString() || '',
      tags: task.tags || [],
      subtasks: task.subtasks || []
    })
    setEditingTask(task)
    setShowTaskModal(true)
  }

  // 保存编辑的任务
  const saveEditedTask = async () => {
    if (!editingTask) return

    await updateTask(editingTask.id, {
      ...taskForm,
      due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
      estimated_time: taskForm.estimated_time ? parseInt(taskForm.estimated_time) : null
    })
    
    setShowTaskModal(false)
    resetTaskForm()
  }

  // 获取任务状态图标
  const getStatusIcon = (status) => {
    const statusConfig = statuses.find(s => s.id === status)
    const Icon = statusConfig?.icon || Circle
    return <Icon className="w-4 h-4" />
  }

  // 获取优先级颜色
  const getPriorityColor = (priority) => {
    return priorities.find(p => p.id === priority)?.color || 'bg-gray-500'
  }

  // 获取分类配置
  const getCategoryConfig = (category) => {
    return categories.find(c => c.id === category) || categories[0]
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部工具栏 */}
      <div className="eva-panel m-4 mb-2 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">任务管理</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAIModal(true)}
              className="eva-button"
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI创建任务
            </Button>
            <Button
              onClick={() => setShowTaskModal(true)}
              className="eva-button"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建任务
            </Button>
          </div>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold">{stats.total_tasks}</div>
                <div className="text-sm text-muted-foreground">总任务</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-green-600">{stats.completed_tasks}</div>
                <div className="text-sm text-muted-foreground">已完成</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-600">{stats.in_progress_tasks}</div>
                <div className="text-sm text-muted-foreground">进行中</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold">{stats.completion_rate}%</div>
                <div className="text-sm text-muted-foreground">完成率</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="eva-input pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="eva-input w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="eva-input w-32">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="eva-input w-32">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部优先级</SelectItem>
              {priorities.map(priority => (
                <SelectItem key={priority.id} value={priority.id}>
                  {priority.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 eva-panel m-4 mt-2 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">没有找到任务</p>
            <p className="text-sm mt-2">创建一个新任务或调整过滤条件</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredTasks.map(task => (
              <Card key={task.id} className={`${viewMode === 'list' ? 'p-4' : ''} hover:shadow-md transition-shadow`}>
                <CardContent className={viewMode === 'list' ? 'p-0' : 'p-4'}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`mt-1 ${task.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`}
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={`${getCategoryConfig(task.category).color} text-white`}>
                            {getCategoryConfig(task.category).icon} {getCategoryConfig(task.category).name}
                          </Badge>
                          <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-white`}>
                            {priorities.find(p => p.id === task.priority)?.name}
                          </Badge>
                          {task.ai_generated && (
                            <Badge variant="outline" className="text-primary">
                              <Brain className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>

                        {task.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {task.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {task.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{task.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {(task.due_date || task.estimated_time) && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                            {task.estimated_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimated_time}分钟
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editTask(task)}
                        className="w-8 h-8 p-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 任务创建/编辑弹窗 */}
      {showTaskModal && (
        <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? '编辑任务' : '创建新任务'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">任务标题</label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="输入任务标题"
                  className="eva-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium">任务描述</label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="输入任务描述"
                  className="eva-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">分类</label>
                  <Select value={taskForm.category} onValueChange={(value) => setTaskForm({...taskForm, category: value})}>
                    <SelectTrigger className="eva-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">优先级</label>
                  <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
                    <SelectTrigger className="eva-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.id} value={priority.id}>
                          {priority.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">截止日期</label>
                  <Input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                    className="eva-input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">预估时间（分钟）</label>
                  <Input
                    type="number"
                    value={taskForm.estimated_time}
                    onChange={(e) => setTaskForm({...taskForm, estimated_time: e.target.value})}
                    placeholder="60"
                    className="eva-input"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                  取消
                </Button>
                <Button 
                  onClick={editingTask ? saveEditedTask : createTask}
                  className="eva-button"
                >
                  {editingTask ? '保存' : '创建'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI任务解析弹窗 */}
      {showAIModal && (
        <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI智能创建任务
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">描述你的任务</label>
                <Textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="例如：明天下午2点开会讨论项目进度，会议时长1小时，需要准备PPT和数据报告"
                  className="eva-input h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium">AI模型</label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger className="eva-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                    <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="anthropic/claude-4">Claude-4</SelectItem>
                    <SelectItem value="deepseek/deepseek-chat-v3">DeepSeek V3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowAIModal(false)}>
                  取消
                </Button>
                <Button 
                  onClick={parseTasksWithAI}
                  disabled={isAIProcessing || !aiText.trim()}
                  className="eva-button"
                >
                  {isAIProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      解析中...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      智能解析
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default TodoPageReal

