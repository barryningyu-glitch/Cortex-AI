import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, Loader2, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { handleApiError } from '../../utils/errorHandler'

const LoginPageReal = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除错误信息
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('请输入用户名和密码')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login'
      
      let requestOptions = {
        method: 'POST'
      }
      
      // 登录和注册都使用JSON格式
      requestOptions.headers = {
        'Content-Type': 'application/json',
      }
      requestOptions.body = JSON.stringify({
        username: formData.username,
        password: formData.password
      })
      
      const response = await fetch(endpoint, requestOptions)

      const data = await response.json()

      if (response.ok) {
        if (isRegisterMode) {
          setError('')
          setIsRegisterMode(false)
          alert('注册成功！请登录')
        } else {
          // 登录成功，保存token和用户信息
          localStorage.setItem('token', data.access_token)
          localStorage.setItem('user', JSON.stringify(data.user))
          onLogin(data.user)
        }
      } else {
        const errorMessage = await handleApiError(response, isRegisterMode ? '注册失败' : '登录失败')
        setError(errorMessage)
      }
    } catch (error) {
      console.error('认证错误:', error)
      setError('网络错误，请检查后端服务是否正常运行')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto">
        {/* Logo和标题 */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Cortex AI</h1>
          <p className="text-sm sm:text-base text-muted-foreground">智能工作台</p>
        </div>

        <Card className="eva-panel shadow-lg">
          <CardHeader className="text-center pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              {isRegisterMode ? '注册账号' : '登录系统'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* 用户名输入 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="请输入用户名"
                    className="eva-input pl-10 h-11 sm:h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 密码输入 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="请输入密码"
                    className="eva-input pl-10 pr-10 h-11 sm:h-12 text-base"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 错误信息 */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 登录/注册按钮 */}
              <Button
                type="submit"
                className="eva-button w-full h-11 sm:h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isRegisterMode ? '注册中...' : '登录中...'}
                  </>
                ) : (
                  isRegisterMode ? '注册' : '登录'
                )}
              </Button>

              {/* 切换模式 */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode)
                    setError('')
                    setFormData({ username: '', password: '' })
                  }}
                  className="text-sm text-primary hover:underline transition-colors"
                  disabled={isLoading}
                >
                  {isRegisterMode ? '已有账号？点击登录' : '没有账号？点击注册'}
                </button>
              </div>


            </form>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground space-y-1">
          <p>Cortex AI Workspace v1.0</p>
          <p className="hidden sm:block">集成 GPT-5 • Gemini • Claude-4 • DeepSeek</p>
          <p className="sm:hidden">集成多种AI模型</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPageReal

