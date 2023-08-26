'use strict';
import Sequelize from 'sequelize';
import process from 'process';
import config from '../config/config.js';
import User from './user.js';
import UserRole from './userRole.js';
import RefreshToken from './refreshToken.js';

const env = process.env.NODE_ENV || 'development';
const Model = {};

let sequelize;
if (config[env].use_env_variable) {
  sequelize = new Sequelize(
    process.env[config[env].use_env_variable],
    config[env]
  );
} else {
  sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    config[env]
  );
}

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database', error);
  });

Model.User = User(sequelize, Sequelize.DataTypes);
Model.UserRole = UserRole(sequelize, Sequelize.DataTypes);
Model.RefreshToken = RefreshToken(sequelize, Sequelize.DataTypes);

Object.keys(Model).forEach((modelName) => {
  if (Model[modelName].associate) {
    Model[modelName].associate(Model);
  }
});

Model.sequelize = sequelize;
Model.Sequelize = Sequelize;

export default Model;
