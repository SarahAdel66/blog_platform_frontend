const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

//middleware to make protect before create post without login
const { protect } = require("../middleware/authMiddleware");

// Create Post (must logged in before create post)
router.post("/", protect, async (req, res) => {

  try {
    const post = new Post({ ...req.body, author: req.user._id , comments :[]});
    await post.save();
    res.status(201).json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Posts
router.get("/", async (req, res) => {

  try {
    const posts = await Post.find().populate("author", "name email").populate("comments.user", "name email");

    // convert date to string
    res.json(posts.map((post) => ({
      ...post._doc,
      createdAt: post.createdAt.toISOString(), 
    })));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get posts of one user (who is logged in )
router.get("/user/:userId", async (req, res) => {

  try {
    const posts = await Post.find({ author: req.params.userId });
    res.json(posts);

  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Get Post by ID
router.get("/:id", async (req, res) => {

  try {
    const post = await Post.findById(req.params.id).populate("author", "name email").populate("comments.user", "name email");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add comment to post
router.post("/:postId/comments", protect, async (req, res) => {
  try {
    const { text } = req.body; 
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      text,
      user: { _id: req.user._id, name: req.user.name },
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


//update post (must logged in before update post)
router.put("/:id", protect, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // compare id of user(author) with id of user that has valid token
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this post" });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete Post (must logged in before delete post)
router.delete("/:id", protect, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // comare id of user(author) with id of user that has valid token
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
