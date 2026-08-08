from dataclasses import dataclass
from dotenv import load_dotenv
import os

load_dotenv()

@dataclass
class RagConfig:
    chunk_size: int = int(os.getenv('RAG_CHUNK_SIZE', '500'))
    chunk_overlap: int = int(os.getenv('RAG_CHUNK_OVERLAP', '50'))
    embedding_dim: int = int(os.getenv('RAG_EMBEDDING_DIM', '128'))
    top_k: int = int(os.getenv('RAG_TOP_K', '5'))
    prompt_template: str = os.getenv('RAG_PROMPT_TEMPLATE', 'Use the following context to answer the query: {context} \nQuestion: {query}')
    citation_template: str = os.getenv('RAG_CITATION_TEMPLATE', 'Source: {source}')
