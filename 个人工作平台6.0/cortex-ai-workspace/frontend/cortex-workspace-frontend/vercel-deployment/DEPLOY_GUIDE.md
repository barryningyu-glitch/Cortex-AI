# Cortex AI Workspace - Vercel 部署指南

## 🚀 快速部署步骤

### 1. 本地准备
```bash
# 确保已在 frontend/cortex-workspace-frontend 目录
npm run build
```

### 2. Vercel 部署选项

#### 选项 A: 使用 Vercel CLI 部署
```bash
# 如果未登录，先登录
vercel login

# 部署到现有项目
vercel --prod --name cortex-ai-black
```

#### 选项 B: 使用 GitHub 集成部署
1. 将代码推送到 GitHub
2. 在 Vercel 控制台连接 GitHub 仓库
3. 自动部署

### 3. 环境变量配置
在 Vercel 控制台设置以下环境变量：
```
VITE_API_BASE_URL=https://cortex-ai-black.vercel.app/api
```

## 📋 部署配置说明

### 文件结构
```
frontend/cortex-workspace-frontend/
├── dist/                   # 构建输出
├── vercel.json            # Vercel 配置
├── .env.production        # 生产环境变量
├── vite.config.js         # Vite 配置
└── DEPLOY_GUIDE.md        # 本指南
```

### API 代理配置
由于前端需要调用后端 API，我们配置了以下方案：

1. **相对路径**: 前端使用 `/api/` 路径
2. **Vercel Rewrites**: 将 `/api/*` 代理到后端服务器
3. **CORS 配置**: 添加了跨域支持

### 重要配置

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://172.17.14.59:8000/api/$1"
    }
  ]
}
```

#### .env.production
```
VITE_API_BASE_URL=/api
```

## 🔄 后端 API 说明

当前配置将 API 请求代理到本地服务器 `172.17.14.59:8000`，这只能在相同网络下工作。

### 解决方案

#### 方案 1: 部署后端到云端 (推荐)
将后端服务部署到 Render、Railway 或 Fly.io 等平台，然后更新代理地址。

#### 方案 2: 使用本地开发模式
保持当前配置，仅在本地网络环境中使用。

#### 方案 3: 使用 ngrok 临时暴露本地服务
```bash
# 安装 ngrok
npm install -g ngrok

# 暴露本地 8000 端口
ngrok http 8000

# 更新 vercel.json 中的代理地址
```

## ✅ 部署验证

部署完成后，访问 `https://cortex-ai-black.vercel.app` 并验证：

1. ✅ 页面正常加载
2. ✅ 登录功能工作
3. ✅ 所有 API 调用正常
4. ✅ 界面与本地版本一致

## 🔧 常见问题

### API 调用失败
- 检查网络连接
- 验证后端服务状态
- 检查 CORS 配置

### 页面空白
- 检查浏览器控制台错误
- 验证构建输出文件
- 检查路由配置

### 样式问题
- 确认 CSS 文件加载
- 检查静态资源路径

## 📞 技术支持

如需帮助，请检查：
1. 浏览器开发者工具控制台
2. Vercel 部署日志
3. 网络请求状态

---

*最后更新: 2025年9月20日*