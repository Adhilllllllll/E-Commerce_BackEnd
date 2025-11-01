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
   console.log("Password before hash:", password);
console.log("Hashed password:", hashedPassword);
    const newUser = await User.create({
  name,
  email,
  password,   
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

    console.log("Entered password:", password);
console.log("Stored password in DB:", user.password);

    //comparing the password
    const isPasswordValid = await user.comparePassword(password);

    //GENERATING A TOKEN
    const TOKEN = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    if (isPasswordValid) {
      //-- SENDING THE TOKEN AND WRAPING IN COOKIE
      res.cookie("token", TOKEN, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // false for localhost
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(0),
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

      console.log("Token from URL (plain):", req.params.token);
console.log("Hashed token (used to query DB):", hashedToken);

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
      expiresIn: process.env.JWT_EXPIRES_IN,
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


// Get current logged-in user
exports.getCurrentUser = async (req, res) => {
  try {
    // The authenticate middleware attaches the user to req.user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ status: "failed", message: "Not logged in" });
    }

    res.status(200).json({
      status: "success",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};


