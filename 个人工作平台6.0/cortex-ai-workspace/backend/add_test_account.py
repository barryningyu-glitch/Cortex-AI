import sqlite3
from datetime import datetime
from passlib.context import CryptContext

# 密码加密上下文（与auth.py保持一致）
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 连接数据库
conn = sqlite3.connect('cortex_workspace.db')
cursor = conn.cursor()

# 测试账户信息
username = 'test'
email = 'test@test.com'
password = '123456'

# 密码哈希（使用bcrypt）
hashed_password = pwd_context.hash(password)

try:
    # 检查用户是否已存在
    cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
    existing_user = cursor.fetchone()
    
    if existing_user:
        print(f"用户 '{username}' 已存在，正在更新密码...")
        cursor.execute('''
        UPDATE users SET hashed_password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE username = ?
        ''', (hashed_password, username))
    else:
        print(f"创建新用户 '{username}'...")
        cursor.execute('''
        INSERT INTO users (username, email, hashed_password, is_active, is_superuser, created_at, updated_at)
        VALUES (?, ?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ''', (username, email, hashed_password))
    
    conn.commit()
    print("✅ 测试账户创建/更新成功！")
    print(f"用户名: {username}")
    print(f"密码: {password}")
    print(f"邮箱: {email}")
    
except sqlite3.Error as e:
    print(f"❌ 数据库操作失败: {e}")
    conn.rollback()
finally:
    conn.close()