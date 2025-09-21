from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from database import get_db
from models import User, Note, Category, Folder
from schemas import (
    NoteCreate, NoteUpdate, NoteResponse,
    CategoryCreate, CategoryResponse,
    FolderCreate, FolderResponse
)
from routers.auth import get_current_user
from ai_service import ai_service

router = APIRouter()

# 笔记相关路由
@router.get("/", response_model=List[NoteResponse])
async def get_notes(
    category: Optional[str] = None,
    folder_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的笔记列表"""
    query = db.query(Note).filter(Note.user_id == current_user.id)
    
    if category:
        query = query.filter(Note.category == category)
    
    if folder_id:
        query = query.filter(Note.folder_id == folder_id)
    
    if search:
        query = query.filter(
            (Note.title.contains(search)) |
            (Note.content.contains(search))
        )
    
    notes = query.order_by(Note.updated_at.desc()).all()
    
    # 转换为响应格式
    result = []
    for note in notes:
        note_dict = {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "category": note.category,
            "folder_id": note.folder_id,
            "tags": json.loads(note.tags) if note.tags else [],
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat()
        }
        result.append(note_dict)
    
    return result

@router.post("/", response_model=NoteResponse)
async def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新笔记"""
    # 创建笔记对象
    note = Note(
        title=note_data.title,
        content=note_data.content,
        category=note_data.category,
        folder_id=note_data.folder_id,
        tags=json.dumps(note_data.tags) if note_data.tags else "[]",
        user_id=current_user.id
    )
    
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "category": note.category,
        "folder_id": note.folder_id,
        "tags": json.loads(note.tags) if note.tags else [],
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat()
    }

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "category": note.category,
        "folder_id": note.folder_id,
        "tags": json.loads(note.tags) if note.tags else [],
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat()
    }

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    # 更新字段
    if note_data.title is not None:
        note.title = note_data.title
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.category is not None:
        note.category = note_data.category
    if note_data.folder_id is not None:
        note.folder_id = note_data.folder_id
    if note_data.tags is not None:
        note.tags = json.dumps(note_data.tags)
    
    note.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(note)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "category": note.category,
        "folder_id": note.folder_id,
        "tags": json.loads(note.tags) if note.tags else [],
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat()
    }

@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    db.delete(note)
    db.commit()
    
    return {"message": "笔记已删除"}

# 分类相关路由
@router.get("/categories/", response_model=List[CategoryResponse])
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的分类列表"""
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    
    # 如果没有分类，创建默认分类
    if not categories:
        default_categories = [
            {"name": "工作", "color": "#3b82f6", "icon": "💼"},
            {"name": "学习", "color": "#10b981", "icon": "📚"},
            {"name": "生活", "color": "#8b5cf6", "icon": "🏠"}
        ]
        
        for cat_data in default_categories:
            category = Category(
                name=cat_data["name"],
                color=cat_data["color"],
                icon=cat_data["icon"],
                user_id=current_user.id
            )
            db.add(category)
        
        db.commit()
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "color": cat.color,
            "icon": cat.icon,
            "created_at": cat.created_at.isoformat()
        }
        for cat in categories
    ]

@router.post("/categories/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新分类"""
    category = Category(
        name=category_data.name,
        color=category_data.color,
        icon=category_data.icon,
        user_id=current_user.id
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return {
        "id": category.id,
        "name": category.name,
        "color": category.color,
        "icon": category.icon,
        "created_at": category.created_at.isoformat()
    }

# 文件夹相关路由
@router.get("/folders/", response_model=List[FolderResponse])
async def get_folders(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的文件夹列表"""
    query = db.query(Folder).filter(Folder.user_id == current_user.id)
    
    if category:
        query = query.filter(Folder.category == category)
    
    folders = query.order_by(Folder.created_at).all()
    
    # 如果没有文件夹，创建默认文件夹
    if not folders:
        default_folders = [
            {"name": "项目文档", "category": "work"},
            {"name": "会议记录", "category": "work"},
            {"name": "技术笔记", "category": "work"},
            {"name": "React学习", "category": "study"},
            {"name": "算法练习", "category": "study"},
            {"name": "健康管理", "category": "life"},
            {"name": "旅行计划", "category": "life"}
        ]
        
        for folder_data in default_folders:
            if not category or folder_data["category"] == category:
                folder = Folder(
                    name=folder_data["name"],
                    category=folder_data["category"],
                    user_id=current_user.id
                )
                db.add(folder)
        
        db.commit()
        
        # 重新查询
        query = db.query(Folder).filter(Folder.user_id == current_user.id)
        if category:
            query = query.filter(Folder.category == category)
        folders = query.order_by(Folder.created_at).all()
    
    result = []
    for folder in folders:
        # 统计文件夹中的笔记数量
        note_count = db.query(Note).filter(
            Note.folder_id == folder.id,
            Note.user_id == current_user.id
        ).count()
        
        result.append({
            "id": folder.id,
            "name": folder.name,
            "category": folder.category,
            "note_count": note_count,
            "created_at": folder.created_at.isoformat()
        })
    
    return result

@router.post("/folders/", response_model=FolderResponse)
async def create_folder(
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新文件夹"""
    folder = Folder(
        name=folder_data.name,
        category=folder_data.category,
        user_id=current_user.id
    )
    
    db.add(folder)
    db.commit()
    db.refresh(folder)
    
    # 统计笔记数量
    note_count = db.query(Note).filter(
        Note.folder_id == folder.id,
        Note.user_id == current_user.id
    ).count()
    
    return {
        "id": folder.id,
        "name": folder.name,
        "category": folder.category,
        "note_count": note_count,
        "created_at": folder.created_at.isoformat()
    }

# AI增强功能
@router.post("/{note_id}/enhance")
async def enhance_note(
    note_id: int,
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI增强笔记内容"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    mode = request.get("mode", "improve")
    model = request.get("model", "openai/gpt-5")
    
    try:
        # 调用AI服务增强文本
        result = await ai_service.enhance_text_endpoint({
            "text": note.content,
            "mode": mode,
            "model": model
        }, current_user)
        
        return {
            "enhanced_content": result["enhanced_text"],
            "model": result["model"],
            "mode": result["mode"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI增强失败: {str(e)}")

@router.post("/{note_id}/generate-tags")
async def generate_note_tags(
    note_id: int,
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """为笔记生成智能标签"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    model = request.get("model", "openai/gpt-5")
    
    try:
        result = await ai_service.generate_tags(note.title, note.content, model=model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"标签生成失败: {str(e)}")

@router.post("/{note_id}/categorize")
async def categorize_note(
    note_id: int,
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """智能分类笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    model = request.get("model", "openai/gpt-5")
    
    # 获取用户的分类
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    category_names = [cat.name for cat in categories] if categories else ["工作", "学习", "生活"]
    
    try:
        result = await ai_service.categorize_note_advanced(
            note.title, note.content, 
            available_categories=category_names, 
            model=model
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"笔记分类失败: {str(e)}")

