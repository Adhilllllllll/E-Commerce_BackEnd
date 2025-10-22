const Product = require("../models/productModel");

// Get all products

exports.getAllProducts = async function (req, res) {
  try {
    const { category, page, limit } = req.query;
    const pageNumber = parseInt(page)||1;
    const limitNumber = parseInt(limit)||10;

    const filter = category ? { category } : {};
    const skip = (pageNumber - 1) * limitNumber;

    const allProducts = await Product.find(filter)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      status: "success",
      products: allProducts,
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Get a single product ID

exports.getProduct = async function (req, res) {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);
    console.log(product);
    res.status(200).json({
      status: "success",
      data: {
        product: [product],
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err.message,
    });
  }
};
