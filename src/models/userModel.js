 const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      maxLength: 12, 
      trim: true,
    },

    email: {
      type: String,
      required: [true, "A user must have a email"],
      unique: [true, "A user  with this email already exists"],
      lowerCase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "A user need a password"],
      trim: true,
      minLength: 6,
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not  a valid role",
      },
      default: "user",
    },

    passwordResetToken: String,
    passwordResetExpires: Date, 
    passwordChangedAt: Date,

    profileImage: {
      type: String,
      default: "https://avatar.iran.liara.run/public/5",
    },

    isBlocked: {
      type: Boolean,
      default : false,
    },
  },
  { timestamps: true }
);


// Static method for hashing password before saving
userSchema.statics.hashPassword = async function (userPassword) {
  return await bcrypt.hash(userPassword, 8);
};



// Instance method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



//Generate password reeset token 

userSchema.methods.createResetPasswordToken = function(){
  const resetToken =crypto.randomBytes(32).toString("hex");


  this.passwordResetToken =crypto
     .createHash("sha256")
     .update(resetToken)
     .digest("hex");


  this.passwordResetExpires =Date.now()+10 *60*1000; //10 minutes
  return resetToken;

};

//update  passwordChangedAt before saving
userSchema.pre("save",function(next){
  if(!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt =Date.now() - 1000;
  next();
})


const User = mongoose.model("User", userSchema);
module.exports = User;





// const crypto = require("crypto");
// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const sendEmail = require("../utility/sendEmail");

// // Forget Password
// exports.forgetPassword = async function (req, res) {
//   try {
//     const { email } = req.body;
//     if (!email) throw new Error("Please provide an email");

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         status: "failed",
//         message: "No such user found",
//       });
//     }

//     const resetPasswordToken = user.createResetPasswordToken();
//     await user.save({ validateBeforeSave: false });

//     const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetPasswordToken}`;

//     const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}\n\nIf you didn't request a password reset, please ignore this email.`;

//     await sendEmail({
//       email: user.email,
//       subject: "Your password reset token (valid for 10 mins)",
//       message,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Token sent successfully to your email",
//     });
//   } catch (err) {
//     if (user) {
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save({ validateBeforeSave: false });
//     }

//     res.status(500).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };

// // Reset Password
// exports.resetPassword = async function (req, res) {
//   try {
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const user = await User.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Token is invalid or has expired",
//       });
//     }

//     user.password = req.body.password;
//     user.passwordConfirm = req.body.passwordConfirm;
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;

//     await user.save({ validateBeforeSave: false });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "90d",
//     });

//     res.status(200).json({
//       status: "success",
//       token,
//       message: "Password updated successfully",
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };
