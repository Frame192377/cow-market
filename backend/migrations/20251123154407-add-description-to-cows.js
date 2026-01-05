module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Cows', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Cows', 'description');
  },
};
