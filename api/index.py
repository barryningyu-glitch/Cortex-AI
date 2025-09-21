import json
import hashlib
import datetime
import base64
import hmac

# 用户数据库
USERS_DB = {
    "宁宇": {
        "id": 1,
        "username": "宁宇",
        "email": "ningyu@example.com",
        "password_hash": "c9ef2891a68d8249d96080b0eb07452a3d2134d794a8a4d00bcda4ada476765e"
    },
    "test": {
        "id": 2,
        "username": "test",
        "email": "test@example.com",
        "password_hash": "c9ef2891a68d8249d96080b0eb07452a3d2134d794a8a4d00bcda4ada476765e"
    }
}

SECRET_KEY = "cortex-ai-workspace-secret-key-2025"

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return hash_password(plain_password) == hashed_password

def create_access_token(data):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    to_encode.update({"exp": int(expire.timestamp())})

    header = {"alg": "HS256", "typ": "JWT"}
    header_encoded = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
    payload_encoded = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip('=')
    message = f"{header_encoded}.{payload_encoded}"
    signature = hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).digest()
    signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')

    return f"{header_encoded}.{payload_encoded}.{signature_encoded}"

def handler(request, context=None):
    """Vercel serverless function handler"""

    # 获取请求信息
    method = request.get('method', 'GET')
    path = request.get('path', '')
    headers = request.get('headers', {})

    # CORS处理
    if method == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400"
            },
            "body": ""
        }

    # 健康检查
    if path == '/health' and method == 'GET':
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({
                "status": "healthy",
                "timestamp": datetime.datetime.now().isoformat(),
                "service": "Cortex AI Backend"
            })
        }

    # API根路径
    if path == '/api/' and method == 'GET':
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({
                "message": "Cortex AI Workspace API",
                "version": "1.0.0",
                "status": "running"
            })
        }

    # 登录端点
    if path == '/api/auth/login' and method == 'POST':
        try:
            # 获取请求体
            body = request.get('body', '{}')
            if isinstance(body, str):
                data = json.loads(body)
            else:
                data = body

            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                raise ValueError("用户名和密码不能为空")

            user = USERS_DB.get(username)
            if not user or not verify_password(password, user["password_hash"]):
                raise ValueError("用户名或密码错误")

            access_token = create_access_token({"sub": user["username"]})

            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                "body": json.dumps({
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": user["id"],
                        "username": user["username"],
                        "email": user["email"]
                    }
                })
            }

        except Exception as e:
            return {
                "statusCode": 401,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                "body": json.dumps({"detail": str(e)})
            }

    # 默认响应
    return {
        "statusCode": 404,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        "body": json.dumps({"detail": "API endpoint not found"})
    }