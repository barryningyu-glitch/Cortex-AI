# 🚀 立即部署到 Vercel

## 超简单部署 (30秒完成)

### 步骤 1: 解压文件
```bash
tar -xzf cortex-ai-vercel-deployment.tar.gz
```

### 步骤 2: 一键部署
```bash
./deploy-to-vercel.sh
```

## 或者手动部署

### 使用 Vercel CLI
```bash
# 安装 Vercel CLI (仅需一次)
npm install -g vercel

# 登录 (仅需一次)
vercel login

# 部署到您的项目
vercel --prod --name cortex-ai-black
```

### 使用 Vercel 网页
1. 访问 [vercel.com](https://vercel.com)
2. 拖拽 `dist` 文件夹到上传区域
3. 完成！

---

**🎯 目标**: https://cortex-ai-black.vercel.app

**📞 遇到问题?** 查看 VERCEL_DEPLOY.md 获取详细帮助。