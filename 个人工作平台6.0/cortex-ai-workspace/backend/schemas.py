from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# 枚举类型
class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    completed = "completed"

class CategoryEnum(str, Enum):
    work = "work"
    study = "study"
    life = "life"

# 用户相关模式
class UserBase(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int  # 整数类型以匹配数据库模型
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# 认证相关模式
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

# 分类相关模式
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(default="#3b82f6", pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: str = Field(default="📁", max_length=10)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# 文件夹相关模式
class FolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: CategoryEnum

class FolderCreate(FolderBase):
    pass

class FolderUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[CategoryEnum] = None

class FolderResponse(FolderBase):
    id: int
    note_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

# 笔记相关模式
class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    category: CategoryEnum
    folder_id: Optional[int] = None
    tags: Optional[List[str]] = []

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[CategoryEnum] = None
    folder_id: Optional[int] = None
    tags: Optional[List[str]] = None

class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 任务相关模式
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: StatusEnum = StatusEnum.todo
    priority: PriorityEnum = PriorityEnum.medium
    category: CategoryEnum
    project_id: Optional[int] = None
    due_date: Optional[datetime] = None
    estimated_time: Optional[int] = None
    tags: Optional[List[str]] = []
    subtasks: Optional[List[Dict[str, Any]]] = []

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    priority: Optional[PriorityEnum] = None
    category: Optional[CategoryEnum] = None
    project_id: Optional[int] = None
    due_date: Optional[datetime] = None
    estimated_time: Optional[int] = None
    actual_time: Optional[int] = None
    tags: Optional[List[str]] = None
    subtasks: Optional[List[Dict[str, Any]]] = None

class TaskResponse(TaskBase):
    id: int
    actual_time: Optional[int] = None
    ai_generated: bool = False
    ai_model: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 对话相关模式
class ConversationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    title: Optional[str] = None

class ConversationResponse(ConversationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1)
    model: Optional[str] = None

class MessageCreate(MessageBase):
    conversation_id: int

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    tokens_used: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# 番茄钟相关模式
class PomodoroSessionBase(BaseModel):
    session_type: str = Field(..., pattern="^(work|short_break|long_break)$")
    duration: int = Field(..., ge=1, le=120)
    theme: str = Field(default="classic", max_length=20)
    task_id: Optional[int] = None

class PomodoroSessionCreate(PomodoroSessionBase):
    pass

class PomodoroSessionUpdate(BaseModel):
    completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

class PomodoroSessionResponse(PomodoroSessionBase):
    id: int
    completed: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# AI相关模式
class AIPolishRequest(BaseModel):
    text: str = Field(..., min_length=1)
    style: Optional[str] = "formal"

class AIPolishResponse(BaseModel):
    polished_text: str

class AIAnalyzeNoteRequest(BaseModel):
    title: str
    content: str

class AIAnalyzeNoteResponse(BaseModel):
    category: str
    folder: str
    tags: List[str]

class AIParseTaskRequest(BaseModel):
    text: str = Field(..., min_length=1)

class AIParseTaskResponse(BaseModel):
    title: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    category: Optional[str] = None
    priority: PriorityEnum

class AIChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    model: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    model: str
    usage: Optional[Dict[str, Any]] = None

class AIEnhanceRequest(BaseModel):
    text: str = Field(..., min_length=1)
    mode: str = Field(default="improve", pattern="^(improve|summarize|expand|translate|restructure)$")
    model: Optional[str] = None

class AIEnhanceResponse(BaseModel):
    enhanced_text: str
    model: str
    mode: str
    usage: Optional[Dict[str, Any]] = None

class AITagsRequest(BaseModel):
    title: str
    content: str
    model: Optional[str] = None

class AITagsResponse(BaseModel):
    tags: List[str]
    model: str
    confidence: float = 0.8

class AICategorizeRequest(BaseModel):
    title: str
    content: str
    model: Optional[str] = None

class AICategorizeResponse(BaseModel):
    category: str
    folder: str
    confidence: float
    reasoning: str
    model: str

class AIParseTasksRequest(BaseModel):
    text: str = Field(..., min_length=1)
    model: Optional[str] = None

class AIParseTasksResponse(BaseModel):
    tasks: List[Dict[str, Any]]
    model: str
    total_count: int

# 用户设置相关模式
class UserSettingsBase(BaseModel):
    theme: str = Field(default="dark", pattern="^(light|dark)$")
    language: str = Field(default="zh", pattern="^(zh|en)$")
    default_ai_model: str = Field(default="gpt-5")
    pomodoro_work_time: int = Field(default=25, ge=15, le=60)
    pomodoro_short_break: int = Field(default=5, ge=3, le=15)
    pomodoro_long_break: int = Field(default=15, ge=10, le=30)
    pomodoro_theme: str = Field(default="classic")
    notifications_enabled: bool = True

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    default_ai_model: Optional[str] = None
    pomodoro_work_time: Optional[int] = None
    pomodoro_short_break: Optional[int] = None
    pomodoro_long_break: Optional[int] = None
    pomodoro_theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 统计相关模式
class UserStatsResponse(BaseModel):
    total_notes: int
    total_tasks: int
    completed_tasks: int
    total_pomodoros: int
    total_ai_usage: int
    this_week_notes: int
    this_week_tasks: int
    this_week_pomodoros: int

class AIUsageStatsResponse(BaseModel):
    total_requests: int
    text_enhancements: int
    chat_messages: int
    task_parsing: int
    current_month_usage: Dict[str, int]
    favorite_model: str
    last_used: datetime

