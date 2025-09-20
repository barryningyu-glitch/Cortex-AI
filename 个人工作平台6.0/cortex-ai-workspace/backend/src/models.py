from sqlalchemy import Column, String, Text, DateTime, Integer, Enum, ForeignKey, JSON, Table, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()

# 生成UUID的辅助函数
def generate_uuid():
    return str(uuid.uuid4())

# 笔记标签关联表
note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', String, ForeignKey('notes.id'), primary_key=True),
    Column('tag_id', String, ForeignKey('tags.id'), primary_key=True)
)

# 枚举类型定义
class PriorityEnum(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(enum.Enum):
    todo = "todo"
    doing = "doing"
    done = "done"

class RoleEnum(enum.Enum):
    user = "user"
    ai = "ai"

# 用户模型
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    pomodoro_settings = Column(JSON, default={
        "work": 25,
        "short_break": 5,
        "long_break": 15,
        "theme": "default",
        "auto_cycle": False
    })
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    pomodoro_logs = relationship("PomodoroLog", back_populates="user", cascade="all, delete-orphan")

# 分类模型
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(50), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    user = relationship("User", back_populates="categories")
    folders = relationship("Folder", back_populates="category", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="category")

# 文件夹模型
class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    category = relationship("Category", back_populates="folders")
    user = relationship("User")
    notes = relationship("Note", back_populates="folder", cascade="all, delete-orphan")

# 笔记模型
class Note(Base):
    __tablename__ = "notes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    folder = relationship("Folder", back_populates="notes")
    user = relationship("User", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")

# 标签模型
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(50), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    user = relationship("User")
    notes = relationship("Note", secondary=note_tags, back_populates="tags")

# 任务模型
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    status = Column(Enum(StatusEnum), default=StatusEnum.todo)
    category_id = Column(String, ForeignKey("categories.id"))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    reminder_minutes_before = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    category = relationship("Category", back_populates="tasks")
    user = relationship("User", back_populates="tasks")
    pomodoro_logs = relationship("PomodoroLog", back_populates="task")

# 对话会话模型
class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

# 对话消息模型
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    session = relationship("ChatSession", back_populates="messages")

# 番茄钟记录模型
class PomodoroLog(Base):
    __tablename__ = "pomodoro_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    duration = Column(Integer, nullable=False)  # 分钟
    completed_at = Column(DateTime, default=func.now())
    
    # 关系
    user = relationship("User", back_populates="pomodoro_logs")
    task = relationship("Task", back_populates="pomodoro_logs")

