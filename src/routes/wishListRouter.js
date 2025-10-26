const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishListController");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.route("/").get(authenticateUser, wishlistController.getAllWishlistitems);

router
  .route("/addToWishlist/:productId")
  .post(authenticateUser, wishlistController.addToWishlist);

router
  .route("/deleteWishList/:productId")
  .delete(authenticateUser, wishlistController.removeFromWishlist);

module.exports = router;