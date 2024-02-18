const HttpError = require("../models/http-error");
const Product = require("../models/product");

const getAllProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find({});
  } catch (error) {
    return next(new HttpError("Error while finding product", 500));
  }

  if (!products) {
    return res.status(200).json({
      message: "No proudcts exists",
    });
  }

  res.status(200).json({
    message: "All Products fetched succesfully",
    proudcts: products.map((product) => product.toObject({ getters: true })),
    count: products.length,
  });
};

const getProductById = async (req, res, next) => {
  const { pid } = req.params;

  let product;
  try {
    product = await Product.findById(pid);
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Some errror occured while fetching product", 500)
    );
  }

  if (!product) {
    return next(new HttpError("Could not find any product", 404));
  }

  res.status(200).json({
    message: "Product found Successfully!",
    product: product.toObject({ getters: true }),
  });
};

exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
