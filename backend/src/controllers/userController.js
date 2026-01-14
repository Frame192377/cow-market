// backend/src/controllers/userController.js
const { User, Cow, Review } = require("../models"); // ✅ Import ครบ (User, Cow, Review)

// GET /api/users/me (ดูข้อมูลตัวเอง)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phoneNumber", "facebook", "line", "avatar", "address", "role"] 
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json(user);
  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id (สำหรับดูโปรไฟล์คนขาย + รีวิว)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. ดึงข้อมูล User (ตัด password ออก)
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] } 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. นับจำนวนวัวที่ "ขายแล้ว" (Sold Count)
    const soldCount = await Cow.count({
      where: {
        userId: id,
        status: 'sold' 
      }
    });

    // 3. ดึงรายการวัวทั้งหมดของผู้ขายคนนี้
    const listings = await Cow.findAll({
      where: { userId: id },
      order: [['createdAt', 'DESC']]
    });

    // ✅ 4. ดึงรีวิวและคำนวณคะแนนเฉลี่ย
    const reviews = await Review.findAll({ where: { sellerId: id } });
    
    // คำนวณคะแนนรวม
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    // หารเพื่อหาค่าเฉลี่ย (ถ้าไม่มีรีวิวให้เป็น 0)
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    // 5. ส่งข้อมูลกลับไปรวมกัน
    res.json({
      ...user.toJSON(),
      soldCount,
      listings,
      avgRating,       // ✅ ส่งคะแนนเฉลี่ย
      reviewCount: reviews.length, // ✅ ส่งจำนวนรีวิว
      reviews          // ✅ ส่งรายการรีวิวไปด้วย (เผื่อจะเอาไปโชว์)
    });

  } catch (err) {
    console.error("GET USER BY ID ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/users/me (แก้ไขข้อมูลตัวเอง)
exports.updateMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, phone, phoneNumber, address, facebook, line } = req.body;

    if (name) user.name = name;
    
    // Logic เบอร์โทร
    const newPhone = phoneNumber || phone;
    if (newPhone) user.phoneNumber = newPhone; 

    if (address) user.address = address;

    // อัปเดต Facebook และ Line
    if (facebook !== undefined) user.facebook = facebook;
    if (line !== undefined) user.line = line;

    // ถ้ามีอัปโหลดรูปมา
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      facebook: user.facebook,
      line: user.line,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
    });
  } catch (err) {
    console.error("UPDATE ME ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};