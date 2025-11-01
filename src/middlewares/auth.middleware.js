const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//User AuthenticateUser MiddleWare

async function authenticateUser(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Please login first");
    console.log(token);
    

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded);
    
    const user = await User.findById(decoded.id);

    if (!user) throw new Error("User not found. Please login again");

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      status: "failed",
      message: err.message,
    });
  }
}

module.exports = { authenticateUser };
