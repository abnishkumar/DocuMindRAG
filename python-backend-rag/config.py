import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING", "")
os.environ["LANGSMITH_ENDPOINT"] = os.getenv("LANGSMITH_ENDPOINT", "")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY", "")
os.environ["LANGSMITH_PROJECT"] = os.getenv("LANGSMITH_PROJECT", "")

LANGSMITH_TRACING="true"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY="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"
LANGSMITH_PROJECT="docuMindRAG"

PG_CONNECTION_STRING = os.getenv("PG_CONNECTION_STRING", "")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gpt-4o-mini")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
CHUNK_SIZE=int(os.getenv("CHUNK_SIZE", 800))
CHUNK_OVERLAP=int(os.getenv("CHUNK_OVERLAP", 100))
SCORE_THRESHOLD=int(os.getenv("SCORE_THRESHOLD", 0))

# Retrieval tuning
TOP_K = int(os.getenv("TOP_K", 5))
MMR_K = int(os.getenv("MMR_K", TOP_K))  # how many results after MMR
MMR_FETCH_K = int(os.getenv("MMR_FETCH_K", TOP_K * 3))  # how many to fetch before MMR
RERANK_TOP_K = int(os.getenv("RERANK_TOP_K", TOP_K))  # how many after reranking

# API_KEY
API_KEY=os.getenv("API_KEY","admin@123")