// backend/src/models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: { 
      type: DataTypes.STRING, 
      allowNull: true, 
      unique: true 
    },
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
    phoneNumber: { 
      type: DataTypes.STRING, 
      allowNull: true, 
      unique: false 
    },
    
    // ✅ 2 คอลัมน์สำหรับช่องทางติดต่อ
    facebook: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    line: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },

    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    
    // ✅✅✅ แก้ไข Role เพื่อรองรับ Admin
    role: { 
      type: DataTypes.ENUM('user', 'admin'), // บังคับค่าได้แค่ 'user' หรือ 'admin'
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

  User.associate = (models) => {
    // 1. User มีวัวหลายตัว
    User.hasMany(models.Cow, {
      foreignKey: "userId",
      as: "Cows", 
    });

    // 2. User มีสินค้าหลายชิ้น
    if (models.Product) {
      User.hasMany(models.Product, {
        foreignKey: "userId",
        as: "Products",
      });
    }

    // 3. User เป็นเจ้าของตลาดนัดได้หลายแห่ง
    if (models.Market) {
      User.hasMany(models.Market, {
        foreignKey: "userId",
        as: "Markets",
      });
    }
  };

  return User;
};