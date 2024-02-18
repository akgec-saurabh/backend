const mongoose = require("mongoose");

const descriptionSchema = new mongoose.Schema({
  heading: { type: String },
  short: { type: String },
  long: { type: String },
});
const dimensionsSchema = new mongoose.Schema({
  length: { type: String },
  width: { type: String },
  height: { type: String },
});

const colorSchema = new mongoose.Schema({
  name: String,
  code: String,
  images: [String],
  sizes: [{ size: String, price: Number }],
  id: String,
});

const additionalInformationSchema = new mongoose.Schema({
  weight: String,
  dimensions: dimensionsSchema,
  colors: [colorSchema],
  storage: String,
});

const productInfoSchema = {
  features: [String],
  sampleNumberList: [String],
  lining: String,
};

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  mainCategory: String,
  images: [String],
  sku: String,
  categories: [String],
  tags: [String],
  sizes: [String],
  additionalInformation: additionalInformationSchema,
  productInfo: productInfoSchema,
  description: descriptionSchema,
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
