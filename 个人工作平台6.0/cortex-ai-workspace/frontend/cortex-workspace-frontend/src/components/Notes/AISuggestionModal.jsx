import { useState, useEffect } from 'react'
import { 
  Brain, 
  X, 
  Folder, 
  Tag, 
  Sparkles,
  Check,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'

const AISuggestionModal = ({ noteData, categories, folders, tags, onSave, onCancel }) => {
  const [loading, setLoading] = useState(true)
  const [suggestion, setSuggestion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [newTagName, setNewTagName] = useState('')

  // 模拟AI分析
  useEffect(() => {
    const analyzeNote = async () => {
      setLoading(true)
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟AI分析结果
      const mockSuggestion = {
        category: categories[1]?.name || '学习', // 默认选择学习分类
        folder: 'AI技术',
        tags: ['人工智能', '技术', '学习笔记']
      }
      
      setSuggestion(mockSuggestion)
      
      // 设置默认选择
      const category = categories.find(c => c.name === mockSuggestion.category)
      if (category) {
        setSelectedCategory(category.id)
        
        // 查找或创建文件夹
        const existingFolder = folders.find(f => 
          f.name === mockSuggestion.folder && f.category_id === category.id
        )
        
        if (existingFolder) {
          setSelectedFolder(existingFolder.id)
        } else {
          setNewFolderName(mockSuggestion.folder)
        }
      }
      
      // 设置建议的标签
      setSelectedTags(mockSuggestion.tags)
      
      setLoading(false)
    }

    analyzeNote()
  }, [noteData, categories, folders])

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedFolder('')
    setNewFolderName('')
  }

  const handleAddTag = () => {
    if (newTagName.trim() && !selectedTags.includes(newTagName.trim())) {
      setSelectedTags([...selectedTags, newTagName.trim()])
      setNewTagName('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    const category = categories.find(c => c.id === selectedCategory)
    let folderId = selectedFolder
    
    // 如果需要创建新文件夹
    if (!folderId && newFolderName.trim()) {
      // 这里应该调用API创建文件夹，现在模拟一个ID
      folderId = `new_folder_${Date.now()}`
    }
    
    const aiSuggestion = {
      category_id: selectedCategory,
      folder_id: folderId,
      tags: selectedTags.map(tagName => {
        // 查找现有标签或创建新标签
        const existingTag = tags.find(t => t.name === tagName)
        return existingTag || { id: `new_tag_${Date.now()}_${tagName}`, name: tagName }
      })
    }
    
    onSave(aiSuggestion)
  }

  const categoryFolders = folders.filter(f => f.category_id === selectedCategory)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="eva-panel w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary eva-glow" />
            <h3 className="text-lg font-semibold">AI智能归档</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">AI正在分析笔记内容...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI建议展示 */}
            {suggestion && (
              <div className="eva-panel p-4 bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI建议</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">分类：</span>{suggestion.category}</p>
                  <p><span className="text-muted-foreground">文件夹：</span>{suggestion.folder}</p>
                  <p><span className="text-muted-foreground">标签：</span>{suggestion.tags.join(', ')}</p>
                </div>
              </div>
            )}

            {/* 分类选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">选择分类</label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="eva-input">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 文件夹选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">选择文件夹</label>
              {categoryFolders.length > 0 && (
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="eva-input mb-2">
                    <SelectValue placeholder="选择现有文件夹" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryFolders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder="或创建新文件夹"
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value)
                    setSelectedFolder('')
                  }}
                  className="eva-input"
                />
              </div>
            </div>

            {/* 标签管理 */}
            <div>
              <label className="block text-sm font-medium mb-2">标签</label>
              
              {/* 已选标签 */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* 添加新标签 */}
              <div className="flex gap-2">
                <Input
                  placeholder="添加标签"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="eva-input"
                />
                <Button onClick={handleAddTag} size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4">
              <Button onClick={onCancel} variant="outline" className="flex-1">
                取消
              </Button>
              <Button 
                onClick={handleSave} 
                className="eva-button flex-1"
                disabled={!selectedCategory || (!selectedFolder && !newFolderName.trim())}
              >
                <Check className="w-4 h-4 mr-2" />
                确认保存
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AISuggestionModal

