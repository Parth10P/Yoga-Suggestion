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

// Check if index exists and has correct dimensions, if not re-create it
const ensureIndex = async () => {
  try {
    const indexList = await pinecone.listIndexes();
    const targetIndex = indexList.indexes.find((i) => i.name === indexName);

    if (targetIndex) {
      if (targetIndex.dimension === 384) {
        console.log(`Index ${indexName} exists with correct dimensions.`);
        return;
      } else {
        console.log(
          `Index ${indexName} has wrong dimensions (${targetIndex.dimension} vs 384). Re-creating...`,
        );
        await pinecone.deleteIndex(indexName);
        console.log(`Index ${indexName} deleted.`);
        // Wait a bit for deletion to propagate
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    console.log(
      `Creating Pinecone index: ${indexName} (Dimensions: 384, Metric: cosine)`,
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

    console.log("Waiting for index initialization...");
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait longer for creation
  } catch (error) {
    console.error("Error creating/checking index:", error);
  }
};

const deleteAllVectors = async () => {
  try {
    const index = pinecone.index(indexName);
    // For serverless indexes, deleteAll() is the standard way.
    // If it fails with 404, the index might not exist or be reachable yet.
    await index.deleteAll();
    console.log("Deleted all vectors from index:", indexName);
  } catch (error) {
    if (error.name === "PineconeNotFoundError") {
      console.warn("Index not found or not ready yet, skipping deletion.");
    } else {
      throw error;
    }
  }
};

module.exports = { upsertVectors, queryVectors, ensureIndex, deleteAllVectors };
