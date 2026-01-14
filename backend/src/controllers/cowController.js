// backend/src/controllers/cowController.js
const { Cow, User, Market } = require('../models'); 

// ✅ Helper: ฟังก์ชันแปลงค่าเป็นตัวเลข (ป้องกัน NaN)
const parseNumber = (val) => {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// GET /api/cows
exports.listCows = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {};
    
    // ✅ ถ้าไม่ได้ระบุสถานะมา ให้ดึงเฉพาะที่ 'approved' เท่านั้น
    if (status && status !== 'all') {
      whereClause.status = status;
    } else if (!status) {
      whereClause.status = 'approved'; 
    }

    const cows = await Cow.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'phoneNumber'] }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(cows);
  } catch (err) {
    console.error('listCows ERROR:', err);
    res.status(500).json({ error: 'Cannot retrieve cow data' });
  }
};

// GET /api/cows/:id
exports.getCowById = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'phoneNumber'] },
        // ดึงข้อมูลตลาดนัด
        { 
          model: Market, 
          as: 'Market', 
          attributes: ['name', 'location'] 
        } 
      ],
    });
    
    if (!cow) return res.status(404).json({ error: 'Cow not found' });
    res.json(cow);
  } catch (err) {
    console.error('getCowById ERROR:', err);
    res.status(500).json({ error: 'Cannot retrieve cow data' });
  }
};

// POST /api/cows
exports.createCow = async (req, res) => {
  try {
    const {
      name, gender, age, weight, breed, price, location, description, category,
      sireName, 
      marketId,
      vaccineHistory, // ✅ 1. รับค่าประวัติวัคซีน
    } = req.body;

    const images = req.files?.map((f) => `/uploads/${f.filename}`) || [];

    const cow = await Cow.create({
      name,
      gender,
      age: parseNumber(age),
      weight: parseNumber(weight),
      price: parseNumber(price),
      breed,
      sireName, 
      location,
      description,
      category: category || 'cow',
      
      marketId: marketId ? parseNumber(marketId) : null,
      
      // ✅ 2. บันทึกลง DB
      vaccineHistory, 

      images,
      userId: req.user.id,
      status: 'pending' // ✅ เปลี่ยนจาก 'available' เป็น 'pending'
    });

    res.json(cow);
  } catch (err) {
    console.error('createCow ERROR:', err);
    res.status(400).json({ error: err.message || 'Create cow listing failed' });
  }
};

// PUT /api/cows/:id
exports.updateCow = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id);
    if (!cow) return res.status(404).json({ error: 'Cow not found' });

    if (cow.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to edit this item' });
    }

    const {
      name, gender, age, weight, breed, price, location, description, category,
      sireName,
      marketId,
      vaccineHistory, // ✅ รับค่าตอนแก้ไข
    } = req.body;

    let images = cow.images || [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    await cow.update({
      name,
      gender,
      age: parseNumber(age),
      weight: parseNumber(weight),
      price: parseNumber(price),
      breed,
      sireName,
      location,
      description,
      category: category || cow.category,
      
      marketId: marketId ? parseNumber(marketId) : null,
      
      // ✅ อัปเดตวัคซีน
      vaccineHistory,

      images,
      status: 'pending' // ✅ เมื่อแก้ไข ให้กลับไปรออนุมัติใหม่ (Optional)
    });

    res.json(cow);
  } catch (err) {
    console.error('updateCow ERROR:', err);
    res.status(400).json({ error: err.message || 'Update cow data failed' });
  }
};

// DELETE /api/cows/:id
exports.deleteCow = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id);
    if (!cow) return res.status(404).json({ error: 'Cow not found' });

    if (cow.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this item' });
    }

    await cow.destroy();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('deleteCow ERROR:', err);
    res.status(500).json({ error: 'Delete item failed' });
  }
};

// PUT /api/cows/:id/sold
exports.markAsSold = async (req, res) => {
  try {
    const cow = await Cow.findByPk(req.params.id);
    if (!cow) return res.status(404).json({ error: 'Cow not found' });

    if (cow.userId !== req.user.id) {
      return res.status(403).json({ error: 'You are not the owner of this post' });
    }

    await cow.update({ status: 'sold' });
    
    res.json({ message: 'Marked as sold successfully', cow });
  } catch (err) {
    console.error('markAsSold ERROR:', err);
    res.status(500).json({ error: 'Update status failed' });
  }
};