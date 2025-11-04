const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
    },

    address: {
      type:mongoose.Schema.Types.Mixed,
      required: [true, "Shipping address is required"],
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancel"],
      default: "pending",
    },

    paymentMethod:{
        type:String,
        enum:["cod","upi","razorpay"],
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid","failed"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
