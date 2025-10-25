
const Product = require("../models/productModel");
 

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
    console.log(err.message);
    
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
  const {description,count,image,price} =req.body;


  const updatedProduct = await  Product.findByIdAndUpdate(
    productId,
    {
        description,
        image,
        count,
        price
    },
    {new :true, runValidators:true}
  );

   if(!updatedProduct){
    return res.status(404).json({
        status:"success",
        message:"No such product exist"
    })
   }

   res.status(200).json({
    status:"success",
    data:updatedProduct
   })

    }catch(err){
        res.status(200).json({
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

        res.status(203).json({
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
        const product=await product.findById(productId);
        if(!product){
            return res.status(404).json({
                status:"failed",
                message:"product not found"
            });
            res.status(200).json({
                status:"success",
                data:product
            });

        }

    }catch(err){
        req.status(400).json({
            status:"failed",
            message:err.message
        });
    }
}



