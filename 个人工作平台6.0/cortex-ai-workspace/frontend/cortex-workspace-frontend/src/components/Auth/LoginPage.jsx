import React, { useState } from 'react';
import './LoginPage.css';
import { handleApiError } from '../../utils/errorHandler';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        onLogin(data.access_token);
      } else {
        const errorMessage = await handleApiError(response, '登录失败');
        setError(errorMessage);
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="请输入用户名"
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
              placeholder="请输入密码"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">⟳</span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="system-info">
            <div className="info-item">
              <span className="status-dot online"></span>
              <span>AI服务在线</span>
            </div>
            <div className="info-item">
              <span className="status-dot online"></span>
              <span>数据库正常</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

