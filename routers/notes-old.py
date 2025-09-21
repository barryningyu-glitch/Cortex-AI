from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database import get_db
from models import Note, Folder, Tag, User, NoteCategoryEnum
from schemas import NoteCreate, NoteUpdate, Note as NoteSchema, FolderCreate, Folder as FolderSchema
from routers.auth import get_current_user
from ai_service import ai_service

router = APIRouter(prefix="/api/notes", tags=["notes"])

# 文件夹管理
@router.get("/folders", response_model=List[FolderSchema])
def get_folders(
    category: Optional[NoteCategoryEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户的文件夹列表"""
    query = db.query(Folder).filter(Folder.user_id == current_user.id)
    if category:
        query = query.filter(Folder.category == category)
    
    folders = query.order_by(Folder.is_pinned.desc(), Folder.sort_order, Folder.created_at).all()
    return folders

@router.post("/folders", response_model=FolderSchema)
def create_folder(
    folder: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新文件夹"""
    db_folder = Folder(
        name=folder.name,
        category=folder.category,
        user_id=current_user.id
    )
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

@router.put("/folders/{folder_id}")
def update_folder(
    folder_id: str,
    name: Optional[str] = None,
    category: Optional[NoteCategoryEnum] = None,
    is_pinned: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新文件夹"""
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.user_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="文件夹不存在")
    
    if name is not None:
        folder.name = name
    if category is not None:
        folder.category = category
    if is_pinned is not None:
        folder.is_pinned = is_pinned
    
    db.commit()
    return {"message": "文件夹更新成功"}

@router.delete("/folders/{folder_id}")
def delete_folder(
    folder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除文件夹"""
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.user_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="文件夹不存在")
    
    # 将文件夹下的笔记移动到默认位置
    db.query(Note).filter(Note.folder_id == folder_id).update({"folder_id": None})
    
    db.delete(folder)
    db.commit()
    return {"message": "文件夹删除成功"}

# 笔记管理
@router.get("/", response_model=List[NoteSchema])
def get_notes(
    category: Optional[NoteCategoryEnum] = None,
    folder_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户的笔记列表"""
    query = db.query(Note).filter(Note.user_id == current_user.id)
    
    if category:
        query = query.filter(Note.category == category)
    if folder_id:
        query = query.filter(Note.folder_id == folder_id)
    if search:
        query = query.filter(
            Note.title.contains(search) | Note.content.contains(search)
        )
    
    notes = query.order_by(
        Note.is_pinned.desc(), 
        Note.sort_order, 
        Note.updated_at.desc()
    ).all()
    return notes

@router.get("/{note_id}", response_model=NoteSchema)
def get_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    return note

@router.post("/", response_model=NoteSchema)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新笔记"""
    db_note = Note(
        title=note.title,
        content=note.content,
        category=note.category,
        folder_id=note.folder_id,
        user_id=current_user.id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.put("/{note_id}", response_model=NoteSchema)
def update_note(
    note_id: str,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新笔记"""
    db_note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    update_data = note.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_note, field, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
def delete_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    return {"message": "笔记删除成功"}

# AI功能
@router.post("/{note_id}/polish")
async def polish_note(
    note_id: str,
    style: str = "formal",
    model: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI润色笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    try:
        result = await ai_service.polish_text(note.content, style, model)
        return {
            "original": note.content,
            "polished": result["content"],
            "model": result["model"],
            "style": style
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI润色失败: {str(e)}")

@router.post("/{note_id}/categorize")
async def categorize_note(
    note_id: str,
    model: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI智能分类笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    try:
        result = await ai_service.categorize_note(note.title, note.content, model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI分类失败: {str(e)}")

@router.post("/{note_id}/apply-categorization")
def apply_categorization(
    note_id: str,
    category: NoteCategoryEnum,
    folder_name: Optional[str] = None,
    tags: Optional[List[str]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """应用AI分类建议"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    # 更新分类
    note.category = category
    
    # 处理文件夹
    if folder_name:
        folder = db.query(Folder).filter(
            Folder.name == folder_name,
            Folder.category == category,
            Folder.user_id == current_user.id
        ).first()
        
        if not folder:
            # 创建新文件夹
            folder = Folder(
                name=folder_name,
                category=category,
                user_id=current_user.id
            )
            db.add(folder)
            db.commit()
            db.refresh(folder)
        
        note.folder_id = folder.id
    
    # 处理标签
    if tags:
        # 清除现有标签
        note.tags.clear()
        
        for tag_name in tags:
            tag = db.query(Tag).filter(
                Tag.name == tag_name,
                Tag.user_id == current_user.id
            ).first()
            
            if not tag:
                # 创建新标签
                tag = Tag(
                    name=tag_name,
                    user_id=current_user.id
                )
                db.add(tag)
                db.commit()
                db.refresh(tag)
            
            note.tags.append(tag)
    
    db.commit()
    db.refresh(note)
    return note

# 笔记操作
@router.post("/{note_id}/pin")
def pin_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """置顶笔记"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    note.is_pinned = not note.is_pinned
    db.commit()
    return {"message": f"笔记{'置顶' if note.is_pinned else '取消置顶'}成功"}

@router.post("/{note_id}/move")
def move_note(
    note_id: str,
    folder_id: Optional[str] = None,
    category: Optional[NoteCategoryEnum] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """移动笔记到不同文件夹或分类"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    if folder_id:
        # 验证文件夹是否存在且属于当前用户
        folder = db.query(Folder).filter(
            Folder.id == folder_id,
            Folder.user_id == current_user.id
        ).first()
        
        if not folder:
            raise HTTPException(status_code=404, detail="目标文件夹不存在")
        
        note.folder_id = folder_id
        note.category = folder.category
    
    if category:
        note.category = category
        if not folder_id:
            note.folder_id = None  # 移动到分类根目录
    
    db.commit()
    return {"message": "笔记移动成功"}

