# Yoga Suggestion App - System Overview

## System Flow (Step by Step)

```
┌──────────┐     ┌────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│          │     │            │     │             │     │             │     │          │
│   USER   │────▶│   SAFETY   │────▶│  UNDERSTAND │────▶│   SEARCH    │────▶│  ANSWER  │
│          │     │    CHECK   │     │   QUESTION  │     │   KNOWLEDGE │     │          │
│          │     │            │     │             │     │             │     │          │
└──────────┘     └────────────┘     └─────────────┘     └─────────────┘     └──────────┘
     │                  │                    │                    │                 │
     │                  │                    │                    │                 │
     ▼                  ▼                    ▼                    ▼                 ▼
  Types:           "Is this a          Convert words          Find similar      Generate
  "What yoga       medical            to numbers             documents in      human-like
  for back         question?"          (AI Embedding)         database          response
  pain?"
                                      "back pain"
                                      ↓
                                      [0.23, -0.15,
                                       0.89, ...]
```

---
## Components Overview

```
            ┌────────────────────────────────────────────────────────────────┐
            │                      USER INTERFACE                            │
            │    ┌────────────┐  ┌────────────┐  ┌──────────────────────┐    │
            │    │   Search   │  │  Chat      │  │  Results Display     │    │
            │    │   Box      │  │  History   │  │  (Text + Sources)    │    │
            │    └────────────┘  └────────────┘  └──────────────────────┘    │
            └────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
            ┌────────────────────────────────────────────────────────────────┐
            │                    APPLICATION SERVER                          │
            │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
            │  │  Safety      │  │  RAG Engine  │  │  Pose Extractor  │      │
            │  │  Filter      │  │  (Brain)     │  │  (Find poses)    │      │
            │  └──────────────┘  └──────────────┘  └──────────────────┘      │
            └────────────────────────────────────────────────────────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                        ┌──────────┐     ┌──────────┐   ┌──────────┐
                        │ Pinecone │     │  Groq    │   │ MongoDB  │
                        │ Vector   │     │  LLM     │   │ History  │
                        │ Database │     │  (AI)    │   │          │
                        └──────────┘     └──────────┘   └──────────┘
```


---

# Data Ingestion Flow - Pinecone Vector DB

## Overview Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   RAW SOURCE    │     │   CHUNKING      │     │   EMBEDDING     │     │   PINECONE      │
│   DOCUMENTS     │────▶│   & PROCESSING  │────▶│   GENERATION    │────▶│   VECTOR DB     │
│                 │     │                 │     │                 │     │                 │
│ • PDF Files     │     │ • Split text    │     │ • Local Model   │     │ • Upsert        │
│ • Word Docs     │     │ • Clean format  │     │ • 384-dim       │     │ • Namespace     │
│ • Text Files    │     │ • Add metadata  │     │ • Batch process │     │ • Index store   │
│ • JSON Data     │     │ • Chunk size    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Detailed Pipeline Flow

```
                              ┌─────────────┐
                              │ START       │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌───────────────────────┐
                              │ LOAD DOCUMENTS        │
                              │ From:                 │
                              │ • Local folder        │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐     ┌───────────────────────┐
                              │ EXTRACT TEXT          │────▶│ SKIP IF UNSUPPORTED   │
                              │ • PDF parser          │     └───────────────────────┘
                              │ • DOCX parser         │
                              │ • TXT reader          │
                              │ • JSON loader         │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐
                              │ PRE-PROCESS           │
                              │ • Remove special chars│
                              │ • Normalize whitespace│
                              │ • UTF-8 encode        │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐
                              │ CHUNK TEXT            │
                              │ Strategy:             │
                              │ • Size: 1000 tokens   │
                              │ • Overlap: 100 tokens │
                              │ • Boundary: Sentence  │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐
                              │ ADD METADATA          │
                              │ Fields:               │
                              │ • source_file         │
                              │ • page_number         │
                              │ • chunk_index         │
                              │ • total_chunks        │
                              │ • upload_timestamp    │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐     ┌───────────────────────┐
                              │ BATCH CREATION        │────▶│ BATCH SIZE: 100       │
                              │ Group chunks          │     │ (Configurable)        │
                              └───────┬───────────────┘     └───────────────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐
                              │ GENERATE EMBEDDINGS   │
                              │ Model:                │
                              │  (Hugging Face model) │
                              │  all-MiniLM-L6-v2     │
                              │ Input: text chunks    │
                              │ Output: 384-dim       │
                              │ vectors               │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐
                              │ PREPARE RECORDS       │
                              │ Format:               │
                              │ {                     │
                              │   id: "uuid",         │
                              │   values: [vector],   │
                              │   metadata: {...}     │
                              │ }                     │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐
                              │ UPSERT TO PINECONE    │
                              │                       │
                              │ Namespace:            │
                              │ • "default"           │
                              │ • "org_{id}"          │
                              │ • Custom              │
                              └───────┬───────────────┘
                                      │
                                      ▼
                              ┌───────────────────────┐     ┌───────────────────────┐
                              │ VERIFY UPLOAD         │────▶│ RETRY IF FAILED       │
                              │ Check index stats     │     │ (Max 3 attempts)      │
                              └───────┬───────────────┘     └───────────────────────┘
                                      │ Success
                                      ▼
                              ┌───────────────────────┐
                              │ LOG RESULTS           │
                              │ • Total processed     │
                              │ • Success count       │
                              │ • Failed count        │
                              │ • Duration            │
                              └───────┬───────────────┘
                                      │
                                      ▼
                                 ┌─────────────┐
                                 │    END      │
                                 └─────────────┘
```

---

## Data Structure Flow

```
                                    INPUT DOCUMENT
                                    │
                                    ├─ File: "yoga_guide.pdf"
                                    ├─ Pages: 25
                                    └─ Size: 2.4 MB
                                          │
                                          ▼
                                    ┌─────────────────────┐
                                    │ CHUNK 1             │
                                    ├─ Text: "Bhujangasana│
                                    │   or Cobra Pose..." │
                                    ├─ Metadata:          │
                                    │   • source:         │
                                    │     "yoga_guide.pdf"│
                                    │   • page: 5         │
                                    │   • index: 0        │
                                    └─────────┬───────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │ EMBEDDING           │
                                    ├─ Vector: [0.023,    │
                                    │   -0.156, 0.892,    │
                                    │   ..., 0.445]       │
                                    ├─ Dimensions: 384    │
                                    └─────────┬───────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │ PINECONE RECORD     │
                                    ├─ id: "doc_001_ch_0" │
                                    ├─ values: [vector]   │
                                    ├─ metadata: {        │
                                    │   text: "Bhujanga.."│
                                    │   source: "yoga_..."│
                                    │   page: 5,          │
                                    │   index: 0          │
                                    │ }                   │
                                    └─────────────────────┘
```

---