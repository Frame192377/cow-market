module.exports = (sequelize, DataTypes) => {
  const Cow = sequelize.define('Cow', {
    name: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false },
    breed: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },

    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    images: { type: DataTypes.JSON, allowNull: true },
    
    // ✅ แก้ไข: เปลี่ยนจาก sold เป็น status เพื่อให้จัดการง่ายขึ้น
    status: { 
      type: DataTypes.STRING, 
      defaultValue: 'available', // ค่าเริ่มต้นคือ "ว่าง/ยังไม่ขาย"
      allowNull: false 
    },

  }, { timestamps: true });

  Cow.associate = (models) => {
    Cow.belongsTo(models.User, {
      foreignKey: "userId",
      as: "User", 
    });

    if (models.CowImage) {
      Cow.hasMany(models.CowImage, {
        foreignKey: "cowId",
        as: "Images",
      });
    }
  };
  
  return Cow;
};