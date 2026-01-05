// backend/src/models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'Unknown' 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: true, 
      unique: true 
    },
    
    // ✅ แก้ไข: เปลี่ยนจาก phone เป็น phoneNumber ให้ตรงกับ Controller
    phoneNumber: { 
      type: DataTypes.STRING, 
      allowNull: true, 
      unique: false // แนะนำให้เป็น false ถ้า user อาจจะยังไม่กรอก หรือกรอกซ้ำได้
    },

    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    role: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'user' 
    },
    avatar: { 
      type: DataTypes.STRING, 
      allowNull: true 
    }, 
    address: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    }, 
  }, { 
    timestamps: true, 
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt' 
  });

  // ⭐ ความสัมพันธ์
  User.associate = (models) => {
    User.hasMany(models.Cow, {
      foreignKey: "userId",
      as: "Cows", // ใช้ตอน include จากฝั่ง User
    });

    // ถ้ามี Product ด้วย:
    if (models.Product) {
      User.hasMany(models.Product, {
        foreignKey: "userId",
        as: "Products",
      });
    }
  };

  return User;
};