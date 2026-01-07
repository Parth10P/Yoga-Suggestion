const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "../data/vector_store.json");
let vectorStore = [];

// Simple cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

const loadStore = () => {
  if (fs.existsSync(STORE_PATH)) {
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    vectorStore = JSON.parse(data);
    console.log(`Vector store loaded with ${vectorStore.length} documents.`);
  } else {
    console.log("No vector store found. Starting empty.");
    vectorStore = [];
  }
};

const saveStore = () => {
  // Ensure directory exists
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(vectorStore, null, 2));
};

const addDocument = (text, embedding, metadata = {}) => {
  const doc = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    text,
    embedding,
    metadata,
  };
  vectorStore.push(doc);
  saveStore();
};

const search = (queryEmbedding, limit = 3) => {
  const results = vectorStore.map((doc) => ({
    doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit).map((r) => r.doc);
};

// Initialize store on load
loadStore();
console.log(`Initial Vector Store Size: ${vectorStore.length}`);

module.exports = {
  addDocument,
  search,
  getStoreSize: () => vectorStore.length,
};
