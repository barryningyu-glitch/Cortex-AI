import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Send, 
  Bot, 
  User, 
  MoreHorizontal,
  Trash2,
  Edit3,
  MessageSquare,
  Zap,
  Settings,
  Copy,
  RefreshCw,
  Download,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import ChatSidebar from './ChatSidebar.jsx'
import MessageList from './MessageList.jsx'
import QuickCommands from './QuickCommands.jsx'

const ChatPage = () => {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showQuickCommands, setShowQuickCommands] = useState(false)
  const [aiModel, setAiModel] = useState('gpt-4')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  // 模拟数据
  useEffect(() => {
    // 模拟会话数据
    const mockSessions = [
      {
        id: '1',
        title: 'AI工作台开发讨论',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T16:30:00Z',
        message_count: 12,
        model: 'gpt-4'
      },
      {
        id: '2',
        title: 'React最佳实践',
        created_at: '2024-01-14T14:20:00Z',
        updated_at: '2024-01-15T09:15:00Z',
        message_count: 8,
        model: 'gpt-3.5-turbo'
      },
      {
        id: '3',
        title: '项目架构设计',
        created_at: '2024-01-13T11:30:00Z',
        updated_at: '2024-01-14T17:45:00Z',
        message_count: 15,
        model: 'gpt-4'
      }
    ]
    setSessions(mockSessions)
    setCurrentSession(mockSessions[0])

    // 模拟消息数据
    const mockMessages = [
      {
        id: '1',
        role: 'user',
        content: '你好，我想了解一下如何构建一个AI智能工作台',
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        role: 'assistant',
        content: '你好！构建AI智能工作台是一个很有趣的项目。我建议从以下几个方面开始：\n\n1. **核心功能模块**\n   - 智能笔记管理\n   - 任务和项目管理\n   - AI对话助手\n   - 专注时间管理\n\n2. **技术架构**\n   - 前端：React + TypeScript\n   - 后端：FastAPI + Python\n   - 数据库：SQLite/PostgreSQL\n   - AI服务：OpenAI API\n\n3. **设计原则**\n   - 用户体验优先\n   - 模块化设计\n   - 响应式布局\n   - 数据安全\n\n你希望重点了解哪个方面呢？',
        timestamp: '2024-01-15T10:01:30Z'
      },
      {
        id: '3',
        role: 'user',
        content: '我想重点了解前端的组件设计，特别是如何实现一个好用的笔记编辑器',
        timestamp: '2024-01-15T10:05:00Z'
      },
      {
        id: '4',
        role: 'assistant',
        content: '很好的问题！笔记编辑器是工作台的核心组件之一。以下是一些关键的设计考虑：\n\n## 编辑器功能\n\n### 基础功能\n- **Markdown支持**：实时预览和语法高亮\n- **富文本工具栏**：粗体、斜体、标题、列表等\n- **自动保存**：防止数据丢失\n- **快捷键支持**：提高编辑效率\n\n### 高级功能\n- **AI辅助**：文本润色、自动摘要、智能分类\n- **代码块支持**：语法高亮和代码执行\n- **图片和文件**：拖拽上传和管理\n- **协作功能**：实时同步和版本控制\n\n### 技术实现\n```javascript\n// 使用React和相关库\nimport { useState, useEffect } from \'react\'\nimport ReactMarkdown from \'react-markdown\'\nimport { Prism as SyntaxHighlighter } from \'react-syntax-highlighter\'\n\nconst NoteEditor = ({ note, onSave }) => {\n  const [content, setContent] = useState(note.content)\n  const [isPreview, setIsPreview] = useState(false)\n  \n  // 自动保存逻辑\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      onSave({ ...note, content })\n    }, 1000)\n    return () => clearTimeout(timer)\n  }, [content])\n  \n  return (\n    <div className=\"editor-container\">\n      {/* 工具栏和编辑区域 */}\n    </div>\n  )\n}\n```\n\n你想深入了解哪个具体方面？',
        timestamp: '2024-01-15T10:08:45Z'
      }
    ]
    setMessages(mockMessages)
  }, [])

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 创建新会话
  const handleNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: '新对话',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0,
      model: aiModel
    }
    setSessions([newSession, ...sessions])
    setCurrentSession(newSession)
    setMessages([])
  }

  // 切换会话
  const handleSessionChange = (session) => {
    setCurrentSession(session)
    // 这里应该加载对应会话的消息
    // 暂时使用模拟数据
    if (session.id === '1') {
      // 保持当前消息
    } else {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `欢迎来到 ${session.title}！我是你的AI助手，有什么可以帮助你的吗？`,
          timestamp: new Date().toISOString()
        }
      ])
    }
  }

  // 删除会话
  const handleDeleteSession = (sessionId) => {
    if (confirm('确定要删除这个对话吗？')) {
      const newSessions = sessions.filter(s => s.id !== sessionId)
      setSessions(newSessions)
      if (currentSession?.id === sessionId) {
        setCurrentSession(newSessions[0] || null)
        setMessages([])
      }
    }
  }

  // 重命名会话
  const handleRenameSession = (sessionId, newTitle) => {
    setSessions(sessions.map(s => 
      s.id === sessionId 
        ? { ...s, title: newTitle, updated_at: new Date().toISOString() }
        : s
    ))
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // 模拟AI响应
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(userMessage.content),
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiResponse])

      // 更新会话信息
      if (currentSession) {
        setSessions(sessions.map(s => 
          s.id === currentSession.id 
            ? { 
                ...s, 
                updated_at: new Date().toISOString(),
                message_count: s.message_count + 2,
                title: s.title === '新对话' ? generateSessionTitle(userMessage.content) : s.title
              }
            : s
        ))
      }
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 生成模拟响应
  const generateMockResponse = (userInput) => {
    const responses = [
      '这是一个很好的问题！让我来为你详细解答...',
      '根据你的需求，我建议采用以下方案：\n\n1. 首先分析现有架构\n2. 确定优化目标\n3. 制定实施计划',
      '我理解你的想法。这个功能确实很有用，我们可以从以下几个角度来实现：',
      '让我帮你整理一下思路：\n\n**核心要点：**\n- 用户体验优先\n- 性能优化\n- 可维护性\n\n你觉得哪个方面最重要？'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 生成会话标题
  const generateSessionTitle = (firstMessage) => {
    if (firstMessage.length > 20) {
      return firstMessage.substring(0, 20) + '...'
    }
    return firstMessage
  }

  // 处理快捷指令
  const handleQuickCommand = (command) => {
    setInputMessage(command)
    setShowQuickCommands(false)
  }

  // 复制消息
  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content)
    // 这里可以添加提示
  }

  // 重新生成响应
  const handleRegenerateResponse = (messageId) => {
    // 实现重新生成逻辑
    console.log('重新生成响应:', messageId)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* 侧边栏 */}
      {showSidebar && (
        <div className="hidden lg:block">
          <ChatSidebar
            sessions={sessions}
            currentSession={currentSession}
            onSessionChange={handleSessionChange}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      )}

      {/* 主对话区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 */}
        <div className="eva-panel p-2 lg:p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex-shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-base lg:text-lg truncate">
                  {currentSession?.title || 'AI对话助手'}
                </h2>
                <p className="text-xs lg:text-sm text-muted-foreground truncate">
                  <span className="hidden lg:inline">{currentSession?.message_count || 0} 条消息 · 模型: {currentSession?.model || aiModel}</span>
                  <span className="lg:hidden">{currentSession?.model || aiModel}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger className="w-24 lg:w-40 h-8 lg:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5</SelectItem>
                  <SelectItem value="claude-3">Claude-3</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuickCommands(!showQuickCommands)}
                className="hidden lg:flex"
              >
                <Zap className="w-4 h-4 mr-2" />
                快捷指令
              </Button>

              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowQuickCommands(!showQuickCommands)}
                className="lg:hidden"
              >
                <Zap className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-hidden relative">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onCopyMessage={handleCopyMessage}
            onRegenerateResponse={handleRegenerateResponse}
          />
          <div ref={messagesEndRef} />

          {/* 快捷指令面板 */}
          {showQuickCommands && (
            <QuickCommands
              onCommandSelect={handleQuickCommand}
              onClose={() => setShowQuickCommands(false)}
            />
          )}
        </div>

        {/* 输入区域 */}
        <div className="eva-panel p-2 lg:p-4 border-t border-border">
          <div className="flex gap-2 lg:gap-3">
            <div className="flex-1 relative">
              <Textarea
                placeholder="输入你的问题..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="eva-input resize-none min-h-[50px] lg:min-h-[60px] max-h-[150px] lg:max-h-[200px] pr-10 lg:pr-12 text-sm lg:text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1 lg:right-2 bottom-1 lg:bottom-2 eva-button"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                ) : (
                  <Send className="w-3 h-3 lg:w-4 lg:h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1 lg:mt-2 text-xs text-muted-foreground">
            <span className="hidden lg:block">AI助手会尽力帮助你，但请注意验证重要信息</span>
            <span className="lg:hidden">请注意验证AI回复的重要信息</span>
            <span>{inputMessage.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage

