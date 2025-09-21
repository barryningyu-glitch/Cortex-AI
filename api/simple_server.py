import json
import hashlib
import datetime
import base64
import hmac
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

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

class APIHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            response = {
                "status": "healthy",
                "timestamp": datetime.datetime.now().isoformat(),
                "service": "Cortex AI Backend"
            }
            self.wfile.write(json.dumps(response).encode())

        elif self.path == '/api/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            response = {
                "message": "Cortex AI Workspace API",
                "version": "1.0.0",
                "status": "running"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            response = {"detail": "Not found"}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        if self.path == '/api/auth/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode())
                username = data.get('username')
                password = data.get('password')

                if not username or not password:
                    raise ValueError("用户名和密码不能为空")

                user = USERS_DB.get(username)
                if not user or not verify_password(password, user["password_hash"]):
                    raise ValueError("用户名或密码错误")

                access_token = create_access_token({"sub": user["username"]})

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()

                response = {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": user["id"],
                        "username": user["username"],
                        "email": user["email"]
                    }
                }
                self.wfile.write(json.dumps(response).encode())

            except Exception as e:
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                response = {"detail": str(e)}
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            response = {"detail": "API endpoint not found"}
            self.wfile.write(json.dumps(response).encode())

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIHandler)
    print(f"🚀 Server running on port {port}")
    print(f"🎯 Health check: http://localhost:{port}/health")
    print(f"📋 API root: http://localhost:{port}/api/")
    print(f"🔑 Login: http://localhost:{port}/api/auth/login")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()