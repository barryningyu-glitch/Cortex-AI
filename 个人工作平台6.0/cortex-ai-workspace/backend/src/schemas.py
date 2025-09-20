from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# 认证相关模式
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserChangePassword(BaseModel):
    current_password: str
    new_password: str

# 枚举类型
class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(str, Enum):
    todo = "todo"
    doing = "doing"
    done = "done"

class RoleEnum(str, Enum):
    user = "user"
    ai = "ai"

# 基础模式
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

# 用户相关模式
class UserBase(BaseSchema):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None
    is_superuser: Optional[bool] = False

class UserUpdate(BaseSchema):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    pomodoro_settings: Optional[dict] = None

class User(UserBase):
    id: str
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    last_login: Optional[datetime] = None
    created_at: datetime

# 分类相关模式
class CategoryBase(BaseSchema):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: str
    user_id: str
    created_at: datetime

# 文件夹相关模式
class FolderBase(BaseSchema):
    name: str

class FolderCreate(FolderBase):
    category_id: str

class Folder(FolderBase):
    id: str
    category_id: str
    user_id: str
    created_at: datetime

# 标签相关模式
class TagBase(BaseSchema):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: str
    user_id: str
    created_at: datetime

# 笔记相关模式
class NoteBase(BaseSchema):
    title: str
    content: Optional[str] = None

class NoteCreate(NoteBase):
    folder_id: str
    tag_ids: Optional[List[str]] = []

class NoteUpdate(BaseSchema):
    title: Optional[str] = None
    content: Optional[str] = None
    folder_id: Optional[str] = None
    tag_ids: Optional[List[str]] = None

class Note(NoteBase):
    id: str
    folder_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    tags: List[Tag] = []

# 任务相关模式
class TaskBase(BaseSchema):
    title: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    priority: PriorityEnum = PriorityEnum.medium
    status: StatusEnum = StatusEnum.todo

class TaskCreate(TaskBase):
    category_id: Optional[str] = None
    reminder_minutes_before: Optional[int] = 0

class TaskUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    category_id: Optional[str] = None
    reminder_minutes_before: Optional[int] = None

class Task(TaskBase):
    id: str
    category_id: Optional[str] = None
    user_id: str
    reminder_minutes_before: int
    created_at: datetime
    updated_at: datetime

# 对话相关模式
class ChatSessionBase(BaseSchema):
    title: str

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSession(ChatSessionBase):
    id: str
    user_id: str
    created_at: datetime

class ChatMessageBase(BaseSchema):
    content: str
    role: RoleEnum

class ChatMessageCreate(ChatMessageBase):
    session_id: str

class ChatMessage(ChatMessageBase):
    id: str
    session_id: str
    created_at: datetime

# 番茄钟相关模式
class PomodoroLogBase(BaseSchema):
    duration: int

class PomodoroLogCreate(PomodoroLogBase):
    task_id: Optional[str] = None

class PomodoroLog(PomodoroLogBase):
    id: str
    user_id: str
    task_id: Optional[str] = None
    completed_at: datetime

class PomodoroSettings(BaseSchema):
    work: int = 25
    short_break: int = 5
    long_break: int = 15
    theme: str = "default"
    auto_cycle: bool = False

# AI相关模式
class AIPolishRequest(BaseSchema):
    text: str

class AIPolishResponse(BaseSchema):
    polished_text: str

class AIAnalyzeNoteRequest(BaseSchema):
    title: str
    content: str

class AIAnalyzeNoteResponse(BaseSchema):
    category: str
    folder: str
    tags: List[str]

class AIParseTaskRequest(BaseSchema):
    text: str

class AIParseTaskResponse(BaseSchema):
    title: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    category: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium

class AIChatRequest(BaseSchema):
    text: str
    session_id: str
    context: Optional[dict] = None

class AIChatResponse(BaseSchema):
    response_type: str  # "message" or "action"
    content: str
    action_details: Optional[dict] = None

# 认证相关模式
class Token(BaseSchema):
    access_token: str
    token_type: str

class TokenData(BaseSchema):
    username: Optional[str] = None

# 笔记树状结构
class NoteTreeItem(BaseSchema):
    id: str
    name: str
    type: str  # "category", "folder", "note"
    children: Optional[List['NoteTreeItem']] = []

# 响应模式
class MessageResponse(BaseSchema):
    message: str
    data: Optional[dict] = None

