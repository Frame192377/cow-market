// backend/src/models/Cow.js
module.exports = (sequelize, DataTypes) => {
  const Cow = sequelize.define('Cow', {
    name: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false },
    breed: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    
    // ข้อมูลพ่อพันธุ์
    sireName: { type: DataTypes.STRING, allowNull: true },
    
    // ข้อมูลตลาดนัด
    marketId: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },

    // ประวัติวัคซีน
    vaccineHistory: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    description: { type: DataTypes.TEXT, allowNull: true },
    images: { type: DataTypes.JSON, allowNull: true },
    
    // ✅ แก้ไขตรงนี้: เพิ่มสถานะ pending, approved, rejected
    status: { 
      type: DataTypes.ENUM('pending', 'approved', 'sold', 'rejected'), 
      defaultValue: 'pending', // เริ่มต้นเป็น 'รออนุมัติ' เสมอ
      allowNull: false 
    },
  }, { timestamps: true });

  Cow.associate = (models) => {
    Cow.belongsTo(models.User, { foreignKey: "userId", as: "User" });
    
    if (models.Market) {
      Cow.belongsTo(models.Market, { foreignKey: "marketId", as: "Market" });
    }
    
    if (models.CowImage) {
      Cow.hasMany(models.CowImage, { foreignKey: "cowId", as: "Images" });
    }
  };
  
  return Cow;
};