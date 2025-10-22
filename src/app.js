const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter = require("../src/routes/authRouter");

const rateLimit = require("express-rate-limit");
const app = express();


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

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", limiter);
app.use("/api/v1/auth", authRouter);



// Error handling middleware
// app.use(errorHandler);

module.exports = app;
