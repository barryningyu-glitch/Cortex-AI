import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SimpleLogin from './components/Auth/SimpleLogin.jsx'
import NotesPage from './components/Notes/NotesPage.jsx'
import TodoPage from './components/Todo/TodoPage.jsx'
import ChatPage from './components/Chat/ChatPage.jsx'
import PomodoroPage from './components/Pomodoro/PomodoroPage.jsx'
import ThemeProvider from './components/ThemeProvider.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import FloatingChatButton from './components/FloatingChat/FloatingChatButton.jsx'
import FloatingPomodoroTimer from './components/FloatingPomodoro/FloatingPomodoroTimer.jsx'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('notes')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储中的登录状态
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  const handleLogin = (token) => {
    setIsAuthenticated(true)
    const user = JSON.parse(localStorage.getItem('user'))
    setCurrentUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <SimpleLogin onLogin={handleLogin} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="app">
        {/* 顶部导航栏 */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">Cortex AI</span>
            </div>
            <nav className="main-nav">
              <button 
                className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                📝 笔记
              </button>
              <button 
                className={`nav-item ${activeTab === 'todo' ? 'active' : ''}`}
                onClick={() => setActiveTab('todo')}
              >
                ✅ 任务
              </button>
              <button 
                className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                💬 AI聊天
              </button>
              <button 
                className={`nav-item ${activeTab === 'pomodoro' ? 'active' : ''}`}
                onClick={() => setActiveTab('pomodoro')}
              >
                🍅 番茄钟
              </button>
            </nav>
          </div>
          
          <div className="header-right">
            <ThemeToggle />
            <div className="user-menu">
              <span className="user-name">👋 {currentUser?.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                退出
              </button>
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="app-main">
          {activeTab === 'notes' && <NotesPage />}
          {activeTab === 'todo' && <TodoPage />}
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'pomodoro' && <PomodoroPage />}
        </main>

        {/* 全局浮动组件 */}
        <FloatingChatButton />
        <FloatingPomodoroTimer />

        {/* 演示标识 */}
        <div className="demo-badge">
          🚀 演示版本
        </div>

        {/* 功能提示 */}
        <div className="feature-hints">
          <div className="hint-item">
            💬 右下角：全局AI助手
          </div>
          <div className="hint-item">
            🍅 左下角：浮动番茄钟
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App

