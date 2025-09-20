import os
import requests
import json
from typing import List, Dict, Any, Optional
from enum import Enum
from fastapi import HTTPException

class AIModel(str, Enum):
    GPT_5 = "openai/gpt-5"
    GEMINI_2_5_FLASH = "google/gemini-2.5-flash"
    GEMINI_2_5_PRO = "google/gemini-2.5-pro"
    CLAUDE_4 = "anthropic/claude-4"
    DEEPSEEK_V3 = "deepseek/deepseek-chat-v3"
    DEEPSEEK_R1 = "deepseek/deepseek-r1"

class AIService:
    def __init__(self):
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.kimi_api_key = os.getenv("KIMI_API_KEY")
        self.kimi_base_url = os.getenv("KIMI_BASE_URL", "https://api.moonshot.cn/v1")
        self.default_model = os.getenv("DEFAULT_MODEL", AIModel.GPT_5)
        
    def get_available_models(self) -> List[Dict[str, str]]:
        """获取可用的AI模型列表"""
        return [
            {"id": AIModel.GPT_5, "name": "GPT-5", "provider": "OpenAI"},
            {"id": AIModel.GEMINI_2_5_FLASH, "name": "Gemini 2.5 Flash", "provider": "Google"},
            {"id": AIModel.GEMINI_2_5_PRO, "name": "Gemini 2.5 Pro", "provider": "Google"},
            {"id": AIModel.CLAUDE_4, "name": "Claude-4", "provider": "Anthropic"},
            {"id": AIModel.DEEPSEEK_V3, "name": "DeepSeek V3", "provider": "DeepSeek"},
            {"id": AIModel.DEEPSEEK_R1, "name": "DeepSeek R1", "provider": "DeepSeek"},
        ]
    
    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        stream: bool = False
    ) -> Dict[str, Any]:
        """AI对话完成"""
        if not model:
            model = self.default_model
            
        try:
            headers = {
                "Authorization": f"Bearer {self.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://cortex-ai-workspace.com",
                "X-Title": "Cortex AI Workspace"
            }
            
            data = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": stream
            }
            
            response = requests.post(
                f"{self.openrouter_base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "model": model,
                    "usage": result.get("usage", {})
                }
            else:
                # 如果OpenRouter失败，尝试使用Kimi作为备用
                return await self._fallback_to_kimi(messages, temperature, max_tokens)
                
        except Exception as e:
            print(f"AI服务错误: {e}")
            return await self._fallback_to_kimi(messages, temperature, max_tokens)
    
    async def _fallback_to_kimi(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """备用Kimi API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.kimi_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "moonshot-v1-8k",
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = requests.post(
                f"{self.kimi_base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "model": "kimi-backup",
                    "usage": result.get("usage", {})
                }
            else:
                return {
                    "content": "抱歉，AI服务暂时不可用，请稍后重试。",
                    "model": "error",
                    "usage": {}
                }
                
        except Exception as e:
            print(f"备用AI服务错误: {e}")
            return {
                "content": "抱歉，AI服务暂时不可用，请稍后重试。",
                "model": "error", 
                "usage": {}
            }
    
    async def polish_text(
        self, 
        text: str, 
        style: str = "formal",
        model: str = None
    ) -> Dict[str, Any]:
        """文本润色功能"""
        style_prompts = {
            "formal": "请将以下文本润色为正式、专业的表达方式",
            "casual": "请将以下文本润色为口语化、轻松的表达方式", 
            "vivid": "请将以下文本润色为活泼生动、富有感染力的表达方式",
            "concise": "请将以下文本精简提炼，保留核心要点",
            "elaborate": "请将以下文本扩充丰富，增加细节和深度"
        }
        
        prompt = style_prompts.get(style, style_prompts["formal"])
        
        messages = [
            {"role": "system", "content": f"{prompt}，保持原意不变，只改进表达方式。"},
            {"role": "user", "content": text}
        ]
        
        return await self.chat_completion(messages, model)
    
    async def categorize_note(
        self, 
        title: str, 
        content: str,
        model: str = None
    ) -> Dict[str, Any]:
        """笔记智能分类"""
        messages = [
            {
                "role": "system", 
                "content": """你是一个智能笔记分类助手。请根据笔记的标题和内容，推荐合适的分类、文件夹和标签。

分类选项：工作、学习、生活
请返回JSON格式：
{
    "category": "推荐的分类",
    "folder": "推荐的文件夹名称",
    "tags": ["标签1", "标签2", "标签3"],
    "reason": "推荐理由"
}"""
            },
            {
                "role": "user", 
                "content": f"标题：{title}\n内容：{content}"
            }
        ]
        
        result = await self.chat_completion(messages, model)
        try:
            return json.loads(result["content"])
        except:
            return {
                "category": "学习",
                "folder": "默认文件夹",
                "tags": ["笔记"],
                "reason": "默认分类"
            }
    
    async def parse_task(
        self, 
        task_description: str,
        model: str = None
    ) -> Dict[str, Any]:
        """智能任务解析"""
        messages = [
            {
                "role": "system",
                "content": """你是一个智能任务解析助手。请将用户的自然语言描述解析为结构化的任务信息。

请返回JSON格式：
{
    "title": "任务标题",
    "description": "详细描述",
    "priority": "high/medium/low",
    "due_date": "YYYY-MM-DD格式的截止日期（如果有）",
    "subtasks": ["子任务1", "子任务2"],
    "tags": ["标签1", "标签2"],
    "estimated_time": "预估时间（分钟）"
}"""
            },
            {
                "role": "user",
                "content": task_description
            }
        ]
        
        result = await self.chat_completion(messages, model)
        try:
            return json.loads(result["content"])
        except:
            return {
                "title": task_description[:50],
                "description": task_description,
                "priority": "medium",
                "due_date": None,
                "subtasks": [],
                "tags": ["任务"],
                "estimated_time": 60
            }

    # 保持向后兼容的方法
    async def enhance_text(self, text: str) -> str:
        """AI文本润色 - 向后兼容"""
        result = await self.polish_text(text, "formal")
        return result["content"]

# 全局AI服务实例
ai_service = AIService()

