const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

exports.getCartItems = async function (req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Not loggedIn ! pls login first",
      });
    }

    const carts = await Cart.find({ userId: user?.id }).populate("productId");

    res.status(200).json({
      status: "success",
      data: carts,
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

//  update cart

exports.updateCartItem = async function (req, res) {
  try {
    const { productId } = req.params;
    const loggedInUser = req.user;

    const { quantity } = req.body;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    const cartItem = await Cart.findOne({
      userId: loggedInUser.id,
      productId,
    });

    if (!cartItem) {
      return res.status(200).json({
        status: "failed",
        message: "invalid productId",
      });
    }

    cartItem.quantity = Number(quantity);

    // Prevent going below 1
    if (cartItem.quantity < 1) {
      cartItem.quantity = 1;
    }

    await cartItem.save();
    await cartItem.populate("productId");

    res.status(201).json({
      status: "success",
      message: "Cart quantity upated succesfully",
      data: cartItem,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Remove From The Cart

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
        message: "cart item not fond ",
      });
    }

    const data = await Cart.find({ userId: loggedInUser.id });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
