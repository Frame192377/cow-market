module.exports = (sequelize, DataTypes) => {
  const CowImage = sequelize.define(
    "CowImage",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      cowId: { type: DataTypes.INTEGER, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "cow_images",
      timestamps: false,
    }
  );

  // Associations
  CowImage.associate = (models) => {
    CowImage.belongsTo(models.Cow, {
      foreignKey: "cowId",
      as: "Cow",
    });
  };

  return CowImage;
};
