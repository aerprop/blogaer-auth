'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('user_roles', [
      {
        id: 1,
        role: 'Admin'
      },
      {
        id: 2,
        role: 'Author'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('user_roles', null);
  }
};
