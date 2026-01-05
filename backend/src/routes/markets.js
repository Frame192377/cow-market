const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const multer = require('multer'); // 1. ต้อง import multer

// 2. ตั้งค่าที่เก็บไฟล์ (Config Multer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // โฟลเดอร์สำหรับเก็บรูป (ต้องมีโฟลเดอร์นี้อยู่จริง)
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่กันซ้ำ (เวลา + ชื่อเดิม)
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// GET /api/markets -> ดึงข้อมูลตลาดทั้งหมด
router.get('/', marketController.getAllMarkets);

// GET /api/markets/:id -> ดึงข้อมูลตลาดตาม ID
router.get('/:id', marketController.getMarketById);

// POST /api/markets -> เพิ่มตลาดใหม่
// 3. 🔥 ใส่ upload.array('images') คั่นกลางตรงนี้ 🔥
// คำว่า 'images' ต้องตรงกับที่ formData.append("images", ...) ใน React
router.post('/', upload.array('images'), marketController.createMarket);

module.exports = router;