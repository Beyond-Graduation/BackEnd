const { Schema, model } = require("../db/connection") // import Schema & model


const blogClickSchema = new Schema({
    blogId: { type: String },
    count: { type: Number, min: 0, default: 1 },
    lastClick: { type: Date, default: Date.now }
});

// User Schema
const UserSchema = new Schema({
    userId: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Transgender", "Non-binary/non-conforming", "Prefer not to say"]

    },
    profilePicPath: { type: String, default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png" },
    department: { type: String, required: true },
    areasOfInterest: [String],
    address: { type: String, default: null },
    phone: { type: String, required: true },
    linkedin: { type: String, default: null },
    github: { type: String, default: null },
    otherLinks: { type: String, default: null },
    bookmarkBlog: [String],
    resume: { type: String, default: "" },
    updated: { type: Date, default: Date.now },
    dateJoined: { type: Date, default: Date.now },
    likedBlogs: [String],
    passwordResetToken: { type: String, default: "000000000000000", length: 15 },
    blogClicks: { type: [blogClickSchema] }
})

// // User model
// const User = model("User", UserSchema)


const User = model("User", UserSchema)


module.exports = User