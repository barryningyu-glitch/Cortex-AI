#!/bin/bash

# Cortex AI Workspace - Vercel 一键部署脚本
# 使用方法: ./deploy-to-vercel.sh

echo "🚀 Cortex AI Workspace - Vercel 部署工具"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Vercel CLI
echo "📋 检查 Vercel CLI..."
if ! command -v vercel > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Vercel CLI 未安装，正在安装...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Vercel CLI 安装失败，请手动安装: npm install -g vercel${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Vercel CLI 已安装${NC}"

# 检查登录状态
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  需要先登录 Vercel${NC}"
    echo "请访问: https://vercel.com/login"
    echo "然后运行: vercel login"

    read -p "按回车键继续登录，或输入 'skip' 跳过: " choice
    if [ "$choice" != "skip" ]; then
        vercel login
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 登录失败${NC}"
            exit 1
        fi
    fi
fi

echo -e "${GREEN}✅ Vercel 登录状态正常${NC}"

# 检查项目文件
echo "📁 检查项目文件..."
required_files=("dist" "vercel.json" ".env.production")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -e "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}❌ 缺少必要文件: ${missing_files[*]}${NC}"
    echo "请确保所有文件都在当前目录中"
    exit 1
fi

echo -e "${GREEN}✅ 所有必要文件都存在${NC}"

# 显示当前配置
echo "⚙️  当前配置:"
echo "   - API 基础路径: $(grep VITE_API_BASE_URL .env.production | cut -d'=' -f2)"
echo "   - 输出目录: dist"
echo "   - 框架: 预构建静态文件"

# 确认部署
echo ""
echo "🚀 准备部署到 Vercel..."
echo "目标项目: cortex-ai-black"
echo ""
read -p "确认部署? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "📤 开始部署..."

    # 执行部署
    vercel --prod --name cortex-ai-black

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 部署成功！${NC}"
        echo "🔗 访问地址: https://cortex-ai-black.vercel.app"
        echo ""
        echo "📋 部署后检查清单:"
        echo "   1. 访问网站确认页面加载正常"
        echo "   2. 测试登录功能"
        echo "   3. 检查 API 调用是否正常"
        echo ""
        echo "⚠️  注意: 由于后端在本地网络，API 功能可能受限"
        echo "建议查看 DEPLOY_GUIDE.md 了解解决方案"
    else
        echo -e "${RED}❌ 部署失败${NC}"
        echo "请查看错误信息并参考 VERCEL_DEPLOY.md"
        exit 1
    fi
else
    echo -e "${YELLOW}⏹️  部署已取消${NC}"
    exit 0
fi

echo ""
echo "✨ 部署工具完成！"
echo "如需帮助，请查看 VERCEL_DEPLOY.md"