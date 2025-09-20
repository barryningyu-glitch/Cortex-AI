# 🚀 Vercel 部署指南

## 📦 部署包内容

这个部署包包含：
- ✅ **构建好的前端文件** (`dist/` 目录)
- ✅ **Vercel 配置文件** (`vercel.json`)
- ✅ **环境变量配置** (`.env.production`)
- ✅ **部署说明** (本文件)

## 🎯 快速部署 (2分钟完成)

### 方法 1: 拖拽部署 (最简单)
1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "New Project"
3. 拖拽整个文件夹到上传区域
4. 等待自动部署完成
5. 访问生成的 URL

### 方法 2: 使用 Vercel CLI
```bash
# 1. 安装 Vercel CLI (如果未安装)
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到指定项目
vercel --prod --name cortex-ai-black
```

### 方法 3: Git 部署
```bash
# 1. 初始化 git (如果未初始化)
git init

# 2. 添加文件
git add .
git commit -m "Deploy to Vercel"

# 3. 连接 Vercel 项目
vercel --prod
```

## ⚙️ 配置说明

### API 配置
- **前端 API 路径**: `/api/*` (相对路径)
- **代理目标**: 本地服务器 `172.17.14.59:8000`
- **CORS**: 已配置跨域支持

### 环境变量
```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Cortex AI Workspace
VITE_APP_VERSION=1.0.0
```

## 🔧 部署后配置

### 1. 环境变量设置
在 Vercel 控制台 → Project Settings → Environment Variables:
```
VITE_API_BASE_URL=/api
```

### 2. 自定义域名 (可选)
- 在 Vercel 控制台添加自定义域名
- 配置 DNS 解析

### 3. 启用 HTTPS
- Vercel 自动提供 SSL 证书
- 所有部署都支持 HTTPS

## 🌐 访问地址

部署完成后，您将获得：
- **Vercel 域名**: `https://cortex-ai-black.vercel.app`
- **自定义域名**: (如果配置了)

## ⚠️ 重要提醒

### 当前限制
由于后端运行在本地网络，Vercel 部署的前端无法直接访问后端 API。

### 解决方案

#### 方案 A: 使用 ngrok (立即生效)
```bash
# 1. 安装 ngrok
npm install -g ngrok

# 2. 暴露本地服务
ngrok http 8000

# 3. 复制提供的 HTTPS URL
# 4. 更新 vercel.json 中的代理地址
```

#### 方案 B: 部署后端到云端 (推荐)
将后端部署到 Render、Railway、Fly.io 等平台。

#### 方案 C: 使用 Vercel Functions
将部分 API 逻辑迁移到 Vercel Edge Functions。

## 🐛 故障排除

### 部署失败
1. 检查文件完整性
2. 验证构建输出
3. 查看 Vercel 部署日志

### API 调用失败
1. 检查网络连接
2. 验证后端服务状态
3. 检查 CORS 配置

### 页面空白
1. 打开浏览器开发者工具
2. 检查控制台错误
3. 验证静态资源加载

## 📞 支持

如需帮助：
1. 检查浏览器控制台错误
2. 查看 Vercel 部署日志
3. 验证网络请求状态

---

**准备好了吗？** 选择上面的部署方法开始吧！ 🚀