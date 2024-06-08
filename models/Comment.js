const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
    commenter: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: [true, "Please enter your comment"],
    }
})

const Comment = mongoose.model("comment", CommentSchema);
module.exports = {Comment, CommentSchema};