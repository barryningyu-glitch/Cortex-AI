import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Shield, 
  Database, 
  Activity, 
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle2,
  XCircle,
  Crown,
  User,
  Calendar,
  BarChart3,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Progress } from '@/components/ui/progress.jsx'

const AdminPage = ({ currentUser }) => {
  const [users, setUsers] = useState([])
  const [systemStats, setSystemStats] = useState({
    total_users: 0,
    active_users: 0,
    total_notes: 0,
    total_tasks: 0,
    ai_requests_today: 0,
    storage_used: 0,
    uptime: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)

  // 新用户表单
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    is_superuser: false,
    is_active: true
  })

  // 用户编辑表单
  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
    is_superuser: false,
    is_active: true
  })

  // 初始化
  useEffect(() => {
    if (currentUser?.is_superuser) {
      loadUsers()
      loadSystemStats()
    }
  }, [currentUser])

  // 加载用户列表
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('加载用户列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 加载系统统计
  const loadSystemStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // 模拟系统统计数据
      const mockStats = {
        total_users: users.length || 5,
        active_users: users.filter(u => u.is_active).length || 4,
        total_notes: 156,
        total_tasks: 89,
        ai_requests_today: 234,
        storage_used: 45.6, // MB
        uptime: 72 // hours
      }
      
      setSystemStats(mockStats)
    } catch (error) {
      console.error('加载系统统计失败:', error)
    }
  }

  // 创建用户
  const createUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      })
      
      if (response.ok) {
        await loadUsers()
        setShowCreateUser(false)
        setNewUser({
          username: '',
          email: '',
          password: '',
          is_superuser: false,
          is_active: true
        })
      }
    } catch (error) {
      console.error('创建用户失败:', error)
    }
  }

  // 更新用户
  const updateUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editUser)
      })
      
      if (response.ok) {
        await loadUsers()
        setShowUserModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('更新用户失败:', error)
    }
  }

  // 删除用户
  const deleteUser = async (userId) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }

  // 切换用户状态
  const toggleUserStatus = async (userId, isActive) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !isActive })
      })
      
      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error('切换用户状态失败:', error)
    }
  }

  // 查看用户详情
  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setEditUser({
      username: user.username,
      email: user.email || '',
      is_superuser: user.is_superuser,
      is_active: user.is_active
    })
    setShowUserModal(true)
  }

  // 过滤用户
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 检查是否为超级用户
  if (!currentUser?.is_superuser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">访问受限</h2>
          <p className="text-muted-foreground">您需要超级用户权限才能访问管理面板</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="eva-panel m-2 lg:m-4 mb-1 lg:mb-2 p-3 lg:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 lg:gap-3 flex-1">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg lg:text-xl font-bold truncate">系统管理</h2>
              <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">管理用户、监控系统状态</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadUsers()
                loadSystemStats()
              }}
              disabled={isLoading}
              className="px-2 lg:px-4"
            >
              <RefreshCw className={`w-3 h-3 lg:w-4 lg:h-4 ${isLoading ? 'animate-spin' : ''} lg:mr-2`} />
              <span className="hidden lg:inline">刷新</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 管理内容 */}
      <div className="flex-1 eva-panel m-2 lg:m-4 mt-1 lg:mt-2 overflow-y-auto">
        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-0">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">
              <Activity className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline lg:inline">系统概览</span>
              <span className="sm:hidden lg:hidden">概览</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs lg:text-sm">
              <Users className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline lg:inline">用户管理</span>
              <span className="sm:hidden lg:hidden">用户</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs lg:text-sm">
              <Database className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline lg:inline">数据管理</span>
              <span className="sm:hidden lg:hidden">数据</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs lg:text-sm">
              <Server className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
              <span className="hidden sm:inline lg:inline">系统监控</span>
              <span className="sm:hidden lg:hidden">监控</span>
            </TabsTrigger>
          </TabsList>

          {/* 系统概览 */}
          <TabsContent value="overview" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
              <Card>
                <CardContent className="p-3 lg:p-4 text-center">
                  <div className="text-lg lg:text-2xl font-bold text-blue-600">{systemStats.total_users}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">总用户数</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 lg:p-4 text-center">
                  <div className="text-lg lg:text-2xl font-bold text-green-600">{systemStats.active_users}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">活跃用户</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 lg:p-4 text-center">
                  <div className="text-lg lg:text-2xl font-bold text-purple-600">{systemStats.total_notes}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">总笔记数</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3 lg:p-4 text-center">
                  <div className="text-lg lg:text-2xl font-bold text-orange-600">{systemStats.ai_requests_today}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">今日AI请求</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <HardDrive className="w-4 h-4 lg:w-5 lg:h-5" />
                    存储使用情况
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    <div>
                      <div className="flex justify-between text-xs lg:text-sm mb-1 lg:mb-2">
                        <span>数据库</span>
                        <span>{systemStats.storage_used} MB / 1 GB</span>
                      </div>
                      <Progress value={(systemStats.storage_used / 1024) * 100} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs lg:text-sm mb-1 lg:mb-2">
                        <span>文件存储</span>
                        <span>23.4 MB / 500 MB</span>
                      </div>
                      <Progress value={4.68} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Cpu className="w-4 h-4 lg:w-5 lg:h-5" />
                    系统状态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm">系统运行时间</span>
                      <span className="text-xs lg:text-sm">{systemStats.uptime} 小时</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm">数据库状态</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle2 className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                        正常
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm">API状态</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle2 className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                        正常
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 用户管理 */}
          <TabsContent value="users" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            {/* 用户操作栏 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 lg:gap-4 flex-1">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="eva-input pl-8 lg:pl-10 w-full sm:w-48 lg:w-64"
                  />
                </div>
              </div>
              
              <Button
                onClick={() => setShowCreateUser(true)}
                className="eva-button"
                size="sm"
              >
                <Plus className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
                <span className="lg:inline">新建用户</span>
              </Button>
            </div>

            {/* 用户列表 */}
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">用户列表 ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 lg:space-y-3">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 lg:p-3 rounded border gap-3">
                      <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          {user.is_superuser ? (
                            <Crown className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
                          ) : (
                            <User className="w-4 h-4 lg:w-5 lg:h-5" />
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
                            <span className="font-medium text-sm lg:text-base truncate">{user.username}</span>
                            {user.is_superuser && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                超级用户
                              </Badge>
                            )}
                            {!user.is_active && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                                已禁用
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs lg:text-sm text-muted-foreground truncate">
                            <span className="hidden sm:inline">{user.email || '未设置邮箱'} · </span>
                            注册于 {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewUserDetails(user)}
                          className="p-1 lg:p-2"
                        >
                          <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`p-1 lg:p-2 ${user.is_active ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {user.is_active ? <Ban className="w-3 h-3 lg:w-4 lg:h-4" /> : <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />}
                        </Button>
                        
                        {user.id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 p-1 lg:p-2"
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-6 lg:py-8 text-muted-foreground text-sm lg:text-base">
                      {searchTerm ? '未找到匹配的用户' : '暂无用户'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="text-base lg:text-lg">数据备份</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    定期备份系统数据以确保数据安全
                  </p>
                  
                  <div className="space-y-2">
                    <Button className="w-full eva-button" size="sm">
                      <Download className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
                      <span className="text-xs lg:text-sm">导出所有数据</span>
                    </Button>
                    
                    <Button variant="outline" className="w-full" size="sm">
                      <Upload className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-2" />
                      <span className="text-xs lg:text-sm">导入数据</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="text-base lg:text-lg">数据清理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    清理过期或无用的数据以优化性能
                  </p>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full text-xs lg:text-sm" size="sm">
                      清理过期会话
                    </Button>
                    
                    <Button variant="outline" className="w-full text-xs lg:text-sm" size="sm">
                      清理临时文件
                    </Button>
                    
                    <Button variant="outline" className="w-full text-red-600 text-xs lg:text-sm" size="sm">
                      清理已删除用户数据
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 系统监控 */}
          <TabsContent value="system" className="space-y-4 lg:space-y-6 p-3 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="text-base lg:text-lg">API使用统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm">今日请求数</span>
                      <span className="font-medium text-xs lg:text-sm">{systemStats.ai_requests_today}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm">平均响应时间</span>
                      <span className="font-medium text-xs lg:text-sm">245ms</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs lg:text-sm">成功率</span>
                      <span className="font-medium text-green-600 text-xs lg:text-sm">99.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="text-base lg:text-lg">错误日志</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs lg:text-sm">
                    <div className="p-2 bg-red-50 rounded text-red-800">
                      [ERROR] 2024-01-15 14:30 - API rate limit exceeded
                    </div>
                    <div className="p-2 bg-yellow-50 rounded text-yellow-800">
                      [WARN] 2024-01-15 12:15 - High memory usage detected
                    </div>
                    <div className="p-2 bg-blue-50 rounded text-blue-800">
                      [INFO] 2024-01-15 10:00 - System backup completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 用户详情/编辑弹窗 */}
      {showUserModal && selectedUser && (
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-sm lg:max-w-md mx-4">
            <DialogHeader className="pb-3 lg:pb-4">
              <DialogTitle className="text-base lg:text-lg">用户详情</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3 lg:space-y-4">
              <div>
                <label className="text-xs lg:text-sm font-medium">用户名</label>
                <Input
                  value={editUser.username}
                  onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                  className="eva-input mt-1 text-xs lg:text-sm"
                  size="sm"
                />
              </div>
              
              <div>
                <label className="text-xs lg:text-sm font-medium">邮箱</label>
                <Input
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="eva-input mt-1 text-xs lg:text-sm"
                  size="sm"
                />
              </div>
              
              <div className="flex items-center justify-between py-1">
                <label className="text-xs lg:text-sm font-medium">超级用户</label>
                <Switch
                  checked={editUser.is_superuser}
                  onCheckedChange={(checked) => setEditUser({...editUser, is_superuser: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between py-1">
                <label className="text-xs lg:text-sm font-medium">账户状态</label>
                <Switch
                  checked={editUser.is_active}
                  onCheckedChange={(checked) => setEditUser({...editUser, is_active: checked})}
                />
              </div>
              
              <div className="flex gap-2 pt-3 lg:pt-4">
                <Button onClick={updateUser} className="eva-button flex-1 text-xs lg:text-sm" size="sm">
                  保存更改
                </Button>
                <Button variant="outline" onClick={() => setShowUserModal(false)} className="flex-1 text-xs lg:text-sm" size="sm">
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 创建用户弹窗 */}
      {showCreateUser && (
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogContent className="max-w-sm lg:max-w-md mx-4">
            <DialogHeader className="pb-3 lg:pb-4">
              <DialogTitle className="text-base lg:text-lg">创建新用户</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3 lg:space-y-4">
              <div>
                <label className="text-xs lg:text-sm font-medium">用户名</label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="输入用户名"
                  className="eva-input mt-1 text-xs lg:text-sm"
                  size="sm"
                />
              </div>
              
              <div>
                <label className="text-xs lg:text-sm font-medium">邮箱</label>
                <Input
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="输入邮箱地址"
                  className="eva-input mt-1 text-xs lg:text-sm"
                  size="sm"
                />
              </div>
              
              <div>
                <label className="text-xs lg:text-sm font-medium">密码</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="输入密码"
                  className="eva-input mt-1 text-xs lg:text-sm"
                  size="sm"
                />
              </div>
              
              <div className="flex items-center justify-between py-1">
                <label className="text-xs lg:text-sm font-medium">超级用户</label>
                <Switch
                  checked={newUser.is_superuser}
                  onCheckedChange={(checked) => setNewUser({...newUser, is_superuser: checked})}
                />
              </div>
              
              <div className="flex gap-2 pt-3 lg:pt-4">
                <Button onClick={createUser} className="eva-button flex-1 text-xs lg:text-sm" size="sm">
                  创建用户
                </Button>
                <Button variant="outline" onClick={() => setShowCreateUser(false)} className="flex-1 text-xs lg:text-sm" size="sm">
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default AdminPage

