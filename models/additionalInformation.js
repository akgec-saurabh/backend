const mongoose = require("mongoose");

const additionalInformationSchema = new mongoose.Schema({
  weight: String,
  dimensions: dimensionsSchema,
  sizes: [String],
  colors: colorSchema,
  storage: String,
});

const dimensionsSchema = new mongoose.Schema({
  length: Number,
  width: Number,
  height: Number,
});

const colorSchema = new mongooose.Schema({
  name: String,
  code: String,
  images: [String],
});

const AdditionalInformation = new mongoose.model(
  "AdditionalInformation",
  additionalInformationSchema
);

module.exports = AdditionalInformation;
