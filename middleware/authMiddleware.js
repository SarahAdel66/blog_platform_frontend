//to protect routes because no one can access the website without having valid token

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {

    let token;

    //EX token in header => Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

        try {
            token = req.headers.authorization.split(" ")[1]; // => eyJhbGciOiJIUzI1NiIsInR5

            // decoded token and verify it is valid or not
            const decoded = jwt.verify(token, process.env.JWT_SECRET);


            // info from decoded => {
            //   "id": "65f1234abcde67890fghij",
            //   "email": "user@example.com",
            //   "iat": 1710000000,
            //   "exp": 1710600000
            //}
            
            // save info from decoded to use it easly (without password)
            req.user = await User.findById(decoded.id).select("-password");
            next();

        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

module.exports = { protect };
