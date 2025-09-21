from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

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

@router.post("/parse-tasks")
async def parse_tasks_batch(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI批量解析自然语言任务"""
    try:
        text = request.get("text", "")
        model = request.get("model", "gpt-5")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="输入文本不能为空")
        
        # 调用AI服务解析任务
        result = await ai_service.parse_tasks_batch(text, model=model)
        
        # 获取用户的项目和标签
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        category_map = {cat.name: cat.id for cat in categories}
        
        # 处理解析结果
        parsed_tasks = []
        for task_data in result.get("tasks", []):
            # 验证和处理项目ID
            project_name = task_data.get("project")
            project_id = None
            if project_name and project_name in category_map:
                project_id = category_map[project_name]
            
            # 处理标签
            tags = []
            for tag_name in task_data.get("tags", []):
                tags.append({"id": str(hash(tag_name) % 1000), "name": tag_name})
            
            # 处理子任务
            subtasks = []
            for subtask in task_data.get("subtasks", []):
                subtasks.append({
                    "title": subtask,
                    "completed": False
                })
            
            # 验证优先级
            priority = task_data.get("priority", "medium")
            if priority not in ["low", "medium", "high"]:
                priority = "medium"
            
            # 处理截止日期
            due_date = task_data.get("due_date")
            if due_date:
                try:
                    # 确保日期格式正确
                    if isinstance(due_date, str):
                        due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00')).date().isoformat()
                except:
                    due_date = (datetime.now() + timedelta(days=1)).date().isoformat()
            else:
                due_date = (datetime.now() + timedelta(days=1)).date().isoformat()
            
            parsed_task = {
                "title": task_data.get("title", "未命名任务"),
                "description": task_data.get("description", ""),
                "priority": priority,
                "status": "todo",
                "project_id": project_id,
                "due_date": due_date,
                "tags": tags,
                "subtasks": subtasks,
                "estimated_time": task_data.get("estimated_time", 60),
                "ai_generated": True,
                "ai_model": model
            }
            
            parsed_tasks.append(parsed_task)
        
        return {
            "tasks": parsed_tasks,
            "model": model,
            "total_count": len(parsed_tasks)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"任务解析失败: {str(e)}")

@router.post("/enhance-text")
async def enhance_text_endpoint(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """文本增强端点 - 支持多种增强模式"""
    try:
        text = request.get("text", "")
        mode = request.get("mode", "improve")
        model = request.get("model", "gpt-5")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="输入文本不能为空")
        
        # 根据模式调用不同的AI服务
        if mode == "improve":
            result = await ai_service.improve_text(text, model=model)
        elif mode == "summarize":
            result = await ai_service.summarize_text(text, model=model)
        elif mode == "expand":
            result = await ai_service.expand_text(text, model=model)
        elif mode == "translate":
            result = await ai_service.translate_text(text, target_language="en", model=model)
        elif mode == "restructure":
            result = await ai_service.restructure_text(text, model=model)
        else:
            result = await ai_service.improve_text(text, model=model)
        
        return {
            "enhanced_text": result["content"],
            "model": result["model"],
            "mode": mode,
            "usage": result.get("usage", {})
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
        model = request.get("model", "gpt-5")
        
        if not messages:
            raise HTTPException(status_code=400, detail="消息不能为空")
        
        result = await ai_service.chat_completion(messages, model=model)
        return {
            "response": result["content"],
            "model": result["model"],
            "usage": result.get("usage", {}),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI聊天失败: {str(e)}")

@router.post("/generate-tags")
async def generate_tags(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """为笔记生成智能标签"""
    try:
        title = request.get("title", "")
        content = request.get("content", "")
        model = request.get("model", "gpt-5")
        
        if not (title or content):
            raise HTTPException(status_code=400, detail="标题或内容不能为空")
        
        result = await ai_service.generate_tags(title, content, model=model)
        
        return {
            "tags": result["tags"],
            "model": result["model"],
            "confidence": result.get("confidence", 0.8)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"标签生成失败: {str(e)}")

@router.post("/categorize-note")
async def categorize_note_endpoint(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """智能分类笔记"""
    try:
        title = request.get("title", "")
        content = request.get("content", "")
        model = request.get("model", "gpt-5")
        
        if not (title or content):
            raise HTTPException(status_code=400, detail="标题或内容不能为空")
        
        # 获取用户的分类
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        category_names = [cat.name for cat in categories] if categories else ["工作", "学习", "生活"]
        
        result = await ai_service.categorize_note_advanced(
            title, content, available_categories=category_names, model=model
        )
        
        return {
            "category": result["category"],
            "folder": result.get("folder", "默认"),
            "confidence": result.get("confidence", 0.8),
            "reasoning": result.get("reasoning", ""),
            "model": result["model"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"笔记分类失败: {str(e)}")

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

@router.get("/usage-stats")
async def get_usage_stats(current_user: User = Depends(get_current_user)):
    """获取AI使用统计"""
    try:
        # 这里可以从数据库获取用户的AI使用统计
        # 暂时返回模拟数据
        return {
            "total_requests": 150,
            "text_enhancements": 45,
            "chat_messages": 80,
            "task_parsing": 25,
            "current_month_usage": {
                "requests": 45,
                "tokens": 12500
            },
            "favorite_model": "openai/gpt-5",
            "last_used": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取使用统计失败: {str(e)}")


