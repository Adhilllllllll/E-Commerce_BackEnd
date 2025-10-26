 const express =require("express");
 const {authenticateUser}=require("../middlewares/auth.middleware");
 const cartController = require("../controllers/cartController");
 const Cart =require("../models/cartModel");


 const router =express.Router();


 router.route("/").get(authenticateUser,cartController.getCartItems);

 router
  .route("/addToCart/:productId")
  .post(authenticateUser,cartController.addToCart);

router
  .route("/updateCartItem/:productId")
  .put(authenticateUser,cartController.updateCartItem)


router
  .route("/deleteFromCart/:productId")
  .delete(authenticateUser,cartController.deleteFromCart)


module.exports =router;