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
  Home
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

const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])
  const [tags, setTags] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('work')
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'work', folder_id: null })
  const [newFolder, setNewFolder] = useState({ name: '', category: 'work' })

  // 分类配置
  const categories = [
    { id: 'work', name: '工作', icon: Briefcase, color: 'bg-blue-500' },
    { id: 'study', name: '学习', icon: BookOpen, color: 'bg-green-500' },
    { id: 'life', name: '生活', icon: Home, color: 'bg-purple-500' }
  ]

  // 获取数据
  useEffect(() => {
    fetchFolders()
    fetchNotes()
    fetchTags()
  }, [selectedCategory])

  const fetchFolders = async () => {
    try {
      const response = await fetch(`/api/notes/folders?category=${selectedCategory}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('获取文件夹失败:', error)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes/?category=${selectedCategory}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('获取笔记失败:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/notes/tags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  // 创建新笔记
  const handleCreateNote = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newNote,
          category: selectedCategory
        })
      })
      
      if (response.ok) {
        const note = await response.json()
        setNotes([note, ...notes])
        setNewNote({ title: '', content: '', category: selectedCategory, folder_id: null })
        setShowNewNoteDialog(false)
        setSelectedNote(note)
        setIsEditing(true)
      }
    } catch (error) {
      console.error('创建笔记失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 创建新文件夹
  const handleCreateFolder = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notes/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newFolder,
          category: selectedCategory
        })
      })
      
      if (response.ok) {
        const folder = await response.json()
        setFolders([...folders, folder])
        setNewFolder({ name: '', category: selectedCategory })
        setShowNewFolderDialog(false)
      }
    } catch (error) {
      console.error('创建文件夹失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 保存笔记
  const handleSaveNote = async () => {
    if (!selectedNote) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content
        })
      })
      
      if (response.ok) {
        const updatedNote = await response.json()
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
        setIsEditing(false)
      }
    } catch (error) {
      console.error('保存笔记失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除笔记
  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
        if (selectedNote?.id === noteId) {
          setSelectedNote(null)
          setIsEditing(false)
        }
      }
    } catch (error) {
      console.error('删除笔记失败:', error)
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

  // 过滤笔记
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder ? note.folder_id === selectedFolder : true
    return matchesSearch && matchesFolder
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
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateNote} disabled={!newNote.title || loading}>
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
                  <Button onClick={handleCreateFolder} disabled={!newFolder.name || loading}>
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
          {folders.map(folder => (
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
                            {note.content?.substring(0, 50)}...
                          </p>
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
                        {note.content?.substring(0, 50)}...
                      </p>
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
                  {isEditing ? (
                    <Button onClick={handleSaveNote} disabled={loading}>
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
    </div>
  )
}

export default NotesPage

