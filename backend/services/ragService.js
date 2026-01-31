const genAI = require("../config/genAI");
const { getEmbedding } = require("./embeddingService");
const {
  upsertVectors,
  queryVectors,
  ensureIndex,
  deleteAllVectors,
} = require("./pineconeService");
const { findPosesInText } = require("./poseService");
const fs = require("fs");
const path = require("path");

// Use Gemini ONLY for the final answer generation
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const getAnswer = async (question) => {
  try {
    console.log("------------------------------------------------");
    console.log("New Question:", question);

    // 1. Generate Query Embedding (Locally - No API Limit!)
    console.log("1. Generating embedding locally (Xenova)...");
    const queryEmbedding = await getEmbedding(question);

    // 2. Retrieve Relevant Chunks from Pinecone
    console.log("2. Querying Pinecone for context...");
    const matches = await queryVectors(queryEmbedding, 3);

    // Map matches to context text
    const context = matches.map((match) => match.metadata.text).join("\n\n");
    const sources = matches.map(
      (match) => match.metadata.source || "General Knowledge",
    );

    console.log(`   Found ${matches.length} relevant matches.`);

    // 3. Construct Prompt
    const prompt = `
    You are an expert yoga instructor with deep knowledge of the Common Yoga Protocol. Your role is to:
    
    1. Provide accurate, helpful yoga guidance based ONLY on the provided knowledge base
    2. Always mention specific yoga poses with both Sanskrit and English names
    3. Include relevant benefits for the user's question
    4. CRITICALLY IMPORTANT: Always include safety precautions and contraindications
    5. Be warm, encouraging, and supportive
    6. If asked about something not in the knowledge base, be honest and suggest 
       consulting a qualified yoga instructor
    7. Never invent information - stick to what's provided
    
    KNOWLEDGE BASE (Authentic Yoga Protocol Information):
    ${context}
    
    User Question: ${question}

    Please provide a comprehensive, helpful answer that addresses the user's question 
    using the above information. Structure your response clearly with poses, benefits, 
    and precautions.
    Answer:
    `;

    // 4. Generate Answer (Gemini)
    console.log("3. Asking Gemini (Generation)...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // 5. Find relevant poses for display
    const relevantPoses = findPosesInText(text);

    return {
      answer: text,
      sources: [...new Set(sources)], // Unique sources
      poses: relevantPoses,
    };
  } catch (error) {
    console.error("Error in getAnswer:", error);
    throw error;
  }
};

// Start-up function to seed data
const seedData = async () => {
  // Only run if specifically requested via env var
  if (process.env.SEED_DB !== "true") {
    console.log("Skipping seeding (SEED_DB is not set to true).");
    return;
  }

  try {
    console.log("Initializing Seeding Process...");
    console.log("Checking Pinecone Index...");
    await ensureIndex();

    console.log("Clearing existing vectors from Pinecone...");
    await deleteAllVectors();
    console.log("Index cleared.");

    const dataPath = path.join(__dirname, "../data/yoga_knowledge.json");
    if (!fs.existsSync(dataPath)) {
      console.error("Data file not found at:", dataPath);
      return;
    }

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const items = JSON.parse(rawData);

    console.log(`Found ${items.length} items in yoga_knowledge.json.`);
    console.log("Starting batch embedding and upload...");

    // Process in batches to avoid overwhelming network/memory
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const vectors = [];

      process.stdout.write(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          items.length / batchSize,
        )}... `,
      );

      for (const item of batch) {
        // Combine title + info for embedding context
        const textToEmbed = `${item.title}: ${item.info}`;
        // Generate embedding locally
        const embedding = await getEmbedding(textToEmbed);

        vectors.push({
          id: item.id || `doc_${Date.now()}_${Math.random()}`,
          values: embedding,
          metadata: {
            text: item.info, // Store the main info as text
            title: item.title,
            source: item.source,
            page: item.page,
            // storing other fields as needed
          },
        });
      }

      // Upload batch to Pinecone
      await upsertVectors(vectors);
      console.log("Done.");
    }

    console.log("------------------------------------------------");
    console.log("✅ Seeding complete! Database is ready.");
    console.log("------------------------------------------------");
  } catch (error) {
    console.error("Error in seedData:", error);
  }
};

module.exports = {
  getAnswer,
  seedData,
};
