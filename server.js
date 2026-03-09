// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/students", require("./routes/student"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));

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
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CyberSprint 2026 backend running on http://localhost:${PORT}`);
});
