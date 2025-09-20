from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import openai
import json
import os

from database import get_db
from models import User, ChatSession, ChatMessage, Note, Task, Category
from schemas import (
    ChatSession as ChatSessionSchema, ChatSessionCreate,
    ChatMessage as ChatMessageSchema, ChatMessageCreate,
    AIChatRequest, AIChatResponse
)
from routers.auth import get_current_user

router = APIRouter()

# 配置OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_base = os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1")

class ChatAIService:
    @staticmethod
    def call_openai(messages, model="openai/gpt-4o-mini", temperature=0.7):
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

@router.get("/sessions", response_model=List[ChatSessionSchema])
def get_chat_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取用户的所有对话会话"""
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
    return sessions

@router.post("/sessions", response_model=ChatSessionSchema)
def create_chat_session(session: ChatSessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建新的对话会话"""
    db_session = ChatSession(
        title=session.title,
        user_id=current_user.id
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageSchema])
def get_session_messages(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取会话的所有消息"""
    # 验证会话属于当前用户
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    return messages

@router.post("/command", response_model=AIChatResponse)
def chat_command(request: AIChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """核心对话接口 - AI大脑"""
    # 验证会话
    session = db.query(ChatSession).filter(ChatSession.id == request.session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 保存用户消息
    user_message = ChatMessage(
        session_id=request.session_id,
        role="user",
        content=request.text
    )
    db.add(user_message)
    db.commit()
    
    # 获取会话历史（最近10条消息）
    recent_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == request.session_id
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()
    recent_messages.reverse()  # 按时间正序
    
    # 构建上下文信息
    context_info = ""
    if request.context:
        if request.context.get("type") == "note":
            note_id = request.context.get("id")
            note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
            if note:
                context_info = f"\n\n当前正在查看的笔记：\n标题：{note.title}\n内容：{note.content[:500]}..."
        elif request.context.get("type") == "task":
            task_id = request.context.get("id")
            task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
            if task:
                context_info = f"\n\n当前正在查看的任务：\n标题：{task.title}\n描述：{task.description}\n状态：{task.status.value}\n优先级：{task.priority.value}"
    
    # 获取用户数据概览
    notes_count = db.query(Note).filter(Note.user_id == current_user.id).count()
    tasks_count = db.query(Task).filter(Task.user_id == current_user.id).count()
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    category_names = [cat.name for cat in categories]
    
    # 构建系统提示
    system_prompt = f"""你是Cortex AI工作区的智能助理，专门帮助用户管理笔记和任务。

用户数据概览：
- 笔记数量：{notes_count}
- 任务数量：{tasks_count}
- 分类：{', '.join(category_names)}

你的能力包括：
1. 回答关于笔记和任务的问题
2. 执行创建、修改任务的指令
3. 提供工作建议和时间管理建议
4. 通用知识问答和内容创作

当用户要求创建或修改数据时，请分析是否为指令操作：
- 如果是创建任务的指令，返回action类型的响应
- 如果是普通对话，返回message类型的响应

对于action类型，请严格按照以下格式返回JSON：
{{
    "response_type": "action",
    "content": "给用户的回复消息",
    "action_details": {{
        "type": "create_task",
        "params": {{
            "title": "任务标题",
            "description": "任务描述",
            "start_time": "2024-01-01T10:00:00",
            "end_time": "2024-01-01T11:00:00",
            "priority": "medium",
            "category_id": "分类ID（如果能确定的话）"
        }}
    }}
}}

对于普通对话，返回：
{{
    "response_type": "message",
    "content": "回复内容"
}}

请用友好、专业的语气与用户交流。{context_info}"""

    # 构建消息历史
    messages = [{"role": "system", "content": system_prompt}]
    
    # 添加历史消息
    for msg in recent_messages[-5:]:  # 只取最近5条
        messages.append({
            "role": msg.role.value,
            "content": msg.content
        })
    
    # 调用AI
    try:
        ai_response = ChatAIService.call_openai(messages, temperature=0.7)
        
        # 尝试解析为JSON
        try:
            response_data = json.loads(ai_response)
            response_type = response_data.get("response_type", "message")
            content = response_data.get("content", ai_response)
            action_details = response_data.get("action_details")
        except json.JSONDecodeError:
            # 如果不是JSON，当作普通消息处理
            response_type = "message"
            content = ai_response
            action_details = None
        
        # 保存AI回复
        ai_message = ChatMessage(
            session_id=request.session_id,
            role="ai",
            content=content
        )
        db.add(ai_message)
        db.commit()
        
        return AIChatResponse(
            response_type=response_type,
            content=content,
            action_details=action_details
        )
        
    except Exception as e:
        # 保存错误消息
        error_message = ChatMessage(
            session_id=request.session_id,
            role="ai",
            content=f"抱歉，我遇到了一些问题：{str(e)}"
        )
        db.add(error_message)
        db.commit()
        
        return AIChatResponse(
            response_type="message",
            content=f"抱歉，我遇到了一些问题：{str(e)}"
        )

@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除对话会话"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    db.delete(session)
    db.commit()
    return {"message": "会话已删除"}

@router.post("/sessions/{session_id}/save-as-note")
def save_conversation_as_note(
    session_id: str, 
    folder_id: str,
    title: str = None,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """将对话保存为笔记"""
    # 验证会话和文件夹
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    from models import Folder
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.user_id == current_user.id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="文件夹不存在")
    
    # 获取会话消息
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    
    # 构建笔记内容
    content = f"# 对话记录 - {session.title}\n\n"
    for msg in messages:
        role_name = "用户" if msg.role.value == "user" else "AI助手"
        content += f"**{role_name}：**\n{msg.content}\n\n"
    
    # 创建笔记
    note = Note(
        title=title or f"对话记录 - {session.title}",
        content=content,
        folder_id=folder_id,
        user_id=current_user.id
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return {"message": "对话已保存为笔记", "note_id": note.id}

