const Interaction = require("../models/Interaction");
const safetyService = require("../services/safetyService");
const ragService = require("../services/ragService");

// POST /ask
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.log(`[USER PROMPT]: ${question}`); // Log user prompt as requested

    // 1. Safety Check
    const safetyCheck = safetyService.checkSafety(question);
    if (safetyCheck.isUnsafe) {
      // Save unsafe interaction
      await Interaction.create({
        userQuestion: question,
        answer: safetyCheck.warning,
        isUnsafe: true,
      });

      return res.json({
        answer: safetyCheck.warning,
        sources: [],
        isUnsafe: true,
        safeAlternative: safetyCheck.safeAlternative,
      });
    }

    // 2. RAG Pipeline
    const ragResult = await ragService.getAnswer(question);

    // 3. Save to DB
    const interaction = await Interaction.create({
      userQuestion: question,
      answer: ragResult.answer,
      sources: ragResult.sources,
      isUnsafe: false,
    });

    res.json({
      id: interaction._id,
      answer: ragResult.answer,
      sources: ragResult.sources,
      poses: ragResult.poses,
      isUnsafe: false,
    });
  } catch (error) {
    console.error("Error in askQuestion:", error);
    res.status(500).json({
      error: "An error occurred while processing your request.",
      details: error.message,
    });
  }
};

// POST /feedback
const submitFeedback = async (req, res) => {
  try {
    const { questionId, feedback } = req.body; // feedback: 'up' or 'down'

    if (!questionId || !feedback) {
      return res
        .status(400)
        .json({ error: "questionId and feedback are required" });
    }

    const interaction = await Interaction.findById(questionId);
    if (!interaction) {
      return res.status(404).json({ error: "Interaction not found" });
    }

    interaction.feedback = feedback;
    await interaction.save();

    res.json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  askQuestion,
  submitFeedback,
};
