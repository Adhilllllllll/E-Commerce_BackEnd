const mongoose =require("mongoose");
const Product = require("./productModel");
const User = require("./userModel");

const cartSchema = mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        quantity:{
            type:Number,
            default:1,
        }
    },
    {timestamp:true}
);

//Calculating total price
cartSchema.statics.calculateTotalPrice = async function (userId) {
  const cartItems = await this.find({ userId : userId}).populate("productId");

  const totalPrice = cartItems.reduce((total, item) => {
    const productPrice = item.productId.price;
    return total + productPrice * item.quantity;
  }, 0);

  return totalPrice;
};


const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;