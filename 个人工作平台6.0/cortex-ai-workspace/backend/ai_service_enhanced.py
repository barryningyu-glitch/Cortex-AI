import os
import requests
import json
from typing import List, Dict, Any, Optional
from enum import Enum
from fastapi import HTTPException
import asyncio
from datetime import datetime, timedelta

class AIModel(str, Enum):
    GPT_5 = "openai/gpt-5"
    GEMINI_2_5_FLASH = "google/gemini-2.5-flash"
    GEMINI_2_5_PRO = "google/gemini-2.5-pro"
    CLAUDE_4 = "anthropic/claude-4"
    DEEPSEEK_V3 = "deepseek/deepseek-chat-v3"
    DEEPSEEK_R1 = "deepseek/deepseek-r1"

class AIService:
    def __init__(self):
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "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")
        self.openrouter_base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.default_model = os.getenv("DEFAULT_MODEL", AIModel.GPT_5)
        
    def get_available_models(self) -> List[Dict[str, str]]:
        """获取可用的AI模型列表"""
        return [
            {"id": AIModel.GPT_5, "name": "GPT-5", "provider": "OpenAI", "color": "bg-green-500"},
            {"id": AIModel.GEMINI_2_5_FLASH, "name": "Gemini 2.5 Flash", "provider": "Google", "color": "bg-blue-500"},
            {"id": AIModel.GEMINI_2_5_PRO, "name": "Gemini 2.5 Pro", "provider": "Google", "color": "bg-blue-600"},
            {"id": AIModel.CLAUDE_4, "name": "Claude-4", "provider": "Anthropic", "color": "bg-purple-500"},
            {"id": AIModel.DEEPSEEK_V3, "name": "DeepSeek V3", "provider": "DeepSeek", "color": "bg-orange-500"},
            {"id": AIModel.DEEPSEEK_R1, "name": "DeepSeek R1", "provider": "DeepSeek", "color": "bg-red-500"},
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
                "HTTP-Referer": "https://cortex-ai-workspace.local",
                "X-Title": "Cortex AI Workspace"
            }
            
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": stream
            }
            
            response = requests.post(
                f"{self.openrouter_base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenRouter API错误: {response.text}"
                )
            
            result = response.json()
            
            if "choices" not in result or not result["choices"]:
                raise HTTPException(status_code=500, detail="AI响应格式错误")
            
            return {
                "content": result["choices"][0]["message"]["content"],
                "model": model,
                "usage": result.get("usage", {}),
                "timestamp": datetime.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"网络请求失败: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI服务调用失败: {str(e)}")

    async def improve_text(self, text: str, model: str = None) -> Dict[str, Any]:
        """改进文本"""
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的文本编辑助手。请帮助用户改进文本，使其更加清晰、准确、流畅。保持原意不变，但提升表达质量。"
            },
            {
                "role": "user",
                "content": f"请改进以下文本：\n\n{text}"
            }
        ]
        return await self.chat_completion(messages, model)

    async def summarize_text(self, text: str, model: str = None) -> Dict[str, Any]:
        """总结文本"""
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的文本总结助手。请为用户提供简洁、准确的文本摘要，突出关键信息和要点。"
            },
            {
                "role": "user",
                "content": f"请总结以下文本的主要内容：\n\n{text}"
            }
        ]
        return await self.chat_completion(messages, model)

    async def expand_text(self, text: str, model: str = None) -> Dict[str, Any]:
        """扩展文本"""
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的内容扩展助手。请帮助用户扩展文本内容，添加相关细节、例子和解释，使内容更加丰富和完整。"
            },
            {
                "role": "user",
                "content": f"请扩展以下文本，添加更多细节和内容：\n\n{text}"
            }
        ]
        return await self.chat_completion(messages, model)

    async def translate_text(self, text: str, target_language: str = "en", model: str = None) -> Dict[str, Any]:
        """翻译文本"""
        language_map = {
            "en": "英语",
            "zh": "中文",
            "ja": "日语",
            "ko": "韩语",
            "fr": "法语",
            "de": "德语",
            "es": "西班牙语"
        }
        
        target_lang_name = language_map.get(target_language, target_language)
        
        messages = [
            {
                "role": "system",
                "content": f"你是一个专业的翻译助手。请将用户提供的文本准确翻译成{target_lang_name}，保持原意和语调。"
            },
            {
                "role": "user",
                "content": f"请将以下文本翻译成{target_lang_name}：\n\n{text}"
            }
        ]
        return await self.chat_completion(messages, model)

    async def restructure_text(self, text: str, model: str = None) -> Dict[str, Any]:
        """重新组织文本结构"""
        messages = [
            {
                "role": "system",
                "content": "你是一个专业的文本结构优化助手。请帮助用户重新组织文本结构，使其逻辑更清晰、层次更分明、阅读体验更好。"
            },
            {
                "role": "user",
                "content": f"请重新组织以下文本的结构，使其更加清晰有序：\n\n{text}"
            }
        ]
        return await self.chat_completion(messages, model)

    async def generate_tags(self, title: str, content: str, model: str = None) -> Dict[str, Any]:
        """生成智能标签"""
        messages = [
            {
                "role": "system",
                "content": "你是一个智能标签生成助手。根据文本内容生成3-5个相关的标签，标签应该简洁、准确、有用。请以JSON格式返回标签列表。"
            },
            {
                "role": "user",
                "content": f"标题：{title}\n\n内容：{content}\n\n请为这篇内容生成合适的标签，以JSON格式返回：{\"tags\": [\"标签1\", \"标签2\", ...]}"
            }
        ]
        
        result = await self.chat_completion(messages, model)
        
        try:
            # 尝试解析JSON响应
            content = result["content"].strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                content = content[3:-3].strip()
            
            parsed = json.loads(content)
            tags = parsed.get("tags", [])
        except:
            # 如果解析失败，使用默认标签
            tags = ["笔记", "重要"]
        
        return {
            "tags": tags,
            "model": result["model"],
            "confidence": 0.8
        }

    async def categorize_note_advanced(
        self, 
        title: str, 
        content: str, 
        available_categories: List[str],
        model: str = None
    ) -> Dict[str, Any]:
        """高级笔记分类"""
        categories_str = "、".join(available_categories)
        
        messages = [
            {
                "role": "system",
                "content": f"你是一个智能分类助手。根据笔记的标题和内容，从以下分类中选择最合适的一个：{categories_str}。同时建议一个合适的文件夹名称。请以JSON格式返回结果。"
            },
            {
                "role": "user",
                "content": f"标题：{title}\n\n内容：{content}\n\n请分析这篇笔记应该归属于哪个分类，并建议文件夹名称。返回JSON格式：{{\"category\": \"分类名\", \"folder\": \"文件夹名\", \"reasoning\": \"分类理由\"}}"
            }
        ]
        
        result = await self.chat_completion(messages, model)
        
        try:
            content = result["content"].strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                content = content[3:-3].strip()
            
            parsed = json.loads(content)
            category = parsed.get("category", available_categories[0])
            folder = parsed.get("folder", "默认")
            reasoning = parsed.get("reasoning", "")
            
            # 验证分类是否在可用列表中
            if category not in available_categories:
                category = available_categories[0]
                
        except:
            # 如果解析失败，使用默认值
            category = available_categories[0] if available_categories else "学习"
            folder = "默认"
            reasoning = "自动分类"
        
        return {
            "category": category,
            "folder": folder,
            "reasoning": reasoning,
            "confidence": 0.8,
            "model": result["model"]
        }

    async def parse_tasks_batch(self, text: str, model: str = None) -> Dict[str, Any]:
        """批量解析任务"""
        messages = [
            {
                "role": "system",
                "content": """你是一个智能任务解析助手。请将用户输入的自然语言文本解析成结构化的任务列表。

每个任务应包含以下信息：
- title: 任务标题
- description: 任务描述
- priority: 优先级 (high/medium/low)
- due_date: 截止日期 (ISO格式)
- estimated_time: 预估时间(分钟)
- project: 项目分类 (工作/学习/生活)
- tags: 相关标签列表
- subtasks: 子任务列表

请以JSON格式返回任务列表。"""
            },
            {
                "role": "user",
                "content": f"请解析以下文本并生成任务列表：\n\n{text}\n\n返回JSON格式：{{\"tasks\": [{{\"title\": \"任务标题\", \"description\": \"任务描述\", \"priority\": \"medium\", \"due_date\": \"2024-01-20\", \"estimated_time\": 60, \"project\": \"工作\", \"tags\": [\"标签1\"], \"subtasks\": [\"子任务1\"]}}]}}"
            }
        ]
        
        result = await self.chat_completion(messages, model)
        
        try:
            content = result["content"].strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                content = content[3:-3].strip()
            
            parsed = json.loads(content)
            tasks = parsed.get("tasks", [])
            
            # 验证和补充任务数据
            for task in tasks:
                if "title" not in task:
                    task["title"] = "未命名任务"
                if "description" not in task:
                    task["description"] = ""
                if "priority" not in task or task["priority"] not in ["high", "medium", "low"]:
                    task["priority"] = "medium"
                if "due_date" not in task:
                    task["due_date"] = (datetime.now() + timedelta(days=1)).date().isoformat()
                if "estimated_time" not in task:
                    task["estimated_time"] = 60
                if "project" not in task:
                    task["project"] = "工作"
                if "tags" not in task:
                    task["tags"] = []
                if "subtasks" not in task:
                    task["subtasks"] = []
                    
        except Exception as e:
            # 如果解析失败，创建一个简单任务
            tasks = [{
                "title": text[:50] + "..." if len(text) > 50 else text,
                "description": "AI解析生成的任务",
                "priority": "medium",
                "due_date": (datetime.now() + timedelta(days=1)).date().isoformat(),
                "estimated_time": 60,
                "project": "工作",
                "tags": ["AI生成"],
                "subtasks": []
            }]
        
        return {
            "tasks": tasks,
            "model": result["model"],
            "total_count": len(tasks)
        }

    async def polish_text(self, text: str, style: str = "formal") -> Dict[str, Any]:
        """文本润色 - 兼容旧接口"""
        return await self.improve_text(text)

    async def categorize_note(self, title: str, content: str) -> Dict[str, Any]:
        """笔记分类 - 兼容旧接口"""
        result = await self.categorize_note_advanced(title, content, ["工作", "学习", "生活"])
        return {
            "category": result["category"],
            "folder": result["folder"],
            "tags": ["笔记", "重要"]
        }

    async def parse_task(self, text: str) -> Dict[str, Any]:
        """单个任务解析 - 兼容旧接口"""
        result = await self.parse_tasks_batch(text)
        tasks = result.get("tasks", [])
        
        if tasks:
            task = tasks[0]
            return {
                "title": task["title"],
                "due_date": task["due_date"],
                "category": task["project"],
                "priority": task["priority"]
            }
        else:
            return {
                "title": text[:50],
                "due_date": (datetime.now() + timedelta(days=1)).date().isoformat(),
                "category": "工作",
                "priority": "medium"
            }

# 创建全局AI服务实例
ai_service = AIService()

