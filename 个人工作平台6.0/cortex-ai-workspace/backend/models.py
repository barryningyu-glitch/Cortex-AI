from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship, foreign
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    color = Column(String(7), default="#3b82f6")  # 十六进制颜色
    icon = Column(String(10), default="📁")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="categories")
    notes = relationship("Note", back_populates="category_obj",
                        primaryjoin="and_(Category.name == foreign(Note.category), Category.user_id == foreign(Note.user_id))",
                        viewonly=True)
    folders = relationship("Folder", back_populates="category_obj",
                          primaryjoin="and_(Category.name == foreign(Folder.category), Category.user_id == foreign(Folder.user_id))",
                          viewonly=True)

class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # work, study, life
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="folders")
    category_obj = relationship("Category", back_populates="folders", 
                               primaryjoin="and_(Folder.category == Category.name, Folder.user_id == Category.user_id)",
                               foreign_keys=[category, user_id], viewonly=True)
    notes = relationship("Note", back_populates="folder")

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)  # work, study, life
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    tags = Column(Text, nullable=True)  # JSON字符串存储标签
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="notes")
    folder = relationship("Folder", back_populates="notes")
    category_obj = relationship("Category", back_populates="notes",
                               primaryjoin="and_(Note.category == Category.name, Note.user_id == Category.user_id)",
                               foreign_keys=[category, user_id], viewonly=True)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="todo")  # todo, in_progress, completed
    priority = Column(String(10), default="medium")  # low, medium, high
    category = Column(String(50), nullable=False)  # work, study, life
    project_id = Column(Integer, nullable=True)
    due_date = Column(DateTime, nullable=True)
    estimated_time = Column(Integer, nullable=True)  # 预估时间（分钟）
    actual_time = Column(Integer, nullable=True)  # 实际时间（分钟）
    tags = Column(Text, nullable=True)  # JSON字符串存储标签
    subtasks = Column(Text, nullable=True)  # JSON字符串存储子任务
    ai_generated = Column(Boolean, default=False)
    ai_model = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="tasks")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    model = Column(String(50), nullable=True)  # AI模型名称
    tokens_used = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    conversation = relationship("Conversation", back_populates="messages")

class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_type = Column(String(20), nullable=False)  # work, short_break, long_break
    duration = Column(Integer, nullable=False)  # 持续时间（分钟）
    completed = Column(Boolean, default=False)
    theme = Column(String(20), default="classic")
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # 关系
    user = relationship("User", back_populates="pomodoro_sessions")
    task = relationship("Task", backref="pomodoro_sessions")

class AIUsage(Base):
    __tablename__ = "ai_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    model = Column(String(50), nullable=False)
    operation = Column(String(50), nullable=False)  # chat, enhance, parse_task, etc.
    tokens_used = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", backref="ai_usage_records")

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    theme = Column(String(20), default="dark")
    language = Column(String(10), default="zh")
    default_ai_model = Column(String(50), default="openai/gpt-5")
    pomodoro_work_time = Column(Integer, default=25)
    pomodoro_short_break = Column(Integer, default=5)
    pomodoro_long_break = Column(Integer, default=15)
    pomodoro_theme = Column(String(20), default="classic")
    notifications_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", backref="settings")

