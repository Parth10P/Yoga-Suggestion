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
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐      │
│  │   Search   │  │  Chat      │  │  Results Display     │      │
│  │   Box      │  │  History   │  │  (Text + Sources)    │      │
│  └────────────┘  └────────────┘  └──────────────────────┘      │
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
            │ Pinecone │     │  Groq    │   │  MongoDB │
            │ Vector   │     │  LLM     │   │  History │
            │ Database │     │  (AI)    │   │          │
            └──────────┘     └──────────┘   └──────────┘
