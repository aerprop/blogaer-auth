'use strict';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import models from '../models/MainModel';

config();

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(_, __) {
    const userData = [
      {
        id: 'cca29307-a21d-4b45-8932-e60ab4ab005e',
        username: 'SuperAdmin',
        email: 'superadmin@mail.com',
        name: 'Super Admin',
        description: 'The administrator',
        roleId: 1
      },
      {
        id: '239da839-477c-4502-b34e-e0979dd337fd',
        username: 'FirstUser',
        email: 'firstuser@mail.com',
        name: 'First User',
        description: 'The test user',
        roleId: 2
      }
    ];

    const createUserData = async (user) => {
      const model = await models;
      return model.user.create({
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
