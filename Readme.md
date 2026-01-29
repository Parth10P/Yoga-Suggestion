# Yoga Suggestion RAG App 🧘‍♀️🤖

A smart Yoga assistant that uses **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware yoga recommendations. It combines local embeddings, a vector database, and the Google Gemini AI model to answer your yoga-related queries safely and effectively.

## 🚀 Features

- **Smart Suggestions:** Ask any yoga question and get AI-generated answers based on curated yoga knowledge.
- **RAG Architecture:** Uses **Pinecone** for vector storage and **Xenova/transformers** for high-performance local embeddings to retrieve relevant context.
- **Gemini AI Integration:** Powered by Google's **Gemini Flash** (`gemini-flash-latest`) model for fast and natural language generation.
- **Safety First:** Includes a custom **Safety Service** that detects and blocks inappropriate or medical-related queries (e.g., "pregnancy", "injury") using keyword and fuzzy matching.
- **Feedback System:** Tracks user interactions and feedback (thumbs up/down) to monitor answer quality.
- **Modern UI:** Built with **React** and **Tailwind CSS**, featuring a clean, responsive design with dark mode support and smooth animations.
- **Source Citations:** Answers strictly cite sources from the internal knowledge base for credibility.

## 🛠️ Tech Stack

### Frontend

- **React** (Vite)
- **Tailwind CSS** (Styling & Animations)
- **Lucide React** (Icons)

### Backend

- **Node.js / Express** (Server)
- **Mongoose** (MongoDB Interaction for logging)
- **Pinecone** (Vector Database for RAG)
- **@xenova/transformers** (Local Embeddings generation)
- **@google/generative-ai** (AI Response Generation)
- **Dotenv** (Environment Management)

## 📂 Project Structure

```
├── backend/
│   ├── config/         # DB and AI configurations
│   ├── controllers/    # Request handlers (Chat, Feedback)
│   ├── models/         # MongoDB schemas (Interaction Logs)
│   ├── routes/         # API routes
│   └── services/       # Business logic (RAG, Safety, Embeddings, Pinecone)
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components (Header, SearchInput, AnswerCard)
    │   └── assets/     # Static assets
```

## ⚡ Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance (Local or Atlas)
- Pinecone Account & API Key
- Google Gemini API Key

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Parth10P/Yoga-suggestion.git
    cd Yoga-suggestion
    ```

2.  **Setup Backend**

    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file in the `backend` directory:

    ```env
    PORT=8082
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_google_gemini_key
    PINECONE_API_KEY=your_pinecone_api_key
    PINECONE_INDEX=your_pinecone_index_name
    SEED_DB=false  # Set to true only if you need to seed data initially
    ```

    Start the server:

    ```bash
    npm start
    ```

3.  **Setup Frontend**

    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

## 🛡️ API Endpoints

- `POST /api/chat/ask`: Submit a yoga question. returns answer, sources, and safety warning.
- `POST /api/chat/feedback`: Submit helpfulness feedback (up/down) for an answer.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.
