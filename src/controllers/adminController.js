 



const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

// ******************************************************************//
// -----------------------PRODUCT SECTION-----------------------//
// ******************************************************************//

// Get All Products (with pagination, filtering, sorting)
exports.getAllProducts = async function (req, res) {
  try {
    const { category, page = 1, limit = 10, sort } = req.query;

    const filter = category ? { category } : {};
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const sortFilter = {};
    if (sort === "higher") sortFilter.price = 1;
    if (sort === "lower") sortFilter.price = -1;

    const totalProducts = await Product.countDocuments(filter);

    const allProducts = await Product.find(filter)
      .sort(sortFilter)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      status: "success",
      totalProducts,
      results: allProducts.length,
      data: allProducts,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Add Product (Create)
exports.addProduct = async function (req, res) {
  try {
    const { name, description, price, category, brand, rating, count } = req.body;

    // Single image upload handling
    let image = "";
    if (req.file) {
      image = req.file.path;
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      rating,
      count,
      image, // single string
    });

    res.status(201).json({
      status: "success",
      data: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Edit Product (Update)
exports.editProduct = async function (req, res) {
  try {
    const { productId } = req.params;
    const { name, description, price, category, brand, count, rating, image } = req.body;

    if (!productId) throw new Error("No product ID provided.");

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (count !== undefined) updateData.count = count;
    if (rating !== undefined) updateData.rating = rating;

    // Image update
    if (req.file) {
      updateData.image = req.file.path; // new uploaded file
    } else if (image) {
      // If frontend sent image URL, use it
      updateData.image = Array.isArray(image) ? image[0] : image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        status: "failed",
        message: "No such product exists.",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Delete Product
exports.deleteProduct = async function (req, res) {
  try {
    const { productId } = req.params;
    if (!productId) throw new Error("Please provide a valid product ID.");

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({
        status: "failed",
        message: "No such product exists.",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// View Single Product
exports.viewProduct = async function (req, res) {
  try {
    const { productId } = req.params;
    if (!productId) throw new Error("Please provide a valid product ID.");

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "failed",
        message: "Product not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// ----------------------- ORDER SECTION ----------------------- //

exports.getAllOrder = async function (req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allOrders = await Order.find({})
      .skip(skip)
      .limit(limit)
      .populate("products.productId", "name price image")
      .populate("userId", "name email");

    const totalOrders = await Order.countDocuments();

    const revenue = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue = revenue[0]?.totalRevenue || 0;

    res.status(200).json({
      status: "success",
      totalOrders,
      totalRevenue,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      data: allOrders,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
      stack: err.stack,
    });
  }
};

// View All Orders
exports.viewOrder = async function (req, res) {
  try {
    const { orderId } = req.params;
    if (!orderId) throw new Error("Order ID required");

    const order = await Order.findById(orderId)
      .populate("products.productId", "name price image")
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

exports.changeOrderStatus = async function (req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        status: "failed",
        message: "Order ID and status are required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// ----------------------- USER SECTION ----------------------- //

exports.getAllUsers = async function (req, res) {
  try {
    const { isBlocked, page, limit } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    let filter = { role: "user" };
    if (isBlocked) filter.isBlocked = isBlocked === "true";

    const allUsers = await User.find(filter).skip(skip).limit(limitNumber);
    res.status(200).json({ status: "success", data: allUsers });
  } catch (err) {
    res.status(400).json({ status: "failed", message: err.message });
  }
};

exports.blockUser = async function (req, res) {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser)
      return res.status(401).json({ status: "failed", message: "Login required" });
    if (loggedInUser.role !== "admin")
      return res.status(403).json({ status: "failed", message: "Not authorized" });

    const { id } = req.params;
    if (!id) throw new Error("No user ID provided");

    const user = await User.findById(id);
    if (!user) throw new Error("No user found with that ID");

    user.isBlocked = !user.isBlocked;
    await user.save();

    const safeUser = await User.findById(id).select("-password");

    res.status(200).json({
      status: "success",
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      data: safeUser,
    });
  } catch (err) {
    res.status(400).json({ status: "failed", message: err.message });
  }
};

exports.deleteUser = async function (req, res) {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser)
      return res.status(401).json({ status: "failed", message: "Login required" });
    if (loggedInUser.role !== "admin")
      return res.status(403).json({ status: "failed", message: "Not authorized" });

    const { id } = req.params;
    if (!id) throw new Error("No user ID provided");

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).json({ status: "failed", message: "User not found" });

    res.status(200).json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: "failed", message: err.message });
  }
};
