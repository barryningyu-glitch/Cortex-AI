# Cortex AI Workspace - 智能工作台

<div align="center">

![Cortex AI Workspace](https://img.shields.io/badge/Cortex-AI%20Workspace-00ff88?style=for-the-badge&logo=robot)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**您的第二大脑 - 智能工作台**

一个集成AI智能笔记、待办事项、对话助手和专注番茄钟的完整工作台系统

</div>

## ✨ 功能特性

### 🧠 智能笔记管理
- **完整的CRUD操作** - 创建、编辑、删除、查看笔记
- **Markdown编辑器** - 支持实时预览和语法高亮
- **AI智能归档** - 自动分析内容并推荐分类
- **AI文本润色** - 一键优化文本表达和质量
- **分层级组织** - 文件夹和标签管理系统

### ✅ 智能待办事项
- **多视图模式** - 看板、日历、列表三种视图
- **AI自然语言解析** - 智能识别任务信息
- **拖拽操作** - 直观的任务状态管理
- **项目分类** - 颜色标识和进度跟踪
- **智能提醒** - 截止日期和优先级管理

### 🤖 AI对话助手
- **多会话管理** - 支持多个独立对话
- **多模型支持** - GPT-4、GPT-3.5、Claude-3
- **快捷指令** - 预设模板快速开始
- **消息操作** - 复制、重新生成、评价、分享
- **上下文关联** - 智能记忆对话历史

### 🍅 专注番茄钟
- **三种专注模式** - 工作、短休息、长休息
- **5种主题配色** - EVA机甲、森林绿意等精美主题
- **统计分析** - 详细的专注数据和趋势
- **自定义设置** - 时间、声音、通知个性化
- **成就系统** - 专注徽章和连击记录

## 🎨 设计特色

### EVA/高达机甲风格
- **深色科技主题** - 专业的机甲风格界面
- **绿色发光效果** - 科技感十足的视觉体验
- **流畅动画** - 精心设计的交互动效
- **响应式布局** - 完美支持桌面和移动端

## 🚀 快速开始

### 环境要求
- Python 3.11+
- Node.js 18+
- OpenAI API Key

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-repo/cortex-ai-workspace.git
cd cortex-ai-workspace
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑环境变量
nano backend/.env
```

3. **安装依赖**
```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖
cd ../frontend/cortex-workspace-frontend
npm install
```

4. **启动服务**
```bash
# 启动后端 (终端1)
cd backend
python main.py

# 启动前端 (终端2)
cd frontend/cortex-workspace-frontend
npm run dev
```

5. **访问应用**
打开浏览器访问: http://localhost:5173

### Docker 部署

```bash
# 一键启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 📖 使用指南

### 智能笔记
1. 点击"新建笔记"创建笔记
2. 使用Markdown编辑器编写内容
3. 点击"AI归档"获取智能分类建议
4. 使用"AI润色"优化文本质量

### 待办事项
1. 点击"AI创建任务"使用自然语言输入
2. 在看板视图中拖拽任务改变状态
3. 使用日历视图查看时间安排
4. 在列表视图中批量管理任务

### AI对话
1. 点击"新建对话"开始聊天
2. 选择合适的AI模型
3. 使用快捷指令快速开始
4. 管理多个对话会话

### 专注番茄钟
1. 选择专注模式（工作/休息）
2. 点击开始按钮启动计时
3. 在设置中自定义时间和声音
4. 查看统计了解专注习惯

## 🛠️ 技术架构

### 后端技术栈
- **FastAPI** - 现代Python Web框架
- **SQLite** - 轻量级数据库
- **OpenAI API** - AI服务集成
- **Pydantic** - 数据验证和序列化

### 前端技术栈
- **React 18** - 现代前端框架
- **Vite** - 快速构建工具
- **自定义组件库** - 机甲风格UI组件
- **CSS3** - 现代样式和动画

### 部署架构
- **Docker** - 容器化部署
- **Nginx** - 反向代理和负载均衡
- **Docker Compose** - 服务编排

## 📊 项目统计

- **代码行数**: 10,000+ 行
- **组件数量**: 50+ 个
- **API接口**: 30+ 个
- **功能模块**: 4 个核心模块
- **开发周期**: 完整开发流程

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- OpenAI - 提供强大的AI服务
- React团队 - 优秀的前端框架
- FastAPI团队 - 现代的Python框架
- 所有开源贡献者

## 📞 联系我们

- 项目主页: [GitHub Repository](https://github.com/your-repo/cortex-ai-workspace)
- 问题反馈: [Issues](https://github.com/your-repo/cortex-ai-workspace/issues)
- 功能建议: [Discussions](https://github.com/your-repo/cortex-ai-workspace/discussions)

---

<div align="center">

**Cortex AI Workspace - 让AI成为您的智能工作伙伴**

Made with ❤️ by Cortex Team

</div>

