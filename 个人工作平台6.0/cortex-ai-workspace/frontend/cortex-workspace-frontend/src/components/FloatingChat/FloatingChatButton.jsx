import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Send, 
  Loader2, 
  Trash2,
  Settings,
  Sparkles,
  Brain,
  Zap,
  Globe,
  BookOpen,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const FloatingChatButtonReal = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5')
  const [availableModels, setAvailableModels] = useState([])
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showQuickCommands, setShowQuickCommands] = useState(false)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // 快捷命令配置
  const quickCommands = [
    { id: 'summarize', name: '总结', icon: BookOpen, description: '总结文本要点' },
    { id: 'improve', name: '改进', icon: Sparkles, description: '改进文本表达' },
    { id: 'translate', name: '翻译', icon: Globe, description: '翻译为英文' },
    { id: 'brainstorm', name: '头脑风暴', icon: Brain, description: '创意想法' },
    { id: 'explain', name: '解释', icon: Zap, description: '详细解释' },
    { id: 'analyze', name: '分析', icon: BarChart3, description: '深入分析' }
  ]

  // 初始化
  useEffect(() => {
    if (isOpen) {
      loadAvailableModels()
      loadConversations()
    }
  }, [isOpen])

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 获取可用模型
  const loadAvailableModels = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.models || [])
        if (data.default) {
          setSelectedModel(data.default)
        }
      }
    } catch (error) {
      console.error('加载AI模型失败:', error)
    }
  }

  // 获取对话列表
  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('加载对话列表失败:', error)
    }
  }

  // 创建新对话
  const createNewConversation = async (title = '新对话') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      })
      
      if (response.ok) {
        const newConversation = await response.json()
        setConversations([newConversation, ...conversations])
        setCurrentConversationId(newConversation.id)
        setMessages([])
        return newConversation.id
      }
    } catch (error) {
      console.error('创建对话失败:', error)
    }
    return null
  }

  // 加载对话消息
  const loadConversationMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const messages = await response.json()
        setMessages(messages)
        setCurrentConversationId(conversationId)
      }
    } catch (error) {
      console.error('加载对话消息失败:', error)
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    try {
      // 如果没有当前对话，创建新对话
      let conversationId = currentConversationId
      if (!conversationId) {
        conversationId = await createNewConversation()
        if (!conversationId) {
          throw new Error('创建对话失败')
        }
      }

      // 添加用户消息到界面
      const tempUserMessage = {
        id: Date.now(),
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, tempUserMessage])

      // 发送到后端
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: userMessage,
          model: selectedModel
        })
      })

      if (response.ok) {
        const aiMessage = await response.json()
        // 重新加载对话消息以获取完整数据
        await loadConversationMessages(conversationId)
      } else {
        throw new Error('发送消息失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 移除临时消息
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()))
      alert('发送消息失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 执行快捷命令
  const executeQuickCommand = async (command, text = '') => {
    if (!text.trim()) {
      const inputText = prompt(`请输入要${quickCommands.find(cmd => cmd.id === command)?.name}的文本：`)
      if (!inputText) return
      text = inputText
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/quick-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          command,
          text,
          model: selectedModel
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // 添加到消息列表
        const userMessage = {
          id: Date.now(),
          role: 'user',
          content: `[${quickCommands.find(cmd => cmd.id === command)?.name}] ${text}`,
          created_at: new Date().toISOString()
        }
        
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.result,
          model: result.model,
          created_at: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, userMessage, aiMessage])
      } else {
        throw new Error('快捷命令执行失败')
      }
    } catch (error) {
      console.error('快捷命令执行失败:', error)
      alert('快捷命令执行失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 全局聊天（不保存历史）
  const globalChat = async (message) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/global-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          model: selectedModel,
          context: messages.slice(-4) // 发送最近4条消息作为上下文
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        const userMessage = {
          id: Date.now(),
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        }
        
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.response,
          model: result.model,
          created_at: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, userMessage, aiMessage])
      } else {
        throw new Error('全局聊天失败')
      }
    } catch (error) {
      console.error('全局聊天失败:', error)
      alert('聊天失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const clearMessages = () => {
    if (confirm('确定要清空当前对话吗？')) {
      setMessages([])
      setCurrentConversationId(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 浮动按钮
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="eva-button w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  // 最小化状态
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="eva-button rounded-full shadow-lg"
          size="sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          AI助手
        </Button>
      </div>
    )
  }

  // 完整聊天界面
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] eva-panel shadow-2xl rounded-lg flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">AI助手</h3>
            <p className="text-xs text-muted-foreground">
              {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickCommands(!showQuickCommands)}
            className="w-8 h-8 p-0"
          >
            <Zap className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="w-8 h-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 p-0"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 快捷命令面板 */}
      {showQuickCommands && (
        <div className="p-3 border-b border-border bg-muted/50">
          <div className="grid grid-cols-3 gap-2">
            {quickCommands.map(command => (
              <button
                key={command.id}
                onClick={() => executeQuickCommand(command.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background transition-colors text-xs"
                disabled={isLoading}
              >
                <command.icon className="w-4 h-4" />
                <span>{command.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>开始与AI助手对话</p>
            <p className="text-sm mt-2">支持多种AI模型和快捷命令</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.model && message.role === 'assistant' && (
                  <div className="text-xs opacity-70 mt-1">
                    {availableModels.find(m => m.id === message.model)?.name || message.model}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI正在思考...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-border">
        {/* 模型选择 */}
        <div className="mb-3">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="eva-input h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${model.color}`}></div>
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 消息输入 */}
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="eva-input flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="eva-button px-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FloatingChatButtonReal

