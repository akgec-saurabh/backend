const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const PORT = process.env.PORT;
const adminRoutes = require("./routes/admin-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/admin", adminRoutes);

// CATCH-ALL Routes
app.use("/", (req, res, next) => {
  return next(HttpError("Could Not find this Route", 400));
});

// ERROR-MIDDLEWARE
app.use((error, req, res, next) => {
  if (error.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An Error Occured on the Server Side" });
});
app.listen(PORT, () => {
  console.log("Listening on Port: " + PORT);
});
