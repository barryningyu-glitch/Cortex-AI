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
        "password_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"  # ny123456
    },
    "test": {
        "id": 2,
        "username": "test",
        "email": "test@example.com",
        "password_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"  # ny123456
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
    to_encode.update({"exp": expire})
    try:
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
    except Exception as e:
        # Fallback to simple token
        return f"simple_token_{data.get('sub', 'user')}_{int(datetime.datetime.utcnow().timestamp())}"

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
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({"detail": f"服务器错误: {str(e)}"})
        }