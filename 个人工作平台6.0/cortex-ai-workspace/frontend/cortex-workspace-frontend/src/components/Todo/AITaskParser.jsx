import React, { useState } from 'react'
import { 
  Brain, 
  Wand2, 
  Loader2, 
  X, 
  Plus,
  Calendar,
  Flag,
  Tag,
  User,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'

const AITaskParser = ({ projects, tags, onCreateTasks, onCancel }) => {
  const [inputText, setInputText] = useState('')
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedTasks, setParsedTasks] = useState([])
  const [showPreview, setShowPreview] = useState(false)

  // AI模型选项
  const models = [
    { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', color: 'bg-green-500' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', color: 'bg-blue-500' },
    { id: 'anthropic/claude-4', name: 'Claude-4', provider: 'Anthropic', color: 'bg-purple-500' },
    { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek V3', provider: 'DeepSeek', color: 'bg-orange-500' }
  ]

  // 快捷模板
  const templates = [
    {
      id: 'daily',
      name: '日常计划',
      content: '今天需要完成的任务：\n1. 回复重要邮件\n2. 准备明天的会议材料\n3. 完成项目报告的第一稿\n4. 锻炼30分钟\n5. 阅读技术文档'
    },
    {
      id: 'project',
      name: '项目规划',
      content: '新项目启动计划：\n- 需求分析和用户调研\n- 技术架构设计\n- UI/UX设计稿\n- 前端开发环境搭建\n- 后端API设计\n- 数据库设计\n- 测试计划制定'
    },
    {
      id: 'learning',
      name: '学习计划',
      content: '本周学习目标：\n• 学习React高级特性\n• 完成TypeScript教程\n• 阅读《代码整洁之道》第3-5章\n• 练习算法题10道\n• 观看技术分享视频'
    },
    {
      id: 'meeting',
      name: '会议准备',
      content: '下周重要会议准备：\n- 周一：项目进度汇报会议，准备PPT和数据报告\n- 周三：客户需求讨论，整理需求文档\n- 周五：团队复盘会议，总结本周工作'
    }
  ]

  const currentModel = models.find(model => model.id === selectedModel)

  // 模拟AI解析任务
  const parseTasksWithAI = async (text, model) => {
    setIsProcessing(true)
    
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟AI解析结果
      const mockParsedTasks = [
        {
          title: '回复重要邮件',
          description: '处理收件箱中的紧急邮件，优先回复客户和合作伙伴的询问',
          priority: 'high',
          status: 'todo',
          project_id: projects[0]?.id || null,
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: [{ id: '1', name: '紧急' }, { id: '4', name: '工作' }],
          subtasks: [
            { title: '查看客户邮件', completed: false },
            { title: '回复合作伙伴询问', completed: false }
          ],
          estimated_time: 60,
          ai_generated: true,
          ai_model: model
        },
        {
          title: '准备明天的会议材料',
          description: '整理项目进度数据，制作演示文稿，准备讨论要点',
          priority: 'high',
          status: 'todo',
          project_id: projects[0]?.id || null,
          due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: [{ id: '2', name: '重要' }, { id: '4', name: '工作' }],
          subtasks: [
            { title: '收集项目数据', completed: false },
            { title: '制作PPT', completed: false },
            { title: '准备讨论要点', completed: false }
          ],
          estimated_time: 120,
          ai_generated: true,
          ai_model: model
        },
        {
          title: '完成项目报告的第一稿',
          description: '撰写项目进度报告，包括完成情况、遇到的问题和下一步计划',
          priority: 'medium',
          status: 'todo',
          project_id: projects[0]?.id || null,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: [{ id: '4', name: '工作' }],
          subtasks: [
            { title: '整理项目数据', completed: false },
            { title: '撰写报告内容', completed: false },
            { title: '检查和修改', completed: false }
          ],
          estimated_time: 180,
          ai_generated: true,
          ai_model: model
        },
        {
          title: '锻炼30分钟',
          description: '进行有氧运动或力量训练，保持身体健康',
          priority: 'medium',
          status: 'todo',
          project_id: projects.find(p => p.name === '生活事务')?.id || null,
          due_date: new Date().toISOString().split('T')[0],
          tags: [],
          subtasks: [],
          estimated_time: 30,
          ai_generated: true,
          ai_model: model
        },
        {
          title: '阅读技术文档',
          description: '学习新技术，提升专业技能',
          priority: 'low',
          status: 'todo',
          project_id: projects.find(p => p.name === '学习计划')?.id || null,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: [{ id: '3', name: '学习' }],
          subtasks: [],
          estimated_time: 60,
          ai_generated: true,
          ai_model: model
        }
      ]
      
      setParsedTasks(mockParsedTasks)
      setShowPreview(true)
    } catch (error) {
      console.error('AI解析失败:', error)
      alert('AI解析失败，请稍后重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcess = () => {
    if (!inputText.trim()) {
      alert('请输入要解析的内容')
      return
    }
    parseTasksWithAI(inputText, selectedModel)
  }

  const handleUseTemplate = (template) => {
    setInputText(template.content)
  }

  const handleEditTask = (index, field, value) => {
    const updatedTasks = [...parsedTasks]
    updatedTasks[index] = { ...updatedTasks[index], [field]: value }
    setParsedTasks(updatedTasks)
  }

  const handleRemoveTask = (index) => {
    setParsedTasks(parsedTasks.filter((_, i) => i !== index))
  }

  const handleConfirmTasks = () => {
    onCreateTasks(parsedTasks)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-500 bg-green-50 border-green-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Flag className="w-3 h-3" />
      case 'medium': return <Clock className="w-3 h-3" />
      case 'low': return <Target className="w-3 h-3" />
      default: return <Flag className="w-3 h-3" />
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI智能任务解析器
          </DialogTitle>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-6">
            {/* AI模型选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">选择AI模型</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${model.color}`}></div>
                        <span>{model.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {model.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 快捷模板 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">快捷模板</label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="justify-start"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 输入区域 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">输入任务描述</label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="请输入您的任务描述，可以是自然语言，比如：&#10;&#10;明天需要完成的工作：&#10;1. 开会讨论项目进度&#10;2. 完成代码审查&#10;3. 写周报&#10;&#10;AI会自动解析并创建结构化的任务..."
                className="min-h-[200px] resize-none"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button 
                onClick={handleProcess} 
                disabled={isProcessing || !inputText.trim()}
                className="eva-button"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI解析中...
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
          <div className="space-y-4">
            {/* 解析结果标题 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">AI解析完成</span>
                <Badge variant="outline">
                  {currentModel?.name} 解析了 {parsedTasks.length} 个任务
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                重新解析
              </Button>
            </div>

            {/* 任务预览列表 */}
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {parsedTasks.map((task, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleEditTask(index, 'title', e.target.value)}
                          className="font-medium text-lg bg-transparent border-none outline-none w-full"
                        />
                        <textarea
                          value={task.description}
                          onChange={(e) => handleEditTask(index, 'description', e.target.value)}
                          className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full resize-none mt-1"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTask(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm">
                      {/* 优先级 */}
                      <div className="flex items-center gap-1">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                          <span className="capitalize">{task.priority}</span>
                        </div>
                      </div>

                      {/* 截止日期 */}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <input
                          type="date"
                          value={task.due_date}
                          onChange={(e) => handleEditTask(index, 'due_date', e.target.value)}
                          className="bg-transparent border-none outline-none"
                        />
                      </div>

                      {/* 预估时间 */}
                      {task.estimated_time && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimated_time}分钟</span>
                        </div>
                      )}

                      {/* 标签 */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {task.tags.map(tag => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 子任务 */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-muted-foreground">子任务:</div>
                        {task.subtasks.map((subtask, subIndex) => (
                          <div key={subIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 border rounded-sm"></div>
                            <span>{subtask.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 确认按钮 */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button onClick={handleConfirmTasks} className="eva-button">
                <Plus className="w-4 h-4 mr-2" />
                创建 {parsedTasks.length} 个任务
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AITaskParser

