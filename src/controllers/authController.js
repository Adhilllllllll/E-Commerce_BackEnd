const { path } = require("../app");
const User = require("../models/userModel");
const jwt=require("jsonwebtoken")

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