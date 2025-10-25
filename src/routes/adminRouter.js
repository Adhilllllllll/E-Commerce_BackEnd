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
  adminController.createproduct
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
  adminController.updateproduct
);

// Delete a product by ID
router.delete(
  "/deleteProduct/:productId",
  authenticateUser,
  restrictTo("admin"),
  adminController.deleteProduct
);

module.exports = router;
