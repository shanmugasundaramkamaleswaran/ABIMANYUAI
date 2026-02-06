import os
import random
from typing import List, Dict, Optional, Any
import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        
        # Configure Gemini
        if self.gemini_key and "your_" not in self.gemini_key.lower():
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.gemini_model = None
            
        # Configure OpenAI
        if self.openai_key and "your_" not in self.openai_key.lower():
            self.openai_client = OpenAI(api_key=self.openai_key)
        else:
            self.openai_client = None

    async def get_response(
        self, 
        prompt: str, 
        history: Optional[List[Dict[str, str]]] = None,
        provider: str = "gemini"
    ) -> str:
        """Get AI response from the specified provider with optional history."""
        if provider == "gemini" and self.gemini_model:
            return await self._get_gemini_response(prompt, history)
        elif provider == "openai" and self.openai_client:
            return await self._get_openai_response(prompt, history)
        else:
            # Fallback logic or error
            if self.gemini_model:
                return await self._get_gemini_response(prompt, history)
            elif self.openai_client:
                return await self._get_openai_response(prompt, history)
            else:
                raise Exception("No AI provider configured properly.")

    async def _get_gemini_response(self, prompt: str, history: Optional[List[Dict[str, str]]]) -> str:
        try:
            # Gemini chat history format: [{"role": "user", "parts": ["..."]}, {"role": "model", "parts": ["..."]}]
            gemini_history = []
            if history:
                for msg in history:
                    role = "user" if msg["role"] == "user" else "model"
                    gemini_history.append({"role": role, "parts": [msg["content"]]})
            
            chat = self.gemini_model.start_chat(history=gemini_history)
            response = chat.send_message(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini Error: {e}")
            raise

    async def _get_openai_response(self, prompt: str, history: Optional[List[Dict[str, str]]]) -> str:
        try:
            messages = []
            if history:
                for msg in history:
                    messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": prompt})
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI Error: {e}")
            raise

# Global instance
ai_service = AIService()
