const HttpError = require("../models/http-error");
const Product = require("../models/product");

const getAllProducts = async (req, res, next) => {
  const search_query = {};
  const categoryQuery = req.query.category;
  const sizeQuery = req.query.size;

  if (categoryQuery) {
    const temp = categoryQuery.split("_");
    search_query.mainCategory = { $in: [...temp] };
  }
  if (sizeQuery) {
    const temp = sizeQuery.split("_");
    // search_query.sizes = { $in: [...temp] };
  }
  //additionalInformation:colors[size:]

  let products;
  console.log(req.query);
  const page = parseInt(req.query.page) || 1;
  let productPerPage = 6;
  let total = 0;

  try {
    total = (await Product.find(search_query)).length;
    products = await Product.find(search_query)
      .skip((page - 1) * productPerPage)
      .limit(productPerPage);
  } catch (error) {
    console.log(error);
    return next(new HttpError("Error while finding product", 500));
  }

  if (!products) {
    return res.status(200).json({
      message: "No proudcts exists",
    });
  }

  res.status(200).json({
    message: "All Products fetched succesfully",
    total,
    products: products.map((product) => product.toObject({ getters: true })),
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

const getAllFilter = async (req, res, next) => {
  const categories = await Product.aggregate([
    {
      $unwind: "$categories",
    },
    {
      $group: {
        _id: "$categories",
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const colors = await Product.aggregate([
    {
      $unwind: "$additionalInformation.colors",
    },
    {
      $group: {
        _id: "$additionalInformation.colors.name",
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({ categories, colors });
};

exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.getAllFilter = getAllFilter;
