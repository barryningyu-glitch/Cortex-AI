from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime, date, timedelta

from database import get_db
from models import User, PomodoroSession, UserSettings
from schemas import PomodoroSessionCreate, PomodoroSessionResponse
from routers.auth import get_current_user

router = APIRouter()

# 番茄钟会话管理
@router.post("/sessions", response_model=PomodoroSessionResponse)
async def create_pomodoro_session(
    session_data: PomodoroSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建番茄钟会话"""
    session = PomodoroSession(
        user_id=current_user.id,
        session_type=session_data.session_type,
        duration=session_data.duration,
        task_id=session_data.task_id,
        completed=False,  # 新创建的会话默认未完成
        theme=session_data.theme or "classic"
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {
        "id": session.id,
        "session_type": session.session_type,
        "duration": session.duration,
        "task_id": session.task_id,
        "completed": session.completed,
        "theme": session.theme,
        "started_at": session.started_at,
        "completed_at": session.completed_at
    }

@router.get("/sessions", response_model=List[PomodoroSessionResponse])
async def get_pomodoro_sessions(
    limit: int = 50,
    offset: int = 0,
    session_type: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取番茄钟会话列表"""
    query = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id
    )
    
    if session_type:
        query = query.filter(PomodoroSession.session_type == session_type)
    
    if date_from:
        query = query.filter(PomodoroSession.created_at >= date_from)
    
    if date_to:
        query = query.filter(PomodoroSession.created_at <= date_to + timedelta(days=1))
    
    sessions = query.order_by(PomodoroSession.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": session.id,
            "session_type": session.session_type,
            "duration": session.duration,
            "task_id": session.task_id,
            "completed": session.completed,
            "theme": session.theme,
            "created_at": session.created_at
        }
        for session in sessions
    ]

