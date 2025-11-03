const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/cloudinary.middleware");

// Multiple file upload endpoint
router.post("/", upload.array("file"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ status: "failed", message: "No file uploaded" });
  }

  // Return array of Cloudinary URLs
  const urls = req.files.map(file => file.path);

  res.json({
    status: "success",
    data: {
      urls, // array of URLs
    },
  });
});

module.exports = router;
