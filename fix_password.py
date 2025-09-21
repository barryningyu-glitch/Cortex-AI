import sqlite3
from passlib.context import CryptContext

# 密码加密配置
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 连接数据库
conn = sqlite3.connect('cortex_workspace.db')
cursor = conn.cursor()

# 更新用户密码为bcrypt哈希
password = 'test123'
hashed_password = pwd_context.hash(password)

cursor.execute('''
UPDATE users SET hashed_password = ? WHERE username = ?
''', (hashed_password, 'testuser'))

conn.commit()
conn.close()

print(f"密码已更新为bcrypt哈希: {hashed_password}")
