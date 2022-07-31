const {Schema, model} = require("../db/connection") // import Schema & model


// User Schema
const UserSchema = new Schema({
    userId:{type: String, unique: true, requried: true},
    email:{type: String, unique: true, required: true},
    password: {type: String, required: true},
    firstName:{type: String,required: true},
    lastName:{type: String,required: true},
    department:{type: String,required: true},
    areasOfInterest:[String],
    address:{type: String, default: null},
    linkedin:{type:String, default: null},
    github:{type:String, default: null},
    otherLinks:{type:String, default: null},
    updated: { type: Date, default: Date.now }
})

// // User model
// const User = model("User", UserSchema)


const User = model("User", UserSchema)


module.exports = User