"""
MAINTIX Ollama Local LLM Client
===============================
Connects to local Ollama inference server (default: http://localhost:11434).
Allows MAINTIX to run 100% offline and on-premise without external cloud dependencies.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger("maintix.ollama")


class OllamaClient:
    """REST Client for local Ollama instance."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2", timeout: int = 30):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def check_health(self) -> bool:
        """Checks if local Ollama daemon is reachable."""
        try:
            r = requests.get(f"{self.base_url}/api/tags", timeout=3)
            return r.status_code == 200
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
