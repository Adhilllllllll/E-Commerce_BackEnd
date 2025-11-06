 


const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateUser } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/role.middelware");
const { upload } = require("../middlewares/cloudinary.middleware");

// Apply authentication & admin check to all routes
router.use(authenticateUser, restrictTo("admin"));

// -------------------- PRODUCT ROUTES -------------------- //
router.post("/addProduct", upload.single("image"), adminController.addProduct);
router.get("/viewProduct/:productId", adminController.viewProduct);
router.put("/editProduct/:productId", upload.single("image"), adminController.editProduct);
router.delete("/deleteProduct/:productId", adminController.deleteProduct);
router.get("/allProducts", adminController.getAllProducts);

// -------------------- ORDER ROUTES -------------------- //
router.get("/allOrders", adminController.getAllOrder); // consider renaming to getAllOrders
router.get("/viewOrder/:orderId", adminController.viewOrder);
router.put("/changeOrderStatus/:orderId", adminController.changeOrderStatus);
 router.get("/testPopulate", async (req, res) => {
  const Order = require("../models/orderModel");
  const result = await Order.findOne().populate("userId", "name email");
  res.json(result);
});



module.exports = router;



