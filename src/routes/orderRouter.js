const express =require("express");
const router =express.Router();
const orderController =require("../controllers/orderController");
const {authenticateUser}=require("../middlewares/auth.middleware");


router
.route("/")
   .get(authenticateUser,orderController.getAllOrders);


router
   .route("/create")
   .post(authenticateUser,orderController.createOrder);

router
   .route("/delete/:orderId")
   .delete(authenticateUser,orderController.deleteOrder);


router
   .route("/pay/:orderId")
   .patch(authenticateUser,orderController.payOrder)

module.exports =router;