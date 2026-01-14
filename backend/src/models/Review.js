module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true },
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, { as: 'Reviewer', foreignKey: 'reviewerId' }); // คนรีวิว
    Review.belongsTo(models.User, { as: 'Seller', foreignKey: 'sellerId' });     // คนถูกรีวิว (ผู้ขาย)
    Review.belongsTo(models.Order, { as: 'Order', foreignKey: 'orderId' });      // รีวิวจากออเดอร์ไหน
  };

  return Review;
};