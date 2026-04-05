# Yoga Suggestion App - High Level Design (HLD)

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         REACT FRONTEND (Vite)                                    │   │
│  │  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────────────┐  │   │
│  │  │  Header     │   │ SearchInput  │   │ ChatMessage │   │ LoadingState     │  │   │
│  │  │  (Logo)     │   │ (User Query) │   │ (Response)  │   │ (Animation)      │  │   │
│  │  └─────────────┘   └──────────────┘   └─────────────┘   └──────────────────┘  │   │
│  │                                                                                  │   │
│  │  User asks: "What yoga poses for back pain?"                                     │   │
│  │         │                                                                        │   │
│  │         ▼                                                                        │   │
│  │  POST /ask {question: "..."}                                                     │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                                    │
│                                    │ HTTP/REST API                                      │
│                                    ▼                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   API LAYER                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                      NODE.JS + EXPRESS SERVER                                    │   │
│  │                          Port: 5000                                              │   │
│  │                                                                                  │   │
│  │  Routes:                                                                         │   │
│  │  ├── POST /ask          → chatController.askQuestion()                         │   │
│  │  ├── POST /feedback     → chatController.submitFeedback()                      │   │
│  │  └── GET  /test         → Health Check                                         │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              BUSINESS LOGIC LAYER (Controllers)                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         CHAT CONTROLLER                                        │   │
│  │                                                                                  │   │
│  │  1. Receive Question from Frontend                                               │   │
│  │            │                                                                     │   │
│  │            ▼                                                                     │   │
│  │  2. SAFETY CHECK (safetyService.checkSafety)                                   │   │
│  │     ├── Keywords: "pregnant", "surgery", "heart condition", "blood pressure"    │   │
│  │     ├── Fuzzy Matching (Levenshtein Distance) - catches typos                    │   │
│  │     └── IF unsafe → Return warning + safe alternative                           │   │
│  │            │                                                                     │   │
│  │            ▼ (If Safe)                                                          │   │
│  │  3. RAG PIPELINE (ragService.getAnswer)                                        │   │
│  │            │                                                                     │   │
│  │            ▼                                                                     │   │
│  │  4. SAVE INTERACTION (MongoDB - Interaction Model)                               │   │
│  │            │                                                                     │   │
│  │            ▼                                                                     │   │
│  │  5. RETURN JSON Response: {answer, sources, poses, isUnsafe}                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              RAG (Retrieval Augmented Generation) PIPELINE              │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                                  │   │
│  │   STEP 1: GENERATE QUERY EMBEDDING (Local - FREE)                              │   │
│  │   ┌────────────────────────────────────────────────────────────────────┐        │   │
│  │   │  embeddingService.getEmbedding(question)                         │        │   │
│  │   │         │                                                        │        │   │
│  │   │         ▼                                                        │        │   │
│  │   │  ┌────────────────────────────────────────┐                       │        │   │
│  │   │  │  Xenova/all-MiniLM-L6-v2 Model       │  ◄── Local Transformer │        │   │
│  │   │  │  • 384-dimensional vectors           │      (No API cost!)     │        │   │
│  │   │  │  • Mean pooling + Normalization      │                       │        │   │
│  │   │  └────────────────────────────────────────┘                       │        │   │
│  │   │         │                                                        │        │   │
│  │   │         ▼                                                        │        │   │
│  │   │  Query Embedding Vector [0.023, -0.156, 0.892, ...] (384 dims)    │        │   │
│  │   └────────────────────────────────────────────────────────────────────┘        │   │
│  │                                    │                                             │   │
│  │                                    ▼                                             │   │
│  │   STEP 2: VECTOR SEARCH (Pinecone DB)                                            │   │
│  │   ┌────────────────────────────────────────────────────────────────────┐        │   │
│  │   │  pineconeService.queryVectors(queryEmbedding, topK=3)            │        │   │
│  │   │         │                                                        │        │   │
│  │   │         ▼                                                        │        │   │
│  │   │  ┌─────────────────────────────────────────────────────────┐    │        │   │
│  │   │  │              PINECONE VECTOR DATABASE                     │    │        │   │
│  │   │  │  ┌─────────────────────────────────────────────────┐      │    │        │   │
│  │   │  │  │  Index: "yoga-rag"                             │      │    │        │   │
│  │   │  │  │  • Dimensions: 384 (matches embedding model)   │      │    │        │   │
│  │   │  │  │  • Metric: Cosine Similarity                   │      │    │        │   │
│  │   │  │  │  • Cloud: AWS (us-east-1)                      │      │    │        │   │
│  │   │  │  └─────────────────────────────────────────────────┘      │    │        │   │
│  │   │  │                                                             │    │        │   │
│  │   │  │  SIMILARITY SEARCH:                                         │    │        │   │
│  │   │  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │    │        │   │
│  │   │  │  │  Doc #1     │    │  Doc #2     │    │  Doc #3     │   │    │        │   │
│  │   │  │  │  Score: 0.89│    │  Score: 0.85│    │  Score: 0.82│   │    │        │   │
│  │   │  │  │  Metadata   │    │  Metadata   │    │  Metadata   │   │    │        │   │
│  │   │  │  └─────────────┘    └─────────────┘    └─────────────┘   │    │        │   │
│  │   │  └─────────────────────────────────────────────────────────┘    │        │   │
│  │   │         │                                                        │        │   │
│  │   │         ▼                                                        │        │   │
│  │   │  Top 3 Matching Documents with Metadata                          │        │   │
│  │   └────────────────────────────────────────────────────────────────────┘        │   │
│  │                                    │                                             │   │
│  │                                    ▼                                             │   │
│  │   STEP 3: CONTEXT CONSTRUCTION                                                   │   │
│  │   ┌────────────────────────────────────────────────────────────────────┐        │   │
│  │   │  matches.map(m => m.metadata.text).join("\n\n")                  │        │   │
│  │   │                                                                    │        │   │
│  │   │  Retrieved Context:                                              │        │   │
│  │   │  ┌────────────────────────────────────────────────────────────┐  │        │   │
│  │   │  │ Doc 1: "Bhujangasana (Cobra Pose) strengthens spine..."   │  │        │   │
│  │   │  │ Doc 2: "Marjarasana (Cat Pose) improves flexibility..."   │  │        │   │
│  │   │  │ Doc 3: "Setu Bandhasana (Bridge Pose) relieves back..."   │  │        │   │
│  │   │  └────────────────────────────────────────────────────────────┘  │        │   │
│  │   └────────────────────────────────────────────────────────────────────┘        │   │
│  │                                    │                                             │   │
│  │                                    ▼                                             │   │
│  │   STEP 4: ANSWER GENERATION (Gemini AI)                                          │   │
│  │   ┌────────────────────────────────────────────────────────────────────┐        │   │
│  │   │  genAI.getGenerativeModel({ model: "gemini-flash-latest" })      │        │   │
│  │   │         │                                                        │        │   │
│  │   │         ▼                                                        │        │   │
│  │   │  PROMPT ENGINEERING:                                               │        │   │
│  │   │  ┌────────────────────────────────────────────────────────────┐  │        │   │
│  │   │  │ "You are an expert yoga instructor...                        │  │        │   │
│  │   │  │                                                             │  │        │   │
│  │   │  │ KNOWLEDGE BASE (Authentic Info):                             │  │        │   │
│  │   │  │ [Retrieved Context from Pinecone]                            │  │        │   │
│  │   │  │                                                             │  │        │   │
│  │   │  │ User Question: What yoga poses for back pain?               │  │        │   │
│  │   │  │                                                             │  │        │   │
│  │   │  │ Provide answer with poses, benefits, and safety..."         │  │        │   │
│  │   │  └────────────────────────────────────────────────────────────┘  │        │   │
│  │   │         │                                                        │        │   │
│  │   │         ▼                                                        │        │   │
│  │   │  LLM Generates Structured Answer                                  │        │   │
│  │   └────────────────────────────────────────────────────────────────────┘        │   │
│  │                                    │                                             │   │
│  │                                    ▼                                             │   │
│  │   STEP 5: POST-PROCESSING                                                        │   │
│  │   ┌────────────────────────────────────────────────────────────────────┐        │   │
│  │   │  poseService.findPosesInText(answer)                             │        │   │
│  │   │         │                                                        │        │   │
│  │   │         ▼                                                        │        │   │
│  │   │  Extracts pose names mentioned in response                       │        │   │
│  │   │  Example: ["Bhujangasana", "Marjarasana", "Setu Bandhasana"]    │        │   │
│  │   └────────────────────────────────────────────────────────────────────┘        │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DATA LAYER                                            │
│                                                                                         │
│   ┌──────────────────────────┐    ┌──────────────────────────┐    ┌─────────────────┐   │
│   │    MONGODB (MongoDB)      │    │  PINECONE VECTOR DB     │    │ LOCAL JSON DATA │   │
│   │  ┌────────────────────┐  │    │  ┌────────────────────┐  │    │                 │   │
│   │  │  interactions      │  │    │  │  yoga-rag index    │  │    ├─ yoga_poses    │   │
│   │  │  ─────────────     │  │    │  │  ────────────────  │  │    ├─ yoga_knowledge│   │
│   │  │  • userQuestion    │  │    │  │  • id              │  │    │                 │   │
│   │  │  • answer          │  │    │  │  • values[384]     │  │    │ SEED DATA FLOW: │   │
│   │  │  • sources         │  │    │  │  • metadata        │  │    │ ┌─────────────┐ │   │
│   │  │  • feedback        │  │    │  │    - text          │  │    │ │yoga_knowledge│ │   │
│   │  │  • isUnsafe        │  │    │  │    - title         │  │    │ │    JSON     │ │   │
│   │  │  • timestamp       │  │    │  │    - source        │  │    │ └──────┬──────┘ │   │
│   │  └────────────────────┘  │    │  │    - page          │  │    │        │        │   │
│   │                          │    │  └────────────────────┘  │    │        ▼        │   │
│   │  Stores chat history     │    │                          │    │ ┌─────────────┐ │   │
│   │  & feedback              │    │  Stores vector embeddings│    │ │getEmbedding │ │   │
│   └──────────────────────────┘    │  for semantic search     │    │ │(Xenova)     │ │   │
│                                  └──────────────────────────┘    │ └──────┬──────┘ │   │
│                                                                           │        │   │
│                                                                           ▼        │   │
│                                                                  ┌─────────────┐   │   │
│                                                                  │upsertVectors│   │   │
│                                                                  │(Pinecone)   │   │   │
│                                                                  └─────────────┘   │   │
│                                                                                     │   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              RESPONSE FLOW (Back to Client)                           │
│                                                                                         │
│   JSON Response:                                                                        │
│   {                                                                                   │
│     "id": "507f1f77bcf86cd799439011",                                                 │
│     "answer": "Based on the Common Yoga Protocol... Bhujangasana (Cobra Pose)...",   │
│     "sources": ["Common Yoga Protocol - Ministry of AYUSH"],                         │
│     "poses": ["Bhujangasana", "Marjarasana"],                                        │
│     "isUnsafe": false                                                                │
│   }                                                                                   │
│                                                                                         │
│   Frontend Renders:                                                                   │
│   ┌────────────────────────────────────────────────────────────┐                     │
│   │  ChatMessage Component                                     │                     │
│   │  ┌──────────────────────────────────────────────────────┐  │                     │
│   │  │  🤖 Answer Text (formatted with markdown)            │  │                     │
│   │  │  📚 Sources List (collapsible)                      │  │                     │
│   │  │  🧘 Pose Cards (if poses detected)                  │  │                     │
│   │  │  👍👎 Feedback Buttons                               │  │                     │
│   │  └──────────────────────────────────────────────────────┘  │                     │
│   └────────────────────────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Data Flow Explanation

