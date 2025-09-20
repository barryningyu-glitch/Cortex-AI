import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    is_superuser: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const user = await response.json();
        setUsers([...users, user]);
        setNewUser({
          username: '',
          email: '',
          full_name: '',
          password: '',
          is_superuser: false
        });
        setShowAddUser(false);
      } else {
        const error = await response.json();
        alert(error.detail || '添加用户失败');
      }
    } catch (error) {
      console.error('添加用户失败:', error);
      alert('添加用户失败');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
        } else {
          const error = await response.json();
          alert(error.detail || '删除用户失败');
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败');
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.id === userId ? updatedUser : user
        ));
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>用户管理</h2>
        <button 
          className="add-user-btn"
          onClick={() => setShowAddUser(true)}
        >
          + 添加用户
        </button>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="header-cell">用户名</div>
          <div className="header-cell">邮箱</div>
          <div className="header-cell">姓名</div>
          <div className="header-cell">角色</div>
          <div className="header-cell">状态</div>
          <div className="header-cell">创建时间</div>
          <div className="header-cell">最后登录</div>
          <div className="header-cell">操作</div>
        </div>

        {users.map(user => (
          <div key={user.id} className="table-row">
            <div className="table-cell">
              <span className="username">{user.username}</span>
            </div>
            <div className="table-cell">{user.email}</div>
            <div className="table-cell">{user.full_name || '-'}</div>
            <div className="table-cell">
              <span className={`role-badge ${user.is_superuser ? 'super' : 'normal'}`}>
                {user.is_superuser ? '超级用户' : '普通用户'}
              </span>
            </div>
            <div className="table-cell">
              <button
                className={`status-btn ${user.is_active ? 'active' : 'inactive'}`}
                onClick={() => toggleUserStatus(user.id, user.is_active)}
              >
                {user.is_active ? '启用' : '禁用'}
              </button>
            </div>
            <div className="table-cell">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
            <div className="table-cell">
              {user.last_login ? new Date(user.last_login).toLocaleDateString() : '从未登录'}
            </div>
            <div className="table-cell">
              <button
                className="delete-btn"
                onClick={() => handleDeleteUser(user.id, user.username)}
                disabled={user.is_superuser}
                title={user.is_superuser ? '不能删除超级用户' : '删除用户'}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddUser && (
        <div className="modal-overlay">
          <div className="add-user-modal">
            <div className="modal-header">
              <h3>添加新用户</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddUser(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-group">
                <label>用户名 *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>邮箱 *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>密码 *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newUser.is_superuser}
                    onChange={(e) => setNewUser({...newUser, is_superuser: e.target.checked})}
                  />
                  超级用户权限
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddUser(false)}>
                  取消
                </button>
                <button type="submit" className="primary">
                  添加用户
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

