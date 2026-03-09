// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  whatsappNumber: { type: String, required: true, trim: true },
  university: {
    type: String,
    required: true,
    enum: ["Bhagwan Mahavir University", "Other University"],
  },
  collegeName: { type: String, required: true, trim: true },
  course: {
    type: String,
    required: true,
    enum: ["Bachelors", "Masters"],
  },
  yearOfStudy: { type: String, required: true },
  emergencyContactName: { type: String, required: true, trim: true },
  emergencyContactNumber: { type: String, required: true, trim: true },
  paymentReference: { type: String, trim: true },
  event: { type: String, required: true, default: "CyberSprint 2026" },
  csId: { type: String, unique: true, index: true },
  registeredAt: { type: Date, default: Date.now },
});

// Auto-generate CS-ID with 4 random digits: CS2026-XXXX
studentSchema.pre("save", async function (next) {
  if (this.csId) return next();

  try {
    let unique = false;
    let csId;

    while (!unique) {
      const randomCode = `${Math.floor(Math.random() * 10000)}`.padStart(4, "0");
      csId = `CS2026-${randomCode}`;

      const existing = await this.constructor.findOne({ csId });
      if (!existing) unique = true;
    }

    this.csId = csId;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Student", studentSchema);
