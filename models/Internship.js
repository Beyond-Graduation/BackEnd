const { Schema, model } = require("../db/connection") // import Schema & model

const qnaSchema = new Schema({
    question:{type:String}
  });

// Internship Schema
const InternshipSchema = new Schema({
    internshipId: { type: String, required: true, unique: true },
    alumniId: { type: String, required: true },
    status: {type: String, default: "open"},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    companyName: { type: String, required: true },
    stipend: { type: Number, min: 0, default: 0},
    // internshipType: { type: String, required: true },
    duration:{ type: String, required: true },
    workingPeriod: { type: String, required: true },
    department: { type: String, required: true },
    yearofStudy: { type: Number, min: 0, default: 0 },
    qnas: {type:[qnaSchema]},
    Perks: [{ type: String }],
    deadline: { type: Date, required: true},
    dateUploaded: { type: Date, required: true, default: Date.now() },
    dateModified: { type: Date, required: true, default: Date.now() },
})

// Internship model
const Internship = model("internship", InternshipSchema)

module.exports = Internship