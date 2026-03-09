// routes/admin.js
const express = require("express");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

const router = express.Router();

// SUMMARY: GET /api/admin/summary?event=CyberSprint 2026
router.get("/summary", async (req, res) => {
  try {
    const event = req.query.event || "CyberSprint 2026";

    const [totalStudents, day1, day2, day3] = await Promise.all([
      Student.countDocuments({ event }),
      Attendance.countDocuments({ event, day: "Day 1" }),
      Attendance.countDocuments({ event, day: "Day 2" }),
      Attendance.countDocuments({ event, day: "Day 3" }),
    ]);

    res.json({
      success: true,
      event,
      totalStudents,
      attendance: {
        day1,
        day2,
        day3,
      },
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// REGISTRATIONS JSON: GET /api/admin/registrations?event=CyberSprint 2026
router.get("/registrations", async (req, res) => {
  try {
    const event = req.query.event || "CyberSprint 2026";
    const students = await Student.find({ event }).sort({ registeredAt: -1 });

    res.json({ success: true, students });
  } catch (err) {
    console.error("Admin registrations error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ATTENDANCE JSON: GET /api/admin/attendance?event=CyberSprint 2026&day=Day 1
router.get("/attendance", async (req, res) => {
  try {
    const event = req.query.event || "CyberSprint 2026";
    const day = req.query.day;
    const query = { event };
    if (day) query.day = day;

    const records = await Attendance.find(query).sort({ scanTime: -1 });

    res.json({ success: true, records });
  } catch (err) {
    console.error("Admin attendance error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// CSV: registrations
router.get("/registrations/csv", async (req, res) => {
  try {
    const event = req.query.event || "CyberSprint 2026";
    const students = await Student.find({ event }).sort({ registeredAt: -1 });

    const header = [
      "CS-ID",
      "First Name",
      "Last Name",
      "Email",
      "WhatsApp",
      "University",
      "College",
      "Course",
      "Year of Study",
      "Emergency Contact Name",
      "Emergency Contact Number",
      "Payment Reference",
      "Event",
      "Registered At",
    ];

    const rows = students.map((s) => [
      s.csId,
      s.firstName,
      s.lastName,
      s.email,
      s.whatsappNumber || "",
      s.university || "",
      s.collegeName || "",
      s.course || "",
      s.yearOfStudy || "",
      s.emergencyContactName || "",
      s.emergencyContactNumber || "",
      s.paymentReference || "",
      s.event || "",
      s.registeredAt ? new Date(s.registeredAt).toISOString() : "",
    ]);

    const csvLines = [header, ...rows].map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="registrations_${event.replace(/\s+/g, "_")}.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error("Admin registrations CSV error:", err);
    res.status(500).send("Error generating CSV");
  }
});

// CSV: attendance
router.get("/attendance/csv", async (req, res) => {
  try {
    const event = req.query.event || "CyberSprint 2026";
    const day = req.query.day;
    const query = { event };
    if (day) query.day = day;

    const records = await Attendance.find(query).sort({ scanTime: -1 });

    const header = ["CS-ID", "Event", "Day", "Status", "Scan Time"];

    const rows = records.map((r) => [
      r.csId,
      r.event || "",
      r.day || "",
      r.status || "",
      r.scanTime ? new Date(r.scanTime).toISOString() : "",
    ]);

    const csvLines = [header, ...rows].map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = csvLines.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance_${event.replace(/\s+/g, "_")}${
        day ? "_" + day.replace(/\s+/g, "_") : ""
      }.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error("Admin attendance CSV error:", err);
    res.status(500).send("Error generating CSV");
  }
});

module.exports = router;
