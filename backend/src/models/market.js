// models/Market.js
module.exports = (sequelize, DataTypes) => {
  const Market = sequelize.define("Market", {
    name: {
      type: DataTypes.STRING,
      allowNull: false, // จำเป็นต้องมี
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false, // จำเป็นต้องมี
    },
    date: {
      type: DataTypes.STRING, 
      // ใช้เก็บรวมทั้งวันและเวลาตามที่ Frontend ส่งมา 
      // เช่น "ทุกวันเสาร์ 05:00 - 12:00 น."
      allowNull: false, 
    },
    // ❌ ลบ time ออก เพราะเรารวมไว้ใน date แล้ว และ Frontend ไม่ได้ส่งแยกมา
    contact: {
      type: DataTypes.STRING, // ✅ เพิ่มช่องเก็บเบอร์โทรศัพท์
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON, // ✅ ใช้ JSON เก็บชื่อไฟล์รูปหลายรูป ["a.jpg", "b.jpg"]
      defaultValue: [] // ถ้าไม่มีรูปให้เป็น array ว่าง
    },
    mapLink: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  return Market;
};