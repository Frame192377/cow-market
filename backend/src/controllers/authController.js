// backend/src/controllers/authController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize'); // ✅ เพิ่ม Op เพื่อใช้ในการค้นหาแบบ OR

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// helper สร้าง payload ของ user ให้ใช้ซ้ำ
function buildUserPayload(user) {
  return {
    id: user.id,
    username: user.username, // ✅ เพิ่ม username
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber, // ✅ แก้จาก phone เป็น phoneNumber
    role: user.role,
    avatar: user.avatar || null,
    address: user.address || '',
  };
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    // รับค่าจากหน้าบ้าน (เผื่อส่งมาทั้ง phone หรือ phoneNumber)
    const { username, name, email, phone, phoneNumber, password } = req.body;

    console.log('REQ BODY REGISTER =', req.body);

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // ✅ แปลงค่า phone ให้เป็นตัวแปรเดียว (userPhone)
    const userPhone = phoneNumber || phone;

    // ✅ กำหนด Username (ถ้าไม่ส่งมา ให้ใช้ email หรือเบอร์แทน)
    const userUsername = username || email || userPhone;

    // เช็คว่ามีข้อมูลซ้ำไหม (เช็คทีเดียวด้วย Op.or)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          // เช็ค email ถ้ามี
          ...(email ? [{ email }] : []),
          // เช็คเบอร์โทร ถ้ามี (ใช้ชื่อคอลัมน์ phoneNumber)
          ...(userPhone ? [{ phoneNumber: userPhone }] : []),
          // เช็ค username
          { username: userUsername }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username, Email หรือ เบอร์โทรศัพท์นี้ ถูกใช้งานแล้ว' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง user ใหม่
    const user = await User.create({
      username: userUsername, // ✅ บันทึก username
      name: name || 'Unknown',
      email: email || null,
      phoneNumber: userPhone || null, // ✅ บันทึกลง phoneNumber
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    const userPayload = buildUserPayload(user);

    return res.json({
      message: 'Register successful',
      user: userPayload,
      token,
    });
  } catch (err) {
    console.error('REGISTER ERROR RAW =', err);
    return res.status(400).json({ error: err.message || 'Validation error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, email, phone, phoneNumber, password } = req.body;

    // รับค่า login ได้หลายแบบ
    const loginIdentity = username || email || phoneNumber || phone;

    if (!loginIdentity || !password) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ' });
    }

    // ค้นหา User (รองรับทั้ง username, email, และ phoneNumber)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: loginIdentity },
          { email: loginIdentity },
          { phoneNumber: loginIdentity } // ✅ เช็คที่ phoneNumber
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'ไม่พบผู้ใช้งาน' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    const userPayload = buildUserPayload(user);

    return res.json({
      message: 'Login successful',
      user: userPayload,
      token,
    });
  } catch (err) {
    console.error('LOGIN ERROR RAW =', err);
    return res.status(500).json({ error: err.message });
  }
};