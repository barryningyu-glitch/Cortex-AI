import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/gundam-theme.css';
import LoginPage from './components/Auth/LoginPage';
import UserManagement from './components/Admin/UserManagement';
import ThemeProvider from './components/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';

// 导入各个模块组件
import NotesPage from './components/Notes/NotesPage';
import TodoPage from './components/Todo/TodoPage';
import ChatPage from './components/Chat/ChatPage';
import PomodoroPage from './components/Pomodoro/PomodoroPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的token
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(token);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token验证失败:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    setIsAuthenticated(true);
    verifyToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">⟳</div>
        <p>正在加载...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'notes':
        return <NotesPage />;
      case 'todo':
        return <TodoPage />;
      case 'chat':
        return <ChatPage />;
      case 'pomodoro':
        return <PomodoroPage />;
      case 'users':
        return user?.is_superuser ? <UserManagement token={token} /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const Dashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>
            <span className="logo-icon">⚡</span>
            Cortex AI Workspace
          </h1>
          <p>欢迎来到智能工作台 - 您的第二大脑</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="feature-card" onClick={() => setCurrentPage('notes')}>
          <div className="card-icon">📝</div>
          <h3>智能笔记</h3>
          <p>AI辅助的笔记管理</p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('todo')}>
          <div className="card-icon">✅</div>
          <h3>待办事项</h3>
          <p>智能任务规划</p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('chat')}>
          <div className="card-icon">🤖</div>
          <h3>AI对话</h3>
          <p>智能助手对话</p>
        </div>

        <div className="feature-card" onClick={() => setCurrentPage('pomodoro')}>
          <div className="card-icon">🍅</div>
          <h3>专注模式</h3>
          <p>番茄钟时间管理</p>
        </div>
      </div>

      <div className="dashboard-status">
        <div className="status-section">
          <h3>🔋 系统状态</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">AI服务</span>
              <span className="status-value online">🟢 在线</span>
            </div>
            <div className="status-item">
              <span className="status-label">数据库</span>
              <span className="status-value online">🟢 正常</span>
            </div>
            <div className="status-item">
              <span className="status-label">同步状态</span>
              <span className="status-value syncing">🟠 同步中</span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>⚡ 快速操作</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => setCurrentPage('notes')}>
              新建笔记 <span className="badge">9</span>
            </button>
            <button className="action-btn" onClick={() => setCurrentPage('todo')}>
              添加任务 <span className="badge">19</span>
            </button>
            <button className="action-btn" onClick={() => setCurrentPage('chat')}>
              开始对话 <span className="badge">11</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Cortex AI</span>
          </div>
        </div>

        <div className="nav-menu">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            工作台
            <span className="nav-badge">1</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'notes' ? 'active' : ''}`}
            onClick={() => setCurrentPage('notes')}
          >
            <span className="nav-icon">📝</span>
            笔记
            <span className="nav-badge">2</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'todo' ? 'active' : ''}`}
            onClick={() => setCurrentPage('todo')}
          >
            <span className="nav-icon">✅</span>
            待办
            <span className="nav-badge">5</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentPage('chat')}
          >
            <span className="nav-icon">🤖</span>
            对话
            <span className="nav-badge">4</span>
          </button>

          <button 
            className={`nav-item ${currentPage === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setCurrentPage('pomodoro')}
          >
            <span className="nav-icon">🍅</span>
            专注
            <span className="nav-badge">5</span>
          </button>

          {user?.is_superuser && (
            <button 
              className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              <span className="nav-icon">👥</span>
              用户管理
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <div className="user-name">{user?.full_name || user?.username}</div>
              <div className="user-role">
                {user?.is_superuser ? '超级用户' : '普通用户'}
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h2 className="page-title">
              {currentPage === 'dashboard' && '工作台'}
              {currentPage === 'notes' && '智能笔记'}
              {currentPage === 'todo' && '待办事项'}
              {currentPage === 'chat' && 'AI对话'}
              {currentPage === 'pomodoro' && '专注番茄钟'}
              {currentPage === 'users' && '用户管理'}
            </h2>
          </div>
          <div className="top-bar-right">
            <ThemeToggle />
            <div className="status-indicator">
              <span className="status-dot online"></span>
              <span>AI在线</span>
            </div>
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
}

export default App;

