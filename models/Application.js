const { Schema, model } = require("../db/connection") // import Schema & model

const qnaSchema = new Schema({
    question:{type:String},
    answer:{type:String}
  });

// Internship Schema
const ApplicationSchema = new Schema({
    applicationId: { type: String, required: true, unique: true },
    internshipId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    status: {type: String, default: "on_review"},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    degree: { type: String, required: true },
    branch: { type: String, required: true },
    cgpa: { type: Number, min: 0, default: 0 },
    graduationyear:{ type: Number},
    yearofStudy: { type: Number, min: 0, default: 0 },
    qnas: {type:[qnaSchema]},
    dateApplied: { type: Date, required: true, default: Date.now() },
    dateofAction: { type: Date, required: true, default: Date.now() },
})

// Internship model
const Application = model("application", ApplicationSchema)

module.exports = Application