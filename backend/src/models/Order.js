// backend/src/models/Order.js
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    customerName: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    paymentMethod: { type: DataTypes.ENUM('cod', 'transfer'), allowNull: false },
    slipImage: { type: DataTypes.STRING, allowNull: true }, // เก็บ path รูปสลิป
    
    status: { 
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'), 
      defaultValue: 'pending' 
    },
    
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },

    // ✅ เพิ่มค่าจัดส่ง
    shippingCost: { 
      type: DataTypes.DECIMAL(10, 2), 
      defaultValue: 0.00,
      allowNull: false
    }
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { as: 'Buyer', foreignKey: 'buyerId' });
    Order.belongsTo(models.User, { as: 'Seller', foreignKey: 'sellerId' });
    Order.belongsTo(models.Product, { as: 'Product', foreignKey: 'productId' });
    Order.hasOne(models.Review, { as: 'Review', foreignKey: 'orderId' });
  };

  return Order;
};