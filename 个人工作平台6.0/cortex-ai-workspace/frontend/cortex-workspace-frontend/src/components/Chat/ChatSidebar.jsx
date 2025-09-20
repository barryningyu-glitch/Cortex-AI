import { useState } from 'react'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  MessageSquare,
  Clock,
  Bot
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'

const ChatSidebar = ({ 
  sessions, 
  currentSession, 
  onSessionChange, 
  onNewSession, 
  onDeleteSession, 
  onRenameSession,
  searchTerm,
  onSearchChange
}) => {
  const [editingSession, setEditingSession] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // 过滤会话
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 开始编辑会话标题
  const startEditing = (session) => {
    setEditingSession(session.id)
    setEditTitle(session.title)
  }

  // 保存编辑
  const saveEdit = () => {
    if (editTitle.trim() && editingSession) {
      onRenameSession(editingSession, editTitle.trim())
    }
    setEditingSession(null)
    setEditTitle('')
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingSession(null)
    setEditTitle('')
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  // 获取模型显示名称
  const getModelDisplayName = (model) => {
    const modelNames = {
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5',
      'claude-3': 'Claude-3'
    }
    return modelNames[model] || model
  }

  return (
    <div className="w-64 lg:w-80 eva-panel border-r border-border flex flex-col h-full">
      {/* 顶部操作区 */}
      <div className="p-2 lg:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2 lg:mb-4">
          <h3 className="font-semibold text-base lg:text-lg flex items-center gap-1 lg:gap-2">
            <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            <span className="hidden lg:inline">AI对话</span>
            <span className="lg:hidden">对话</span>
          </h3>
          <Button onClick={onNewSession} size="sm" className="eva-button">
            <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
          </Button>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
          <Input
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="eva-input pl-8 lg:pl-10 text-sm"
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-2 lg:p-4 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 opacity-50" />
            <p className="text-xs lg:text-sm">
              {searchTerm ? '没有找到匹配的对话' : '还没有对话记录'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={onNewSession} 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs lg:text-sm"
              >
                开始新对话
              </Button>
            )}
          </div>
        ) : (
          <div className="p-1 lg:p-2">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                className={`
                  group relative p-2 lg:p-3 rounded-lg cursor-pointer transition-all mb-1 lg:mb-2
                  ${currentSession?.id === session.id 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'hover:bg-accent/50'
                  }
                `}
                onClick={() => onSessionChange(session)}
              >
                {/* 会话标题 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className="eva-input w-full text-xs lg:text-sm font-medium"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h4 className="font-medium text-xs lg:text-sm truncate mb-1">
                        {session.title}
                      </h4>
                    )}
                    
                    <div className="flex items-center gap-1 lg:gap-2 text-xs text-muted-foreground">
                      <Clock className="w-2 h-2 lg:w-3 lg:h-3" />
                      <span className="text-xs">{formatTime(session.updated_at)}</span>
                      <span className="hidden lg:inline">·</span>
                      <span className="hidden lg:inline">{session.message_count} 条消息</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <div className="px-1 lg:px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded">
                        {getModelDisplayName(session.model)}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-0.5 lg:gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(session)
                        }}
                        className="w-5 h-5 lg:w-6 lg:h-6 p-0"
                      >
                        <Edit3 className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSession(session.id)
                        }}
                        className="w-5 h-5 lg:w-6 lg:h-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="p-2 lg:p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span className="hidden lg:inline">总对话数:</span>
            <span className="lg:hidden">对话:</span>
            <span>{sessions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="hidden lg:inline">当前会话:</span>
            <span className="lg:hidden">消息:</span>
            <span>{currentSession?.message_count || 0} 条</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatSidebar

