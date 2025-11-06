const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

exports.getCartItems = async function (req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Not loggedIn ! pls login first",
      });
    }

    const carts = await Cart.find({ userId: req.user.id }).populate(
      "productId"
    );

    // remove deleted products
    const filteredCarts = carts.filter((item) => item.productId !== null);

    res.status(200).json({
      status: "success",
      data: filteredCarts,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

////// Add To Cart

exports.addToCart = async function (req, res) {
  try {
    const loggedInUser = req.user;
    const { productId } = req.params;

    if (!loggedInUser) {
      return res.status(400).json({
        status: "failed",
        message: "logIn in first",
      });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        status: "failed",
        message: "Product not found",
      });
    }

    //checking the product if existing or not
    const isAlreadyInCart = await Cart.findOne({
      userId: loggedInUser.id,
      productId: productId,
    });
    if (isAlreadyInCart) {
      return res.status(200).json({
        status: "success",
        message: "this product is already in the cart",
      });
    }
    //else
    const newCartItem = await Cart.create({
      userId: loggedInUser.id,
      productId,
    });

    await newCartItem.populate("productId");

    res.status(200).json({
      status: "success",
      data: newCartItem,
    });
  } catch (err) {
    return res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Update Cart Item
exports.updateCartItem = async function (req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const loggedInUser = req.user;

    // Check if user is logged in
    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    // Add quantity validation here
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid quantity",
      });
    }

    // Find the cart item and populate product details
    const cartItem = await Cart.findOne({
      userId: loggedInUser.id,
      productId,
    }).populate("productId");

    // Check if cart item exists and the product still exists
    if (!cartItem || !cartItem.productId) {
      return res.status(404).json({
        status: "failed",
        message: "Cart item not found",
      });
    }

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid quantity",
      });
    }

    // Assign the validated quantity
    cartItem.quantity = qty;

    res.status(200).json({
      status: "success",
      message: "Cart quantity updated successfully",
      data: cartItem,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

////////////

exports.deleteFromCart = async function (req, res) {
  try {
    const { productId } = req.params;
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "fialed",
        message: "logIN first",
      });
    }

    const removeCart = await Cart.findOneAndDelete({
      userId: loggedInUser.id,
      productId,
    });

    if (!removeCart) {
      return res.status(404).json({
        status: "failed",
        message: "Item already removed or not found",
        data: [],
      });
    }

    const data = await Cart.find({ userId: loggedInUser.id }).populate(
      "productId"
    );
    const filterData = data.filter((item) => item.productId !== null);

    res.status(200).json({
      status: "success",
      data: filterData,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
