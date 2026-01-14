# Yoga Suggestion RAG App 🧘‍♀️🤖

A smart Yoga assistant that uses **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware yoga recommendations. It combines local embeddings, a vector database, and the Gemini AI model to answer your yoga-related queries safely and effectively.

## 🚀 Features

- **Smart Suggestions:** Ask any yoga question and get AI-generated answers based on curated yoga knowledge.
- **RAG Architecture:** Uses **Pinecone** for vector storage and **Xenova/transformers** for local embeddings to retrieve relevant context.
- **Gemini AI Integration:** Powered by Google's **Gemini Flash** model for natural language generation.
- **Safety First:** Includes a safety service to detect and block inappropriate or harmful queries logic.
- **Modern UI:** Built with **React** and **Tailwind CSS**, featuring a clean, responsive, and dark-mode compatible interface.
- **Source Citations:** answers strictly cite sources from the internal knowledge base for credibility.

## 🛠️ Tech Stack

### Frontend

- **React** (Vite)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)

### Backend

- **Node.js / Express**
- **Mongoose** (MongoDB Interaction)
- **Pinecone** (Vector Database)
- **@xenova/transformers** (Local Embeddings)
- **@google/generative-ai** (Gemini Model)

## 📂 Project Structure

```
├── backend/
│   ├── config/         # DB and AI configurations
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   └── services/       # Business logic (RAG, Safety, Embeddings)
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   └── assets/     # Static assets
```

## ⚡ Getting Started

### Prerequisites

- Node.js installed
- MongoDB instance (Local or Atlas)
- Pinecone API Key
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
    # Create .env file and add:
    # PORT=8082
    # MONGO_URI=your_mongo_uri
    # GEMINI_API_KEY=your_gemini_key
    # PINECONE_API_KEY=your_pinecone_key
    # PINECONE_INDEX=your_index_name
    npm start
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

## 🛡️ API Endpoints

- `POST /api/chat/ask` - Submit a yoga question.
- `POST /api/chat/feedback` - Submit helpfulness feedback for an answer.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.
