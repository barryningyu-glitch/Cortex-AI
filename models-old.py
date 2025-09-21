from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Table, Enum
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

class NoteCategoryEnum(enum.Enum):
    work = "工作"
    study = "学习"
    life = "生活"

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
        "auto_start": False,
        "sound_enabled": True
    })
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="user", cascade="all, delete-orphan")

# 分类模型（兼容性）
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    user = relationship("User")

# 文件夹模型
class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    category = Column(Enum(NoteCategoryEnum), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_pinned = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="folders")
    notes = relationship("Note", back_populates="folder", cascade="all, delete-orphan")

# 笔记模型
class Note(Base):
    __tablename__ = "notes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    category = Column(Enum(NoteCategoryEnum), nullable=False, default=NoteCategoryEnum.study)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    ai_summary = Column(Text, nullable=True)  # AI生成的摘要
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="notes")
    folder = relationship("Folder", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")

# 标签模型
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(50), nullable=False)
    color = Column(String(7), default="#0066CC")  # 十六进制颜色
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
    description = Column(Text, nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.todo)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    project = Column(String(100), nullable=True)
    tags = Column(JSON, default=[])
    subtasks = Column(JSON, default=[])
    estimated_time = Column(Integer, nullable=True)  # 预估时间（分钟）
    actual_time = Column(Integer, nullable=True)     # 实际时间（分钟）
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="tasks")

# 对话模型
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    model = Column(String(50), default="openai/gpt-5")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

# 消息模型
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    content = Column(Text, nullable=False)
    model = Column(String(50), nullable=True)
    tokens_used = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    conversation = relationship("Conversation", back_populates="messages")

# 番茄钟会话模型
class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    session_type = Column(String(20), nullable=False)  # work, short_break, long_break
    duration = Column(Integer, nullable=False)  # 持续时间（分钟）
    completed = Column(Boolean, default=False)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=True)  # 关联的任务
    notes = Column(Text, nullable=True)  # 会话笔记
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # 关系
    user = relationship("User", back_populates="pomodoro_sessions")
    task = relationship("Task")

# 用户活动日志模型
class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)  # create, update, delete, etc.
    resource_type = Column(String(50), nullable=False)  # note, task, conversation, etc.
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    user = relationship("User")

