// backend/src/controllers/cowController.js
const { Cow, User } = require('../models');

// GET /api/cows
// รองรับ ?status=sold หรือ ?status=available
exports.listCows = async (req, res) => {
  try {
    const { status } = req.query;

    // สร้างเงื่อนไขการค้นหา
    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    } else if (!status) {
      // ค่าเริ่มต้น: ถ้าไม่ส่ง status มา ให้โชว์เฉพาะที่ "ว่าง" (available)
      whereClause.status = 'available';
    }

    const cows = await Cow.findAll({
      where: whereClause, // ✅ ใส่เงื่อนไขกรองสถานะ
      // ✅ เพิ่ม phoneNumber เพื่อให้หน้าเว็บเอาไปแสดงตอนติดต่อเจ้าของ
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'phoneNumber'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(cows);
  } catch (err) {
    console.error('listCows ERROR:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลวัวได้' });
  }
};

// GET /api/cows/:id
exports.getCowById = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'phoneNumber'] }],
    });
    if (!cow) return res.status(404).json({ error: 'ไม่พบวัวตัวนี้' });
    res.json(cow);
  } catch (err) {
    console.error('getCowById ERROR:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลวัวได้' });
  }
};

// POST /api/cows
exports.createCow = async (req, res) => {
  try {
    const {
      name,
      gender,
      age,
      weight,
      breed,
      price,
      location,
      description,
      category,
    } = req.body;

    // เก็บ path เต็ม ตามที่คุณต้องการ
    const images = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const cow = await Cow.create({
      name,
      gender,
      age: age ? Number(age) : null,
      weight,
      breed,
      price,
      location,
      description,
      category: category || 'cow',
      images,
      userId: req.user.id,
      status: 'available' // ✅ กำหนดค่าเริ่มต้นเป็น ว่าง
    });

    res.json(cow);
  } catch (err) {
    console.error('createCow ERROR:', err);
    res.status(400).json({ error: err.message || 'สร้างรายการวัวไม่สำเร็จ' });
  }
};

// PUT /api/cows/:id
exports.updateCow = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id);
    if (!cow) {
      return res.status(404).json({ error: 'ไม่พบวัวตัวนี้' });
    }

    if (cow.userId !== req.user.id) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์แก้ไขรายการนี้' });
    }

    const {
      name,
      gender,
      age,
      weight,
      breed,
      price,
      location,
      description,
      category,
    } = req.body;

    let images = cow.images || [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    await cow.update({
      name,
      gender,
      age: age ? Number(age) : null,
      weight,
      breed,
      price,
      location,
      description,
      category: category || cow.category,
      images,
    });

    res.json(cow);
  } catch (err) {
    console.error('updateCow ERROR:', err);
    res.status(400).json({ error: err.message || 'แก้ไขข้อมูลวัวไม่สำเร็จ' });
  }
};

// DELETE /api/cows/:id
exports.deleteCow = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id);
    if (!cow) {
      return res.status(404).json({ error: 'ไม่พบวัวตัวนี้' });
    }

    if (cow.userId !== req.user.id) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ลบรายการนี้' });
    }

    await cow.destroy();
    res.json({ message: 'ลบรายการเรียบร้อย' });
  } catch (err) {
    console.error('deleteCow ERROR:', err);
    res.status(500).json({ error: 'ลบรายการไม่สำเร็จ' });
  }
};

// ✅ เพิ่มฟังก์ชันนี้: กดปุ่ม "ขายแล้ว" (PUT /api/cows/:id/sold)
exports.markAsSold = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id);
    if (!cow) return res.status(404).json({ error: 'ไม่พบวัวตัวนี้' });

    // เช็คว่าเป็นเจ้าของไหม
    if (cow.userId !== req.user.id) {
      return res.status(403).json({ error: 'คุณไม่ใช่เจ้าของโพสต์นี้' });
    }

    // อัปเดตสถานะเป็น sold
    await cow.update({ status: 'sold' });
    
    res.json({ message: 'ปิดการขายเรียบร้อย', cow });
  } catch (err) {
    console.error('markAsSold ERROR:', err);
    res.status(500).json({ error: 'อัปเดตสถานะไม่สำเร็จ' });
  }
};