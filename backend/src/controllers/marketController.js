const { Market } = require('../models');

exports.getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(markets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching markets' });
  }
};

exports.getMarketById = async (req, res) => {
  try {
    const { id } = req.params;
    const market = await Market.findByPk(id);

    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }

    res.status(200).json(market);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching market details' });
  }
};

// 🔥 แก้ไขให้บันทึก path เต็ม (/uploads/filename) 🔥
exports.createMarket = async (req, res) => {
  try {
    console.log("--------------------------------");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    console.log("--------------------------------");

    const { name, location, date, contact, description, mapLink } = req.body;

    // ✅ แก้ตรงนี้: เพิ่ม '/uploads/' นำหน้าชื่อไฟล์
    // ผลลัพธ์ใน DB จะเป็น: ["/uploads/170xxx.jpg", "/uploads/170xxx.jpg"]
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
      images: imageFiles 
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