const mongoose = require("mongoose");
const { Comment, CommentSchema } = require("./Comment");

const BlogSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please enter a title"],
  },
  content: {
    type: String,
    required: [true, "Please enter a content"],
  },
  commenters: [CommentSchema],
  likes: {type: Number, default: 0},
  dislikes: {type: Number, default: 0},
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  unpdatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Blog = mongoose.model("blog", BlogSchema);
module.exports = Blog;
