require("dotenv").config(); // to use variables in .env file
const express = require("express")
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan"); // FOR LOGIN requests

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");



app.use(express.json());
app.use(cors());
app.use(morgan("dev"));


app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Blog_DB",
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


app.get("/", (req, res) => res.send("Welcome to the Simple Blog API"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));