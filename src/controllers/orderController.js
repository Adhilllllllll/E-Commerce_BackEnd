 
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// ****************************
// Create Order
// ****************************
// ****************************
// Create a new order after validating user, cart, and stock
exports.createOrder = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // 🧠 Safety check: user must be logged in
    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    const { address, paymentMethod } = req.body;

    // 🏠 Validate shipping address
    if (!address || address.trim().length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Shipping address is required",
      });
    }

    // 🛒 Fetch all cart items for this user
    const cartItems = await Cart.find({ userId: loggedInUser._id }).populate("productId");

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Your cart is empty. Please add products to proceed.",
      });
    }

    // 🧮 Build valid product list & compute total safely
    const products = [];
    let totalPrice = 0;

    for (const item of cartItems) {
      // Skip invalid or missing products
      if (!item.productId || !item.productId._id) {
        console.warn("⚠️ Invalid cart item found:", item._id);
        await Cart.deleteOne({ _id: item._id });
        continue;
      }

      const product = await Product.findById(item.productId._id);
      if (!product) {
        console.warn("⚠️ Product not found in DB:", item.productId._id);
        await Cart.deleteOne({ _id: item._id });
        continue;
      }

      // 🧾 Check stock
      if (product.count < item.quantity) {
        return res.status(400).json({
          status: "failed",
          message: `${product.name} is out of stock`,
        });
      }

      // Update stock
      product.count -= item.quantity;
      await product.save();

      // Add to order summary
      products.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;
    }

    // 🧩 Stop if all products were invalid
    if (products.length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "No valid products found in your cart. Please refresh and try again.",
      });
    }

    // 💳 Create the order
    const newOrder = await Order.create({
      userId: loggedInUser._id,
      products,
      totalPrice,
      address,
      paymentMethod: paymentMethod || "cod",
      status: paymentMethod === "cod" ? "pending" : "paid",
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "paid",
      createdAt: new Date(),
    });

    // 🧹 Clear user's cart after successful order
    await Cart.deleteMany({ userId: loggedInUser._id });

    // ✅ Respond success
    res.status(201).json({
      status: "success",
      message: "Order placed successfully!",
      data: newOrder,
    });

  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({
      status: "failed",
      message: err.message || "An error occurred while creating the order.",
    });
  }
};

// ****************************
// Get All Orders (user or admin)
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

    let orders;

    
    if (loggedInUser.role === "admin") {
      orders = await Order.find()
        .populate("products.productId", "name price image count")
        .populate("userId", "name email")
        .sort({ createdAt: -1 }); // newest first
    } else {
      
      orders = await Order.find({ userId: loggedInUser._id })
        .populate("products.productId", "name price image count")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      status: "success",
      allOrders: orders,
    });
  } catch (err) {
    console.error("❌ Fetch orders error:", err);
    res.status(500).json({
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
    console.error("❌ Delete order error:", err);
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
    console.error("Pay order error:", err);
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};