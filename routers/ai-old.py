from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import os
from datetime import datetime, timedelta

from database import get_db
from models import User, Category
from schemas import (
    AIPolishRequest, AIPolishResponse,
    AIAnalyzeNoteRequest, AIAnalyzeNoteResponse,
    AIParseTaskRequest, AIParseTaskResponse,
    PriorityEnum
)
from routers.auth import get_current_user
from ai_service import ai_service

router = APIRouter()

@router.post("/polish-text", response_model=AIPolishResponse)
async def polish_text(request: AIPolishRequest, current_user: User = Depends(get_current_user)):
    """AI文本润色"""
    try:
        result = await ai_service.polish_text(request.text, style="formal")
        return AIPolishResponse(polished_text=result["content"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI服务调用失败: {str(e)}")

@router.post("/analyze-note", response_model=AIAnalyzeNoteResponse)
async def analyze_note(request: AIAnalyzeNoteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI分析笔记内容并推荐分类"""
    try:
        # 获取用户的分类
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        category_names = [cat.name for cat in categories] if categories else ["工作", "学习", "生活"]
        
        result = await ai_service.categorize_note(request.title, request.content)
        
        # 验证分类是否存在
        if result["category"] not in category_names:
            result["category"] = category_names[0]
        
        return AIAnalyzeNoteResponse(
            category=result["category"],
            folder=result["folder"],
            tags=result["tags"]
        )
    except Exception as e:
        # 如果AI服务失败，返回默认值
        return AIAnalyzeNoteResponse(
            category="学习",
            folder="未分类",
            tags=["笔记"]
        )

@router.post("/parse-task", response_model=AIParseTaskResponse)
async def parse_task(request: AIParseTaskRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI解析自然语言任务"""
    try:
        result = await ai_service.parse_task(request.text)
        
        # 获取用户的分类
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        category_names = [cat.name for cat in categories] if categories else []
        
        # 验证分类
        category = result.get("category")
        if category and category not in category_names:
            category = None
        
        # 处理时间字段
        start_time = None
        end_time = None
        
        if result.get("due_date"):
            try:
                start_time = datetime.fromisoformat(result["due_date"])
                end_time = start_time + timedelta(hours=1)
            except:
                pass
        
        # 验证优先级
        priority = result.get("priority", "medium")
        if priority not in ["low", "medium", "high"]:
            priority = "medium"
        
        return AIParseTaskResponse(
            title=result["title"],
            start_time=start_time,
            end_time=end_time,
            category=category,
            priority=PriorityEnum(priority)
        )
        
    except Exception as e:
        # 如果解析失败，返回简单的任务
        title = request.text[:100] if len(request.text) > 100 else request.text
        return AIParseTaskResponse(
            title=title,
            start_time=None,
            end_time=None,
            category=None,
            priority=PriorityEnum.medium
        )

@router.get("/models")
async def get_available_models():
    """获取可用的AI模型列表"""
    models = ai_service.get_available_models()
    return {"models": models, "default": ai_service.default_model}

@router.post("/test-connection")
async def test_ai_connection():
    """测试AI服务连接"""
    try:
        messages = [
            {"role": "user", "content": "Hello, please respond with 'AI service is working correctly.'"}
        ]
        result = await ai_service.chat_completion(messages)
        return {"status": "success", "response": result["content"], "model": result["model"]}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@router.post("/enhance-text")
async def enhance_text_endpoint(request: AIPolishRequest, current_user: User = Depends(get_current_user)):
    """文本增强端点 - 支持多种增强模式"""
    try:
        # 默认使用正式风格润色
        result = await ai_service.polish_text(request.text, style="formal")
        return {"enhanced_text": result["content"], "model": result["model"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文本增强失败: {str(e)}")

@router.post("/enhance-text/{mode}")
async def enhance_text_with_mode(
    mode: str, 
    request: AIPolishRequest, 
    current_user: User = Depends(get_current_user)
):
    """带模式的文本增强端点"""
    try:
        # 支持的增强模式
        valid_modes = ["formal", "casual", "vivid", "concise", "elaborate"]
        if mode not in valid_modes:
            mode = "formal"
        
        result = await ai_service.polish_text(request.text, style=mode)
        return {
            "enhanced_text": result["content"], 
            "model": result["model"],
            "mode": mode
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文本增强失败: {str(e)}")

@router.post("/chat")
async def ai_chat(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """AI聊天端点"""
    try:
        messages = request.get("messages", [])
        model = request.get("model", ai_service.default_model)
        
        if not messages:
            raise HTTPException(status_code=400, detail="消息不能为空")
        
        result = await ai_service.chat_completion(messages, model=model)
        return {
            "response": result["content"],
            "model": result["model"],
            "usage": result.get("usage", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI聊天失败: {str(e)}")

