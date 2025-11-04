 
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

// 🔹 Helper: sign JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// 🔹 Sign Up
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, profileImage } = req.body;
    const newUser = await User.create({ name, email, password, role, profileImage });

    res.status(201).json({ status: "success", data: { newUser } });
  } catch (err) {
    res.status(400).json({ status: "failed", message: err.message });
  }
};

// 🔹 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ status: "failed", message: "No such user found" });
    if (user.isBlocked) return res.status(403).json({ status: "failed", message: "Your account is blocked" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ status: "failed", message: "Invalid login credentials" });

    const token = signToken(user._id);

    // Set cookie
    const isProd = process.env.NODE_ENV === "development";

   res.cookie("token", token, {
  httpOnly: true,
  secure: isProd,                   // true in prod (HTTPS), false in local dev
  sameSite: isProd ? "none" : "lax", // "none" in prod, "lax" for localhost
  path: "/",                        // ensure cookie is valid for all routes
})

    // Normalize role
    const userRole = user.role === "user" ? "customer" : user.role;

    res.status(200).json({
      status: "success",
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: userRole, profileImage: user.profileImage || null },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// 🔹 Logout
exports.logout = async (req, res) => {
  try {
  const isProd = process.env.NODE_ENV === "development";

res.clearCookie("token", {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  expires: new Date(0),
});


    res.status(200).json({ status: "success", message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// 🔹 Get Current Logged-in User
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ status: "failed", message: "Not logged in" });

    res.status(200).json({
      status: "success",
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profileImage: req.user.profileImage || null,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// 🔹 Forgot Password
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Please provide an email");

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: "failed", message: "No such user found" });

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Reset your password via PATCH request to: ${resetUrl}`;

    await sendEmail({ email: user.email, subject: "Password Reset Token", message });

    res.status(200).json({ status: "success", message: "Reset token sent to email" });
  } catch (err) {
    res.status(403).json({ status: "failed", message: err.message });
  }
};

// 🔹 Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ status: "failed", message: "Token is invalid or expired" });

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.status(200).json({ status: "success", token, message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ status: "failed", message: err.message });
  }
};
