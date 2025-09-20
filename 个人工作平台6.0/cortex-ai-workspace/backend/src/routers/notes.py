from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Note, Folder, Category, Tag
from schemas import Note as NoteSchema, NoteCreate, NoteUpdate, NoteTreeItem
from routers.auth import get_current_user

router = APIRouter()

@router.get("/tree", response_model=List[NoteTreeItem])
def get_notes_tree(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取笔记的树状结构"""
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    
    tree = []
    for category in categories:
        category_item = NoteTreeItem(
            id=category.id,
            name=category.name,
            type="category",
            children=[]
        )
        
        folders = db.query(Folder).filter(Folder.category_id == category.id).all()
        for folder in folders:
            folder_item = NoteTreeItem(
                id=folder.id,
                name=folder.name,
                type="folder",
                children=[]
            )
            
            notes = db.query(Note).filter(Note.folder_id == folder.id).all()
            for note in notes:
                note_item = NoteTreeItem(
                    id=note.id,
                    name=note.title,
                    type="note",
                    children=[]
                )
                folder_item.children.append(note_item)
            
            category_item.children.append(folder_item)
        
        tree.append(category_item)
    
    return tree

@router.get("/", response_model=List[NoteSchema])
def get_notes(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取用户的所有笔记"""
    notes = db.query(Note).filter(Note.user_id == current_user.id).offset(skip).limit(limit).all()
    return notes

@router.get("/{note_id}", response_model=NoteSchema)
def get_note(note_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取特定笔记"""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    return note

@router.post("/", response_model=NoteSchema)
def create_note(note: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建新笔记"""
    # 验证文件夹是否属于当前用户
    folder = db.query(Folder).filter(Folder.id == note.folder_id, Folder.user_id == current_user.id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="文件夹不存在")
    
    # 创建笔记
    db_note = Note(
        title=note.title,
        content=note.content,
        folder_id=note.folder_id,
        user_id=current_user.id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # 添加标签
    if note.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(note.tag_ids), Tag.user_id == current_user.id).all()
        db_note.tags = tags
        db.commit()
    
    return db_note

@router.put("/{note_id}", response_model=NoteSchema)
def update_note(note_id: str, note_update: NoteUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """更新笔记"""
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    # 更新字段
    if note_update.title is not None:
        db_note.title = note_update.title
    if note_update.content is not None:
        db_note.content = note_update.content
    if note_update.folder_id is not None:
        # 验证文件夹
        folder = db.query(Folder).filter(Folder.id == note_update.folder_id, Folder.user_id == current_user.id).first()
        if not folder:
            raise HTTPException(status_code=404, detail="文件夹不存在")
        db_note.folder_id = note_update.folder_id
    
    # 更新标签
    if note_update.tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(note_update.tag_ids), Tag.user_id == current_user.id).all()
        db_note.tags = tags
    
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
def delete_note(note_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除笔记"""
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    db.delete(db_note)
    db.commit()
    return {"message": "笔记已删除"}

# 文件夹管理
@router.post("/folders", response_model=dict)
def create_folder(name: str, category_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建文件夹"""
    # 验证分类
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    
    # 检查文件夹名是否已存在
    existing_folder = db.query(Folder).filter(
        Folder.name == name, 
        Folder.category_id == category_id,
        Folder.user_id == current_user.id
    ).first()
    if existing_folder:
        raise HTTPException(status_code=400, detail="文件夹名已存在")
    
    folder = Folder(name=name, category_id=category_id, user_id=current_user.id)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    
    return {"id": folder.id, "name": folder.name, "category_id": folder.category_id}

# 标签管理
@router.post("/tags", response_model=dict)
def create_tag(name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建标签"""
    # 检查标签是否已存在
    existing_tag = db.query(Tag).filter(Tag.name == name, Tag.user_id == current_user.id).first()
    if existing_tag:
        return {"id": existing_tag.id, "name": existing_tag.name}
    
    tag = Tag(name=name, user_id=current_user.id)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    
    return {"id": tag.id, "name": tag.name}

@router.get("/tags", response_model=List[dict])
def get_tags(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取用户的所有标签"""
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    return [{"id": tag.id, "name": tag.name} for tag in tags]

