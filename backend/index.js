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


app.get("/test", (req, res) => {
  res.status(200).send("Server is up and running..");
});


app.listen(PORT, () => {
  console.log(`Server is running http://localhost:${process.env.PORT}`);
});
