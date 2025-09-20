import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  FolderPlus, 
  Tag,
  Brain,
  Sparkles,
  Save,
  Trash2,
  Edit3,
  Folder,
  ChevronDown,
  ChevronRight,
  Pin,
  Archive,
  MoreVertical,
  Briefcase,
  BookOpen,
  Home,
  Wand2,
  Hash,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx'
import AIEnhanceModal from './AIEnhanceModal.jsx'

const NotesPageWithAI = () => {
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('work')
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showAIEnhanceModal, setShowAIEnhanceModal] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState(new Set(['1', '2', '3']))
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'work', folder_id: null })
  const [newFolder, setNewFolder] = useState({ name: '', category: 'work' })
  const [aiSuggestions, setAiSuggestions] = useState([])

  // 分类配置
  const categories = [
    { id: 'work', name: '工作', icon: Briefcase, color: 'bg-blue-500' },
    { id: 'study', name: '学习', icon: BookOpen, color: 'bg-green-500' },
    { id: 'life', name: '生活', icon: Home, color: 'bg-purple-500' }
  ]

  // 模拟数据
  useEffect(() => {
    // 模拟文件夹数据
    const mockFolders = [
      { id: '1', name: 'React开发', category: 'study', user_id: '1' },
      { id: '2', name: '项目管理', category: 'work', user_id: '1' },
      { id: '3', name: '读书笔记', category: 'study', user_id: '1' },
      { id: '4', name: '生活记录', category: 'life', user_id: '1' },
      { id: '5', name: '工作计划', category: 'work', user_id: '1' }
    ]

    // 模拟笔记数据
    const mockNotes = [
      {
        id: '1',
        title: 'React Hooks学习笔记',
        content: 'React Hooks是React 16.8引入的新特性，让我们可以在函数组件中使用state和其他React特性。\n\n主要的Hooks包括：\n- useState: 管理组件状态\n- useEffect: 处理副作用\n- useContext: 使用Context\n- useReducer: 复杂状态管理\n\n使用Hooks的好处：\n1. 更简洁的代码\n2. 更好的逻辑复用\n3. 更容易测试',
        category: 'study',
        folder_id: '1',
        ai_summary: 'React Hooks核心概念和优势总结',
        tags: ['React', 'JavaScript', '前端开发'],
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: '项目进度跟踪',
        content: '本周完成的任务：\n\n✅ 用户登录功能开发\n✅ 笔记系统基础架构\n✅ AI集成测试\n\n下周计划：\n🔲 完善笔记分类功能\n🔲 添加AI文本增强\n🔲 实现全局搜索\n🔲 优化用户界面\n\n遇到的问题：\n- 认证系统需要优化\n- 前后端通信需要调试',
        category: 'work',
        folder_id: '2',
        ai_summary: '项目开发进度和下周计划',
        tags: ['项目管理', '开发计划'],
        created_at: '2024-01-14T14:20:00Z'
      },
      {
        id: '3',
        title: '今日感想',
        content: '今天学习了很多新知识，感觉很充实。\n\n特别是在AI集成方面有了新的突破，成功连接了OpenRouter API，可以调用GPT-5等多个模型。\n\n明天计划：\n- 继续完善笔记系统\n- 测试AI功能\n- 优化用户体验',
        category: 'life',
        folder_id: '4',
        ai_summary: '学习心得和明日计划',
        tags: ['学习', '感想', 'AI'],
        created_at: '2024-01-13T20:15:00Z'
      },
      {
        id: '4',
        title: 'AI工作台设计思路',
        content: '设计一个智能工作台的核心思路：\n\n1. 以用户为中心\n- 简洁直观的界面\n- 快速响应的交互\n- 个性化的体验\n\n2. AI赋能\n- 智能文本增强\n- 自动分类标签\n- 内容推荐\n\n3. 数据管理\n- 三分类结构（工作、学习、生活）\n- 文件夹组织\n- 全文搜索\n\n4. 协作功能\n- 多用户支持\n- 权限管理\n- 数据同步',
        category: 'work',
        folder_id: '5',
        ai_summary: '智能工作台的设计理念和功能规划',
        tags: ['设计', 'AI', '产品规划'],
        created_at: '2024-01-12T16:45:00Z'
      }
    ]

    setFolders(mockFolders)
    setNotes(mockNotes)
    
    // 模拟AI建议
    setAiSuggestions([
      { type: 'category', suggestion: '建议将此笔记归类到"学习"分类' },
      { type: 'tag', suggestion: '推荐标签：#React #前端开发' },
      { type: 'summary', suggestion: '为长篇笔记生成摘要' }
    ])
  }, [])

  // 创建新笔记
  const handleCreateNote = () => {
    const newNoteData = {
      id: Date.now().toString(),
      title: newNote.title || '新笔记',
      content: '',
      category: selectedCategory,
      folder_id: newNote.folder_id,
      ai_summary: '',
      tags: [],
      created_at: new Date().toISOString()
    }
    
    setNotes([newNoteData, ...notes])
    setNewNote({ title: '', content: '', category: selectedCategory, folder_id: null })
    setShowNewNoteDialog(false)
    setSelectedNote(newNoteData)
    setIsEditing(true)
  }

  // 创建新文件夹
  const handleCreateFolder = () => {
    const newFolderData = {
      id: Date.now().toString(),
      name: newFolder.name,
      category: selectedCategory,
      user_id: '1'
    }
    
    setFolders([...folders, newFolderData])
    setNewFolder({ name: '', category: selectedCategory })
    setShowNewFolderDialog(false)
  }

  // 保存笔记
  const handleSaveNote = () => {
    if (!selectedNote) return
    
    setNotes(notes.map(note => 
      note.id === selectedNote.id ? selectedNote : note
    ))
    setIsEditing(false)
  }

  // 删除笔记
  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }

  // 切换文件夹展开状态
  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  // AI增强文本应用
  const handleAIEnhanceApply = (enhancedText) => {
    if (selectedNote) {
      setSelectedNote({
        ...selectedNote,
        content: enhancedText
      })
    }
  }

  // AI智能分类
  const handleAIClassify = async () => {
    if (!selectedNote) return
    
    // 模拟AI分类
    const suggestions = [
      { category: 'work', confidence: 0.8, reason: '包含项目管理相关内容' },
      { category: 'study', confidence: 0.6, reason: '包含学习笔记特征' }
    ]
    
    // 这里可以显示分类建议
    console.log('AI分类建议:', suggestions)
  }

  // AI生成标签
  const handleAIGenerateTags = async () => {
    if (!selectedNote) return
    
    // 模拟AI生成标签
    const suggestedTags = ['AI', '笔记', '工作台', '开发']
    
    setSelectedNote({
      ...selectedNote,
      tags: [...(selectedNote.tags || []), ...suggestedTags]
    })
  }

  // 过滤数据
  const filteredFolders = folders.filter(folder => folder.category === selectedCategory)
  const filteredNotes = notes.filter(note => {
    const matchesCategory = note.category === selectedCategory
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // 按文件夹分组笔记
  const notesByFolder = filteredNotes.reduce((acc, note) => {
    const folderId = note.folder_id || 'uncategorized'
    if (!acc[folderId]) {
      acc[folderId] = []
    }
    acc[folderId].push(note)
    return acc
  }, {})

  const currentCategory = categories.find(cat => cat.id === selectedCategory)

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* 分类标签 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3">
              {categories.map(category => {
                const Icon = category.icon
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* 搜索和操作 */}
        <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索笔记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  新笔记
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新笔记</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="笔记标题"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  />
                  <Select value={newNote.folder_id || ''} onValueChange={(value) => setNewNote({...newNote, folder_id: value || null})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择文件夹（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">无文件夹</SelectItem>
                      {filteredFolders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateNote} disabled={!newNote.title}>
                    创建
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderPlus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新文件夹</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="文件夹名称"
                    value={newFolder.name}
                    onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                  />
                  <Button onClick={handleCreateFolder} disabled={!newFolder.name}>
                    创建
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 文件夹和笔记列表 */}
        <div className="flex-1 overflow-y-auto">
          {/* 文件夹 */}
          {filteredFolders.map(folder => (
            <div key={folder.id} className="border-b border-gray-100 dark:border-gray-700">
              <div 
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
              >
                <div className="flex items-center gap-2">
                  {expandedFolders.has(folder.id) ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                  <Folder className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                <Badge variant="secondary">
                  {notesByFolder[folder.id]?.length || 0}
                </Badge>
              </div>
              
              {expandedFolders.has(folder.id) && notesByFolder[folder.id] && (
                <div className="pl-6">
                  {notesByFolder[folder.id].map(note => (
                    <div
                      key={note.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-l-2 ${
                        selectedNote?.id === note.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent'
                      }`}
                      onClick={() => {
                        setSelectedNote(note)
                        setIsEditing(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{note.title}</h4>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {note.ai_summary || note.content?.substring(0, 50) + '...'}
                          </p>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDeleteNote(note.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 未分类笔记 */}
          {notesByFolder.uncategorized && (
            <div className="border-b border-gray-100 dark:border-gray-700">
              <div className="p-3 font-medium text-gray-500">未分类</div>
              {notesByFolder.uncategorized.map(note => (
                <div
                  key={note.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-l-2 ${
                    selectedNote?.id === note.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent'
                  }`}
                  onClick={() => {
                    setSelectedNote(note)
                    setIsEditing(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{note.title}</h4>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {note.ai_summary || note.content?.substring(0, 50) + '...'}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{note.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDeleteNote(note.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* 笔记头部 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${currentCategory?.color}`} />
                  <h1 className="text-xl font-semibold">{selectedNote.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* AI功能按钮 */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowAIEnhanceModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    AI增强
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Brain className="w-4 h-4 mr-2" />
                        AI助手
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleAIClassify}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        智能分类
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAIGenerateTags}>
                        <Hash className="w-4 h-4 mr-2" />
                        生成标签
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isEditing ? (
                    <Button onClick={handleSaveNote}>
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                  )}
                </div>
              </div>
              
              {/* 标签显示 */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedNote.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 笔记内容 */}
            <div className="flex-1 p-4 bg-white dark:bg-gray-800">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                    className="text-xl font-semibold"
                    placeholder="笔记标题"
                  />
                  <Textarea
                    value={selectedNote.content || ''}
                    onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                    className="min-h-96 resize-none"
                    placeholder="开始写笔记..."
                  />
                </div>
              ) : (
                <div className="prose max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap">{selectedNote.content}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                选择一个笔记开始编辑
              </h3>
              <p className="text-gray-500">
                或者创建一个新笔记来开始记录你的想法
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI增强模态框 */}
      <AIEnhanceModal
        isOpen={showAIEnhanceModal}
        onClose={() => setShowAIEnhanceModal(false)}
        originalText={selectedNote?.content || ''}
        onApply={handleAIEnhanceApply}
      />
    </div>
  )
}

export default NotesPageWithAI

