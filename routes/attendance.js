// routes/attendance.js
const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const router = express.Router();

// POST /api/attendance/scan
router.post("/scan", async (req, res) => {
  try {
    const { csId, event, day, preview } = req.body;

    if (!csId || !event || !day) {
      return res
        .status(400)
        .json({ success: false, message: "csId, event and day are required" });
    }

    // Check student registration for this event
    const student = await Student.findOne({ csId, event });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found for this event",
      });
    }

    // Preview mode: only return student info
    if (preview) {
      return res.json({
        success: true,
        preview: true,
        student: {
          firstName: student.firstName,
          lastName: student.lastName,
          csId: student.csId,
          event: student.event,
          university: student.university,
          collegeName: student.collegeName,
          course: student.course,
          yearOfStudy: student.yearOfStudy,
        },
      });
    }

    // Check if already marked present for this event+day
    const existing = await Attendance.findOne({ csId, event, day });

    if (existing) {
      return res.json({
        success: true,
        alreadyMarked: true,
        message: `Already marked present for ${day}.`,
        student: {
          firstName: student.firstName,
          lastName: student.lastName,
          csId: student.csId,
          event: student.event,
        },
      });
    }

    const attendance = new Attendance({
      csId,
      event,
      day,
      scannedBy: "teacher",
      status: "present",
    });

    await attendance.save();

    return res.json({
      success: true,
      alreadyMarked: false,
      message: `Attendance marked successfully for ${day}.`,
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        csId: student.csId,
        event: student.event,
      },
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

// GET /api/attendance?event=CyberSprint 2026&day=Day 1
router.get("/", async (req, res) => {
  try {
    const { event, day } = req.query;
    const query = {};
    if (event) query.event = event;
    if (day) query.day = day;

    const records = await Attendance.find(query).sort({ scanTime: -1 });
    return res.json(records);
  } catch (error) {
    console.error("Attendance list error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

module.exports = router;
