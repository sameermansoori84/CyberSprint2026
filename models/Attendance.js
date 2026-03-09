// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  csId: { type: String, required: true, index: true }, // CS2026-XXXX
  event: { type: String, required: true },
  day: { type: String, required: true }, // "Day 1", "Day 2", "Day 3"
  scanTime: { type: Date, default: Date.now },
  scannedBy: { type: String, default: "teacher" },
  status: { type: String, default: "present" },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
