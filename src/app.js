const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
const rateLimit = require("express-rate-limit");
const app = express();
const helmet =require("helmet")


const authRouter = require("../src/routes/authRouter");
const productRouter = require("../src/routes/productRouter")
 const adminRouter = require("../src/routes/adminRouter")

//Rate - limit

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    status: 429,
    message: "Too many request. Please try again in an hour",
  },
  standardHeaders: true,
  legacyHeaders: true,
});

// Middlewares


app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());


// app.use((err,req,res,next)=>{
//   console.log(`REQUEST +`,req);
  
// })

// Rate limiter
app.use("/api", limiter);

// Routes

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products",productRouter);
app.use("/api/v1/admin",adminRouter);



 // 404 error handling middleware
//  app.use((err,req,res,next)=>{
//   return res.status(404).json({
//     status:"can't find the url",
//     message:err.message
//   })
//  })

module.exports = app;
