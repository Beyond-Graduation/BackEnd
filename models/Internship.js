const { Schema, model } = require("../db/connection"); // import Schema & model

const qnaSchema = new Schema({
  question: { type: String },
});

// Internship Schema
const InternshipSchema = new Schema({
  internshipId: { type: String, required: true, unique: true },
  alumniId: { type: String, required: true },
  status: {
    type: String,
    default: "open",
    enum: ["open", "closed"],
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, required: true },
  companyName: { type: String, required: true },
  description: { type: String, required: true },
  stipend: { type: Number, min: 0, default: 0 },
  duration: { type: String, required: true },
  workingType: {
    type: String,
    required: true,
    enum: ["full_time", "part_time"],
  },
  yearofStudy: { type: Number, min: 0, default: 0 },
  qnas: { type: [qnaSchema] },
  deadline: { type: Date, required: true },
  dateUploaded: { type: Date, required: true, default: Date.now() },
  dateModified: { type: Date },
  // department_constraints: { type: String, required: true },
});

// Status options are "open" and "closed"

// Internship model
const Internship = model("internship", InternshipSchema);

module.exports = Internship;
