import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  CheckSquare, 
  MessageCircle, 
  Timer, 
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  Menu,
  X,
  BarChart3,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import LoginPageReal from './components/Auth/LoginPageReal.jsx'
import NotesPageFinal from './components/Notes/NotesPageFinal.jsx'
import TodoPageReal from './components/Todo/TodoPageReal.jsx'
import ChatPage from './components/Chat/ChatPage.jsx'
import PomodoroPage from './components/Pomodoro/PomodoroPage.jsx'
import SettingsPage from './components/Settings/SettingsPage.jsx'
import AnalyticsPage from './components/Analytics/AnalyticsPage.jsx'
import AdminPage from './components/Admin/AdminPage.jsx'
import FloatingChatButtonReal from './components/FloatingChat/FloatingChatButtonReal.jsx'
import FloatingPomodoroTimer from './components/FloatingPomodoro/FloatingPomodoroTimer.jsx'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notes')
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // 导航项配置
  const navigationItems = [
    { id: 'notes', name: '笔记', icon: FileText },
    { id: 'todo', name: '待办', icon: CheckSquare },
    { id: 'chat', name: '聊天', icon: MessageCircle },
    { id: 'pomodoro', name: '番茄钟', icon: Timer },
    { id: 'analytics', name: '分析', icon: BarChart3 },
    { id: 'settings', name: '设置', icon: Settings }
  ]

  // 初始化
  useEffect(() => {
    checkAuthStatus()
    loadTheme()
  }, [])

  // 检查登录状态
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  // 加载主题
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // 处理主题变化
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // 登录成功处理
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData)
  }

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('token')
    setCurrentUser(null)
    setActiveTab('notes')
  }

  // 渲染页面内容
  const renderPageContent = () => {
    switch (activeTab) {
      case 'notes':
        return <NotesPageFinal currentUser={currentUser} />
      case 'todo':
        return <TodoPageReal currentUser={currentUser} />
      case 'chat':
        return <ChatPage currentUser={currentUser} />
      case 'pomodoro':
        return <PomodoroPage currentUser={currentUser} />
      case 'analytics':
        return <AnalyticsPage currentUser={currentUser} />
      case 'settings':
        return <SettingsPage currentUser={currentUser} onThemeChange={handleThemeChange} />
      case 'admin':
        return <AdminPage currentUser={currentUser} />
      default:
        return <NotesPageFinal currentUser={currentUser} />
    }
  }

  // 加载中
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录
  if (!currentUser) {
    return <LoginPageReal onLogin={handleLoginSuccess} />
  }

  // 主应用界面
  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`eva-sidebar transition-all duration-300 flex flex-col z-50
        ${sidebarOpen 
          ? 'w-64 lg:w-64' 
          : 'w-0 lg:w-16'
        }
        ${sidebarOpen 
          ? 'fixed lg:relative left-0 top-0 h-full lg:h-auto' 
          : 'lg:relative'
        }
      `}>
        {/* 侧边栏头部 */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {(sidebarOpen || window.innerWidth >= 1024) && sidebarOpen && (
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
                  Cortex AI
                </h1>
                <p className="text-xs text-muted-foreground">智能工作台</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 p-0 flex-shrink-0"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* 导航菜单 */}
        <div className="flex-1 p-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium truncate">{item.name}</span>}
                </button>
              )
            })}
            
            {/* 管理员菜单 */}
            {currentUser?.is_superuser && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">管理</span>}
              </button>
            )}
          </nav>
        </div>

        {/* 侧边栏底部 */}
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            {/* 用户信息 */}
            {sidebarOpen && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.is_superuser ? '超级用户' : '普通用户'}
                  </p>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="flex-1"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {sidebarOpen && <span className="ml-2 text-xs">主题</span>}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="w-4 h-4" />
                {sidebarOpen && <span className="ml-2 text-xs">登出</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* 移动端顶部栏 */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 p-0"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">Cortex AI</h1>
          <div className="w-8 h-8" /> {/* 占位符保持居中 */}
        </div>
        
        <div className="flex-1 overflow-hidden">
          {renderPageContent()}
        </div>
      </div>

      {/* 全局浮动组件 */}
      <FloatingChatButtonReal currentUser={currentUser} />
      <FloatingPomodoroTimer currentUser={currentUser} />
    </div>
  )
}

export default App

