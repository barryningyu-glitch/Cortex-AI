import { useState } from 'react'
import { 
  Brain, 
  Wand2, 
  X, 
  CheckCircle2,
  Calendar,
  Flag,
  FolderOpen,
  Tag,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'

const AITaskParser = ({ projects, tags, onCreateTasks, onCancel }) => {
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedTasks, setParsedTasks] = useState([])
  const [showResults, setShowResults] = useState(false)

  // 模拟AI解析任务的函数
  const analyzeText = async (text) => {
    setIsAnalyzing(true)
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟AI解析结果
    const mockParsedTasks = [
      {
        title: '完成项目文档编写',
        description: '编写项目的技术文档和用户手册',
        status: 'todo',
        priority: 'high',
        project_id: projects[0]?.id || '',
        due_date: '2024-01-20',
        tags: [{ id: '2', name: '重要' }, { id: '4', name: '工作' }],
        subtasks: [
          { id: 'sub1', title: '编写技术文档', completed: false },
          { id: 'sub2', title: '编写用户手册', completed: false },
          { id: 'sub3', title: '文档审核', completed: false }
        ]
      },
      {
        title: '准备下周的会议材料',
        description: '整理会议议程和相关资料',
        status: 'todo',
        priority: 'medium',
        project_id: projects[0]?.id || '',
        due_date: '2024-01-18',
        tags: [{ id: '4', name: '工作' }],
        subtasks: [
          { id: 'sub4', title: '制作PPT', completed: false },
          { id: 'sub5', title: '准备数据报告', completed: false }
        ]
      }
    ]
    
    setParsedTasks(mockParsedTasks)
    setIsAnalyzing(false)
    setShowResults(true)
  }

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      alert('请输入要解析的文本')
      return
    }
    analyzeText(inputText)
  }

  const handleCreateTasks = () => {
    onCreateTasks(parsedTasks)
  }

  const handleEditTask = (index, field, value) => {
    const updatedTasks = [...parsedTasks]
    updatedTasks[index] = { ...updatedTasks[index], [field]: value }
    setParsedTasks(updatedTasks)
  }

  const handleRemoveTask = (index) => {
    setParsedTasks(parsedTasks.filter((_, i) => i !== index))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getProjectInfo = (projectId) => {
    return projects.find(p => p.id === projectId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="eva-panel w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">AI智能任务解析</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!showResults ? (
          /* 输入阶段 */
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                输入任务描述（支持自然语言）
              </label>
              <Textarea
                placeholder="例如：
明天下午3点开会讨论项目进度，需要准备PPT和数据报告
下周五之前完成用户手册的编写，包括功能介绍和使用指南
紧急：修复登录页面的bug，优先级高
学习React新特性，包括Hooks和Context API"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="eva-input h-40"
              />
              <p className="text-xs text-muted-foreground mt-2">
                AI将自动识别任务标题、描述、优先级、截止日期等信息
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={onCancel} variant="outline">
                取消
              </Button>
              <Button 
                onClick={handleAnalyze} 
                className="eva-button"
                disabled={isAnalyzing || !inputText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    开始解析
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* 结果阶段 */
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">解析结果</h4>
                <p className="text-sm text-muted-foreground">
                  AI已识别出 {parsedTasks.length} 个任务，您可以编辑后创建
                </p>
              </div>
              <Button 
                onClick={() => setShowResults(false)}
                variant="outline"
                size="sm"
              >
                重新解析
              </Button>
            </div>

            {/* 解析的任务列表 */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {parsedTasks.map((task, index) => {
                const project = getProjectInfo(task.project_id)
                
                return (
                  <div key={index} className="eva-panel p-4 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleEditTask(index, 'title', e.target.value)}
                          className="eva-input font-medium text-lg w-full mb-2"
                        />
                        <textarea
                          value={task.description}
                          onChange={(e) => handleEditTask(index, 'description', e.target.value)}
                          className="eva-input w-full h-16 text-sm"
                          placeholder="任务描述..."
                        />
                      </div>
                      <Button
                        onClick={() => handleRemoveTask(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 任务属性 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">优先级</label>
                        <select
                          value={task.priority}
                          onChange={(e) => handleEditTask(index, 'priority', e.target.value)}
                          className="eva-input text-sm w-full"
                        >
                          <option value="low">低优先级</option>
                          <option value="medium">中优先级</option>
                          <option value="high">高优先级</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">状态</label>
                        <select
                          value={task.status}
                          onChange={(e) => handleEditTask(index, 'status', e.target.value)}
                          className="eva-input text-sm w-full"
                        >
                          <option value="todo">待开始</option>
                          <option value="in_progress">进行中</option>
                          <option value="completed">已完成</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">项目</label>
                        <select
                          value={task.project_id}
                          onChange={(e) => handleEditTask(index, 'project_id', e.target.value)}
                          className="eva-input text-sm w-full"
                        >
                          <option value="">选择项目</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">截止日期</label>
                        <input
                          type="date"
                          value={task.due_date}
                          onChange={(e) => handleEditTask(index, 'due_date', e.target.value)}
                          className="eva-input text-sm w-full"
                        />
                      </div>
                    </div>

                    {/* 任务信息展示 */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                        <span className={getPriorityColor(task.priority)}>
                          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
                        </span>
                      </div>

                      {project && (
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{project.name}</span>
                        </div>
                      )}

                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(task.due_date).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {task.tags.map(tag => tag.name).join(', ')}
                          </span>
                        </div>
                      )}

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {task.subtasks.length} 个子任务
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 底部操作 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button onClick={onCancel} variant="outline">
                取消
              </Button>
              <Button 
                onClick={handleCreateTasks} 
                className="eva-button"
                disabled={parsedTasks.length === 0}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                创建 {parsedTasks.length} 个任务
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AITaskParser

