// const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");

// //User AuthenticateUser MiddleWare

// async function authenticateUser(req, res, next) {
//   try {
//     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
//     if (!token) throw new Error("Please login first");
//     console.log(token);
    

//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     console.log(decoded);
    
//     const user = await User.findById(decoded.id);

//     if (!user) throw new Error("User not found. Please login again");

//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// }

// module.exports = { authenticateUser };



const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// 🔹 Authenticate User Middleware
async function authenticateUser(req, res, next) {
  try {
    // 1️⃣ Get token from cookie or Authorization header
    let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ status: "failed", message: "Please login first" });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ status: "failed", message: "Invalid or expired token" });
    }

    // 3️⃣ Find user in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: "failed", message: "User not found. Please login again" });
    }

    // 4️⃣ Normalize role
    if (user.role === "user") user.role = "customer";

    // 5️⃣ Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ status: "failed", message: "Internal server error" });
  }
}

module.exports = { authenticateUser };
