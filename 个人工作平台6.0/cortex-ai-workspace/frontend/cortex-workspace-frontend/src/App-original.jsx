import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './components/Auth/LoginPage';
import UserManagement from './components/Admin/UserManagement';

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
  const [theme, setTheme] = useState('dark'); // 主题状态

  useEffect(() => {
    // 检查本地存储的token和主题
    const savedToken = localStorage.getItem('token');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // 应用主题到body
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
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

  const handleLogin = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        
        // 获取用户信息
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        }
      } else {
        const error = await response.json();
        return { success: false, message: error.detail || '登录失败' };
      }
    } catch (error) {
      console.error('登录错误:', error);
      return { success: false, message: '网络错误，请稍后重试' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  // 主题切换按钮组件
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={`切换到${theme === 'dark' ? '浅色' : '深色'}模式`}
    >
      <span className="theme-icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      <span className="theme-text">
        {theme === 'dark' ? '浅色' : '深色'}
      </span>
    </button>
  );

  // Dashboard组件
  const Dashboard = () => (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>欢迎使用 Cortex AI Workspace</h1>
        <p>您的第二大脑 - AI驱动的智能工作空间</p>
      </div>

      <div className="modules-grid">
        <div className="module-card" onClick={() => setCurrentPage('notes')}>
          <div className="module-icon">📝</div>
          <h3>智能笔记</h3>
          <p>AI辅助的笔记管理系统，支持智能归档和文本润色</p>
          <div className="module-stats">2个笔记</div>
        </div>

        <div className="module-card" onClick={() => setCurrentPage('todo')}>
          <div className="module-icon">✅</div>
          <h3>待办事项</h3>
          <p>智能任务规划工具，支持看板视图和AI任务解析</p>
          <div className="module-stats">5个任务</div>
        </div>

        <div className="module-card" onClick={() => setCurrentPage('chat')}>
          <div className="module-icon">🤖</div>
          <h3>AI对话</h3>
          <p>多模型智能助手，支持GPT-4、DeepSeek等模型</p>
          <div className="module-stats">4个会话</div>
        </div>

        <div className="module-card" onClick={() => setCurrentPage('pomodoro')}>
          <div className="module-icon">🍅</div>
          <h3>专注模式</h3>
          <p>番茄钟时间管理工具，提升工作效率和专注力</p>
          <div className="module-stats">5个番茄钟</div>
        </div>
      </div>

      <div className="status-panel">
        <h3>系统状态</h3>
        <div className="status-items">
          <div className="status-item">
            <span className="status-dot online"></span>
            <span>AI服务：在线</span>
          </div>
          <div className="status-item">
            <span className="status-dot online"></span>
            <span>数据库：正常</span>
          </div>
          <div className="status-item">
            <span className="status-dot warning"></span>
            <span>同步状态：同步中</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>快速操作</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => setCurrentPage('notes')}>
            新建笔记 <span className="action-count">9个模板</span>
          </button>
          <button className="action-btn" onClick={() => setCurrentPage('todo')}>
            添加任务 <span className="action-count">19个快捷任务</span>
          </button>
          <button className="action-btn" onClick={() => setCurrentPage('chat')}>
            开始对话 <span className="action-count">11个对话模板</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'notes':
        return <NotesPage />;
      case 'todo':
        return <TodoPage />;
      case 'chat':
        return <ChatPage />;
      case 'pomodoro':
        return <PomodoroPage />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
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

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Cortex AI</span>
          </div>
        </div>

        <div className="sidebar-nav">
          <button 
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            🏠工作台
            <span className="nav-badge">1</span>
          </button>
          <button 
            className={currentPage === 'notes' ? 'active' : ''}
            onClick={() => setCurrentPage('notes')}
          >
            📝笔记
            <span className="nav-badge">2</span>
          </button>
          <button 
            className={currentPage === 'todo' ? 'active' : ''}
            onClick={() => setCurrentPage('todo')}
          >
            ✅待办
            <span className="nav-badge">5</span>
          </button>
          <button 
            className={currentPage === 'chat' ? 'active' : ''}
            onClick={() => setCurrentPage('chat')}
          >
            🤖对话
            <span className="nav-badge">4</span>
          </button>
          <button 
            className={currentPage === 'pomodoro' ? 'active' : ''}
            onClick={() => setCurrentPage('pomodoro')}
          >
            🍅专注
            <span className="nav-badge">5</span>
          </button>
          {user && user.is_superuser && (
            <button 
              className={currentPage === 'users' ? 'active' : ''}
              onClick={() => setCurrentPage('users')}
            >
              👥用户管理
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username || '用户'}</div>
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

