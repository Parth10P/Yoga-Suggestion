const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api");
const ragService = require("./services/ragService");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", apiRoutes);

// Seed Data (if empty)
ragService.seedData();

// Export for Vercel
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
