'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        type: Sequelize.TINYINT
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING
      }
    });
  },

  async down(queryInterface, _) {
    await queryInterface.dropTable('user_roles');
  }
};
