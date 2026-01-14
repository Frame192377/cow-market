// backend/src/routes/users.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth"); // เช็ค path ให้ถูกว่า middleware อยู่โฟลเดอร์ไหน (middlewares หรือ middleware)
const userController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");

// ตั้งค่า Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // เก็บไว้ที่ 'uploads' (backend/uploads)
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({ storage });

// --- ลำดับสำคัญมาก! ต้องเอา /me ไว้ก่อน /:id ---

// 1. ดูข้อมูลตัวเอง
router.get("/me", authenticate, userController.getMe);

// 2. แก้ไขข้อมูลตัวเอง
router.put(
  "/me",
  authenticate,
  upload.single("avatar"), 
  userController.updateMe
);

// 3. ดูโปรไฟล์คนอื่น (ต้องไว้ล่างสุด)
// ✅ ใช้ getUserById ตามที่เขียนใน Controller
router.get("/:id", userController.getUserById);

module.exports = router;