const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "dzubk4650",
  api_key: "111633472116384",
  api_secret: "3w8BEchTft5P93JDQ3G6aEIuFbY",
});


// Define storage engine for Multer using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };