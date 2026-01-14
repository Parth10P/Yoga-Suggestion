const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
  userQuestion: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  sources: {
    type: [String],
    default: [],
  },
  isUnsafe: {
    type: Boolean,
    default: false,
  },
  feedback: {
    type: String,
    enum: ["up", "down", null],
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Yoga-Suggestion-System-logs", interactionSchema);
