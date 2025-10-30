const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { authenticateUser } = require("../middlewares/auth.middleware");
 const {restrictTo} =require("../middlewares/role.middelware")
const { upload } = require("../middlewares/cloudinary.middleware");

// -------------------- PRODUCT ROUTES -------------------- //

// Add a new product
router.post(
  "/addProduct",
  authenticateUser,
  restrictTo("admin"),
  upload.single("image"),
  adminController.addProduct
);

// View a single product by ID (admin)
router.get(
  "/viewProduct/:productId",
  authenticateUser,
  restrictTo("admin"),
  adminController.viewProduct
);

// Update a product by ID
router.put(
  "/editProduct/:productId",
  authenticateUser,
  restrictTo("admin"),
  upload.single("image"), // optional if admin wants to update image
  adminController.editProduct
);

// Delete a product by ID
router.delete(
  "/deleteProduct/:productId",
  authenticateUser,
  restrictTo("admin"),
  adminController.deleteProduct
);

router.get("/allProducts",
  authenticateUser,
  restrictTo("admin"),
  adminController.getAllProducts
)


///////// ORDER ROUTES

router
  .route("/viewOrder/:orderId")
  .get(authenticateUser, restrictTo("admin"),
   adminController.viewOrder);

router
  .route("/changeOrderStatus/:orderId")
  .put(
    authenticateUser,
    restrictTo("admin"),
    adminController.changeOrderStatus
  );


module.exports = router;
