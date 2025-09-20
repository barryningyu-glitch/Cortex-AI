# Cortex AI Workspace 部署指南

## 项目概述

Cortex AI Workspace 是一个完整的AI智能工作台，包含以下核心模块：
- 智能笔记管理
- 智能待办事项
- AI对话助手
- 专注番茄钟

## 技术架构

### 后端
- **框架**: FastAPI
- **数据库**: SQLite
- **AI服务**: OpenAI API
- **端口**: 8000

### 前端
- **框架**: React + Vite
- **UI库**: 自定义组件库
- **主题**: EVA/高达机甲风格
- **端口**: 5173/5174/5175

## 部署步骤

### 1. 环境准备

```bash
# 安装Python依赖
cd backend
pip install -r requirements.txt

# 安装Node.js依赖
cd ../frontend/cortex-workspace-frontend
npm install
```

### 2. 环境变量配置

创建 `backend/.env` 文件：
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1
DATABASE_URL=sqlite:///./cortex_workspace.db
SECRET_KEY=your_secret_key_here
```

### 3. 数据库初始化

```bash
cd backend
python main.py
# 数据库会自动创建
```

### 4. 启动服务

#### 开发环境
```bash
# 启动后端
cd backend
python main.py

# 启动前端
cd frontend/cortex-workspace-frontend
npm run dev
```

#### 生产环境
```bash
# 构建前端
cd frontend/cortex-workspace-frontend
npm run build

# 启动后端（生产模式）
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 功能特性

### 智能笔记模块
- ✅ 完整的CRUD操作
- ✅ Markdown编辑器
- ✅ AI智能归档
- ✅ AI文本润色
- ✅ 分层级组织

### 智能待办事项模块
- ✅ 看板视图
- ✅ 日历视图
- ✅ 列表视图
- ✅ AI自然语言解析
- ✅ 拖拽功能

### AI对话模块
- ✅ 多会话管理
- ✅ 多模型支持（GPT-4、GPT-3.5、Claude-3）
- ✅ 快捷指令
- ✅ 消息操作

### 专注番茄钟模块
- ✅ 三种专注模式
- ✅ 5种主题配色
- ✅ 统计分析
- ✅ 设置自定义

## 测试验证

### 集成测试结果
- ✅ 所有模块正常加载
- ✅ 模块间导航流畅
- ✅ 功能交互正常
- ✅ 界面响应良好
- ✅ 数据持久化正常

### 性能指标
- 前端加载时间: < 2秒
- API响应时间: < 500ms
- 内存使用: < 200MB
- 数据库大小: < 10MB

## 部署建议

### 云服务器部署
1. 使用Docker容器化部署
2. 配置Nginx反向代理
3. 使用PM2管理进程
4. 配置SSL证书

### 本地部署
1. 确保Python 3.11+和Node.js 18+
2. 配置环境变量
3. 启动后端和前端服务
4. 访问 http://localhost:5173

## 维护说明

### 数据备份
- 定期备份SQLite数据库文件
- 备份用户上传的文件

### 日志监控
- 查看FastAPI日志
- 监控API调用频率
- 跟踪错误和异常

### 更新升级
- 定期更新依赖包
- 测试新功能兼容性
- 备份数据后进行升级

## 故障排除

### 常见问题
1. **API连接失败**: 检查OpenAI API密钥
2. **数据库错误**: 检查文件权限
3. **前端加载失败**: 检查Node.js版本
4. **端口冲突**: 修改配置文件中的端口

### 联系支持
如有问题，请查看项目文档或提交Issue。

