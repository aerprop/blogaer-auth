'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
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
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      picture: {
        type: Sequelize.STRING
      },
      banner: {
        type: Sequelize.STRING
      },
      roleId: {
        allowNull: false,
        type: Sequelize.TINYINT,
        defaultValue: 2,
        field: 'role_id',
        references: {
          model: 'user_roles',
          key: 'id'
        }
      },
      verified: {
        type: Sequelize.BOOLEAN
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
      },
      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE,
        field: 'deleted_at'
      }
    });
  },

  async down(queryInterface, _) {
    await queryInterface.dropTable('Users');
  }
};
