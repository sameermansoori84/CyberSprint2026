// routes/student.js
const express = require("express");
const Student = require("../models/Student");
const { generateQrBuffer } = require("../utils/generateQr");
const { sendRegistrationEmail } = require("../utils/sendEmail");

const router = express.Router();

// POST /api/students/register
router.post("/register", async (req, res) => {
  try {
    const data = req.body;
    const student = new Student(data);
    await student.save();

    // 1) Generate QR for CS-ID
    let qrBuffer;
    try {
      qrBuffer = await generateQrBuffer(student.csId);
      console.log("QR generated for", student.csId);
    } catch (qrErr) {
      console.error("QR generation failed:", qrErr.message);
      // You can decide: continue without email, or fail.
    }

    // 2) Send confirmation email with QR (if QR generated and email config present)
    try {
      const fullName = `${student.firstName} ${student.lastName}`.trim();
      await sendRegistrationEmail({
        to: student.email,
        name: fullName,
        csId: student.csId,
        event: student.event,
        qrBuffer, // can be undefined if QR failed
      });
      console.log("Email sent to", student.email);
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);
      // Don't block registration just because email failed
    }

    res.json({
      success: true,
      message: "Registration successful! (Email will be sent if configured correctly.)",
      student: {
        id: student._id,
        csId: student.csId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        whatsappNumber: student.whatsappNumber,
        university: student.university,
        collegeName: student.collegeName,
        course: student.course,
        yearOfStudy: student.yearOfStudy,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered or CS-ID collision. Try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

// GET /api/students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ registeredAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET /students/by-email?email=test@example.com
router.get("/sendEmail", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
    }

    const student = await Student.findOne({ email: email.trim() });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found for this email",
      });
    }

    // 1) Generate QR for CS-ID
    let qrBuffer;
    try {
      qrBuffer = await generateQrBuffer(student.csId);
      console.log("QR generated for", student.csId);
    } catch (qrErr) {
      console.error("QR generation failed:", qrErr.message);
      // You can decide: continue without email, or fail.
    }

    // 2) Send confirmation email with QR (if QR generated and email config present)
    try {
      const fullName = `${student.firstName} ${student.lastName}`.trim();
      await sendRegistrationEmail({
        to: student.email,
        name: fullName,
        csId: student.csId,
        event: student.event,
        qrBuffer, // can be undefined if QR failed
      });
      console.log("Email sent to", student.email);
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);
      // Don't block registration just because email failed
    }
    res.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student by email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});


module.exports = router;
