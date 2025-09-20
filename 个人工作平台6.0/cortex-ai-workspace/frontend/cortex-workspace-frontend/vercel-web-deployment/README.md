# 🚀 Vercel 网页部署指南

## 📋 无需命令行的部署方法

### 方法 1: Vercel 拖拽部署 (30秒)

1. **访问 Vercel**
   - 打开浏览器访问 [vercel.com](https://vercel.com)
   - 使用 GitHub、GitLab 或邮箱登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Import Project"

3. **上传文件**
   - 拖拽整个 `dist` 文件夹到上传区域
   - 或者点击 "Upload" 选择 `dist` 文件夹

4. **配置项目**
   - Framework Preset: 选择 "Vite" 或 "Other"
   - Root Directory: `dist`
   - Build Command: 留空 (已预构建)
   - Output Directory: `dist`

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成 (通常 30-60 秒)

6. **访问网站**
   - 点击提供的 `.vercel.app` 链接
   - 应该能看到 "Cortex AI Workspace - 智能工作台"

### 方法 2: GitHub 集成部署

1. **创建 GitHub 仓库**
   ```bash
   # 本地初始化 git
   git init
   git add dist/
   git commit -m "Initial deployment"
   ```

2. **推送到 GitHub**
   - 在 GitHub 创建新仓库
   - 推送代码

3. **连接 Vercel**
   - 在 Vercel 点击 "New Project"
   - 选择 GitHub 仓库
   - 配置构建设置
   - 自动部署

## ⚙️ 项目配置

### 文件说明
```
vercel-web-deployment/
├── dist/                    # 构建好的前端文件
│   ├── index.html          # 主页面
│   ├── favicon.ico         # 网站图标
│   └── assets/             # CSS、JS 资源
├── vercel.json             # Vercel 配置
├── .env.production         # 环境变量
└── README.md               # 本说明
```

### 环境变量
```
VITE_API_BASE_URL=/api
```

### Vercel 配置
- **Build Command**: 无 (预构建)
- **Output Directory**: `dist`
- **Framework**: 静态网站
- **API 代理**: `/api/*` → 本地服务器

## 🎯 部署目标

**预期地址**: `https://cortex-ai-black.vercel.app`

## ✅ 部署验证

部署完成后，请检查：

1. **页面加载**
   - 访问提供的 `.vercel.app` 链接
   - 应该看到登录界面
   - 标题显示 "Cortex AI Workspace - 智能工作台"

2. **静态资源**
   - 检查 CSS 样式是否正确加载
   - 验证 JavaScript 文件是否存在
   - 确认图标显示正常

3. **基本功能**
   - 页面可以正常打开
   - 登录表单可见
   - 响应式设计工作正常

## ⚠️ 已知限制

由于后端 API 运行在本地网络 (`172.17.14.59:8000`)，部署后的网站会有以下限制：

- ✅ 页面展示正常
- ✅ 静态资源加载正常
- ❌ API 调用可能失败 (跨域/网络限制)
- ❌ 登录功能可能无法使用

## 🔧 解决方案

### 方案 1: ngrok 临时解决 (推荐)
```bash
# 安装 ngrok
npm install -g ngrok

# 暴露本地服务
ngrok http 8000

# 获得类似: https://abc123.ngrok.io
# 在 Vercel 控制台更新环境变量
```

### 方案 2: 完整云端部署
- 将后端部署到 Render/Railway/Fly.io
- 更新 API 地址
- 重新部署前端

### 方案 3: 本地开发模式
- 保持当前配置用于演示
- 在相同网络下访问功能完整

## 📞 获取帮助

如果部署遇到问题：

1. **检查文件**: 确认 `dist` 文件夹存在且包含文件
2. **查看日志**: 在 Vercel 控制台查看部署日志
3. **网络问题**: 确认网络连接正常
4. **浏览器调试**: 打开 F12 查看控制台错误

---

**🎉 准备好部署了吗？** 选择上面的方法开始吧！

预计部署时间: **30秒-2分钟**