// backend/src/models/Market.js
module.exports = (sequelize, DataTypes) => {
  const Market = sequelize.define("Market", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON, 
      defaultValue: [] 
    },
    mapLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ✅ เพิ่ม userId เพื่อระบุเจ้าของโพสต์ตลาดนัด
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, 
    }
  }, {
    timestamps: true
  });

  // ✅✅✅ เพิ่มส่วน Association เพื่อแก้ Error
  Market.associate = (models) => {
    // 1. ตลาดนัดเป็นของ User คนไหน (แก้ Error EagerLoading)
    Market.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });

    // 2. ตลาดนัดมีวัวมาขายหลายตัว (Link กับ Cow)
    if (models.Cow) {
      Market.hasMany(models.Cow, { foreignKey: 'marketId', as: 'Cows' });
    }
  };

  return Market;
};