const {Schema, model} = require("../db/connection") // import Schema & model


// User Schema
const UserSchema = new Schema({
    userId:{type: String, unique: true, requried: true},
    email:{type: String, unique: true, required: true},
    password: {type: String, required: true},
    firstName:{type: String,required: true},
    lastName:{type: String,required: true},
    gender:{
        type: String,
        required:true,
        enum:["Male","Female","Transgender","Non-binary/non-conforming","Prefer not to say"]

    },
    profilePicPath:{type:String , default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"},
    department:{type: String,required: true},
    areasOfInterest:[String],
    address:{type: String, default: null},
    linkedin:{type:String, default: null},
    github:{type:String, default: null},
    otherLinks:{type:String, default: null},
    bookmarkBlog:[String],
    resume:{type: String,default:""},
    updated: { type: Date, default: Date.now }
})

// // User model
// const User = model("User", UserSchema)


const User = model("User", UserSchema)


module.exports = User