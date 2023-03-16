const {Schema, model} = require("../db/connection") // import Schema & model
var extend = require('mongoose-schema-extend');
const User = require('../models/User');
// console.log(User)

var start = new Date();
var ymax = start.getFullYear();



// Alumni Schema
const AdminSchema = new Schema({
    designation:{type: String,required: true},
    staffId:{type: String, unique: true, required: true}});

// Alumni model
// const User = model("User", UserSchema)
const Admin = User.discriminator("Admin", AdminSchema)
// const Student = model("Student", StudentSchema)

module.exports = Admin











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