const Order =require("../models/orderModel");


exports.viewProdfile =async function(req,res){
    try{
    const loggedInUser = req.user;
    if(!loggedInUser){
        return res.status(400).json({
            status:"failed",
            message:"please login first"
        })
    };



    const totalOrders =await Order.aggregate([
     {
        $match: {
            userId:loggedInUser.id
        }
     },

     {
        $unwind:'$products'
     },
     {
        $group:{
            _id:null,
            totalOrders:{$sum :1}
        }
     }

    ]);

        res.status(200).json({
            status:"success",
            data:{
                user:loggedInUser,
                totalOrders
            }
        });

    }catch(err){
     res.status(404).json({
        status:"failed"
     })
    }
}