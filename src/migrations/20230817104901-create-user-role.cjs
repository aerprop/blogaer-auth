'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TINYINT
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roles');
  }
};
