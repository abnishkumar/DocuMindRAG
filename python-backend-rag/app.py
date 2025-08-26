from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from typing import List, Optional
from pydantic import BaseModel
import os
from fastapi.responses import JSONResponse

from document_manager import DocumentManager
from config import API_KEY  # your API key in config.py

# Set memory cache
from langchain.globals import set_llm_cache
from langchain_community.cache import InMemoryCache
set_llm_cache(InMemoryCache())

# --- App setup ---
app = FastAPI(title="RAG with PGVector + LangChain + OpenAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- API Key Security ---
api_key_header = APIKeyHeader(name="X-Api-Key", auto_error=False)
user_id_header = Header(None, alias="X-User-Id")  # custom header for user id


async def get_user_id(
    api_key: Optional[str] = Depends(api_key_header),
    user_id: Optional[int] = user_id_header,
) -> int:
    """Validate API key and extract user_id from headers."""
    if api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API Key. Provide 'X-Api-Key' header.",
        )
    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="Missing 'X-User-Id' header.",
        )
    return user_id


# --- Pydantic models ---
class IngestRequest(BaseModel):
    doc_ids: List[int]


class QueryRequest(BaseModel):
    query: str


# --- Routes ---
@app.get("/health")
async def health():
    """Health check endpoint (no auth)."""
    return {"status": "ok"}


@app.post("/ingest")
def ingest_documents(request: IngestRequest, user_id: int = Depends(get_user_id)):
    """
    Ingest documents by IDs from DB into PGVector.
    """
    try:
        result = DocumentManager(user_id).ingest_document(request.doc_ids)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@app.post("/qna")
async def query_rag(request: QueryRequest, user_id: int = Depends(get_user_id)):
    """
    Handle user query with authentication.
    """
    try:
        answer = DocumentManager(user_id).query_document(request.query)
        print(answer)
        return {"status": "success", "data": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)