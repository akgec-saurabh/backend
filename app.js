const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

require("dotenv").config();

const PORT = process.env.PORT;

const cartRoutes = require("./routes/cart-routes");
const productsRoutes = require("./routes/products-routes");
const adminRoutes = require("./routes/admin-routes");
const authRoutes = require("./routes/auth-routes");
const HttpError = require("./models/http-error");

/**
 *Middleware
 */
const app = express();
app.use(bodyParser.json());

// app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors());

/**
 * Routes// const productsRoutes = require("./routes/products-routes");
 */
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);

/**
 * Catch All Routes
 */
app.use("/", (req, res, next) => {
  return next(new HttpError("Could Not find this Route", 400));
});

/**
 * Error-Middleware
 */
app.use((error, req, res, next) => {
  if (error.headerSent) {
    return next(error);
  }
  console.log("ERROR IN APP.JS", error);
  res.status(error.code || 500);
  res.json({ message: error.message || "An Error Occured on the Server Side" });
});

/**
 * Database Connection
 */
app.listen(PORT, () => {
  console.log("Listening on Port: " + PORT);

  mongoose.connect(process.env.MONGO_DB_URL).then(() => {
    console.log("DB CONNECTED");
  });
});
