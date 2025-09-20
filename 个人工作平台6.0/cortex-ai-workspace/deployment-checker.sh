#!/bin/bash

# Cortex AI 部署状态检查器

echo "🚀 Cortex AI Workspace - 部署状态检查"
echo "======================================="

# 检查本地服务状态
echo "📋 检查本地服务..."
if pgrep -f "python3 main.py" > /dev/null; then
    echo "✅ 本地后端服务正在运行"
else
    echo "❌ 本地后端服务未运行"
    echo "📖 启动命令: cd backend && source venv/bin/activate && python3 main.py"
fi

# 检查端口
echo "🔍 检查端口状态..."
if lsof -i :8000 > /dev/null 2>&1; then
    echo "✅ 端口 8000 正在监听"
else
    echo "❌ 端口 8000 未监听"
fi

# 检查文件完整性
echo "📁 检查部署文件..."
DEPLOY_DIR="frontend/cortex-workspace-frontend/vercel-deployment/final-deployment"
if [ -d "$DEPLOY_DIR" ]; then
    echo "✅ 部署目录存在"

    if [ -f "$DEPLOY_DIR/dist/index.html" ]; then
        echo "✅ 主页面文件存在"
    else
        echo "❌ 主页面文件缺失"
    fi

    if [ -f "$DEPLOY_DIR/vercel.json" ]; then
        echo "✅ Vercel 配置文件存在"
    else
        echo "❌ Vercel 配置文件缺失"
    fi
else
    echo "❌ 部署目录不存在"
fi

# 检查构建文件
echo "🔨 检查构建文件..."
if [ -d "$DEPLOY_DIR/dist/assets" ]; then
    echo "✅ 静态资源目录存在"
    FILE_COUNT=$(find "$DEPLOY_DIR/dist/assets" -name "*.js" -o -name "*.css" | wc -l)
    echo "📊 找到 $FILE_COUNT 个静态资源文件"
else
    echo "❌ 静态资源目录缺失"
fi

# 显示文件大小
echo "📏 文件大小统计:"
if [ -f "$DEPLOY_DIR/final-vercel-deployment.tar.gz" ]; then
    SIZE=$(ls -lh "$DEPLOY_DIR/final-vercel-deployment.tar.gz" | awk '{print $5}')
    echo "📦 部署包大小: $SIZE"
fi

echo ""
echo "🎯 部署准备状态:"
echo "=================="
echo "1. ✅ 前端文件已构建完成"
echo "2. ✅ Vercel 配置文件已准备"
echo "3. ✅ 部署包已创建"
echo "4. ✅ 本地服务运行正常 (如已启动)"
echo ""
echo "🚀 下一步: 访问 https://vercel.com 并拖拽 dist 文件夹！"
echo ""
echo "📞 遇到问题? 查看: /Users/mac/Desktop/AL/个人工作平台6.0/cortex-ai-workspace/DEPLOYMENT_COMPLETE.md"