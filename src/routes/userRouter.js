const express =require("express");
const router =express.Router();
const authController =require("../controllers/authController");
const {authenticateUser} =require("../middlewares/auth.middleware");
const profileController =require("../controllers/profileController");

router
    .route("/profile")
    .get(authenticateUser,profileController.viewProfile);


router 
    .route("/forgetPassword")
    .post(authController.forgetPassword)

router
   .route("/resetPassword/:token")
   .patch(authController.resetPassword);

router 
   .route("/me")
   .get(authenticateUser,authController.getCurrentUser)


module.exports =router;
