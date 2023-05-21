const { Schema, model } = require("../db/connection") // import Schema & model

const VectorSchema = new Schema({
    data: [Number],
    indices: [Number],
    indptr: [Number],
    shape: [Number]
})

// Blog Schema
const BlogSchema = new Schema({
    blogId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    title: { type: String, required: true },
    domain: [{ type: String, required: true }],
    content: { type: String, required: true },
    abstract: { type: String, required: true },
    dateUploaded: { type: Date, required: true, default: Date.now() },
    dateModified: { type: Date, required: true, default: Date.now() },
    imagePath: { type: String },
    likes: { type: Number, min: 0, default: 0 },
    clicks: { type: Number, min: 0, default: 0 },
    vector: { type: VectorSchema },
    vector_embedding: [Number],
    vectorEmbedding: [Number]
})

// Blog model
const Blog = model("Blog", BlogSchema)

module.exports = Blog