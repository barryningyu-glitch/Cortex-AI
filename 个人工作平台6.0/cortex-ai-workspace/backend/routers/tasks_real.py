from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime, date

from database import get_db
from models import User, Task
from schemas import (
    TaskCreate, TaskUpdate, TaskResponse, 
    StatusEnum, PriorityEnum, CategoryEnum,
    AIParseTasksRequest, AIParseTasksResponse
)
from routers.auth import get_current_user
from ai_service import ai_service

router = APIRouter()

# 任务管理
@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    status: Optional[StatusEnum] = None,
    category: Optional[CategoryEnum] = None,
    priority: Optional[PriorityEnum] = None,
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的任务列表"""
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if status:
        query = query.filter(Task.status == status)
    if category:
        query = query.filter(Task.category == category)
    if priority:
        query = query.filter(Task.priority == priority)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    tasks = query.order_by(Task.created_at.desc()).all()
    
    # 转换为响应格式
    result = []
    for task in tasks:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "category": task.category,
            "project_id": task.project_id,
            "due_date": task.due_date,
            "estimated_time": task.estimated_time,
            "actual_time": task.actual_time,
            "tags": json.loads(task.tags) if task.tags else [],
            "subtasks": json.loads(task.subtasks) if task.subtasks else [],
            "ai_generated": task.ai_generated,
            "ai_model": task.ai_model,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        }
        result.append(task_dict)
    
    return result

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新任务"""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        category=task_data.category,
        project_id=task_data.project_id,
        due_date=task_data.due_date,
        estimated_time=task_data.estimated_time,
        tags=json.dumps(task_data.tags) if task_data.tags else "[]",
        subtasks=json.dumps(task_data.subtasks) if task_data.subtasks else "[]",
        user_id=current_user.id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "category": task.category,
        "project_id": task.project_id,
        "due_date": task.due_date,
        "estimated_time": task.estimated_time,
        "actual_time": task.actual_time,
        "tags": json.loads(task.tags) if task.tags else [],
        "subtasks": json.loads(task.subtasks) if task.subtasks else [],
        "ai_generated": task.ai_generated,
        "ai_model": task.ai_model,
        "created_at": task.created_at,
        "updated_at": task.updated_at
    }

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个任务"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "category": task.category,
        "project_id": task.project_id,
        "due_date": task.due_date,
        "estimated_time": task.estimated_time,
        "actual_time": task.actual_time,
        "tags": json.loads(task.tags) if task.tags else [],
        "subtasks": json.loads(task.subtasks) if task.subtasks else [],
        "ai_generated": task.ai_generated,
        "ai_model": task.ai_model,
        "created_at": task.created_at,
        "updated_at": task.updated_at
    }

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新任务"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    # 更新字段
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.status is not None:
        task.status = task_data.status
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.category is not None:
        task.category = task_data.category
    if task_data.project_id is not None:
        task.project_id = task_data.project_id
    if task_data.due_date is not None:
        task.due_date = task_data.due_date
    if task_data.estimated_time is not None:
        task.estimated_time = task_data.estimated_time
    if task_data.actual_time is not None:
        task.actual_time = task_data.actual_time
    if task_data.tags is not None:
        task.tags = json.dumps(task_data.tags)
    if task_data.subtasks is not None:
        task.subtasks = json.dumps(task_data.subtasks)
    
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "category": task.category,
        "project_id": task.project_id,
        "due_date": task.due_date,
        "estimated_time": task.estimated_time,
        "actual_time": task.actual_time,
        "tags": json.loads(task.tags) if task.tags else [],
        "subtasks": json.loads(task.subtasks) if task.subtasks else [],
        "ai_generated": task.ai_generated,
        "ai_model": task.ai_model,
        "created_at": task.created_at,
        "updated_at": task.updated_at
    }

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除任务"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    db.delete(task)
    db.commit()
    
    return {"message": "任务已删除"}

