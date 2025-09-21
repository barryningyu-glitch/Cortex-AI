from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import openai
import json
import os
from datetime import datetime, timedelta
import re

from database import get_db
from models import User, Category
from schemas import (
    AIPolishRequest, AIPolishResponse,
    AIAnalyzeNoteRequest, AIAnalyzeNoteResponse,
    AIParseTaskRequest, AIParseTaskResponse,
    PriorityEnum
)
from routers.auth import get_current_user

router = APIRouter()

# 配置OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_base = os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1")

# 默认模型配置
DEFAULT_MODEL = "openai/gpt-4o-mini"

class AIService:
    @staticmethod
    def call_openai(messages, model=DEFAULT_MODEL, temperature=0.7):
        """调用OpenAI API"""
        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=2000
            )
            return response.choices[0].message.content
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI服务调用失败: {str(e)}")

@router.post("/polish-text", response_model=AIPolishResponse)
def polish_text(request: AIPolishRequest, current_user: User = Depends(get_current_user)):
    """AI文本润色"""
    messages = [
        {
            "role": "system",
            "content": """你是一个专业的文本润色助手。请对用户提供的文本进行润色和优化，要求：
1. 保持原意不变
2. 提升语言表达的流畅性和准确性
3. 修正语法错误和错别字
4. 优化句式结构，使表达更加清晰
5. 保持原文的语言风格（正式/非正式）
6. 直接返回润色后的文本，不要添加额外说明"""
        },
        {
            "role": "user",
            "content": f"请润色以下文本：\n\n{request.text}"
        }
    ]
    
    polished_text = AIService.call_openai(messages)
    return AIPolishResponse(polished_text=polished_text)

@router.post("/analyze-note", response_model=AIAnalyzeNoteResponse)
def analyze_note(request: AIAnalyzeNoteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI分析笔记内容并推荐分类"""
    # 获取用户的分类
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    category_names = [cat.name for cat in categories]
    
    messages = [
        {
            "role": "system",
            "content": f"""你是一个智能笔记分析助手。请分析用户的笔记内容，并推荐合适的分类、文件夹和标签。

用户的现有分类：{', '.join(category_names)}

请严格按照以下JSON格式返回结果：
{{
    "category": "分类名称（必须从现有分类中选择）",
    "folder": "推荐的文件夹名称",
    "tags": ["标签1", "标签2", "标签3"]
}}

要求：
1. category必须从用户现有分类中选择
2. folder应该是一个具体、有意义的文件夹名称
3. tags应该是3-5个相关的关键词标签
4. 只返回JSON，不要添加其他文字"""
        },
        {
            "role": "user",
            "content": f"标题：{request.title}\n\n内容：{request.content}"
        }
    ]
    
    response_text = AIService.call_openai(messages, temperature=0.3)
    
    try:
        # 尝试解析JSON
        result = json.loads(response_text)
        
        # 验证分类是否存在
        if result["category"] not in category_names:
            result["category"] = category_names[0] if category_names else "工作"
        
        return AIAnalyzeNoteResponse(
            category=result["category"],
            folder=result["folder"],
            tags=result["tags"]
        )
    except json.JSONDecodeError:
        # 如果JSON解析失败，返回默认值
        return AIAnalyzeNoteResponse(
            category=category_names[0] if category_names else "工作",
            folder="未分类",
            tags=["笔记"]
        )

@router.post("/parse-task", response_model=AIParseTaskResponse)
def parse_task(request: AIParseTaskRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """AI解析自然语言任务"""
    # 获取用户的分类
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    category_names = [cat.name for cat in categories]
    
    # 获取当前时间作为参考
    now = datetime.now()
    
    messages = [
        {
            "role": "system",
            "content": f"""你是一个智能任务解析助手。请解析用户的自然语言输入，提取任务信息。

当前时间：{now.strftime('%Y-%m-%d %H:%M:%S')}
用户的分类：{', '.join(category_names)}

请严格按照以下JSON格式返回结果：
{{
    "title": "任务标题",
    "start_time": "2024-01-01T10:00:00",
    "end_time": "2024-01-01T11:00:00",
    "category": "分类名称",
    "priority": "high/medium/low"
}}

解析规则：
1. 提取核心任务内容作为title
2. 识别时间表达（如"明天下午3点"、"下周一"等）并转换为具体时间
3. 如果没有明确时间，start_time和end_time设为null
4. 如果只有开始时间，end_time设为开始时间+1小时
5. category从用户现有分类中选择最合适的
6. 根据关键词判断优先级（重要、紧急、高优先级等词汇表示high）
7. 只返回JSON，不要添加其他文字"""
        },
        {
            "role": "user",
            "content": request.text
        }
    ]
    
    response_text = AIService.call_openai(messages, temperature=0.3)
    
    try:
        result = json.loads(response_text)
        
        # 处理时间字段
        start_time = None
        end_time = None
        
        if result.get("start_time"):
            try:
                start_time = datetime.fromisoformat(result["start_time"].replace('Z', '+00:00'))
            except:
                pass
                
        if result.get("end_time"):
            try:
                end_time = datetime.fromisoformat(result["end_time"].replace('Z', '+00:00'))
            except:
                pass
        
        # 验证分类
        category = result.get("category")
        if category not in category_names:
            category = None
        
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
        
    except (json.JSONDecodeError, KeyError, ValueError):
        # 如果解析失败，尝试简单提取标题
        title = request.text[:100] if len(request.text) > 100 else request.text
        return AIParseTaskResponse(
            title=title,
            start_time=None,
            end_time=None,
            category=None,
            priority=PriorityEnum.medium
        )

@router.get("/models")
def get_available_models():
    """获取可用的AI模型列表"""
    models = [
        {"id": "openai/gpt-4o", "name": "GPT-4o", "provider": "OpenAI"},
        {"id": "openai/gpt-4o-mini", "name": "GPT-4o Mini", "provider": "OpenAI"},
        {"id": "deepseek/deepseek-chat", "name": "DeepSeek Chat", "provider": "DeepSeek"},
        {"id": "google/gemini-2.0-flash-exp", "name": "Gemini 2.0 Flash", "provider": "Google"},
        {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet", "provider": "Anthropic"},
    ]
    return {"models": models, "default": DEFAULT_MODEL}

@router.post("/test-connection")
def test_ai_connection():
    """测试AI服务连接"""
    try:
        messages = [
            {"role": "user", "content": "Hello, please respond with 'AI service is working correctly.'"}
        ]
        response = AIService.call_openai(messages)
        return {"status": "success", "response": response}
    except Exception as e:
        return {"status": "error", "error": str(e)}

