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



 