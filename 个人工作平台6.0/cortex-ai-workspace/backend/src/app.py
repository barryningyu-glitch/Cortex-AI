#!/usr/bin/env python3
"""
Flask兼容的启动文件，用于部署服务
"""
import os
import sys
import uvicorn
from main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

