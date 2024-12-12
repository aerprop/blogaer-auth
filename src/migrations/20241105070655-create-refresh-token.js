'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      token: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: Sequelize.STRING
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      clientId: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'client_id'
      },
      loginWith: {
        allowNull: false,
        defaultValue: 'credentials',
        type: Sequelize.STRING,
        field: 'login_with'
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
    await queryInterface.dropTable('refresh_tokens');
  }
};
