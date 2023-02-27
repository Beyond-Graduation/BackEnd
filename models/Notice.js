const { Schema, model } = require("../db/connection") // import Schema & model

// Notice Schema
const NoticeSchema = new Schema({
    noticeId: { type: String, required: true },
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachmentPath: { type: String, default: "" },
    noticeType: {
        type: String,
        required: true,
        enum: ["Alumni", "Public"],
        default: "Public"
    },
    dateUploaded: { type: Date, default: Date.now },

})

// Notice model
const Notice = model("Notice", NoticeSchema)

module.exports = Notice