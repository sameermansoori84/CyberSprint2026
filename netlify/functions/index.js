const serverless = require("serverless-http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS configuration
const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoUri) {
    console.error("Missing MONGO_URI environment variable");
    throw new Error("Missing MONGO_URI");
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        serverApi: { version: "1", strict: true, deprecationErrors: true },
        bufferCommands: false,
      });
    }
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    isConnected = false;
    throw err;
  }
};

// Middleware to connect DB before each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed",
      error: error.message 
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "API is working",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Import routes
try {
  const studentRoutes = require("../../routes/student");
  const attendanceRoutes = require("../../routes/attendance");
  const authRoutes = require("../../routes/auth");
  const adminRoutes = require("../../routes/admin");

  // Register routes
  app.use("/api/students", studentRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
} catch (error) {
  console.error("Error loading routes:", error);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Endpoint not found",
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    success: false, 
    message: "Internal server error",
    error: err.message 
  });
});

// Export handler
module.exports.handler = serverless(app);
