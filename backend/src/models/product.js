// backend/src/models/product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      name: { type: DataTypes.STRING, allowNull: false },

      // ประเภทสินค้า เช่น medicine, supplement, other
      category: { type: DataTypes.STRING, allowNull: false },

      price: { type: DataTypes.FLOAT, allowNull: false },

      description: { type: DataTypes.TEXT, allowNull: true },

      images: { type: DataTypes.JSON, allowNull: true },
    },
    { timestamps: true }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: "userId",
      as: "User",
    });
  };

  return Product;
};
