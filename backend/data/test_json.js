const fs = require("fs");
const path = require("path");

try {
  const content = fs.readFileSync(
    "/Users/patel_parthk/Desktop/Yoga-suggestion/backend/data/yoga_poses.json",
    "utf8",
  );
  JSON.parse(content);
  console.log("JSON is valid");
} catch (e) {
  console.error("JSON is invalid:", e.message);
  console.error("Stack:", e.stack);
}
