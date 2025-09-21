import sqlite3
import hashlib
import uuid
from datetime import datetime

# 连接数据库
conn = sqlite3.connect('cortex_workspace.db')
cursor = conn.cursor()

# 创建用户表（如果不存在）
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    is_superuser BOOLEAN DEFAULT 0,
    last_login DATETIME,
    pomodoro_settings TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# 创建其他必要的表
cursor.execute('''
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    user_id TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL DEFAULT 'study',
    folder_id TEXT,
    user_id TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    ai_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (folder_id) REFERENCES folders (id)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#0066CC',
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

# 创建测试用户
user_id = str(uuid.uuid4())
username = 'testuser'
email = 'test@example.com'
password = 'test123'

# 简单的密码哈希（实际应用中应该使用bcrypt）
hashed_password = hashlib.sha256(password.encode()).hexdigest()

cursor.execute('''
INSERT OR REPLACE INTO users (id, username, email, hashed_password, is_active, is_superuser)
VALUES (?, ?, ?, ?, 1, 0)
''', (user_id, username, email, hashed_password))

print(f"创建用户: {username}")
print(f"密码: {password}")
print(f"用户ID: {user_id}")

# 创建一些示例文件夹
folders = [
    ('React开发', 'study'),
    ('项目管理', 'work'),
    ('读书笔记', 'study'),
    ('生活记录', 'life')
]

for folder_name, category in folders:
    folder_id = str(uuid.uuid4())
    cursor.execute('''
    INSERT INTO folders (id, name, category, user_id)
    VALUES (?, ?, ?, ?)
    ''', (folder_id, folder_name, category, user_id))
    print(f"创建文件夹: {folder_name} ({category})")

# 创建一些示例笔记
notes = [
    ('React Hooks学习', 'React Hooks是React 16.8引入的新特性...', 'study'),
    ('项目进度跟踪', '本周完成的任务：\n1. 用户登录功能\n2. 笔记系统', 'work'),
    ('今日感想', '今天学习了很多新知识，感觉很充实。', 'life')
]

for title, content, category in notes:
    note_id = str(uuid.uuid4())
    cursor.execute('''
    INSERT INTO notes (id, title, content, category, user_id)
    VALUES (?, ?, ?, ?, ?)
    ''', (note_id, title, content, category, user_id))
    print(f"创建笔记: {title} ({category})")

conn.commit()
conn.close()

print("数据库初始化完成！")
