// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration for cross-origin requests
const corsOptions = {
  origin: [
    'https://animated-choux-2ca6b0.netlify.app',
    'https://cute-concha-90eaf1.netlify.app/',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json());

// Static files - serve from public directory
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/students", require("./routes/student"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "API is working!",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection (Mongoose using your Atlas URI)
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
  })
  .then(async () => {
    console.log("Connected to MongoDB via Mongoose");

    // Optional ping, similar to MongoClient example
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Start server only after successful DB connection
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`CyberSprint 2026 backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// Export for Vercel
module.exports = app;
