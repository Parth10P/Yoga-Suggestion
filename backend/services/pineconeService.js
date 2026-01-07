const { Pinecone } = require("@pinecone-database/pinecone");

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME || "yoga-rag";

const upsertVectors = async (vectors) => {
  // vectors array format defaults to: [{ id, values, metadata }]
  const index = pinecone.index(indexName);
  await index.upsert(vectors);
};

const queryVectors = async (vector, topK = 3) => {
  const index = pinecone.index(indexName);
  const queryResponse = await index.query({
    vector: vector,
    topK: topK,
    includeMetadata: true,
  });
  return queryResponse.matches;
};

// Check if index exists, if not create it (optional helper)
const ensureIndex = async () => {
  try {
    const indexList = await pinecone.listIndexes();
    const existingIndexes = indexList.indexes.map((i) => i.name);

    if (!existingIndexes.includes(indexName)) {
      console.log(
        `Creating Pinecone index: ${indexName} (Dimensions: 384, Metric: cosine)`
      );
      await pinecone.createIndex({
        name: indexName,
        dimension: 384, // Metric for Xenova/all-MiniLM-L6-v2
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      // Wait for index to be ready
      console.log("Waiting for index initialization...");
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  } catch (error) {
    console.error("Error creating/checking index:", error);
  }
};

module.exports = { upsertVectors, queryVectors, ensureIndex };
