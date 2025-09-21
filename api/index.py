import json
import hashlib
import datetime
from typing import Dict, Any

# JWT configuration
SECRET_KEY = "cortex-ai-workspace-secret-key-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# User database (simplified)
USERS_DB = {
    "宁宇": {
        "id": 1,
        "username": "宁宇",
        "email": "ningyu@example.com",
        "password_hash": "c9ef2891a68d8249d96080b0eb07452a3d2134d794a8a4d00bcda4ada476765e"  # ny123456
    },
    "test": {
        "id": 2,
        "username": "test",
        "email": "test@example.com",
        "password_hash": "c9ef2891a68d8249d96080b0eb07452a3d2134d794a8a4d00bcda4ada476765e"  # ny123456
    }
}

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: Dict[str, Any], expires_delta: datetime.timedelta = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": int(expire.timestamp())})  # Convert to timestamp

    # Simple JWT implementation without external library
    import base64
    import hmac

    # Create header
    header = {"alg": "HS256", "typ": "JWT"}
    header_encoded = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')

    # Create payload
    payload_encoded = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip('=')

    # Create signature
    message = f"{header_encoded}.{payload_encoded}"
    signature = hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).digest()
    signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')

    return f"{header_encoded}.{payload_encoded}.{signature_encoded}"

def handle_login(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle login request"""
    try:
        username = request_data.get("username")
        password = request_data.get("password")

        if not username or not password:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                "body": json.dumps({"detail": "用户名和密码不能为空"})
            }

        user = USERS_DB.get(username)
        if not user or not verify_password(password, user["password_hash"]):
            return {
                "statusCode": 401,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                "body": json.dumps({"detail": "用户名或密码错误"})
            }

        access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"]}, expires_delta=access_token_expires
        )

        # Convert datetime to string for JSON serialization
        user_data = {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }

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
                "user": user_data
            })
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"detail": f"服务器错误: {str(e)}"})
        }

def handler(request, context=None):
    """
    Vercel serverless function handler
    """
    try:
        # Get request details
        path = request.get('path', '')
        method = request.get('method', 'GET')
        headers = request.get('headers', {})

        print(f"Received request: {method} {path}")

        # Handle CORS preflight
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

        # Health check endpoint
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

        # API root endpoint
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

        # Login endpoint
        if path == '/api/auth/login' and method == 'POST':
            try:
                # Parse request body
                body = request.get('body', '{}')
                if isinstance(body, str):
                    request_data = json.loads(body)
                else:
                    request_data = body

                print(f"Login request data: {request_data}")
                return handle_login(request_data)

            except json.JSONDecodeError:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    },
                    "body": json.dumps({"detail": "无效的JSON格式"})
                }
            except Exception as e:
                print(f"Login error: {str(e)}")
                return {
                    "statusCode": 500,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    },
                    "body": json.dumps({"detail": f"登录处理错误: {str(e)}"})
                }

        # Default response
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

    except Exception as e:
        print(f"Handler error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"detail": f"服务器错误: {str(e)}"})
        }