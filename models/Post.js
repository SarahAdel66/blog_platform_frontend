const mongoose = require("mongoose");


const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, 
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now } 
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [CommentSchema]
});


module.exports = mongoose.model("posts", PostSchema);