@router.get("/stats")
async def get_pomodoro_stats(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取番茄钟统计信息"""
    # 计算日期范围
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # 总会话数
    total_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= start_date
    ).count()
    
    # 完成的会话数
    completed_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= start_date,
        PomodoroSession.completed == True
    ).count()
    
    # 工作会话数
    work_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= start_date,
        PomodoroSession.session_type == "work",
        PomodoroSession.completed == True
    ).count()
    
    # 总专注时间（分钟）
    total_focus_time = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= start_date,
        PomodoroSession.session_type == "work",
        PomodoroSession.completed == True
    ).all()
    
    focus_minutes = sum(session.duration for session in total_focus_time)
    
    # 今日统计
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= today_start,
        PomodoroSession.completed == True
    ).count()
    
    today_focus_time = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= today_start,
        PomodoroSession.session_type == "work",
        PomodoroSession.completed == True
    ).all()
    
    today_focus_minutes = sum(session.duration for session in today_focus_time)
    
    # 每日统计（最近7天）
    daily_stats = []
    for i in range(days):
        day_start = (end_date - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_sessions = db.query(PomodoroSession).filter(
            PomodoroSession.user_id == current_user.id,
            PomodoroSession.created_at >= day_start,
            PomodoroSession.created_at < day_end,
            PomodoroSession.session_type == "work",
            PomodoroSession.completed == True
        ).all()
        
        day_count = len(day_sessions)
        day_minutes = sum(session.duration for session in day_sessions)
        
        daily_stats.append({
            "date": day_start.date().isoformat(),
            "sessions": day_count,
            "focus_time": day_minutes
        })
    
    # 主题使用统计
    theme_stats = {}
    theme_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= start_date
    ).all()
    
    for session in theme_sessions:
        theme = session.theme or "classic"
        theme_stats[theme] = theme_stats.get(theme, 0) + 1
    
    return {
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "work_sessions": work_sessions,
        "completion_rate": round(completed_sessions / total_sessions * 100, 1) if total_sessions > 0 else 0,
        "total_focus_time": focus_minutes,
        "average_daily_sessions": round(work_sessions / days, 1),
        "today_sessions": today_sessions,
        "today_focus_time": today_focus_minutes,
        "daily_stats": list(reversed(daily_stats)),  # 最近的日期在前
        "theme_stats": theme_stats,
        "period_days": days
    }

@router.put("/sessions/{session_id}")
async def update_pomodoro_session(
    session_id: int,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新番茄钟会话"""
    session = db.query(PomodoroSession).filter(
        PomodoroSession.id == session_id,
        PomodoroSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 更新字段
    if "completed" in updates:
        session.completed = updates["completed"]
    if "duration" in updates:
        session.duration = updates["duration"]
    if "theme" in updates:
        session.theme = updates["theme"]
    
    db.commit()
    db.refresh(session)
    
    return {"message": "会话已更新", "session_id": session.id}

@router.delete("/sessions/{session_id}")
async def delete_pomodoro_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除番茄钟会话"""
    session = db.query(PomodoroSession).filter(
        PomodoroSession.id == session_id,
        PomodoroSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    db.delete(session)
    db.commit()
    
    return {"message": "会话已删除"}

# 用户番茄钟设置
@router.get("/settings")
async def get_pomodoro_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户番茄钟设置"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # 创建默认设置
        settings = UserSettings(
            user_id=current_user.id,
            pomodoro_work_time=25,
            pomodoro_short_break=5,
            pomodoro_long_break=15,
            pomodoro_theme="classic",
            pomodoro_sound_enabled=True,
            pomodoro_sound_volume=50,
            pomodoro_auto_start=False
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "work_time": settings.pomodoro_work_time,
        "short_break": settings.pomodoro_short_break,
        "long_break": settings.pomodoro_long_break,
        "theme": settings.pomodoro_theme,
        "sound_enabled": settings.pomodoro_sound_enabled,
        "sound_volume": settings.pomodoro_sound_volume,
        "auto_start": settings.pomodoro_auto_start
    }

@router.put("/settings")
async def update_pomodoro_settings(
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户番茄钟设置"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    # 更新设置
    if "work_time" in updates:
        settings.pomodoro_work_time = updates["work_time"]
    if "short_break" in updates:
        settings.pomodoro_short_break = updates["short_break"]
    if "long_break" in updates:
        settings.pomodoro_long_break = updates["long_break"]
    if "theme" in updates:
        settings.pomodoro_theme = updates["theme"]
    if "sound_enabled" in updates:
        settings.pomodoro_sound_enabled = updates["sound_enabled"]
    if "sound_volume" in updates:
        settings.pomodoro_sound_volume = updates["sound_volume"]
    if "auto_start" in updates:
        settings.pomodoro_auto_start = updates["auto_start"]
    
    db.commit()
    db.refresh(settings)
    
    return {"message": "设置已更新"}

# 番茄钟与任务关联
@router.post("/sessions/{session_id}/link-task")
async def link_task_to_session(
    session_id: int,
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """将番茄钟会话关联到任务"""
    session = db.query(PomodoroSession).filter(
        PomodoroSession.id == session_id,
        PomodoroSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    task_id = request.get("task_id")
    if task_id:
        session.task_id = task_id
        db.commit()
        db.refresh(session)
    
    return {"message": "任务关联成功", "session_id": session.id, "task_id": task_id}

@router.get("/task-stats/{task_id}")
async def get_task_pomodoro_stats(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取特定任务的番茄钟统计"""
    sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.task_id == task_id,
        PomodoroSession.completed == True
    ).all()
    
    total_sessions = len(sessions)
    total_time = sum(session.duration for session in sessions)
    
    return {
        "task_id": task_id,
        "total_sessions": total_sessions,
        "total_time": total_time,
        "sessions": [
            {
                "id": session.id,
                "duration": session.duration,
                "created_at": session.created_at
            }
            for session in sessions
        ]
    }

# 批量操作
@router.post("/sessions/batch/delete")
async def batch_delete_sessions(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """批量删除番茄钟会话"""
    session_ids = request.get("session_ids", [])
    
    if not session_ids:
        raise HTTPException(status_code=400, detail="会话ID列表不能为空")
    
    deleted_count = db.query(PomodoroSession).filter(
        PomodoroSession.id.in_(session_ids),
        PomodoroSession.user_id == current_user.id
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "message": f"已删除 {deleted_count} 个会话",
        "deleted_count": deleted_count
    }

# 导出数据
@router.get("/export")
async def export_pomodoro_data(
    format: str = "json",
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """导出番茄钟数据"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.created_at >= start_date
    ).order_by(PomodoroSession.created_at.desc()).all()
    
    data = {
        "export_date": datetime.utcnow().isoformat(),
        "period_days": days,
        "total_sessions": len(sessions),
        "sessions": [
            {
                "id": session.id,
                "session_type": session.session_type,
                "duration": session.duration,
                "task_id": session.task_id,
                "completed": session.completed,
                "theme": session.theme,
                "created_at": session.created_at.isoformat()
            }
            for session in sessions
        ]
    }
    
    return data

