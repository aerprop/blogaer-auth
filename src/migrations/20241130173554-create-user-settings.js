'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      twoFaEnabled: {
        type: Sequelize.BOOLEAN,
        field: 'two_fa_enabled'
      },
      twoFaMethod: {
        type: Sequelize.STRING,
        field: 'two_fa_method'
      },
      preference: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      }
    });
  },
  async down(queryInterface, _) {
    await queryInterface.dropTable('user_settings');
  }
};
