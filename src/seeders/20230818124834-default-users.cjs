'use strict';
import Model from '../models';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();
export default {
  async up(queryInterface, Sequelize) {
    const userData = [
      {
        username: 'SuperAdmin',
        email: 'superadmin@mail.com',
        role_id: 1
      },
      {
        username: 'FirstUser',
        email: 'firstuser@mail.com',
        role_id: 2
      }
    ];

    const createUserData = async (user) => {
      return await Model.User.create({
        ...user,
        password: bcrypt.hashSync(process.env.USER_PASSWORD, 8),
        picture: null,
        created_at: new Date(),
        updated_at: new Date()
      });
    };

    const createdUsers = await Promise.all(userData.map(createUserData));
    return createdUsers;
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null);
  }
};
