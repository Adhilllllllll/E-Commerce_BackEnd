const Product = require("../models/productModel");

// **************************** //
//      GET ALL PRODUCTS         //
// **************************** //
exports.getAllProducts = async function (req, res) {
  try {
    const { category, page, limit, search, sort } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    // Build query
    let query = Product.find(filter);

    // sorting if provided
    if (sort) {
      const sortBy = sort.split(",").join(" "); 
      query = query.sort(sortBy);
    }

    // pagination
    query = query.skip(skip).limit(limitNumber);

    const allProducts = await query;

    res.status(200).json({
      status: "success",
      results: allProducts.length,
      products: allProducts,
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err.message);
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};



// **************************** //
//      GET SINGLE PRODUCT       //
// **************************** //


exports.getProduct = async function (req, res) {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err) {
    console.error("Error in getProduct:", err.message);
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
