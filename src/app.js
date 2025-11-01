const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const app = express();
const helmet = require("helmet");

const authRouter = require("../src/routes/authRouter");
const productRouter = require("../src/routes/productRouter");
const adminRouter = require("../src/routes/adminRouter");
const cartRouter =require("../src/routes/cartRouter");
const wishListRouter =require("../src/routes/wishListRouter");
const orderRouter =require("../src/routes/orderRouter");
const userRouter =require("../src/routes/userRouter")

//Rate - limit

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: {
    status: 429,
    message: "Too many request. Please try again in an hour",
  },
  standardHeaders: true,
  legacyHeaders: true,
});

// Middlewares

app.use(helmet({contentSecurityPolicy:false}));
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

// Rate limiter for all
app.use("/api", limiter);

// Routes

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/carts",cartRouter);
app.use("/api/v1/wishlist",wishListRouter);
app.use("/api/v1/orders",orderRouter);
app.use("/api/v1/users",userRouter);

module.exports = app;
