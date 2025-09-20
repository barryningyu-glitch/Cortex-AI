import { useState } from 'react'
import { 
  Bot, 
  User, 
  Copy, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  MoreHorizontal,
  Code,
  Download,
  Share
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const MessageList = ({ messages, isLoading, onCopyMessage, onRegenerateResponse }) => {
  const [copiedMessageId, setCopiedMessageId] = useState(null)

  // 复制消息内容
  const handleCopy = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 简单的Markdown渲染函数
  const renderMarkdown = (content) => {
    // 简单处理一些基本的Markdown语法
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
    
    // 包装在段落中
    if (!html.includes('<h') && !html.includes('<li')) {
      html = `<p class="mb-4 leading-relaxed">${html}</p>`
    }
    
    return html
  }

  const MessageBubble = ({ message, isLast }) => {
    const isUser = message.role === 'user'
    const isAssistant = message.role === 'assistant'

    return (
      <div className={`flex gap-2 lg:gap-4 p-2 lg:p-4 ${isUser ? 'bg-accent/30' : ''}`}>
        {/* 头像 */}
        <div className={`
          w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}
        `}>
          {isUser ? <User className="w-3 h-3 lg:w-4 lg:h-4" /> : <Bot className="w-3 h-3 lg:w-4 lg:h-4" />}
        </div>

        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <span className="font-medium text-xs lg:text-sm">
              {isUser ? '你' : 'AI助手'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            {isUser ? (
              <p className="whitespace-pre-wrap mb-2 lg:mb-4 leading-relaxed text-sm lg:text-base">{message.content}</p>
            ) : (
              <div 
                className="whitespace-pre-wrap text-sm lg:text-base"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
            )}
          </div>

          {/* 消息操作 */}
          <div className="flex items-center gap-1 lg:gap-2 mt-2 lg:mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(message.id, message.content)}
              className="h-6 lg:h-7 px-1 lg:px-2"
            >
              {copiedMessageId === message.id ? (
                <span className="text-xs text-green-400">已复制</span>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-0 lg:mr-1" />
                  <span className="text-xs hidden lg:inline">复制</span>
                </>
              )}
            </Button>

            {isAssistant && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRegenerateResponse(message.id)}
                  className="h-6 lg:h-7 px-1 lg:px-2"
                >
                  <RefreshCw className="w-3 h-3 mr-0 lg:mr-1" />
                  <span className="text-xs hidden lg:inline">重新生成</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 lg:h-7 px-1 lg:px-2"
                >
                  <ThumbsUp className="w-3 h-3 mr-0 lg:mr-1" />
                  <span className="text-xs hidden lg:inline">好评</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 lg:h-7 px-1 lg:px-2"
                >
                  <ThumbsDown className="w-3 h-3 mr-0 lg:mr-1" />
                  <span className="text-xs hidden lg:inline">差评</span>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 lg:h-7 px-1 lg:px-2"
            >
              <Share className="w-3 h-3 mr-0 lg:mr-1" />
              <span className="text-xs hidden lg:inline">分享</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center p-4">
          <div>
            <Bot className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-base lg:text-lg font-medium mb-2">开始新的对话</h3>
            <p className="text-muted-foreground max-w-md text-sm lg:text-base">
              我是你的AI助手，可以帮助你解答问题、分析问题、提供建议。
              有什么我可以帮助你的吗？
            </p>
            
            {/* 建议问题 */}
            <div className="mt-4 lg:mt-6 space-y-2">
              <p className="text-xs lg:text-sm text-muted-foreground">你可以尝试问我：</p>
              <div className="flex flex-wrap gap-1 lg:gap-2 justify-center">
                {[
                  '如何提高工作效率？',
                  '解释一下React Hooks',
                  '帮我制定学习计划',
                  '分析这个项目架构'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-2 lg:px-3 py-1 bg-muted hover:bg-accent rounded-full text-xs transition-colors"
                    onClick={() => {
                      // 这里可以触发发送建议问题的逻辑
                      console.log('发送建议问题:', suggestion)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="group">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex gap-4 p-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">AI助手</span>
                  <span className="text-xs text-muted-foreground">正在思考...</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MessageList

