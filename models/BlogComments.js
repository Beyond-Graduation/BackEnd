const {Schema, model} = require("../db/connection") // import Schema & model

// Blog Schema
const BlogCommentsSchema = new Schema({
    blogId:{type: String, required: true},
    commentId:{type: String, required: true, unique: true},
    userId:{type: String, required: true},
    firstName:{type: String,required: true},
    lastName:{type: String,required: true},
    content:{type: String,required: true},
    dateUploaded:{type:Date, required: true, default: Date.now()},
    likes:{type:Number,min: 0, default:0},
    parent:{type:String,default:null},
    userType:{type:String},
    childCommentCount:{type:Number,default:0,min:0}
})

// Blog model
const BlogComments = model("BlogComments", BlogCommentsSchema)

module.exports = BlogComments