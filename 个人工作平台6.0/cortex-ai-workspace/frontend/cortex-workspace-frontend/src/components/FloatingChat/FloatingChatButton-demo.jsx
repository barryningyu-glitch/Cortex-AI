import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2,
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Loader2,
  Settings,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5')
  const [showSettings, setShowSettings] = useState(false)

  // AI模型选项
  const models = [
    { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', color: 'bg-green-500' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', color: 'bg-blue-500' },
    { id: 'anthropic/claude-4', name: 'Claude-4', provider: 'Anthropic', color: 'bg-purple-500' },
    { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek V3', provider: 'DeepSeek', color: 'bg-orange-500' }
  ]

  // 快捷命令
  const quickCommands = [
    { id: 'summarize', label: '总结笔记', prompt: '请帮我总结当前笔记的要点' },
    { id: 'improve', label: '改进文本', prompt: '请帮我改进这段文本的表达' },
    { id: 'translate', label: '翻译内容', prompt: '请将这段内容翻译为英文' },
    { id: 'brainstorm', label: '头脑风暴', prompt: '基于这个话题，给我一些创意想法' }
  ]

  const currentModel = models.find(model => model.id === selectedModel)

  // 初始化欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: '👋 您好！我是您的AI助手，可以帮您：\n\n• 📝 改进和总结笔记内容\n• 🔍 回答各种问题\n• 💡 提供创意和建议\n• 🌐 翻译和解释文本\n\n有什么可以帮助您的吗？',
          timestamp: new Date(),
          model: selectedModel
        }
      ])
    }
  }, [])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // 模拟AI响应
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMockResponse(inputMessage),
        timestamp: new Date(),
        model: selectedModel
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date(),
        model: selectedModel,
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 生成模拟响应
  const generateMockResponse = (input) => {
    const responses = [
      `基于您的问题"${input}"，我来为您分析：\n\n这是一个很好的问题。让我从几个角度来回答：\n\n1. **主要观点**：这个话题涉及多个方面...\n2. **实用建议**：建议您可以考虑...\n3. **进一步思考**：您还可以探索...\n\n希望这些信息对您有帮助！`,
      `关于"${input}"，我的理解是：\n\n💡 **核心要点**：\n- 重点一：...\n- 重点二：...\n- 重点三：...\n\n🚀 **行动建议**：\n基于以上分析，建议您...\n\n还有其他想了解的吗？`,
      `很有趣的问题！让我来帮您分析"${input}"：\n\n📊 **数据分析**：从目前的情况来看...\n🎯 **解决方案**：我建议采用以下方法...\n⚡ **快速提示**：记住这个关键点...\n\n需要我进一步解释哪个部分吗？`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 使用快捷命令
  const handleQuickCommand = (command) => {
    setInputMessage(command.prompt)
  }

  // 清空对话
  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: '对话已清空。有什么新的问题需要帮助吗？',
        timestamp: new Date(),
        model: selectedModel
      }
    ])
  }

  // 格式化时间
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="h-full shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        {/* 头部 */}
        <CardHeader className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${currentModel?.color || 'bg-green-500'}`}></div>
              <div>
                <CardTitle className="text-sm font-medium">AI助手</CardTitle>
                <p className="text-xs opacity-90">{currentModel?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            {/* 设置面板 */}
            {showSettings && (
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">AI模型</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-full">
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleClearChat}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      清空对话
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 快捷命令 */}
            <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
              <div className="flex flex-wrap gap-2">
                {quickCommands.map(command => (
                  <Button
                    key={command.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickCommand(command)}
                    className="text-xs"
                  >
                    {command.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 消息列表 */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : message.isError
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      <div className={`inline-block p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.isError
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                        {message.model && message.type === 'assistant' && (
                          <span className="ml-2">
                            • {models.find(m => m.id === message.model)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI正在思考...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="p-4 border-t bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="输入消息..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default FloatingChatButton

