exports.uplaodFile = async function(req, res){
    try{
const files = req.files.file
    }catch(err){
        return res.status(200).json({
            status : "success",
            message:err.message,
        })
    }
}