### 1. Data Ingestion & Vector DB Population (One-time Setup)

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  yoga_knowledge  │────▶│  getEmbedding()   │────▶│  upsertVectors() │────▶│   Pinecone DB    │
│     .json        │     │  (Xenova Model)   │     │   (REST API)     │     │  (yoga-rag idx)  │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
       │                          │                         │                         │
       │                          │                         │                         │
       ▼                          ▼                         ▼                         ▼
  Source Data               Text → 384-dim           Vectors uploaded            Stored as:
  - 50+ documents           embedding vector        in batches of 10            {id, values[],
  - Poses, benefits         (Local processing)                                metadata{}}
  - Guidelines
```

**Process:**
1. Yoga knowledge is stored in `yoga_knowledge.json` (source: Ministry of AYUSH)
2. During startup (`seedData()`), each item is converted to an embedding using Xenova/all-MiniLM-L6-v2
3. Embeddings are uploaded to Pinecone vector database in batches
4. Each vector has metadata: `{text, title, source, page}`

---

### 2. Query Processing Flow (Real-time)

```
User Query: "What poses help with back pain?"
                │
                ▼
    ┌───────────────────────┐
    │   1. Safety Check     │ ◄── Filters medical/pregnancy queries
    │   safetyService       │     Returns warning if unsafe
    └───────────────────────┘
                │
                ▼ (Safe Query)
    ┌───────────────────────┐
    │   2. Embed Query      │ ◄── Xenova/all-MiniLM-L6-v2 (local)
    │   embeddingService    │     [0.023, -0.156, ...] (384 dims)
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   3. Vector Search    │ ◄── Pinecone cosine similarity
    │   pineconeService     │     Returns top 3 similar documents
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   4. Context Build    │ ◄── Join retrieved docs with "\n\n"
    │   ragService          │     Creates knowledge context
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   5. LLM Generation   │ ◄── Gemini-Flash API
    │   genAI (Google)      │     Generates structured answer
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   6. Response         │ ◄── Extract poses + save to MongoDB
    │   chatController      │     Return JSON to frontend
    └───────────────────────┘
