'use strict';

import DataTypes, { Sequelize } from 'sequelize';
import process from 'process';
import sequelizeConfig from '../config/sequelizeConfig';
import User from './user';
import UserRole from './userRole';
import RefreshToken from './refreshToken';

const env = process.env.NODE_ENV || 'development';

type Models = {
  User: ReturnType<typeof User>;
  UserRole: ReturnType<typeof UserRole>;
  RefreshToken: ReturnType<typeof RefreshToken>;
  dataTypes: typeof DataTypes;
  Sequelize: Sequelize;
}

let sequelizeObj: Sequelize;
if (sequelizeConfig[env].use_env_variable) {
  sequelizeObj = new Sequelize(
    process.env[sequelizeConfig[env].use_env_variable] as string,
    sequelizeConfig[env]
  );
} else {
  sequelizeObj = new Sequelize(
    sequelizeConfig[env].database,
    sequelizeConfig[env].username,
    sequelizeConfig[env].password,
    sequelizeConfig[env]
  );
}

sequelizeObj
  .authenticate()
  .then(() => {
    console.log('Connected to mysql.');
  })
  .catch((error: Error) => {
    console.error('Unable to connect to the database', error);
  });

const models: Models = {
  User: User(sequelizeObj, DataTypes),
  UserRole: UserRole(sequelizeObj, DataTypes),
  RefreshToken: RefreshToken(sequelizeObj, DataTypes),
  dataTypes: DataTypes,
  Sequelize: sequelizeObj
};

Object.values(models).forEach((model) => {
  if ('associate' in model) {
    model.associate(models);
  }
});

export default models;
