const { Schema, model } = require("../db/connection") // import Schema & model
const User = require('../models/User');
// console.log(User)

var start = new Date();
var ymax = start.getFullYear();

// Alumni Schema

const higherStudiesSchema = new Schema({
    degree: { type: String },
    university: { type: String },
    yearGraduation: { type: Number, min: 1943, max: ymax },
    subject: { type: String }
})


const workExperienceSchema = new Schema({
    from: { type: Number, min: 1943, max: ymax },
    to: { type: Number, min: 1943, max: ymax, default: null },
    currentlyWorkingHere: { type: Boolean, default: 'true' },
    company: { type: String },
    role: { type: String },
    Contribution: { type: String }
});

const publicationsSchema = new Schema({
    domain: { type: String },
    title: { type: String },
    link: { type: String },
    description: { type: String }
})


const AlumniSchema = new Schema({
    degree: { type: String, required: true },
    admissionId: { type: Number, min: 0, unique: true, required: true },
    yearGraduation: { type: Number, min: 1943, max: ymax, required: true },
    higherStudies: {
        type: [higherStudiesSchema],
        default: null

    },
    workExperience: {
        type: [workExperienceSchema],
        required: true
    },
    publications: {
        type: [publicationsSchema],
        default: null
    },
    profileCompletionPerc: { type: Number, min: 0.0, max: 100.0, default: 10.0, required: true },
    vectorEmbedding: [Number]
});


// Alumni model
const Alumni = User.discriminator("Alumni", AlumniSchema)


module.exports = Alumni