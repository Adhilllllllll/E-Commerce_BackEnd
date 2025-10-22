const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticateUser } = require("../middlewares/auth.middleware");

router.route("/").get(authenticateUser, productController.getAllProducts);

router.route("/:id").get(productController.getProduct);

 module.exports = router;
