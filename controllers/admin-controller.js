const { v4: uuidv4 } = require("uuid");

const DEMO_PRODUCT = [];

const getAllProducts = (req, res, next) => {
  res.status(200).json({
    message: "Fetched All Products Successfully",
    products: DEMO_PRODUCT,
  });
};

const createProduct = (req, res, next) => {
  const { name } = req.body;

  const product = {
    name,
    id: uuidv4(),
  };

  DEMO_PRODUCT.push(product);

  res.status(201).json({ message: "Product Created", product });
};

const addProductDetails = (req, res, next) => {
  const productId = req.params.pid;
  //Find Product
};

exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.addProductDetails = addProductDetails;
