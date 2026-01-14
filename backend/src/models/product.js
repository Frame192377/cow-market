// backend/src/models/product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    
    // ประเภทสินค้า เช่น medicine, supplement, other
    category: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    price: { 
      type: DataTypes.FLOAT, 
      allowNull: false 
    },

    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    images: { 
      type: DataTypes.JSON, 
      allowNull: true 
    },

    stock: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      defaultValue: 1 
    },

    // ✅ เพิ่มสถานะสินค้า: pending (รออนุมัติ), approved (ขายได้), sold (ขายแล้ว), rejected (ไม่ผ่าน)
    status: { 
      type: DataTypes.ENUM('pending', 'approved', 'sold', 'rejected'), 
      defaultValue: 'pending', 
      allowNull: false 
    },
  }, { 
    timestamps: true 
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, { 
      foreignKey: "userId", 
      as: "User" 
    });
  };

  return Product;
};