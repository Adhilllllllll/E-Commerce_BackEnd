const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishListModel");

//Get All wishList Items

exports.getAllWishlistitems = async function (req, res) {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    const wishlistItems = await Wishlist.find({
      userId: loggedInUser._id,
    }).populate("productId");

    res.status(200).json({
      status: "success",
      data: wishlistItems,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Add to wishlist
exports.addToWishlist = async function (req, res) {
  try {
    const loggedInUser = req.user;
    const { productId } = req.params;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    if (!productId) {
      return res.status(400).json({
        status: "failed",
        message: "Product is required to add to wishlist",
      });
    }

    const isAlreadyInWishlist = await Wishlist.findOne({
      userId: loggedInUser._id,
      productId,
    });

    if (isAlreadyInWishlist) {
      return res.status(200).json({
        status: "success",
        message: "This product is already in wishlist",
      });
    }

    const newWishlist = await Wishlist.create({
      userId: loggedInUser._id,
      productId,
    });

    await newWishlist.populate("productId");

    res.status(201).json({
      status: "success",
      data: newWishlist,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async function (req, res) {
  try {
    const loggedInUser = req.user;
    const { productId } = req.params;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "Please login first",
      });
    }

    await Wishlist.findOneAndDelete({
      userId: loggedInUser._id,
      productId,
    });

    const data = await Wishlist.find({ userId: loggedInUser._id }).populate(
      "productId"
    );

    res.status(200).json({
      status: "success",
      message: "Product removed from wishlist",
      data,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Get WishList Count

exports.getWishListCount = async function (req, res) {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({
        status: "failed",
        message: "please login first",
      });
    }

    const count = await Wishlist.countDocuments({ userId: loggedInUser.id });

    res.status(200).JSON({
      status: "success",
      count,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Move Item From WishList To Cart

exports.moveToCart = async function (req, res) {
  try {
    const { productId } = req.user;
    const loggedInUser = req.params;

    if (!loggedInUser) {
      return res.status(400).json({
        status: "failed",
        message: "please logIn first",
      });
    }

    const isAlreadyInCart = await Cart.findOne({
      productId,
      userId: loggedInUser.id,
    });

    // if not in there crete one

    if (!isAlreadyInCart) {
      await Cart.create({
        userId: loggedInUser.id,
        productId,
        quantity: 1,
      });
    }

    // remove product from wishlist after moving

    await Wishlist.findOneAndDelete({
      userId: loggedInUser.id,
      productId,
    });

    res.status(200).json({
      status: "success",
      message: "product moved to cart successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