```

---

### 3. Vector Comparison (Similarity Search) Details

```
Query: "back pain relief"
   │
   ▼
Embedding: [0.023, -0.156, 0.892, ..., 0.445] (384 dimensions)
   │
   ▼
Pinecone Index Search (Cosine Similarity):
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   Similarity(A,B) = (A · B) / (||A|| × ||B||)                        │
│                                                                        │
│   Document A: "Bhujangasana strengthens spine..."    Score: 0.89      │
│   Document B: "Marjarasana improves flexibility..."    Score: 0.85      │
│   Document C: "Shavasana for relaxation..."           Score: 0.62      │
│   ...                                                                  │
│                                                                        │
│   Returns Top K=3 most similar documents                               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite | UI Components, Chat Interface |
| **API** | Express.js | REST API endpoints |
| **LLM** | Google Gemini Flash | Answer generation (cloud) |
| **Embeddings** | Xenova/all-MiniLM-L6-v2 | Local embedding generation (free) |
| **Vector DB** | Pinecone | Semantic search storage |
| **Database** | MongoDB | Chat history & feedback |
| **Safety** | Custom + Fuzzy Match | Medical query filtering |

---

## Key Design Decisions

### 1. **Hybrid Embedding Strategy**
- **Local Embeddings (Xenova)**: Cost-effective, runs on server
- **No API cost for embeddings** unlike OpenAI
- 384-dimensional vectors match Pinecone index

