const unsafeKeywords = [
  "pregnant",
  "pregnancy",
  "trimester",
  "baby",
  "prenatal",
  "medical",
  "surgery",
  "pain",
  "doctor",
  "hospital",
  "hernia",
  "glaucoma",
  "blood pressure",
  "bp",
  "heart condition",
  "heart attack", // Added
  "cardiac",      // Added
  "stroke",       // Added
  "injury",
  "diagnosis",
  "cure",
  "treatment",
  "medication",
];

// 1. High-risk single words for fuzzy matching (Typos)
const fuzzyTriggers = [
  "pregnant",
  "pregnancy",
  "trimester",
  "prenatal",
  "surgery",
  "hernia",
  "glaucoma",
  "cardiac",
  "hospital",
  "doctor",
  "medication",
  "injury",
  "stroke",
  "asthma",
  "diabetes"
];

// Helper: Calculate Levenshtein Distance (Typos)
const getEditDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const checkSafety = (query) => {
  const lowerQuery = query.toLowerCase();

  // Clean query for "missing space" check (e.g. "heartattack")
  // Removes all non-alphanumeric characters
  const cleanQuery = lowerQuery.replace(/[^a-z0-9]/g, "");

  // --- CHECK 1: Exact matches & Missing Spaces ---
  for (const keyword of unsafeKeywords) {
    // Standard inclusion
    if (lowerQuery.includes(keyword)) {
      return createUnsafeResponse(keyword);
    }
    // Missing space check (e.g., keyword "heart attack" matches input "heartattack")
    const cleanKeyword = keyword.replace(/[^a-z0-9]/g, "");
    if (cleanQuery.includes(cleanKeyword)) {
      return createUnsafeResponse(keyword);
    }
  }

  // --- CHECK 2: Fuzzy Matching (Typos in Words) ---
  // Split query into words to check individually
  const queryTokens = lowerQuery.split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of queryTokens) {
    // Skip very short words (less than 4 chars) to avoid false positives
    if (token.length < 4) continue;

    for (const trigger of fuzzyTriggers) {
      // Allow max 1 edit for shorter words, 2 for longer
      const maxDistance = trigger.length > 5 ? 2 : 1;
      const distance = getEditDistance(token, trigger);

      if (distance <= maxDistance) {
        return createUnsafeResponse(trigger);
      }
    }
  }

  // --- CHECK 3: Multi-word Fuzzy (e.g., "heart atteck") ---
  // Specific check for "heart attack" variations
  const hasHeart = queryTokens.some(t => getEditDistance(t, "heart") <= 1);
  const hasAttack = queryTokens.some(t => getEditDistance(t, "attack") <= 1 || getEditDistance(t, "condition") <= 2);

  if (hasHeart && hasAttack) {
    return createUnsafeResponse("heart condition/attack");
  }

  return { isUnsafe: false };
};

const createUnsafeResponse = (detectedTerm) => {
  return {
    isUnsafe: true,
    warning: `I cannot provide medical advice. Your query seems to mention '${detectedTerm}' or a related condition. Please consult a certified yoga therapist or medical professional.`,
    safeAlternative: "Try asking about general yoga poses for relaxation, flexibility, or strength.",
  };
};

module.exports = { checkSafety };
