import mongoose from "mongoose";
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
