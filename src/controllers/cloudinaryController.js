exports.uploadFile = async function(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "failed",
        message: "No file uploaded",
      });
    }

    // req.file.path contains the Cloudinary URL
    const fileUrl = req.file.path;

    res.status(200).json({
      status: "success",
      data: {
        url: fileUrl
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};
