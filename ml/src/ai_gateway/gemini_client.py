"""
MAINTIX Gemini Cloud AI Client (Optional)
=========================================
Optional cloud LLM provider fallback when GEMINI_API_KEY is configured.
Maintains identical interface to OllamaClient for transparent provider switching.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger("maintix.gemini")

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False


class GeminiClient:
    """Optional Google Gemini LLM API client."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        self.is_configured = False
        if HAS_GEMINI and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(model_name)
                self.is_configured = True
                logger.info(f"Configured Gemini Client ({model_name})")
            except Exception as e:
                logger.warning(f"Could not configure Gemini: {e}")

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.1) -> Optional[str]:
        if not self.is_configured:
            return None

        try:
            full_prompt = f"System: {system_prompt}\n\nUser Request: {prompt}" if system_prompt else prompt
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(temperature=temperature)
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini generation error: {e}")
            return None
