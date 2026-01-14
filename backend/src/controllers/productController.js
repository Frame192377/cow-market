// backend/src/controllers/productController.js
const { Product, User } = require("../models");

// ดึงรายการสินค้า (เฉพาะที่อนุมัติแล้ว)
const listProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      // ✅ เพิ่ม: กรองเฉพาะสินค้าสถานะ 'approved' เท่านั้น
      where: { status: 'approved' }, 
      include: [{ model: User, as: "User", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(products);
  } catch (err) {
    console.error("listProducts ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// สร้างสินค้าใหม่ (สถานะเริ่มต้น = pending)
const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;
    const images = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const product = await Product.create({
      name,
      category, 
      price,
      description,
      stock: stock || 1,
      images,
      userId: req.user.id,
      
      // ✅ กำหนดสถานะเริ่มต้นเป็น 'pending' (รออนุมัติ)
      status: 'pending' 
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