# AI功能
@router.post("/parse-tasks", response_model=AIParseTasksResponse)
async def parse_tasks_with_ai(
    request: AIParseTasksRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """使用AI解析文本并创建任务"""
    try:
        # 调用AI服务解析任务
        result = await ai_service.parse_tasks_advanced(
            request.text, 
            model=request.model or "openai/gpt-5"
        )
        
        # 保存解析出的任务到数据库
        created_tasks = []
        for task_data in result["tasks"]:
            task = Task(
                title=task_data.get("title", "未命名任务"),
                description=task_data.get("description", ""),
                status="todo",
                priority=task_data.get("priority", "medium"),
                category=task_data.get("project", "work"),
                due_date=datetime.fromisoformat(task_data["due_date"]) if task_data.get("due_date") else None,
                estimated_time=task_data.get("estimated_time"),
                tags=json.dumps(task_data.get("tags", [])),
                subtasks=json.dumps(task_data.get("subtasks", [])),
                ai_generated=True,
                ai_model=request.model or "openai/gpt-5",
                user_id=current_user.id
            )
            
            db.add(task)
            created_tasks.append(task)
        
        db.commit()
        
        # 刷新任务数据
        for task in created_tasks:
            db.refresh(task)
        
        return {
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "category": task.category,
                    "due_date": task.due_date,
                    "estimated_time": task.estimated_time,
                    "tags": json.loads(task.tags) if task.tags else [],
                    "subtasks": json.loads(task.subtasks) if task.subtasks else [],
                    "ai_generated": task.ai_generated,
                    "ai_model": task.ai_model
                }
                for task in created_tasks
            ],
            "model": request.model or "openai/gpt-5",
            "total_count": len(created_tasks)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI任务解析失败: {str(e)}")

@router.post("/{task_id}/complete")
async def complete_task(
    task_id: int,
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """完成任务"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task.status = "completed"
    task.actual_time = request.get("actual_time")
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    return {"message": "任务已完成", "task_id": task.id}

@router.post("/{task_id}/start")
async def start_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """开始任务"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task.status = "in_progress"
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    return {"message": "任务已开始", "task_id": task.id}

# 统计功能
@router.get("/stats/summary")
async def get_task_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取任务统计信息"""
    total_tasks = db.query(Task).filter(Task.user_id == current_user.id).count()
    
    completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "completed"
    ).count()
    
    in_progress_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "in_progress"
    ).count()
    
    todo_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "todo"
    ).count()
    
    # 按分类统计
    work_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.category == "work"
    ).count()
    
    study_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.category == "study"
    ).count()
    
    life_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.category == "life"
    ).count()
    
    # 按优先级统计
    high_priority = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.priority == "high"
    ).count()
    
    medium_priority = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.priority == "medium"
    ).count()
    
    low_priority = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.priority == "low"
    ).count()
    
    # AI生成的任务数量
    ai_generated_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.ai_generated == True
    ).count()
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "todo_tasks": todo_tasks,
        "completion_rate": round(completed_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0,
        "category_stats": {
            "work": work_tasks,
            "study": study_tasks,
            "life": life_tasks
        },
        "priority_stats": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority
        },
        "ai_generated_tasks": ai_generated_tasks,
        "ai_usage_rate": round(ai_generated_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0
    }

# 批量操作
@router.post("/batch/update-status")
async def batch_update_status(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """批量更新任务状态"""
    task_ids = request.get("task_ids", [])
    new_status = request.get("status")
    
    if not task_ids or not new_status:
        raise HTTPException(status_code=400, detail="任务ID列表和状态不能为空")
    
    # 验证状态值
    if new_status not in ["todo", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="无效的状态值")
    
    # 批量更新
    updated_count = db.query(Task).filter(
        Task.id.in_(task_ids),
        Task.user_id == current_user.id
    ).update(
        {"status": new_status, "updated_at": datetime.utcnow()},
        synchronize_session=False
    )
    
    db.commit()
    
    return {
        "message": f"已更新 {updated_count} 个任务的状态",
        "updated_count": updated_count
    }

@router.delete("/batch/delete")
async def batch_delete_tasks(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """批量删除任务"""
    task_ids = request.get("task_ids", [])
    
    if not task_ids:
        raise HTTPException(status_code=400, detail="任务ID列表不能为空")
    
    # 批量删除
    deleted_count = db.query(Task).filter(
        Task.id.in_(task_ids),
        Task.user_id == current_user.id
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "message": f"已删除 {deleted_count} 个任务",
        "deleted_count": deleted_count
    }

