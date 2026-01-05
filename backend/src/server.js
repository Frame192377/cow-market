// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const cowRoutes = require('./routes/cows'); 
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const marketRoutes = require('./routes/markets');

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// log ทุก request ที่มาถึง (debug)
app.use((req, res, next) => {
  console.log('INCOMING:', req.method, req.url);
  next();
});

// routes
app.use('/api/auth', authRoutes); // -> /api/auth/register, /api/auth/login
app.use('/api/cows', cowRoutes);  // -> /api/cows (GET, POST, PUT, DELETE)
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/markets', marketRoutes);

// เชื่อมต่อ DB และ sync schema ให้ตรงกับ models
sequelize.authenticate()
  .then(() => {
    console.log('DB connected');
    // อัปเดตตารางให้ตรงกับ model (จะเพิ่ม column description ให้)
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
