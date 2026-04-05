# Yoga Suggestion App - Architecture Flow (Simplified)

## Quick Overview Diagram

```
┌─────────────┐      HTTP POST       ┌─────────────┐
│   USER      │ ───────────────────▶ │   EXPRESS   │
│  (Browser)  │    /ask {question}   │   SERVER    │
└─────────────┘                      └──────┬──────┘
      ▲                                     │
      │                              Safety Check
      │                              (Medical? Pregnancy?)
      │                                     │
      │                                     ▼
      │                              ┌─────────────┐
      │                              │  EMBEDDING  │◄─┐
      │                              │  (Xenova)   │  │
      │                              └──────┬──────┘  │
      │                                     │         │
      │                              [384-dim vector] │
      │                                     │         │
      │                                     ▼         │
      │                              ┌─────────────┐  │
      │                              │   VECTOR    │  │
      │                              │   SEARCH    │  │
      │                              │ (Pinecone)  │  │
      │                              └──────┬──────┘  │
      │                              Top 3 matches   │
      │                                     │         │
      │                                     ▼         │
      │                              ┌─────────────┐  │
      │                              │    RAG      │  │
      │                              │   CONTEXT   │──┘
      │                              │   BUILDER   │
      │                              └──────┬──────┘
      │                                     │
      │                                     ▼
      │                              ┌─────────────┐
      │                              │    GEMINI   │
      │                              │     LLM     │
      │                              │   (Google)  │
      │                              └──────┬──────┘
      │                                     │
      │                              Generated Answer
      │                                     │
      │                              ┌─────────────┐
      │                              │   MongoDB   │
      │                              │   (Save)    │
      │                              └──────┬──────┘
      │                                     │
      └─────────────────────────────────────┘
                    JSON Response
        {answer, sources, poses, isUnsafe}
```

---

## Step-by-Step Data Flow

### Step 1: User Sends Question
```
Frontend (React) ──POST /ask──▶ Backend (Express)
Body: { "question": "What yoga for back pain?" }
```

### Step 2: Safety Check
```javascript
// safetyService.checkSafety()
// Checks for: pregnant, surgery, heart, blood pressure, etc.
// Also uses fuzzy matching for typos

Input:  "What yoga for back pain?"
Output: { isUnsafe: false }  // ✓ Proceed

Input:  "Yoga for pregnancy?"
Output: { isUnsafe: true, warning: "Consult a doctor..." }  // ✗ Blocked
```

### Step 3: Generate Embedding (LOCAL - FREE)
```javascript
// embeddingService.getEmbedding()
// Uses: Xenova/all-MiniLM-L6-v2 (runs on your server)

Text:   "What yoga for back pain?"
Output: [0.023, -0.156, 0.892, ..., 0.445]  // 384 numbers
        │
        └─▶ This is a vector representation of the text meaning
```

### Step 4: Vector Search (Pinecone)
```javascript
// pineconeService.queryVectors(embedding, topK=3)

Query Vector ──▶ Pinecone Index "yoga-rag"
                    │
                    ├─ Compare with ALL stored vectors
                    │  (Cosine Similarity)
                    │
                    ▼
            Returns Top 3 Matches:
            ┌─────────────────────────────────────┐
            │ 1. Score: 0.89 - "Bhujangasana..." │
            │ 2. Score: 0.85 - "Marjarasana..."  │
            │ 3. Score: 0.82 - "Setu Bandha..."  │
            └─────────────────────────────────────┘
```

### Step 5: Build Context
```javascript
// ragService builds prompt

const context = matches.map(m => m.metadata.text).join("\n\n");

Result:
"Bhujangasana strengthens the spine and relieves backache...

Marjarasana improves flexibility of the neck, shoulders, and spine...

Setu Bandhasana relieves back pain and strengthens back muscles..."
```

