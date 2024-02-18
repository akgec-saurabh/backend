const mongoose = require("mongoose");

const descriptionSchema = new mongoose.Schema({
  heading: String,
  short: String,
  long: String,
});

const Description = new mongoose.model("Description", descriptionSchema);

module.exports = Description;
