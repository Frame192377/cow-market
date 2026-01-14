// backend/src/routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middlewares/auth");
const { adminCheck } = require("../middlewares/admin");

// ทุก Route ต้องผ่านการ Login และเป็น Admin

// 1. สถิติรวม
router.get("/stats", authenticate, adminCheck, adminController.getStats);

// ✅ 2. เพิ่ม Route สำหรับดึง Users และ Orders
router.get("/users", authenticate, adminCheck, adminController.getAllUsers);
router.get("/orders", authenticate, adminCheck, adminController.getAllOrders);

// 3. สินค้าและวัว
router.get("/cows", authenticate, adminCheck, adminController.getAllCows);
router.get("/products", authenticate, adminCheck, adminController.getAllProducts);

// 4. ลบรายการ
router.delete("/:type/:id", authenticate, adminCheck, adminController.deleteItem);

router.put("/:type/:id/status", authenticate, adminCheck, adminController.updateItemStatus);

module.exports = router;