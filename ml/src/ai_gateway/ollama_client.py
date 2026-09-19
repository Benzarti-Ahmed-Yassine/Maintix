"""
MAINTIX Ollama Local LLM Client
===============================
Connects to local Ollama inference server (default: http://localhost:11434).
Allows MAINTIX to run 100% offline and on-premise without external cloud dependencies.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger("maintix.ollama")

class OllamaClient:
    """REST Client for local Ollama instance."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None, timeout: Optional[int] = None):
        self.base_url = (base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")).rstrip("/")
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen2.5:0.5b")
        self.timeout = timeout or int(os.getenv("OLLAMA_TIMEOUT", "60"))

    def check_health(self) -> bool:
        """Checks if local Ollama daemon is reachable and selects available model."""
        try:
            r = requests.get(f"{self.base_url}/api/tags", timeout=3)
            if r.status_code == 200:
                data = r.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                if models and self.model not in models:
                    # Prefer local model without :cloud suffix first
                    local_models = [m for m in models if not m.endswith(":cloud")]
                    matched = [m for m in models if self.model.split(":")[0] in m]
                    if matched:
                        self.model = matched[0]
                    elif local_models:
                        self.model = local_models[0]
                    elif models:
                        self.model = models[0]
                    logger.info(f"Ollama selected active model: {self.model}")
                return True
            return False
        except Exception:
            return False

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.1) -> Optional[str]:
        """Calls Ollama generate API."""
        if not self.check_health():
            return None

        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt or "You are an industrial reliability AI.",
            "stream": False,
            "options": {"temperature": temperature},
        }

        try:
            r = requests.post(url, json=payload, timeout=self.timeout)
            if r.status_code == 200:
                data = r.json()
                return data.get("response", "").strip()
            return None
        except Exception as e:
            logger.warning(f"Ollama generation error: {e}")
            return None