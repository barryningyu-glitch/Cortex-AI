import React, { useState, useEffect } from 'react'
import { Sun, Moon, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx'

// 组件导入
import LoginPageReal from './components/Auth/LoginPageReal.jsx'
import NotesPage from './components/Notes/NotesPage.jsx'
import TodoPage from './components/Todo/TodoPage.jsx'
import ChatPage from './components/Chat/ChatPage.jsx'
import PomodoroPage from './components/Pomodoro/PomodoroPage.jsx'
import FloatingChatButton from './components/FloatingChat/FloatingChatButton.jsx'
import FloatingPomodoroTimer from './components/FloatingPomodoro/FloatingPomodoroTimer.jsx'
import ThemeProvider from './components/ThemeProvider.jsx'

// 样式
import './App.css'
import './styles/gundam-theme.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notes')
  const [theme, setTheme] = useState('dark')

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        // 验证token是否有效
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          setCurrentUser(userData)
        } else {
          // Token无效，清除本地存储
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      // 网络错误时，如果有本地用户信息，仍然允许离线使用
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser))
        } catch (e) {
          localStorage.removeItem('user')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setActiveTab('notes')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    )
  }

  // 未登录状态
  if (!currentUser) {
    return (
      <ThemeProvider>
        <LoginPageReal onLogin={handleLogin} />
      </ThemeProvider>
    )
  }

  // 已登录状态
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* 顶部导航栏 */}
        <header className="eva-panel border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-primary">Cortex AI</h1>
              <div className="text-sm text-muted-foreground">
                智能工作台
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 主题切换 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {/* 用户菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{currentUser.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="h-[calc(100vh-73px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="eva-panel m-4 mb-0">
              <TabsTrigger value="notes">📝 笔记</TabsTrigger>
              <TabsTrigger value="todo">✅ 待办</TabsTrigger>
              <TabsTrigger value="chat">💬 AI聊天</TabsTrigger>
              <TabsTrigger value="pomodoro">🍅 番茄钟</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="h-[calc(100%-3rem)] m-0">
              <NotesPage currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="todo" className="h-[calc(100%-3rem)] m-0">
              <TodoPage currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="chat" className="h-[calc(100%-3rem)] m-0">
              <ChatPage currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="pomodoro" className="h-[calc(100%-3rem)] m-0">
              <PomodoroPage currentUser={currentUser} />
            </TabsContent>
          </Tabs>
        </main>

        {/* 全局浮动组件 */}
        <FloatingChatButton currentUser={currentUser} />
        <FloatingPomodoroTimer />

        {/* 功能提示 */}
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg p-2 border border-border">
          <div className="flex items-center gap-4">
            <span>💬 右下角：全局AI助手</span>
            <span>🍅 左下角：浮动番茄钟</span>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App

