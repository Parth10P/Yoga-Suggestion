"""FastAPI application for Yoga RAG Query API."""

import os
import sys
import threading
import uuid
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration from env
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "yoga-rag")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "llama-3.3-70b-versatile"
PORT = int(os.getenv("PORT", "8000"))

# Global state
_embedding_model = None
_pinecone_index = None
_llm = None
_ready = False
_init_error = None
_init_lock = threading.Lock()


def init_models():
    """Initialize heavy models in background."""
    global _embedding_model, _pinecone_index, _llm, _ready, _init_error

    # Lazy imports - only load heavy dependencies when needed
    from sentence_transformers import SentenceTransformer
    from pinecone import Pinecone
    from langchain_groq import ChatGroq

    try:
        print("[Init] Loading embedding model...", file=sys.stderr)
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
        print(f"[Init] Embedding model loaded", file=sys.stderr)

        print("[Init] Connecting to Pinecone...", file=sys.stderr)
        pc = Pinecone(api_key=PINECONE_API_KEY)
        _pinecone_index = pc.Index(PINECONE_INDEX_NAME)
        stats = _pinecone_index.describe_index_stats()
        print(f"[Init] Pinecone connected: {stats.total_vector_count} vectors", file=sys.stderr)

        print("[Init] Initializing LLM...", file=sys.stderr)
        _llm = ChatGroq(
            groq_api_key=GROQ_API_KEY,
            model_name=LLM_MODEL,
            temperature=0.1,
            max_tokens=1024,
        )
        print("[Init] LLM ready", file=sys.stderr)

        with _init_lock:
            _ready = True
    except Exception as e:
        print(f"[Init] Error: {e}", file=sys.stderr)
        with _init_lock:
            _init_error = str(e)


def ensure_ready():
    """Check if service is ready to handle requests."""
    with _init_lock:
        if _init_error:
            raise HTTPException(status_code=503, detail=f"Init failed: {_init_error}")
        if not _ready:
            raise HTTPException(status_code=503, detail="Initializing, retry shortly")


# Create FastAPI app
app = FastAPI(
    title="Yoga RAG API",
    description="Query API for Yoga knowledge base",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str
    top_k: int = 5


class FeedbackRequest(BaseModel):
    questionId: str
    feedback: str


class QueryResponse(BaseModel):
    id: str
    answer: str
    sources: List[str]
    isUnsafe: bool
    poses: List[dict] = []


@app.on_event("startup")
async def startup():
    """Start background initialization."""
    thread = threading.Thread(target=init_models, daemon=True)
    thread.start()
    print(f"[Startup] Server binding to port {PORT}, models loading in background...", file=sys.stderr)


@app.get("/")
def root():
    """Root endpoint."""
    with _init_lock:
        status = "ready" if _ready else "initializing"
        if _init_error:
            status = "error"
    return {"message": "Yoga RAG API", "status": status, "docs": "/docs"}


@app.get("/health")
def health():
    """Health check for Render."""
    with _init_lock:
        if _init_error:
            return {"status": "error"}
        return {"status": "ready" if _ready else "initializing"}


@app.post("/query", response_model=QueryResponse)
def query_endpoint(request: QueryRequest):
    """Query the yoga knowledge base."""
    ensure_ready()

    try:
        # Generate embedding
        query_embedding = _embedding_model.encode([request.question])[0].tolist()

        # Query Pinecone
        results = _pinecone_index.query(
            vector=query_embedding,
            top_k=request.top_k,
            include_metadata=True,
        )

        # Process results
        documents = []
        sources = []
        for match in results.matches:
            metadata = match.metadata or {}
            content = metadata.get("text", "")
            source_file = metadata.get("source_file", "")
            page = metadata.get("page", 0)

            documents.append({"content": content})
            if source_file:
                sources.append(f"{source_file} (page {page})")

        # Generate answer
        if documents:
            context = "\n\n".join([f"Doc {i+1}: {doc['content']}" for i, doc in enumerate(documents)])
            prompt = f"""You are a knowledgeable yoga instructor. Answer based on context.

Context:
{context}

Question: {request.question}

Answer:"""
            response = _llm.invoke(prompt)
            answer = response.content
        else:
            answer = "No relevant information found."

        # Extract poses
        poses = []
        answer_lower = answer.lower()
        for pose in ["downward dog", "tree pose", "warrior", "cobra", "lotus"]:
            if pose in answer_lower:
                poses.append({"name": pose.title(), "confidence": 0.8})

        return QueryResponse(
            id=str(uuid.uuid4()),
            answer=answer,
            sources=sources,
            isUnsafe=False,
            poses=poses[:3],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/feedback")
def feedback_endpoint(request: FeedbackRequest):
    """Handle feedback."""
    print(f"Feedback: {request.questionId} = {request.feedback}", file=sys.stderr)
    return {"message": "Feedback received"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
