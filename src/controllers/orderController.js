const Cart =require("../models/cartModel");
const Order = require("../models/orderModel");

// Creating Order

exports.createOrder = async function (req,res){
    try{

        const loggedInUser = req.user;

        if(!loggedInUser){
            return res.status(401).json({
                status:"failed",
                message:"please login "
            })
        }

        //fecth all cart

        const cartItems =await Cart.find({userId:loggedInUser.id})
        .populate("productId");


        if(cartItems.length === 0){
            return res.status(400).json({
                status:"faield",
                message:"cart is empty"
            })
        }



        // map products including the quantity

        const products = cartItems.map((item)=>({
            productId:item.productId.id,
            quantity:item.quantity, 
        }));



        //total price

        const totalPrice =cartItems.reduce(
            (sum,item)=>sum +item.productId.price *item.quantity,
            0
        );


        //creatin new order

        const newOrder =await Order.create({
            userId :loggedInUser?.id,
            products,totalPrice,
            status:"pending"
        });


        //clearing the cart after checkout

        await Cart.deleteMany({userId:loggedInUser.id});

           return res.status(201).json({
           status: "success",
           data: newOrder,
        });


        } catch (err) {
        console.log(err);
             return res.status(400).json({
             status: "failed",
             message: err.message,
    });
  }
};



