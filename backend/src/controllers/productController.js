// backend/src/controllers/productController.js
const { Product, User } = require("../models");

const listProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: User, as: "User", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(products);
  } catch (err) {
    console.error("listProducts ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const images = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const product = await Product.create({
      name,
      category, // medicine / supplement / other
      price,
      description,
      images,
      userId: req.user.id,
    });

    res.json(product);
  } catch (err) {
    console.error("createProduct ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  listProducts,
  createProduct,
};
