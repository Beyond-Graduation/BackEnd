const { Schema, model } = require("../db/connection") // import Schema & model
var extend = require('mongoose-schema-extend');
const User = require('../models/User');
// console.log(User)

var start = new Date();
var ymax = start.getFullYear();

const higherSecondarySchema = new Schema({
    board: { type: String },
    cgpa: { type: Number, min: 1, max: 100, required: true }
});

const internshipSchema = new Schema({
    from: { type: Number, min: 1943, max: ymax },
    to: { type: Number, min: 1943, max: ymax },
    company: { type: String },
    role: { type: String },
    contribution: { type: String }
});


const projectSchema = new Schema({
    from: { type: Number, min: 1900, max: ymax },
    to: { type: Number, min: 1900, max: ymax },
    title: { type: String },
    domain: { type: String },
    role: { type: String },
    link: { type: String },
    description: { type: String }
});

// Student Schema
const StudentSchema = new Schema({
    degree: { type: String, required: true },
    higherSecondary: { type: higherSecondarySchema, required: true },
    admissionId: { type: Number, min: 0, unique: true, required: true },
    yearOfJoining: { type: Number, min: 1943, max: ymax, required: true },
    expectedGraduationYear: { type: Number, min: 1943, required: true },
    cgpa: { type: Number, min: 0.0, max: 10.0 },
    favAlumId: [String],
    internships: { type: [internshipSchema] },
    projects: { type: [projectSchema] },
    profileCompletionPerc: { type: Number, min: 0.0, max: 100.0, default: 10.0, required: true },
    vectorEmbedding: [Number]
});

// const User = model("User", UserSchema)
const Student = User.discriminator("Student", StudentSchema)
    // const Student = model("Student", StudentSchema)

module.exports = Student











// StudentSchema.add(UserSchema).add({
//     cgpa:{type:Number, min:1.0, max:10.0 , required:true}

//     // userId:{type: String, unique: true, required: true},
//     // username: {type: String, unique: true, required: true},
//     // email:{type: String, unique: true, required: true},
//     // password: {type: String, unique: true, required: true},
//     // name:{type: String,required: true},
//     // areasOfInterest:[String],
//     // address:{type: String},
//     // zip:{type:Number},
//     // linkedin:{type:String},
//     // github:{type:String},
//     // otherLinks:{type:String}
// })