import { useState } from 'react'
import { 
  Zap, 
  Search, 
  Code, 
  FileText, 
  Lightbulb, 
  BookOpen,
  Calculator,
  Globe,
  Palette,
  Settings,
  X,
  Star,
  Clock,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'

const QuickCommands = ({ onCommandSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 快捷指令数据
  const commandCategories = [
    { id: 'all', name: '全部', icon: Zap },
    { id: 'writing', name: '写作', icon: FileText },
    { id: 'coding', name: '编程', icon: Code },
    { id: 'analysis', name: '分析', icon: Search },
    { id: 'creative', name: '创意', icon: Palette },
    { id: 'learning', name: '学习', icon: BookOpen },
    { id: 'productivity', name: '效率', icon: Target }
  ]

  const commands = [
    // 写作类
    {
      id: 'summarize',
      category: 'writing',
      title: '总结文本',
      description: '帮我总结以下内容的要点',
      command: '请帮我总结以下内容的核心要点：\n\n[在这里粘贴要总结的内容]',
      icon: FileText,
      popular: true
    },
    {
      id: 'improve_writing',
      category: 'writing',
      title: '改进文本',
      description: '优化文本表达和语法',
      command: '请帮我改进以下文本的表达和语法：\n\n[在这里粘贴要改进的文本]',
      icon: FileText
    },
    {
      id: 'translate',
      category: 'writing',
      title: '翻译文本',
      description: '翻译为其他语言',
      command: '请将以下文本翻译为英文：\n\n[在这里粘贴要翻译的文本]',
      icon: Globe
    },

    // 编程类
    {
      id: 'code_review',
      category: 'coding',
      title: '代码审查',
      description: '审查代码质量和最佳实践',
      command: '请帮我审查以下代码，指出可能的问题和改进建议：\n\n```\n[在这里粘贴代码]\n```',
      icon: Code,
      popular: true
    },
    {
      id: 'debug_code',
      category: 'coding',
      title: '调试代码',
      description: '帮助找出代码中的bug',
      command: '我的代码有问题，请帮我找出bug：\n\n```\n[在这里粘贴有问题的代码]\n```\n\n错误信息：[描述错误现象]',
      icon: Code
    },
    {
      id: 'explain_code',
      category: 'coding',
      title: '解释代码',
      description: '详细解释代码的工作原理',
      command: '请详细解释以下代码的工作原理：\n\n```\n[在这里粘贴代码]\n```',
      icon: Code
    },
    {
      id: 'optimize_code',
      category: 'coding',
      title: '优化代码',
      description: '提供代码性能优化建议',
      command: '请帮我优化以下代码的性能：\n\n```\n[在这里粘贴代码]\n```',
      icon: Code
    },

    // 分析类
    {
      id: 'analyze_data',
      category: 'analysis',
      title: '数据分析',
      description: '分析数据趋势和模式',
      command: '请帮我分析以下数据，找出趋势和模式：\n\n[在这里粘贴数据或描述数据情况]',
      icon: Search
    },
    {
      id: 'pros_cons',
      category: 'analysis',
      title: '利弊分析',
      description: '分析方案的优缺点',
      command: '请帮我分析以下方案的利弊：\n\n[描述要分析的方案或决策]',
      icon: Search,
      popular: true
    },
    {
      id: 'compare_options',
      category: 'analysis',
      title: '方案对比',
      description: '对比多个选项的差异',
      command: '请帮我对比以下几个选项的差异：\n\n选项A：[描述]\n选项B：[描述]\n选项C：[描述]',
      icon: Search
    },

    // 创意类
    {
      id: 'brainstorm',
      category: 'creative',
      title: '头脑风暴',
      description: '生成创意想法',
      command: '请帮我进行头脑风暴，围绕以下主题生成创意想法：\n\n主题：[描述主题]',
      icon: Lightbulb
    },
    {
      id: 'naming',
      category: 'creative',
      title: '命名建议',
      description: '为项目或产品起名',
      command: '请帮我为以下项目/产品起一些有创意的名字：\n\n描述：[项目/产品描述]\n风格要求：[简洁/专业/有趣等]',
      icon: Palette
    },

    // 学习类
    {
      id: 'explain_concept',
      category: 'learning',
      title: '概念解释',
      description: '解释复杂概念',
      command: '请用简单易懂的方式解释以下概念：\n\n[要解释的概念]',
      icon: BookOpen,
      popular: true
    },
    {
      id: 'learning_plan',
      category: 'learning',
      title: '学习计划',
      description: '制定学习路线图',
      command: '请帮我制定学习以下技能的计划：\n\n技能：[要学习的技能]\n当前水平：[初学者/中级/高级]\n目标：[学习目标]\n时间：[可用时间]',
      icon: BookOpen
    },

    // 效率类
    {
      id: 'task_breakdown',
      category: 'productivity',
      title: '任务分解',
      description: '将复杂任务分解为小步骤',
      command: '请帮我将以下复杂任务分解为具体的执行步骤：\n\n任务：[描述任务]\n截止时间：[时间要求]',
      icon: Target
    },
    {
      id: 'time_management',
      category: 'productivity',
      title: '时间管理',
      description: '优化时间安排',
      command: '请帮我优化以下时间安排：\n\n当前安排：[描述当前时间安排]\n目标：[想要达到的效果]',
      icon: Clock
    }
  ]

  // 过滤指令
  const filteredCommands = commands.filter(command => {
    const matchesCategory = selectedCategory === 'all' || command.category === selectedCategory
    const matchesSearch = command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         command.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // 热门指令
  const popularCommands = commands.filter(cmd => cmd.popular)

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="eva-panel w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">快捷指令</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-[60vh]">
          {/* 左侧分类 */}
          <div className="w-48 border-r border-border p-4">
            <div className="space-y-1">
              {commandCategories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${selectedCategory === category.id 
                        ? 'bg-primary/20 text-primary' 
                        : 'hover:bg-accent/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 flex flex-col">
            {/* 搜索框 */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索指令..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="eva-input pl-10"
                />
              </div>
            </div>

            {/* 指令列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 热门指令 */}
              {selectedCategory === 'all' && !searchTerm && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <h4 className="font-medium">热门指令</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {popularCommands.map(command => {
                      const Icon = command.icon
                      return (
                        <button
                          key={command.id}
                          onClick={() => onCommandSelect(command.command)}
                          className="eva-panel p-4 text-left hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <h5 className="font-medium mb-1">{command.title}</h5>
                              <p className="text-sm text-muted-foreground">
                                {command.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 所有指令 */}
              <div>
                {!searchTerm && selectedCategory !== 'all' && (
                  <h4 className="font-medium mb-3">
                    {commandCategories.find(c => c.id === selectedCategory)?.name} 指令
                  </h4>
                )}
                
                <div className="space-y-2">
                  {filteredCommands.map(command => {
                    const Icon = command.icon
                    return (
                      <button
                        key={command.id}
                        onClick={() => onCommandSelect(command.command)}
                        className="w-full eva-panel p-4 text-left hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{command.title}</h5>
                              {command.popular && (
                                <Star className="w-3 h-3 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {command.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {filteredCommands.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>没有找到匹配的指令</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            选择指令后会自动填入输入框，你可以根据需要修改内容
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuickCommands

