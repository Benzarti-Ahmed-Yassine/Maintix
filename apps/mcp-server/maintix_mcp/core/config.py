from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class McpConfig:
    memory_window: int = int(os.getenv('MCP_MEMORY_WINDOW', '50'))
    tool_registry_name: str = os.getenv('MCP_TOOL_REGISTRY_NAME', 'industrial-tools')
    prompt_library_path: str = os.getenv('MCP_PROMPT_LIBRARY_PATH', 'prompts.json')
