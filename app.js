const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");

require("dotenv").config({ path: ".env.local" });

const PORT = process.env.PORT;

const cartRoutes = require("./routes/cart-routes");
const productsRoutes = require("./routes/products-routes");
const adminRoutes = require("./routes/admin-routes");
const authRoutes = require("./routes/auth-routes");
const paymentRoutes = require("./routes/payment-routes");
const orderRoutes = require("./routes/order-routes");
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
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

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

if (process.env.NODE_ENV === "production") {
  const options = {
    key: fs.readFileSync("private.key"),
    certificate: fs.readFileSync("certificate.crt"),
  };

  //Connecting to DataBase
  https.createServer(options, app).listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGO_DB_URL).then(() => {
      console.log("DB CONNECTED");
    });
  });
} else {
  /**
   * Database Connection
   */
  app.listen(PORT, () => {
    console.log("Listening on Port: " + PORT);
    mongoose.connect(process.env.MONGO_DB_URL).then(() => {
      console.log("DB CONNECTED");
    });
  });
}
