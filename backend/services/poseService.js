const fs = require("fs");
const path = require("path");
const https = require("https");

let allPoses = [];

const loadLocalPoses = () => {
  try {
    const dataPath = path.join(__dirname, "../data/yoga_poses.json");
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, "utf-8");
      const localPoses = JSON.parse(rawData);
      return localPoses.map((p) => ({
        name: p.english_name,
        sanskrit: p.sanskrit_name,
        image: p.img_url,
        synonyms: p.sanskrit_name === "Sivasana" ? ["shavasana"] : [],
      }));
    }
  } catch (error) {
    console.error("Error loading local poses:", error);
  }
  return [];
};

const fetchExternalPoses = () => {
  return new Promise((resolve) => {
    https
      .get(
        "https://datasets-server.huggingface.co/rows?dataset=helloko%2Fyoga_poses&config=default&split=train&offset=0&length=100",
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              const mapped = parsed.rows.map((r) => ({
                name: r.row.name,
                sanskrit: r.row.sanskrit_name,
                image: r.row.photo_url,
              }));
              resolve(mapped);
            } catch (e) {
              console.error("Error parsing external poses:", e);
              resolve([]);
            }
          });
        },
      )
      .on("error", (err) => {
        console.error("Error fetching external poses:", err);
        resolve([]);
      });
  });
};

const init = async () => {
  console.log("[PoseService] Starting initialization...");
  const local = loadLocalPoses();
  allPoses = local; // Set local poses immediately
  console.log(`[PoseService] Loaded ${local.length} local poses.`);

  const external = await fetchExternalPoses();
  console.log(`[PoseService] Fetched ${external.length} external poses.`);

  const merged = [...allPoses, ...external];
  const unique = [];
  const seen = new Set();

  for (const p of merged) {
    if (!p.name) continue;
    const key = p.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }

  allPoses = unique;
  console.log(
    `[PoseService] Initialization complete. ${allPoses.length} unique yoga poses ready.`,
  );
};

// Initial load
init();

const findPosesInText = (text) => {
  if (!text || allPoses.length === 0) return [];

  const found = [];
  const lowerText = text.toLowerCase();

  for (const pose of allPoses) {
    const name = pose.name.toLowerCase();
    const sanskrit = pose.sanskrit ? pose.sanskrit.toLowerCase() : null;
    const synonyms = pose.synonyms || [];

    if (
      lowerText.includes(name) ||
      (sanskrit && lowerText.includes(sanskrit)) ||
      synonyms.some((s) => lowerText.includes(s))
    ) {
      found.push(pose);
    }
  }

  // Return top 4 unique matches to keep UI clean
  return found.slice(0, 4);
};

module.exports = { findPosesInText, init };
