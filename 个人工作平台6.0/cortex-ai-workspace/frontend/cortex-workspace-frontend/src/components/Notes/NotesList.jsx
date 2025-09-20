import { FileText, Folder, Calendar } from 'lucide-react'

const NotesList = ({ notes, selectedNote, onSelectNote, folders, categories }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '今天'
    if (diffDays === 2) return '昨天'
    if (diffDays <= 7) return `${diffDays}天前`
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getFolderInfo = (folderId) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return { folderName: '未分类', categoryName: '其他' }
    
    const category = categories.find(c => c.id === folder.category_id)
    return {
      folderName: folder.name,
      categoryName: category?.name || '其他'
    }
  }

  const getPreviewText = (content) => {
    // 移除Markdown标记并获取预览文本
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/`(.*?)`/g, '$1') // 移除代码标记
      .replace(/\n+/g, ' ') // 替换换行为空格
      .trim()
    
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
  }

  // 按日期分组笔记
  const groupedNotes = notes.reduce((groups, note) => {
    const date = new Date(note.updated_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let groupKey
    if (date.toDateString() === today.toDateString()) {
      groupKey = '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = '昨天'
    } else {
      const diffTime = Math.abs(today - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 7) {
        groupKey = '本周'
      } else if (diffDays <= 30) {
        groupKey = '本月'
      } else {
        groupKey = '更早'
      }
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(note)
    return groups
  }, {})

  // 排序组
  const groupOrder = ['今天', '昨天', '本周', '本月', '更早']
  const sortedGroups = groupOrder.filter(group => groupedNotes[group])

  return (
    <div className="p-2">
      {sortedGroups.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">暂无笔记</p>
        </div>
      ) : (
        sortedGroups.map(groupName => (
          <div key={groupName} className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              {groupName}
            </h3>
            <div className="space-y-1">
              {groupedNotes[groupName].map(note => {
                const { folderName, categoryName } = getFolderInfo(note.folder_id)
                const isSelected = selectedNote?.id === note.id
                
                return (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground eva-glow'
                        : 'hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1 flex-1">
                        {note.title}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {getPreviewText(note.content)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Folder className="w-3 h-3" />
                        <span>{categoryName} / {folderName}</span>
                      </div>
                      
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag.id}
                              className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default NotesList

