const express =require("express");
const router =express.Router();
const authController =require("../controllers/authController");
const {authenticateUser} =require("../middlewares/auth.middleware");
const profileController =require("../controllers/profileController");
const { restrictTo} =require("../middlewares/role.middelware")
const adminController = require("../controllers/adminController")
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



// ADMIN USER MANAGEMENT ROUTES
router.route("/")
  .get(authenticateUser, restrictTo("admin"), adminController.getAllUsers);

router.route("/:id/block")
  .patch(authenticateUser, restrictTo("admin"), adminController.blockUser);

router.route("/:id")
  .delete(authenticateUser, restrictTo("admin"), adminController.deleteUser);

router.get("/test", (req, res) => res.send("User router working "));


module.exports =router;
