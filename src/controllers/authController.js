const { path } = require("path");
const User = require("../models/userModel");
const jwt=require("jsonwebtoken");
const sendEmail =require("../utils/email")
const crypto = require("crypto");

//Sign Up

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, profileImage } = req.body;
    const hashedPassword = await User.hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage,
    });

    res.status(201).json({
      status: "success",
      data: { newUser },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};



 

// LOGIN 
exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    //  finding the user with email
    const user = await User.findOne({ email: email });
    if (!user) throw new Error(`No such user found.`);

    //comparing the password
    const isPasswordValid = await user.comparePassword(password);

    //GENERATING A TOKEN
    const TOKEN = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    if (isPasswordValid) {
      //-- SENDING THE TOKEN AND WRAPING IN COOKIE
      res.cookie("token", TOKEN, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",  // allows cors with credentila
        path:"/",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      if (user.role === "admin") {
        return res.status(200).json({
          status: "success",
          data: user,
        });
      }

      res.status(200).json({
        status: "success",
        data: "Succesfully logged in",
        user: {
          name: user?.name,
          email: user?.email,
        },
      });
    } else throw new Error("Invalid Login credentials");
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err.message,
      stack: err.stack,
    });
  }
};




// LOGOUT

exports.logout =async function (req,res){
  try{
    //clearing auth cookie
    res.clearCookie("token",{
      httpOnly:true,
      secure:false,
      sameSite:"lax",
      path:"/"
    });
    return res.status(200).json({
      status:"success",
      message:"logged out successfully",
    });
  }catch(err){
    res.status(500).json({
      status:"failed",
      message:err.message,
    })
  }
}





//forget password

exports.forgetPassword =async function (req,res){
  try{
    const {email} =req.body;
    if(!email) throw new Error(`please provide a email`);
    const user =await User.findOne({email});

    if(!user){
      return res.status(404).json({
        status: "failed",
        message: "No such user found",
      });
    }

   const resetPasswordToken =user.createResetPasswordToken();
   await user.save({ validateBeforeSave: false });

   const resetUrl =`${req.protocol}://${req.get(
     "host"
  )}/api/v1/users/resetPassword/${resetPasswordToken}`;

 const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}\n\nIf you didn't request a password reset, please ignore this email.`;



 await sendEmail({
  email:user.email,
  subject:"your passwrod reset token (valid for 10 mins)",
  message,
 });

 console.log(`RESET PASSWORD LINK: http://localhost:7000/api/v1/users/resetPassword/${resetPasswordToken}`);
 

 res.status(200).json({
  status:"success",
  message:"token sent successfully",
 });

  }catch(err){
    res.status(403).json({
      status:"failed",
      message:err.message
    })

  }
}



//  Reset Password

exports.resetPassword = async function (req, res) {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "token is invalid or has expired",
      });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    //After editing the password the jwt token is issued  again to the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "90d",
    });

    res.status(200).json({
      status: "success",
      token,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};


