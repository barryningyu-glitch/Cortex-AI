from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, date, timedelta

from database import get_db
from models import User, PomodoroLog, Task
from schemas import PomodoroLog as PomodoroLogSchema, PomodoroLogCreate, PomodoroSettings
from routers.auth import get_current_user

router = APIRouter()

@router.get("/logs", response_model=List[PomodoroLogSchema])
def get_pomodoro_logs(
    skip: int = 0,
    limit: int = 100,
    task_id: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取番茄钟记录"""
    query = db.query(PomodoroLog).filter(PomodoroLog.user_id == current_user.id)
    
    if task_id:
        query = query.filter(PomodoroLog.task_id == task_id)
    if date_from:
        query = query.filter(PomodoroLog.completed_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(PomodoroLog.completed_at <= datetime.combine(date_to, datetime.max.time()))
    
    logs = query.order_by(PomodoroLog.completed_at.desc()).offset(skip).limit(limit).all()
    return logs

@router.post("/logs", response_model=PomodoroLogSchema)
def create_pomodoro_log(log: PomodoroLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """记录完成的番茄钟"""
    # 验证任务（如果提供）
    if log.task_id:
        task = db.query(Task).filter(Task.id == log.task_id, Task.user_id == current_user.id).first()
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")
    
    # 创建记录
    db_log = PomodoroLog(
        user_id=current_user.id,
        task_id=log.task_id,
        duration=log.duration
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/settings", response_model=PomodoroSettings)
def get_pomodoro_settings(current_user: User = Depends(get_current_user)):
    """获取用户的番茄钟设置"""
    settings = current_user.pomodoro_settings or {}
    return PomodoroSettings(
        work=settings.get("work", 25),
        short_break=settings.get("short_break", 5),
        long_break=settings.get("long_break", 15),
        theme=settings.get("theme", "default"),
        auto_cycle=settings.get("auto_cycle", False)
    )

@router.put("/settings", response_model=PomodoroSettings)
def update_pomodoro_settings(settings: PomodoroSettings, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """更新用户的番茄钟设置"""
    current_user.pomodoro_settings = settings.dict()
    db.commit()
    return settings

@router.get("/stats/daily", response_model=dict)
def get_daily_stats(
    date_param: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取每日番茄钟统计"""
    target_date = date_param or date.today()
    start_time = datetime.combine(target_date, datetime.min.time())
    end_time = datetime.combine(target_date, datetime.max.time())
    
    # 查询当日记录
    logs = db.query(PomodoroLog).filter(
        and_(
            PomodoroLog.user_id == current_user.id,
            PomodoroLog.completed_at >= start_time,
            PomodoroLog.completed_at <= end_time
        )
    ).all()
    
    total_count = len(logs)
    total_minutes = sum(log.duration for log in logs)
    
    # 按任务分组统计
    task_stats = {}
    for log in logs:
        if log.task_id:
            if log.task_id not in task_stats:
                task = db.query(Task).filter(Task.id == log.task_id).first()
                task_stats[log.task_id] = {
                    "task_title": task.title if task else "未知任务",
                    "count": 0,
                    "minutes": 0
                }
            task_stats[log.task_id]["count"] += 1
            task_stats[log.task_id]["minutes"] += log.duration
    
    return {
        "date": target_date.isoformat(),
        "total_pomodoros": total_count,
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 2),
        "task_breakdown": list(task_stats.values())
    }

@router.get("/stats/weekly", response_model=dict)
def get_weekly_stats(
    week_start: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取周统计"""
    if not week_start:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
    
    week_end = week_start + timedelta(days=6)
    start_time = datetime.combine(week_start, datetime.min.time())
    end_time = datetime.combine(week_end, datetime.max.time())
    
    # 查询本周记录
    logs = db.query(PomodoroLog).filter(
        and_(
            PomodoroLog.user_id == current_user.id,
            PomodoroLog.completed_at >= start_time,
            PomodoroLog.completed_at <= end_time
        )
    ).all()
    
    # 按日期分组
    daily_stats = {}
    for i in range(7):
        current_date = week_start + timedelta(days=i)
        daily_stats[current_date.isoformat()] = {
            "date": current_date.isoformat(),
            "count": 0,
            "minutes": 0
        }
    
    for log in logs:
        log_date = log.completed_at.date()
        date_key = log_date.isoformat()
        if date_key in daily_stats:
            daily_stats[date_key]["count"] += 1
            daily_stats[date_key]["minutes"] += log.duration
    
    total_count = len(logs)
    total_minutes = sum(log.duration for log in logs)
    
    return {
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "total_pomodoros": total_count,
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 2),
        "daily_breakdown": list(daily_stats.values()),
        "average_per_day": round(total_count / 7, 2)
    }

@router.get("/stats/task/{task_id}", response_model=dict)
def get_task_pomodoro_stats(task_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """获取特定任务的番茄钟统计"""
    # 验证任务
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    # 查询该任务的所有番茄钟记录
    logs = db.query(PomodoroLog).filter(
        PomodoroLog.task_id == task_id,
        PomodoroLog.user_id == current_user.id
    ).order_by(PomodoroLog.completed_at).all()
    
    total_count = len(logs)
    total_minutes = sum(log.duration for log in logs)
    
    # 按日期分组
    daily_counts = {}
    for log in logs:
        date_key = log.completed_at.date().isoformat()
        daily_counts[date_key] = daily_counts.get(date_key, 0) + 1
    
    return {
        "task_id": task_id,
        "task_title": task.title,
        "total_pomodoros": total_count,
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 2),
        "first_session": logs[0].completed_at.isoformat() if logs else None,
        "last_session": logs[-1].completed_at.isoformat() if logs else None,
        "daily_counts": daily_counts
    }

@router.delete("/logs/{log_id}")
def delete_pomodoro_log(log_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """删除番茄钟记录"""
    log = db.query(PomodoroLog).filter(PomodoroLog.id == log_id, PomodoroLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    db.delete(log)
    db.commit()
    return {"message": "记录已删除"}

