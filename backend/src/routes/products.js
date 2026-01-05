// backend/src/routes/products.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const productController = require("../controllers/productController");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// GET /api/products
router.get("/", productController.listProducts);

// POST /api/products
router.post(
  "/",
  authenticate,
  upload.array("images", 6),
  productController.createProduct
);

module.exports = router;
