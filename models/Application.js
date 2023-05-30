const { Schema, model } = require("../db/connection"); // import Schema & model

const qnaSchema = new Schema({
    question: { type: String },
    answer: { type: String },
});

// Internship Schema
const ApplicationSchema = new Schema({
    applicationId: { type: String, required: true, unique: true },
    internshipId: { type: String, required: true },
    alumniId: { type: String, required: true },
    studentId: { type: String, required: true },
    status: {
        type: String,
        default: "applied",
        enum: ["applied", "rejected", "selected"],
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    degree: { type: String, required: true },
    branch: { type: String, required: true },
    cgpa: { type: Number, min: 0, default: 0 },
    expectedGraduationYear: { type: Number },
    yearofStudy: { type: Number, min: 0, default: 0 },
    qnas: { type: [qnaSchema] },
    dateApplied: { type: Date, required: true, default: Date.now() },
    dateofAction: { type: Date },
    resume: { type: String, default: "" },
    vectorEmbedding: [Number]
});


// set email+internship id as unique asap
ApplicationSchema.index({ email: 1, internshipId: 1 }, { unique: true });
ApplicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

//status be "on_review", "rejected", "selected"

// Internship model
const Application = model("application", ApplicationSchema);

module.exports = Application;