### Step 6: Generate Answer (Gemini LLM)
```javascript
// genAI.getGenerativeModel({ model: "gemini-flash-latest" })

Prompt Sent to Gemini:
─────────────────────────────────────────
You are an expert yoga instructor...

KNOWLEDGE BASE:
[Context from Step 5]

User Question: What yoga for back pain?

Provide answer with poses, benefits, and precautions.
─────────────────────────────────────────

Output: "Based on the Common Yoga Protocol, here are poses for back pain:
        1. Bhujangasana (Cobra Pose) - strengthens spine...
        2. Marjarasana (Cat Pose) - improves flexibility..."
```

### Step 7: Extract Poses & Save
```javascript
// poseService.findPosesInText(answer)
// Returns: ["Bhujangasana", "Marjarasana", "Setu Bandhasana"]

// Save to MongoDB
Interaction.create({
  userQuestion: "What yoga for back pain?",
  answer: "...",
  sources: ["Common Yoga Protocol..."],
  isUnsafe: false
});
```

### Step 8: Return to Frontend
```json
{
  "id": "507f1f77bcf86cd799439011",
  "answer": "Based on the Common Yoga Protocol...",
  "sources": ["Common Yoga Protocol - Ministry of AYUSH"],
  "poses": ["Bhujangasana", "Marjarasana"],
  "isUnsafe": false
}
```

---

## How Similarity Comparison Works

```
┌─────────────────────────────────────────────────────────┐
│           COSINE SIMILARITY EXPLAINED                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  When user asks: "back pain relief"                    │
│                                                         │
│  Converted to vector: [0.1, -0.3, 0.8, ...]           │
│                                384 dimensions          │
│                                                         │
│  Compare with stored documents:                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ Document A: "Bhujangasana for back..."      │     │
│  │ Vector:      [0.2, -0.2, 0.9, ...]          │     │
│  │                                              │     │
│  │ Similarity = cos(θ) = (A·B) / (|A|×|B|)     │     │
│  │            = 0.89  ◄── HIGH SIMILARITY       │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │ Document B: "Meditation for stress..."        │     │
│  │ Vector:      [-0.5, 0.1, 0.2, ...]           │     │
│  │                                              │     │
│  │ Similarity = 0.34  ◄── LOW SIMILARITY        │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  Pinecone returns documents with highest scores!      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Cost Breakdown

| Component | Cost | Why? |
|-----------|------|------|
| **Xenova Embeddings** | FREE | Runs locally on server |
| **Pinecone** | ~$0.01/1K queries | Vector storage + search |
| **Gemini Flash** | ~$0.000125/1K tokens | Answer generation only |
| **MongoDB** | FREE tier | Chat history storage |

**Total per query: ~$0.0002** (extremely cost-effective!)

---

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| `embeddingService.js` | Convert text → vector (local model) |
| `pineconeService.js` | Store & search vectors (cloud DB) |
| `ragService.js` | Orchestrate: embed → search → generate |
| `safetyService.js` | Filter unsafe medical queries |
| `chatController.js` | HTTP request handler |
| `yoga_knowledge.json` | Source documents for RAG |

---

## Data Seeding Flow (One-time)

```
yoga_knowledge.json
        │
        │ For each item:
        ▼
┌───────────────┐
│ getEmbedding()│◄──┐
│ (Xenova)      │   │
└───────┬───────┘   │
        │           │
        ▼           │
┌───────────────┐   │
│upsertVectors()│───┘ (Batch size: 10)
│ (Pinecone)    │
└───────────────┘
        │
        ▼
Vectors stored in yoga-rag index
```

Run with: `SEED_DB=true node index.js`

---

## Why This Architecture?

1. **RAG (Retrieval Augmented Generation)**
   - Reduces hallucination (LLM answers based on facts)
   - Cites authentic sources (Ministry of AYUSH)
   - Updatable knowledge (just update JSON, re-seed)

2. **Local Embeddings (Xenova)**
   - Zero cost for embeddings
   - Fast (no API latency)
   - Privacy (text stays on your server)

3. **Vector Database (Pinecone)**
   - Millisecond similarity search
   - Scalable (handles millions of documents)
   - Managed service (no ops overhead)

4. **Safety Layer**
   - Protects against medical liability
   - Fuzzy matching catches typos
   - Pre-LLM filtering (saves API costs)
