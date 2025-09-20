import { useState, useEffect } from 'react'
import { 
  X, 
  Calendar, 
  Flag, 
  Tag, 
  FolderOpen,
  Plus,
  Trash2,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'

const TaskModal = ({ task, projects, tags, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    project_id: '',
    due_date: '',
    tags: [],
    subtasks: []
  })

  const [newSubtask, setNewSubtask] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        project_id: task.project_id || '',
        due_date: task.due_date || '',
        tags: task.tags || [],
        subtasks: task.subtasks || []
      })
      setSelectedTags(task.tags?.map(t => t.id) || [])
    }
  }, [task])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagToggle = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]
    
    setSelectedTags(newSelectedTags)
    
    const newTags = tags.filter(tag => newSelectedTags.includes(tag.id))
    handleInputChange('tags', newTags)
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskObj = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false
      }
      handleInputChange('subtasks', [...formData.subtasks, newSubtaskObj])
      setNewSubtask('')
    }
  }

  const handleRemoveSubtask = (subtaskId) => {
    handleInputChange('subtasks', formData.subtasks.filter(st => st.id !== subtaskId))
  }

  const handleSubtaskToggle = (subtaskId) => {
    handleInputChange('subtasks', formData.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ))
  }

  const handleSubtaskEdit = (subtaskId, newTitle) => {
    handleInputChange('subtasks', formData.subtasks.map(st =>
      st.id === subtaskId ? { ...st, title: newTitle } : st
    ))
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('请输入任务标题')
      return
    }

    onSave(formData)
  }

  const statusOptions = [
    { value: 'todo', label: '待开始', color: 'text-yellow-400' },
    { value: 'in_progress', label: '进行中', color: 'text-blue-400' },
    { value: 'completed', label: '已完成', color: 'text-green-400' }
  ]

  const priorityOptions = [
    { value: 'low', label: '低优先级', color: 'text-green-400' },
    { value: 'medium', label: '中优先级', color: 'text-yellow-400' },
    { value: 'high', label: '高优先级', color: 'text-red-400' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="eva-panel w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold">
            {task ? '编辑任务' : '新建任务'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">任务标题 *</label>
              <Input
                placeholder="输入任务标题..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="eva-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">任务描述</label>
              <Textarea
                placeholder="输入任务描述..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="eva-input h-24"
              />
            </div>
          </div>

          {/* 状态和优先级 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">状态</label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="eva-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">优先级</label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="eva-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Flag className={`w-4 h-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 项目和截止日期 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">所属项目</label>
              <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)}>
                <SelectTrigger className="eva-input">
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">截止日期</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="eva-input"
              />
            </div>
          </div>

          {/* 标签选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 子任务 */}
          <div>
            <label className="block text-sm font-medium mb-2">子任务</label>
            
            {/* 添加子任务 */}
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="添加子任务..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="eva-input flex-1"
              />
              <Button onClick={handleAddSubtask} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* 子任务列表 */}
            {formData.subtasks.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto eva-panel p-3">
                {formData.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                    />
                    <Input
                      value={subtask.title}
                      onChange={(e) => handleSubtaskEdit(subtask.id, e.target.value)}
                      className={`eva-input flex-1 text-sm ${
                        subtask.completed ? 'line-through opacity-60' : ''
                      }`}
                    />
                    <Button
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button onClick={onCancel} variant="outline">
            取消
          </Button>
          <Button onClick={handleSave} className="eva-button">
            <Save className="w-4 h-4 mr-2" />
            保存任务
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskModal

