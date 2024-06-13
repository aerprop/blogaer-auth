'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'users',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
        },
        username: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING
        },
        email: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        picture: {
          type: Sequelize.STRING
        },
        role_id: {
          allowNull: false,
          type: Sequelize.TINYINT,
          defaultValue: 2,
          references: {
            model: 'user_roles',
            key: 'id'
          }
        },
        verified: {
          type: Sequelize.BOOLEAN
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deleted_at: {
          type: Sequelize.DATE,
          defaultValue: null
        }
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
