// backend/src/routes/orders.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

// Config Multer สำหรับสลิป
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-slip-" + file.originalname)
});
const upload = multer({ storage });

// 1. สร้างคำสั่งซื้อ (Buyer)
router.post("/", authenticate, upload.single("slipImage"), orderController.createOrder);

// 2. ดึงออเดอร์สำหรับคนขาย (Seller)
router.get("/seller", authenticate, orderController.getSellerOrders); 

// ✅ 3. ดึงประวัติการสั่งซื้อสำหรับคนซื้อ (Buyer)
router.get("/buyer", authenticate, orderController.getBuyerOrders);

// ✅ 4. อัปเดตสถานะออเดอร์ (Seller)
router.put("/:id/status", authenticate, orderController.updateOrderStatus);

module.exports = router;