### 2. **RAG Architecture Benefits**
- Reduces hallucination by grounding answers in retrieved context
- Uses authentic yoga knowledge (Ministry of AYUSH)
- Cites sources for transparency

### 3. **Safety Layer**
- Pre-LLM filtering catches medical queries
- Fuzzy matching handles typos ("pregnent" → "pregnant")
- Levenshtein distance algorithm for typo tolerance

### 4. **Cost Optimization**
- Embeddings generated locally (0 cost)
- Only LLM generation uses paid API
- Vector search is fast and scalable

---

## Data Sources

| Source | Format | Content |
|--------|--------|---------|
| `yoga_knowledge.json` | JSON | 50+ documents on yoga theory, poses, guidelines |
| `yoga_poses.json` | JSON | Detailed pose library with benefits & precautions |
| Ministry of AYUSH | Reference | Authentic Common Yoga Protocol |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ask` | POST | Submit question, get AI answer |
| `/feedback` | POST | Submit thumbs up/down feedback |
| `/test` | GET | Health check endpoint |

---

## Security & Safety

```
User Input
    │
    ▼
┌─────────────────────────────────────┐
│ Safety Check Layer:                 │
│ • Keyword matching (exact)          │
│ • Fuzzy matching (typos)            │
│ • Medical term detection            │
│ • Pregnancy/surgery flags             │
└─────────────────────────────────────┘
    │
    ├─ Unsafe ──▶ Return warning message
    │
    └─ Safe ────▶ Proceed to RAG pipeline
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Production Setup              │
├─────────────────────────────────────────┤
│                                         │
│   ┌──────────────┐    ┌──────────────┐ │
│   │   Frontend   │    │   Backend    │ │
│   │   (Vercel)   │◄──►│   (Render)   │ │
│   │              │    │   / Railway  │ │
│   └──────────────┘    └──────┬───────┘ │
│                              │          │
│         ┌────────────────────┤          │
│         │                    │          │
│         ▼                    ▼          │
│   ┌──────────┐        ┌──────────┐     │
│   │ Pinecone │        │ MongoDB  │     │
│   │  Vector  │        │  Atlas   │     │
│   │   DB     │        │          │     │
│   └──────────┘        └──────────┘     │
│                                         │
│   ┌──────────┐                          │
│   │  Google  │                          │
│   │  Gemini  │                          │
│   │   API    │                          │
│   └──────────┘                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## Performance Considerations

1. **Embedding Caching**: None currently (could add Redis)
2. **Batch Processing**: Seed data uploaded in batches of 10
3. **Model Size**: Xenova/all-MiniLM-L6-v2 is small and fast (~80MB)
4. **Top-K Search**: Returns only top 3 documents for relevance
5. **Timeout**: Standard HTTP timeouts apply

---

## Future Enhancements

- [ ] Add Redis caching for embeddings
- [ ] Implement chat history context
- [ ] Add user authentication
- [ ] Support image uploads for pose correction
- [ ] Multi-language support
- [ ] Feedback loop for improving retrieval
