const { pipeline } = require("@xenova/transformers");

// Use a singleton pattern to lazy-load the model
let extractor = null;

const getEmbedding = async (text) => {
  if (!extractor) {
    // Load the model locally. 'Xenova/all-MiniLM-L6-v2' is small and fast.
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  // Generate embedding
  const output = await extractor(text, { pooling: "mean", normalize: true });

  // Convert Tensor to standard array
  return Array.from(output.data);
};

module.exports = { getEmbedding };
