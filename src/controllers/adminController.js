
const Product = require("../models/productModel");
 const Order =require("../models/orderModel");

// ******************************************************************//
// -----------------------PRODUCT SECTION-----------------------//
// ******************************************************************//



exports.createproduct = async function(req,res){
  try{
 
    console.log("admin  reached createproduct rout");
    const {image,name,description,brand,category,price,rating,count}= req.body
    
    const newProduct =await Product.create({
        name,
        description,
        brand,
        category,
        price,
        rating,
        count,
        image
    });
     
    res.status(201).json({
       status:"Success",
       data:newProduct
    })

  }catch(err){
    console.error(err.message);
    
    res.status(400).json({
        status :"failed",
        message:err.message
    })
  }
};


/***********************************************************/

//    UPDATE PRODUCT

exports.updateproduct = async function(req,res){
    try{

  const {productId} =req.params;
  const {description,count,image,price,name,category,brand} =req.body;

 if(!productId)
     throw new Error("there is no prodcut ID");

const updateData ={};
if(description !== undefined)updateData.description =description;
if(name !== undefined)updateData.name =name;
if(count !== undefined)updateData.count =count;
if(image !== undefined)updateData.image =image;
if(price !== undefined)updateData.price =price;
if(category !== undefined)updateData.category =category;
if(brand !== undefined)updateData.brand =brand;


const product =await Product.findByIdAndUpdate(productId,updateData,{
    new:true,
    runValidators:true
     
})


   if(!product){
    return res.status(404).json({
        status:"success",
        message:"No such product exist"
    })
   }

   res.status(200).json({
    status:"success",
    data:product
   })

    }catch(err){
        res.status(400).json({
            status:"failed",
            message:err.message
        })
    }
};


/***************************************************************/


//     DELETE PRODUCT

exports.deleteProduct =async function(req,res){
    try{

        const {productId} =req.params;
        const deletedProduct =await Product.findByIdAndDelete(productId);

        if(!deletedProduct){
            return res.status(404).json({
                status:"fail",
                message:"no such product exist!"
            })
        }

        res.status(204).json({
            status:"success",
            data:null
        })

    }catch(err){
        res.status(400).json({
            status:"failed",
            message:err.message
        })
    }
};


//vieproduct

exports.viewProduct = async function (req,res) {
    try{
        const{productId} =req.params;
        const product=await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                status:"failed",
                message:"product not found"
            });
             }
            res.status(200).json({
                status:"success",
                data:product
            });

       

    }catch(err){
        res.status(400).json({
            status:"failed",
            message:err.message
        });
    }
};

 
//getAll Products

exports.getAllProducts = async function (req, res) {
  try {
    const products = await Product.find();
    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};



// ORDER SECTION
  
exports.getAllProducts = async function(req,res){
     try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allOrders = await Order.find({})
      .skip(skip)
      .limit(limit)
      .populate("products.productId", "name price image")
      .populate("userId", "name email");

    const totalOrders = await Order.countDocuments();

    const revenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revenue[0]?.totalRevenue || 0;

    res.status(200).json({
      status: "success",
      totalOrders,
      totalRevenue,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      data: allOrders,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
      stack: err.stack,
    });
  }
};



// view AllOrders


exports.viewOrder = async function (req, res) {
  try {
    const { orderId } = req.params;
    if (!orderId) throw new Error("Order ID required");

    const order = await Order.findById(orderId)
      .populate("products.productId", "name price image")
      .populate("userId", "name email");

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};



exports.changeOrderStatus = async function (req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        status: "failed",
        message: "Order ID and status are required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
