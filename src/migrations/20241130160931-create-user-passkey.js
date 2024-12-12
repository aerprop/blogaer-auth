'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_passkeys', {
      id: {
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
      clientBrowser: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'client_browser'
      },
      clientOs: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'client_os'
      },
      isMobile: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        field: 'is_mobile'
      },
      publicKey: {
        allowNull: false,
        type: Sequelize.BLOB,
        field: 'public_key'
      },
      counter: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      deviceType: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'device_type'
      },
      backedUp: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        field: 'backed_up'
      },
      transports: {
        allowNull: false,
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
    await queryInterface.dropTable('user_passkeys');
  }
};
