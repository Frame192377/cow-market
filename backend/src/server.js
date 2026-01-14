// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // ✅ เพิ่ม fs เพื่อจัดการไฟล์/โฟลเดอร์
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const cowRoutes = require('./routes/cows'); 
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const marketRoutes = require('./routes/markets');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// ✅ จัดการ Static Files (รูปภาพ) ให้รัดกุมขึ้น
const uploadDir = path.join(__dirname, '..', 'uploads');

// 1. ถ้ายังไม่มีโฟลเดอร์ uploads ให้สร้างใหม่เลย
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📂 Created uploads folder at:', uploadDir);
}

// 2. บอกว่า path นี้คือ static file
app.use('/uploads', express.static(uploadDir));
console.log('📂 Serving static files from:', uploadDir); // log ดูว่า path ถูกไหม

// log ทุก request ที่มาถึง (debug)
app.use((req, res, next) => {
  console.log('INCOMING:', req.method, req.url);
  next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/cows', cowRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/admin", adminRoutes);

// เชื่อมต่อ DB
sequelize.authenticate()
  .then(() => {
    console.log('DB connected');
    // ✅ ใช้ alter: true เพื่อให้อัปเดตโครงสร้างตาราง (เช่น เพิ่ม username, sireName)
    return sequelize.sync({});
  })
  .then(() => {
    console.log('DB synced');
  })
  .catch(err => {
    console.error('DB error:', err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});