#!/bin/bash

# Cortex AI Workspace - Vercel 部署脚本

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🔗 访问: https://cortex-ai-black.vercel.app"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi

echo "🎉 部署完成！"