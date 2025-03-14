const express = require("express");
const User = require('../models/User')
const router = express.Router();
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware"); 

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id)
      });
      
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    
    res.status(500).json({ message: error.message });
  }
});


router.get("/", async (req, res) => {

  try {
    const users = await User.find();
    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get user`s info (who is login and has token)
router.get("/me", protect, async (req, res) => {

  try {

    // get user`s info without password
    const user = await User.findById(req.user.id).select("-password"); 
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
    
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
module.exports = router;