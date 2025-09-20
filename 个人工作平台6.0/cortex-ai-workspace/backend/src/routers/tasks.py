from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from database import get_db
from models import User, Task, Category
from schemas import Task as TaskSchema, TaskCreate, TaskUpdate, StatusEnum, PriorityEnum
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskSchema])
def get_tasks(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[StatusEnum] = None,
    priority: Optional[PriorityEnum] = None,
    category_id: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """获取任务列表，支持多种筛选条件"""
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if category_id:
        query = query.filter(Task.category_id == category_id)
    if date_from:
        query = query.filter(Task.start_time >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(Task.end_time <= datetime.combine(date_to, datetime.max.time()))
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=TaskSchema)
def get_task(task_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取特定任务"""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task

@router.post("/", response_model=TaskSchema)
def create_task(task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """创建新任务"""
    # 验证分类（如果提供）
    if task.category_id:
        category = db.query(Category).filter(Category.id == task.category_id, Category.user_id == current_user.id).first()
        if not category:
            raise HTTPException(status_code=404, detail="分类不存在")
    
    # 创建任务
    db_task = Task(
        title=task.title,
        description=task.description,
        start_time=task.start_time,
        end_time=task.end_time,
        priority=task.priority,
        status=task.status,
        category_id=task.category_id,
        user_id=current_user.id,
        reminder_minutes_before=task.reminder_minutes_before
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(task_id: str, task_update: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """更新任务"""
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    # 更新字段
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "category_id" and value:
            # 验证分类
            category = db.query(Category).filter(Category.id == value, Category.user_id == current_user.id).first()
            if not category:
                raise HTTPException(status_code=404, detail="分类不存在")
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除任务"""
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    db.delete(db_task)
    db.commit()
    return {"message": "任务已删除"}

@router.patch("/{task_id}/status")
def update_task_status(task_id: str, status: StatusEnum, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """更新任务状态（用于看板拖拽）"""
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    db_task.status = status
    db.commit()
    return {"message": "任务状态已更新", "status": status}

@router.get("/calendar/events", response_model=List[dict])
def get_calendar_events(
    start: date = Query(..., description="开始日期"),
    end: date = Query(..., description="结束日期"),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """获取日历事件格式的任务数据"""
    start_datetime = datetime.combine(start, datetime.min.time())
    end_datetime = datetime.combine(end, datetime.max.time())
    
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.start_time >= start_datetime,
        Task.end_time <= end_datetime
    ).all()
    
    events = []
    for task in tasks:
        # 根据优先级设置颜色
        color_map = {
            "high": "#ff4757",
            "medium": "#ffa502", 
            "low": "#2ed573"
        }
        
        event = {
            "id": task.id,
            "title": task.title,
            "start": task.start_time.isoformat() if task.start_time else None,
            "end": task.end_time.isoformat() if task.end_time else None,
            "backgroundColor": color_map.get(task.priority.value, "#3742fa"),
            "borderColor": color_map.get(task.priority.value, "#3742fa"),
            "extendedProps": {
                "description": task.description,
                "priority": task.priority.value,
                "status": task.status.value,
                "category_id": task.category_id
            }
        }
        events.append(event)
    
    return events

@router.get("/stats/summary", response_model=dict)
def get_task_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取任务统计信息"""
    total_tasks = db.query(Task).filter(Task.user_id == current_user.id).count()
    todo_tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.status == StatusEnum.todo).count()
    doing_tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.status == StatusEnum.doing).count()
    done_tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.status == StatusEnum.done).count()
    
    high_priority = db.query(Task).filter(Task.user_id == current_user.id, Task.priority == PriorityEnum.high).count()
    
    return {
        "total": total_tasks,
        "todo": todo_tasks,
        "doing": doing_tasks,
        "done": done_tasks,
        "high_priority": high_priority,
        "completion_rate": round((done_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
    }

