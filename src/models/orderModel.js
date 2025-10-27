const mongoose =require("mongoose");


const orderSchema = mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },

        products:[
            {
                productId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Product",
                    required:true,
                },
                quantity:{type:Number,default:1},
            },
        ],


        totalPrice:{
            type:Number,
            required:[true,"need toatal price"],
        },


        address:{
            type:String,
            required:[true,"shipping address is required"]

        },



        status:{
            type:String,
            enum:{
                values:["pending","shipped","delivered","cancel"],
            default:"pending"
            }
        },


        paymentStatus:{ 
            type:String,
            enum:["unpaid","paid"],
            default:"unpaid"

        }
 

    },
    {timestamps:true}
);

const Order = mongoose.model("Order",orderSchema);

module.exports =Order;
