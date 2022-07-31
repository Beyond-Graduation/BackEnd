const {Schema, model} = require("../db/connection") // import Schema & model
var extend = require('mongoose-schema-extend');
const User = require('../models/User');
// console.log(User)

var start = new Date();
var ymax = start.getFullYear();

const higherSecondarySchema = new Schema({
    board:{type:String},
    cgpa:{type:Number, min: 1, max: 100, required:true}
  });


// Alumni Schema
const StudentSchema = new Schema({
    degree:{type: String,required: true},
    higherSecondary:{type:higherSecondarySchema,required:true},
    yearOfJoining:{type:Number, min: 1943, max: ymax, required:true},
    expectedGraduationYear:{type:Number, min: 1943, required:true},
    cgpa:{type:Number, min:0.0, max:10.0 , required:true}});

// Alumni model
// const User = model("User", UserSchema)
const Student = User.discriminator("Student", StudentSchema)
// const Student = model("Student", StudentSchema)

module.exports = Student











// StudentSchema.add(UserSchema).add({
//     cgpa:{type:Number, min:1.0, max:10.0 , required:true}
        
//     // userId:{type: String, unique: true, requried: true},
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