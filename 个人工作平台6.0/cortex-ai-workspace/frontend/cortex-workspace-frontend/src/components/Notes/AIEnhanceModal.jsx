import React, { useState } from 'react'
import { 
  Brain, 
  Sparkles, 
  Languages, 
  FileText, 
  Lightbulb,
  CheckCircle,
  Loader2,
  Copy,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const AIEnhanceModal = ({ isOpen, onClose, originalText, onApply }) => {
  const [selectedMode, setSelectedMode] = useState('improve')
  const [selectedModel, setSelectedModel] = useState('openai/gpt-5')
  const [enhancedText, setEnhancedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // AI增强模式配置
  const enhanceModes = [
    {
      id: 'improve',
      name: '文本改进',
      icon: Sparkles,
      description: '优化语言表达，提升文本质量',
      prompt: '请帮我改进以下文本的表达，使其更加清晰、流畅和专业：'
    },
    {
      id: 'summarize',
      name: '内容摘要',
      icon: FileText,
      description: '提取关键信息，生成简洁摘要',
      prompt: '请为以下内容生成一个简洁明了的摘要，突出重点：'
    },
    {
      id: 'expand',
      name: '内容扩展',
      icon: Lightbulb,
      description: '丰富内容细节，增加深度分析',
      prompt: '请帮我扩展以下内容，添加更多细节和深入分析：'
    },
    {
      id: 'translate',
      name: '智能翻译',
      icon: Languages,
      description: '翻译为其他语言并保持语境',
      prompt: '请将以下内容翻译为英文，保持原意和语境：'
    },
    {
      id: 'structure',
      name: '结构优化',
      icon: Brain,
      description: '重新组织内容结构，提升逻辑性',
      prompt: '请帮我重新组织以下内容的结构，使其更有逻辑性和条理性：'
    }
  ]

  // AI模型选项
  const models = [
    { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
    { id: 'anthropic/claude-4', name: 'Claude-4', provider: 'Anthropic' },
    { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek V3', provider: 'DeepSeek' }
  ]

  const currentMode = enhanceModes.find(mode => mode.id === selectedMode)
  const currentModel = models.find(model => model.id === selectedModel)

  // 调用AI增强功能
  const handleEnhance = async () => {
    if (!originalText.trim()) {
      setError('请先输入要增强的文本')
      return
    }

    setLoading(true)
    setError('')
    setEnhancedText('')

    try {
      // 模拟AI API调用
      const prompt = `${currentMode.prompt}\n\n${originalText}`
      
      // 这里应该调用真实的API，现在先模拟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟不同模式的响应
      let mockResponse = ''
      switch (selectedMode) {
        case 'improve':
          mockResponse = `经过AI优化的文本：\n\n${originalText}\n\n[此处为改进后的版本，语言更加流畅专业，表达更加清晰准确]`
          break
        case 'summarize':
          mockResponse = `📝 内容摘要：\n\n• 主要观点1\n• 主要观点2\n• 关键结论\n\n总结：${originalText.substring(0, 100)}...的核心要点`
          break
        case 'expand':
          mockResponse = `${originalText}\n\n📈 扩展内容：\n\n• 详细分析和背景信息\n• 相关案例和实例\n• 深入思考和启发\n• 实际应用建议`
          break
        case 'translate':
          mockResponse = `🌐 英文翻译：\n\n[English translation of the original text while maintaining context and meaning]\n\n原文：${originalText}`
          break
        case 'structure':
          mockResponse = `📋 结构化内容：\n\n## 主要内容\n${originalText}\n\n## 关键要点\n1. 要点一\n2. 要点二\n3. 要点三\n\n## 总结\n[结构化总结]`
          break
        default:
          mockResponse = `AI增强结果：\n\n${originalText}`
      }
      
      setEnhancedText(mockResponse)
    } catch (err) {
      setError('AI增强失败，请稍后重试')
      console.error('AI enhance error:', err)
    } finally {
      setLoading(false)
    }
  }

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(enhancedText)
      // 这里可以添加成功提示
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // 应用增强结果
  const handleApply = () => {
    if (enhancedText && onApply) {
      onApply(enhancedText)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            AI文本增强
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[70vh]">
          {/* 控制面板 */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-2">增强模式</label>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enhanceModes.map(mode => {
                    const Icon = mode.icon
                    return (
                      <SelectItem key={mode.id} value={mode.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {mode.name}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">{currentMode?.description}</p>
            </div>

            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-2">AI模型</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {model.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleEnhance} 
                disabled={loading || !originalText.trim()}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? '增强中...' : '开始增强'}
              </Button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
            {/* 原始文本 */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">原始文本</h3>
                <Badge variant="outline">{originalText.length} 字符</Badge>
              </div>
              <Textarea
                value={originalText}
                readOnly
                className="flex-1 resize-none"
                placeholder="原始文本将显示在这里..."
              />
            </div>

            {/* 增强结果 */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">增强结果</h3>
                <div className="flex items-center gap-2">
                  {enhancedText && (
                    <>
                      <Badge variant="outline">{enhancedText.length} 字符</Badge>
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Textarea
                value={enhancedText}
                onChange={(e) => setEnhancedText(e.target.value)}
                className="flex-1 resize-none"
                placeholder={loading ? "AI正在生成增强内容..." : "增强结果将显示在这里..."}
                readOnly={loading}
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={!enhancedText}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              应用结果
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AIEnhanceModal

