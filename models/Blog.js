const {Schema, model} = require("../db/connection") // import Schema & model

// Blog Schema
const BlogSchema = new Schema({
    blogId:{type: String, required: true, unique: true},
    userId:{type: String, required: true},
    firstName:{type: String,required: true},
    lastName:{type: String,required: true},
    title:{type: String,required: true},
    domain:[{type: String,required: true}],
    content:{type: String,required: true},
    abstract:{type: String,required: true},
    dateUploaded:{type:Date, required: true, default: Date.now()},
    dateModified:{type:Date, required: true, default: Date.now()},
    imagePath:{type:String},
    likes:{type:Number,min: 0, default:0}
})

// Blog model
const Blog = model("Blog", BlogSchema)

module.exports = Blog