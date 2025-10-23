const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { restrictTo } = require("../middlewares/role.middleware");
const productController = require("../controllers/productController");
const { authenticateUser } = require("../middlewares/auth.middleware");
const adminController = require("../controllers/adminController");

router
  .route("/users")
  .get(authenticateUser, restrictTo("admin"), adminController.getAllUsers);

router.get(
  "/orders",
  authenticateUser,
  restrictTo("admin"),
  adminController.getAllOrders
);

router
  .route("/products")
  .get(authenticateUser, restrictTo("admin"), adminController.getAllProducts);

router.route("/forgetPassword").post(authController.forgetPassword);

router.route("/resetPassword/:token").patch(authController.resetPassword);

router
  .route("/users/:id")
  .put(authenticateUser, restrictTo("admin"), adminController.blockUser);

// Add Product

console.log("Add product Route Reached");

router
  .route("/addProduct")
  .post(
    authenticateUser,
    restrictTo("admin"),
    upload.single("image"),
    adminController.addProduct
  );

router
  .route("/viewProduct/:id")
  .get(authenticateUser, restrictTo("admin"), productController.getProduct);

 
router
  .route("/deleteProduct/:productId")
  .delete(authenticateUser, restrictTo("admin"), adminController.deleteProduct);

router
  .route("/editProduct/:productId")
  .put(authenticateUser, restrictTo("admin"), adminController.editProduct);

router
  .route("/viewOrder/:orderId")
  .get(authenticateUser, restrictTo("admin"), adminController.viewOrder);

router

  .route("/changeOrderStatus/:orderId")
  .patch(
    authenticateUser,
    restrictTo("admin"),
    adminController.changeOrderStatus
  );

module.exports = router;
 