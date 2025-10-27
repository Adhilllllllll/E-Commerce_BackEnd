const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// ****************************
// Create Order
// ****************************
exports.createOrder = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Check login
    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    const { address } = req.body;

    // Validate shipping address
    if (!address) {
      return res.status(400).json({
        status: "failed",
        message: "Shipping address is required",
      });
    }

    // Fetch cart items
    const cartItems = await Cart.find({
      userId: loggedInUser._id,
    })
    .populate("productId");

    if (cartItems.length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Cart is empty",
      });
    }

    // Map products, check stock, and calculate total price
    const products = [];
    let totalPrice = 0;

    for (const item of cartItems) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res.status(404).json({
          status: "failed",
          message: "Product not found",
        });
      }

      if (product.count < item.quantity) {
        return res.status(400).json({
          status: "failed",
          message: `${product.name} is out of stock`,
        });
      }

      // Deduct stock
      product.count -= item.quantity;
      await product.save();

      products.push({
        productId: product._id,
        quantity: item.quantity,
      });

      totalPrice += product.price * item.quantity;
    }

    // Create new order
    const newOrder = await Order.create({
      userId: loggedInUser._id,
      products,
      totalPrice,
      address,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // Clear cart
    await Cart.deleteMany({
      userId: loggedInUser._id,
    });

    res.status(201).json({
      status: "success",
      data: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// ****************************
// Get All Orders
// ****************************
exports.getAllOrders = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    const allOrders = await Order.find({
      userId: loggedInUser._id,
    })
    .populate("products.productId", "name price image count");

    res.status(200).json({
      status: "success",
      allOrders,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// ****************************
// Delete Order
// ****************************
exports.deleteOrder = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid orderId",
      });
    }

    const isExist = await Order.findOne({
      userId: loggedInUser._id,
      _id: orderId,
    });

    if (!isExist) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    await Order.deleteOne({ _id: orderId });

    res.status(200).json({
      status: "success",
      message: "Order deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// ****************************
// Simple Pay Order
// ****************************
exports.payOrder = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid orderId",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: loggedInUser._id,
    });

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        status: "failed",
        message: "Order is already paid",
      });
    }

    order.paymentStatus = "paid";
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Payment successful",
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
