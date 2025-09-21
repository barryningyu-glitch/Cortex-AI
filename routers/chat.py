from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from database import get_db
from models import User, Conversation, Message
from schemas import (
    ConversationCreate, ConversationResponse, ConversationUpdate,
    MessageCreate, MessageResponse, AIChatRequest, AIChatResponse
)
from routers.auth import get_current_user
from ai_service import ai_service

router = APIRouter()

# 对话管理
@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的对话列表"""
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    
    return [
        {
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at
        }
        for conv in conversations
    ]

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新对话"""
    conversation = Conversation(
        title=conversation_data.title,
        user_id=current_user.id
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at
    }

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取对话的消息列表"""
    # 验证对话是否属于当前用户
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    return [
        {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "role": msg.role,
            "content": msg.content,
            "model": msg.model,
            "tokens_used": msg.tokens_used,
            "created_at": msg.created_at
        }
        for msg in messages
    ]

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    message_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """发送消息并获取AI回复"""
    # 验证对话是否属于当前用户
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    user_content = message_data.get("content", "")
    model = message_data.get("model", "gpt-5")
    
    if not user_content.strip():
        raise HTTPException(status_code=400, detail="消息内容不能为空")
    
    try:
        # 保存用户消息
        user_message = Message(
            conversation_id=conversation_id,
            role="user",
            content=user_content,
            model=model
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # 获取对话历史
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).all()
        
        # 构建对话上下文
        chat_messages = []
        for msg in messages:
            chat_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # 调用AI服务
        ai_response = await ai_service.chat_completion(chat_messages, model)
        
        # 保存AI回复
        ai_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=ai_response["content"],
            model=model,
            tokens_used=ai_response.get("usage", {}).get("total_tokens")
        )
        db.add(ai_message)
        
        # 更新对话时间
        conversation.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(ai_message)
        
        return {
            "id": ai_message.id,
            "conversation_id": ai_message.conversation_id,
            "role": ai_message.role,
            "content": ai_message.content,
            "model": ai_message.model,
            "tokens_used": ai_message.tokens_used,
            "created_at": ai_message.created_at
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"AI聊天失败: {str(e)}")

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除对话"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    db.delete(conversation)
    db.commit()
    
    return {"message": "对话已删除"}

@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    conversation_data: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新对话标题"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    if conversation_data.title:
        conversation.title = conversation_data.title
        conversation.updated_at = datetime.utcnow()
        
    db.commit()
    db.refresh(conversation)
    
    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at
    }

# 快捷命令
@router.post("/quick-command")
async def execute_quick_command(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """执行快捷命令"""
    command = request.get("command")
    text = request.get("text", "")
    model = request.get("model", "gpt-5")

    if not command:
        raise HTTPException(status_code=400, detail="命令不能为空")
    
    try:
        # 根据命令类型构建提示
        prompts = {
            "summarize": f"请总结以下内容的要点：\n\n{text}",
            "improve": f"请改进以下文本的表达和语法：\n\n{text}",
            "translate": f"请将以下文本翻译为英文：\n\n{text}",
            "brainstorm": f"基于以下内容进行头脑风暴，提供创意想法：\n\n{text}",
            "explain": f"请详细解释以下内容：\n\n{text}",
            "analyze": f"请分析以下内容：\n\n{text}"
        }
        
        if command not in prompts:
            raise HTTPException(status_code=400, detail="不支持的命令")
        
        messages = [
            {"role": "user", "content": prompts[command]}
        ]
        
        # 调用AI服务
        response = await ai_service.chat_completion(messages, model)
        
        return {
            "command": command,
            "result": response["content"],
            "model": model,
            "usage": response.get("usage", {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"快捷命令执行失败: {str(e)}")

# 全局AI聊天（不保存历史）
@router.post("/global-chat")
async def global_chat(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """全局AI聊天（不保存到数据库）"""
    message = request.get("message", "")
    model = request.get("model", "gpt-5")
    context = request.get("context", [])  # 可选的上下文消息
    
    if not message.strip():
        raise HTTPException(status_code=400, detail="消息不能为空")
    
    try:
        # 构建消息列表
        messages = []
        
        # 添加上下文消息（如果有）
        if context:
            messages.extend(context)
        
        # 添加当前消息
        messages.append({
            "role": "user",
            "content": message
        })
        
        # 调用AI服务
        response = await ai_service.chat_completion(messages, model)
        
        return {
            "response": response["content"],
            "model": model,
            "usage": response.get("usage", {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI聊天失败: {str(e)}")

# 获取可用模型
@router.get("/models")
async def get_available_models():
    """获取可用的AI模型列表"""
    try:
        models = await ai_service.get_available_models()
        return {
            "models": models,
            "default": "gpt-5"
        }
    except Exception as e:
        # 返回默认模型列表
        return {
            "models": [
                {"id": "gpt-5", "name": "GPT-5", "provider": "OpenAI", "color": "bg-green-500"},
                {"id": "google/gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "Google", "color": "bg-blue-500"},
                {"id": "anthropic/claude-4", "name": "Claude-4", "provider": "Anthropic", "color": "bg-purple-500"},
                {"id": "deepseek/deepseek-chat-v3", "name": "DeepSeek V3", "provider": "DeepSeek", "color": "bg-orange-500"}
            ],
            "default": "gpt-5"
        }

