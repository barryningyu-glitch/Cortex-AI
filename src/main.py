from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uvicorn
import os
from dotenv import load_dotenv

from database import get_db, engine, Base
from routers import notes, tasks, chat, pomodoro, auth, ai, users
from models import User, Category, Note, Task, ChatSession, PomodoroLog
from auth import create_super_user

# 加载环境变量
load_dotenv()

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="Cortex AI Workspace API",
    description="AI智能工作台后端API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

# 安全配置
security = HTTPBearer()

# 静态文件服务
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(users.router, tags=["用户管理"])
app.include_router(notes.router, prefix="/api/notes", tags=["笔记"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["任务"])
app.include_router(chat.router, prefix="/api/chat", tags=["对话"])
app.include_router(pomodoro.router, prefix="/api/pomodoro", tags=["番茄钟"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI服务"])

@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化"""
    db = next(get_db())
    try:
        # 创建超级用户（如果不存在）
        create_super_user(db)
        print("✅ 超级用户初始化完成")
        print("📋 超级用户信息:")
        print("   用户名: 宁宇")
        print("   密码: ny123456")
    except Exception as e:
        print(f"❌ 超级用户初始化失败: {e}")
    finally:
        db.close()

@app.get("/api/")
async def api_root():
    return {"message": "Cortex AI Workspace API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 前端路由处理
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """服务前端应用"""
    # 如果是API路由，返回404
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # 检查静态文件是否存在
    static_file_path = f"static/{full_path}"
    if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
        return FileResponse(static_file_path)
    
    # 默认返回index.html（用于SPA路由）
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

