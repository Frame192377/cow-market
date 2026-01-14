// backend/src/controllers/marketController.js
const { Market, User } = require('../models'); // ✅ ต้อง import User ด้วย

// GET /api/markets
exports.getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.findAll({
      order: [['createdAt', 'DESC']],
      // (Optional) ถ้าอยากโชว์ชื่อคนสร้างในหน้ารวม ก็ใส่ include User ตรงนี้ได้
    });
    res.status(200).json(markets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching markets' });
  }
};

// GET /api/markets/:id
exports.getMarketById = async (req, res) => {
  try {
    const { id } = req.params;
    const market = await Market.findByPk(id, {
      // ✅ เพิ่ม include User เพื่อดึงชื่อคนสร้างไปแสดงในหน้า Detail
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'phoneNumber'] }
      ]
    });

    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }

    res.status(200).json(market);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching market details' });
  }
};

// POST /api/markets
exports.createMarket = async (req, res) => {
  try {
    console.log("--------------------------------");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("USER:", req.user); // เช็คว่ามี user ไหม
    console.log("--------------------------------");

    const { name, location, date, contact, description, mapLink } = req.body;

    // ✅ บันทึก path เต็ม
    const imageFiles = req.files 
      ? req.files.map((file) => `/uploads/${file.filename}`) 
      : [];

    const newMarket = await Market.create({
      name,
      location,
      date,
      contact,
      description,
      mapLink,
      images: imageFiles,
      userId: req.user.id // ✅ บันทึกว่าใครเป็นคนสร้าง (สำคัญมาก!)
    });

    res.status(201).json({
      message: 'Create market success',
      data: newMarket
    });

  } catch (error) {
    console.error("Error creating market:", error);
    res.status(500).json({ message: 'Error creating market', error: error.message });
  }
};

// PUT /api/markets/:id
exports.updateMarket = async (req, res) => {
  try {
    const { id } = req.params;
    const market = await Market.findByPk(id);

    if (!market) return res.status(404).json({ message: 'Market not found' });

    // ✅ เช็คสิทธิ์ความเป็นเจ้าของ
    if (market.userId !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขรายการนี้' });
    }

    const { name, location, date, contact, description, mapLink } = req.body;

    // จัดการรูปภาพ (ถ้ามีอัปโหลดใหม่ ให้ใช้ของใหม่ ถ้าไม่มีให้ใช้ของเดิม)
    let imageFiles = market.images || [];
    if (req.files && req.files.length > 0) {
      imageFiles = req.files.map((file) => `/uploads/${file.filename}`);
    }

    await market.update({
      name,
      location,
      date,
      contact,
      description,
      mapLink,
      images: imageFiles
    });

    res.json({ message: 'Update success', market });

  } catch (error) {
    console.error("Error updating market:", error);
    res.status(500).json({ message: 'Error updating market' });
  }
};

// DELETE /api/markets/:id
exports.deleteMarket = async (req, res) => {
  try {
    const { id } = req.params;
    const market = await Market.findByPk(id);

    if (!market) return res.status(404).json({ message: 'Market not found' });

    // ✅ เช็คสิทธิ์ความเป็นเจ้าของ
    if (market.userId !== req.user.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบรายการนี้' });
    }

    await market.destroy();
    res.json({ message: 'Delete success' });

  } catch (error) {
    console.error("Error deleting market:", error);
    res.status(500).json({ message: 'Error deleting market' });
  }
};