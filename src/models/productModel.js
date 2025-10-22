const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "A product should have a name"],
    unique: [true, "A name must be unique"],
  },
  description: {
    type: String,
    trim: true,
  },

  price: {
    type: Number,
    required: [true, "A product should have a price"],
  },

  image: {
    type: String,
    required: [true, "A product should have a image"],
    default: "",
  },

  rating: {
    type: Number,
    default: 4.5,
  },

  category: {
    type: String,
    required: [true, "A product should have a category"],
    trim: true,
  },

  count: {
    type: Number,
    default: 10,
  },

  isActive: {
    type: Boolean,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
