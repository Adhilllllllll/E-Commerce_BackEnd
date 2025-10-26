const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
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
      min:[0,"price cannot be neagtive"]
    },

    image: {
      type: [String],
      required: [true, "A product should have a image"],
      default: [],
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
      min:[0,"stock cannot be negative"]
    },

    isActive: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
