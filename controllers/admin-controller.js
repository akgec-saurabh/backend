const Product = require("../models/product");
const HttpError = require("../models/http-error");

const getAllProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find();
  } catch (error) {
    console.log(error);
    s;
    return next(
      new HttpError("Some Error Occured while fetching products", 500)
    );
  }
  if (!products) {
    return res.status(200).json({ message: "No products exist" });
  }
  res.status(200).json({
    message: "Fetched All Products Successfully",
    products: products.map((product) => product.toObject({ getters: true })),
    count: products.length,
  });
};

const createProduct = async (req, res, next) => {
  const { name } = req.body;

  const product = new Product({
    name,
  });

  try {
    await product.save();
  } catch (error) {
    return next(new HttpError("Unable to Save Product", 500));
  }

  res.status(201).json({
    message: "Product Created Successfully",
    product: product.toObject({ getters: true }),
  });
};

const getProductById = async (req, res, next) => {
  const id = req.params.pid;
  console.log(id);

  let existingProduct;
  try {
    existingProduct = await Product.findById(id);
  } catch (error) {
    return next(new HttpError("Error Occured while finding Product", 500));
  }

  if (!existingProduct) {
    return res.status(404).json({ message: "Product Not found" });
  }

  res.status(200).json({
    message: "Fetched Product Successfully!",
    product: existingProduct.toObject({ getters: true }),
  });
};

const updateProductDetails = async (req, res, next) => {
  const {
    name,
    price,
    mainCategory,
    images,
    sku,
    categories,
    tags,
    sizes,
    additionalInformation,
    productInfo,
    description,
  } = req.body;

  console.log(req.body);

  const id = req.params.pid;

  let existingProduct;
  try {
    existingProduct = await Product.findById(id);
    console.log("Existing Product", existingProduct);
  } catch (error) {
    return next(new HttpError("Error Occured while finding Product", 500));
  }

  if (!existingProduct) {
    return res.status(404).json({ message: "Product Not found" });
  }

  existingProduct.set({
    name,
    price,
    mainCategory,
    images,
    sku,
    categories,
    tags,
    sizes,
    additionalInformation,
    productInfo,
    description,
  });
  try {
    await existingProduct.save();
  } catch (error) {
    return next(new HttpError("Unable to Update Product", 500));
  }

  res.status(200).json({
    message: "Product Updated Successfully!",
    updatedProduct: existingProduct.toObject({ getters: true }),
  });
};

exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.updateProductDetails = updateProductDetails;
exports.getProductById = getProductById;
