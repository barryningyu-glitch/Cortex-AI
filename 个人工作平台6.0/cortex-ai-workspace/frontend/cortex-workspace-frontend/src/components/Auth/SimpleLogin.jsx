import React, { useState } from 'react'
import './LoginPage.css'

const SimpleLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 简化的登录逻辑 - 直接模拟成功登录
    if (formData.username && formData.password) {
      // 模拟API调用延迟
      setTimeout(() => {
        // 创建一个模拟的token
        const mockToken = 'mock-jwt-token-' + Date.now()
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          username: formData.username,
          email: formData.username + '@example.com'
        }))
        onLogin(mockToken)
        setLoading(false)
      }, 1000)
    } else {
      setError('请输入用户名和密码')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="circuit-pattern"></div>
        <div className="glow-effects"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Cortex AI</span>
          </div>
          <h1>智能工作台</h1>
          <p>您的第二大脑 - AI驱动的智能工作空间</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入任意用户名"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入任意密码"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <div className="feature-indicator">
            <span className="indicator active">AI服务就绪</span>
            <span className="indicator active">数据库正常</span>
          </div>
        </div>

        <div className="demo-notice">
          <p>🚀 演示版本 - 输入任意用户名和密码即可登录</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleLogin

