const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { authenticate } = require('../middlewares/auth'); // ✅ 1. ต้อง Import ตัวนี้มาด้วย!
const multer = require('multer');
const path = require('path');

// ตั้งค่า Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ใช้ path.join เพื่อความชัวร์เรื่อง path (.. ถอยกลับไป root แล้วเข้า uploads)
    cb(null, path.join(__dirname, '..', '..', 'uploads')); 
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่กันซ้ำ และลบช่องว่างในชื่อไฟล์ออก
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage: storage });

// --- Routes ---

// GET: ดูข้อมูลไม่ต้องล็อกอิน
router.get('/', marketController.getAllMarkets);
router.get('/:id', marketController.getMarketById);

// POST: เพิ่มตลาดใหม่ (ต้องล็อกอิน)
// ✅ 2. ใส่ 'authenticate' ไว้ตัวแรกสุด
router.post(
  '/', 
  authenticate, 
  upload.array('images'), 
  marketController.createMarket
);

// PUT: แก้ไขตลาด (ต้องล็อกอิน)
router.put(
  '/:id', 
  authenticate, 
  upload.array('images'), 
  marketController.updateMarket
);

// DELETE: ลบตลาด (ต้องล็อกอิน)
router.delete(
  '/:id', 
  authenticate, 
  marketController.deleteMarket
);

module.exports = router;