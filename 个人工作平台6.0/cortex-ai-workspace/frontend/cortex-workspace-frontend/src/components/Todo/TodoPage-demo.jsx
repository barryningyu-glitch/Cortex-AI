import { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar, 
  LayoutGrid, 
  List, 
  Search,
  Filter,
  Brain,
  Clock,
  Flag,
  User,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import KanbanView from './KanbanView.jsx'
import CalendarView from './CalendarView.jsx'
import ListView from './ListView.jsx'
import TaskModal from './TaskModal.jsx'
import AITaskParser from './AITaskParser.jsx'

const TodoPage = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [tags, setTags] = useState([])
  const [currentView, setCurrentView] = useState('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAIParser, setShowAIParser] = useState(false)

  // 模拟数据
  useEffect(() => {
    // 模拟项目数据
    setProjects([
      { id: '1', name: 'AI工作台开发', color: '#10b981' },
      { id: '2', name: '学习计划', color: '#3b82f6' },
      { id: '3', name: '生活事务', color: '#f59e0b' }
    ])

    // 模拟标签数据
    setTags([
      { id: '1', name: '紧急', color: '#ef4444' },
      { id: '2', name: '重要', color: '#f97316' },
      { id: '3', name: '学习', color: '#8b5cf6' },
      { id: '4', name: '工作', color: '#06b6d4' }
    ])

    // 模拟任务数据
    setTasks([
      {
        id: '1',
        title: '完成AI笔记模块开发',
        description: '实现笔记的CRUD功能，集成AI智能归档和文本润色',
        status: 'completed',
        priority: 'high',
        project_id: '1',
        due_date: '2024-01-15',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T16:30:00Z',
        tags: [{ id: '2', name: '重要' }, { id: '4', name: '工作' }],
        subtasks: [
          { id: '1-1', title: '设计数据模型', completed: true },
          { id: '1-2', title: '实现编辑器组件', completed: true },
          { id: '1-3', title: '集成AI功能', completed: true }
        ]
      },
      {
        id: '2',
        title: '设计待办事项界面',
        description: '创建看板视图、日历视图和列表视图',
        status: 'in_progress',
        priority: 'high',
        project_id: '1',
        due_date: '2024-01-16',
        created_at: '2024-01-14T09:00:00Z',
        updated_at: '2024-01-15T14:20:00Z',
        tags: [{ id: '2', name: '重要' }, { id: '4', name: '工作' }],
        subtasks: [
          { id: '2-1', title: '看板视图组件', completed: true },
          { id: '2-2', title: '日历视图组件', completed: false },
          { id: '2-3', title: '列表视图组件', completed: false }
        ]
      },
      {
        id: '3',
        title: '学习React高级特性',
        description: '深入学习React Hooks、Context API和性能优化',
        status: 'todo',
        priority: 'medium',
        project_id: '2',
        due_date: '2024-01-20',
        created_at: '2024-01-12T15:30:00Z',
        updated_at: '2024-01-12T15:30:00Z',
        tags: [{ id: '3', name: '学习' }],
        subtasks: [
          { id: '3-1', title: '学习useCallback和useMemo', completed: false },
          { id: '3-2', title: '学习Context API', completed: false },
          { id: '3-3', title: '性能优化实践', completed: false }
        ]
      },
      {
        id: '4',
        title: '整理房间',
        description: '清理桌面，整理书籍和文件',
        status: 'todo',
        priority: 'low',
        project_id: '3',
        due_date: '2024-01-18',
        created_at: '2024-01-13T20:00:00Z',
        updated_at: '2024-01-13T20:00:00Z',
        tags: [],
        subtasks: []
      }
    ])
  }, [])

  const handleNewTask = () => {
    setSelectedTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleSaveTask = (taskData) => {
    if (selectedTask) {
      // 更新现有任务
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...taskData, id: selectedTask.id, updated_at: new Date().toISOString() }
          : task
      ))
    } else {
      // 创建新任务
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setTasks([newTask, ...tasks])
    }
    setShowTaskModal(false)
  }

  const handleDeleteTask = (taskId) => {
    if (confirm('确定要删除这个任务吗？')) {
      setTasks(tasks.filter(task => task.id !== taskId))
    }
  }

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
        : task
    ))
  }

  const handleAITaskCreate = (parsedTasks) => {
    const newTasks = parsedTasks.map(taskData => ({
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    setTasks([...newTasks, ...tasks])
    setShowAIParser(false)
  }

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // 统计数据
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && 
      new Date(t.due_date) < new Date()
    ).length
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* 顶部工具栏 */}
      <div className="eva-panel p-4 m-4 mb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-primary">智能待办事项</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                总计: {stats.total}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                已完成: {stats.completed}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                进行中: {stats.inProgress}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                待开始: {stats.todo}
              </span>
              {stats.overdue > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  逾期: {stats.overdue}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAIParser(true)} variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              AI创建任务
            </Button>
            <Button onClick={handleNewTask} className="eva-button" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              新建任务
            </Button>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="eva-input pl-10"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="eva-input px-3 py-2 rounded-lg"
          >
            <option value="all">所有状态</option>
            <option value="todo">待开始</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="eva-input px-3 py-2 rounded-lg"
          >
            <option value="all">所有优先级</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>
      </div>

      {/* 视图切换和内容 */}
      <div className="flex-1 p-4 pt-0">
        <Tabs value={currentView} onValueChange={setCurrentView} className="h-full">
          <TabsList className="eva-panel mb-4">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              看板视图
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              日历视图
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              列表视图
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="h-[calc(100%-3rem)]">
            <KanbanView
              tasks={filteredTasks}
              projects={projects}
              tags={tags}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateStatus={handleUpdateTaskStatus}
            />
          </TabsContent>

          <TabsContent value="calendar" className="h-[calc(100%-3rem)]">
            <CalendarView
              tasks={filteredTasks}
              projects={projects}
              onEditTask={handleEditTask}
              onNewTask={handleNewTask}
            />
          </TabsContent>

          <TabsContent value="list" className="h-[calc(100%-3rem)]">
            <ListView
              tasks={filteredTasks}
              projects={projects}
              tags={tags}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateStatus={handleUpdateTaskStatus}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 任务编辑弹窗 */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projects={projects}
          tags={tags}
          onSave={handleSaveTask}
          onCancel={() => setShowTaskModal(false)}
        />
      )}

      {/* AI任务解析弹窗 */}
      {showAIParser && (
        <AITaskParser
          projects={projects}
          tags={tags}
          onCreateTasks={handleAITaskCreate}
          onCancel={() => setShowAIParser(false)}
        />
      )}
    </div>
  )
}

export default TodoPage

