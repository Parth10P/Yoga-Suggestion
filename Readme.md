# Yoga Suggestion RAG App

A smart Yoga assistant that uses **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware yoga recommendations. It combines local embeddings, Pinecone vector database, and Groq LLM to answer your yoga-related queries safely and effectively.

## Features

- **Smart Suggestions:** Ask any yoga question and get AI-generated answers based on curated yoga knowledge.
- **RAG Architecture:** Uses **Pinecone** for vector storage and **Sentence Transformers** for local embeddings to retrieve relevant context.
- **Groq LLM Integration:** Powered by **Llama 3.3 70B** for fast and natural language generation.
- **Modular Prompts:** Prompt templates are stored separately in `prompt_temp.py` for easy customization.
- **Safety First:** Handles greetings separately from yoga queries; blocks inappropriate medical claims when context is insufficient.
- **Feedback System:** Tracks user interactions and feedback (thumbs up/down) to monitor answer quality.
- **Modern UI:** Built with **React** and **Tailwind CSS**, featuring a clean, responsive design.
- **Source Citations:** Answers cite sources from the internal knowledge base for credibility.

## Tech Stack

### Frontend

- **React** (Vite)
- **Tailwind CSS** (Styling & Animations)
- **Lucide React** (Icons)

### Backend (Python)

- **FastAPI** (Python Web Framework)
- **Sentence Transformers** (Local Embeddings - `all-MiniLM-L6-v2`)
- **Pinecone** (Vector Database for RAG)
- **LangChain Groq** (LLM Integration)
- **Pydantic** (Data Validation)

## Project Structure

```
├── rag_pipeline/
│   ├── api.py              # FastAPI application main file
│   ├── prompt_temp.py      # Prompt templates for LLM
│   ├── requirements.txt    # Python dependencies
│   └── notebook/           # Jupyter notebooks for data processing
│       └── document.ipynb
│
├── backend/                # Legacy Node.js backend (if present)
├── frontend/               # React frontend
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js (for frontend)
- Pinecone Account & API Key
- Groq API Key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Parth10P/Yoga-suggestion.git
   cd Yoga-suggestion
   ```

2. **Setup Python Backend**

   ```bash
   cd rag_pipeline
   pip install -r requirements.txt
   ```

   Create a `.env` file in the `rag_pipeline` directory:

   ```env
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_pinecone_index_name
   GROQ_API_KEY=your_groq_api_key
   PORT=8000
   ```

   Start the server:

   ```bash
   python api.py
   # Or with uvicorn directly:
   uvicorn api:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## API Endpoints

- `GET /`: Root endpoint with API info
- `GET /health`: Health check
- `POST /query`: Submit a yoga question. Returns answer, sources, and detected poses.
  ```json
  {
    "question": "What poses help with back pain?",
    "top_k": 3
  }
  ```
- `POST /feedback`: Submit helpfulness feedback (up/down) for an answer.
  ```json
  {
    "questionId": "uuid",
    "feedback": "up"
  }
  ```

## Customizing Prompts

The prompt template is stored in `rag_pipeline/prompt_temp.py`. Edit this file to customize:

- Instructions for yoga pose recommendations
- Greeting responses
- Safety guidelines
- Response structure

Example from `prompt_temp.py`:
```python
prompt = """
You are a professional yoga instructor and wellness guide.
Your goal is to suggest yoga practices based ONLY on the provided context.
...
"""
```
