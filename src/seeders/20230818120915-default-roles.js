'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, _) {
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

  async down(queryInterface, _) {
    return queryInterface.bulkDelete('user_roles', null);
  }
};
