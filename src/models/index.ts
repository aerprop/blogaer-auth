'use strict';

import DataTypes, { Sequelize } from 'sequelize';
import process from 'process';
import sequelizeConfig from '../config/sequelizeConfig';
import User from './user';
import UserRole from './userRole';
import RefreshToken from './refreshToken';
import UserProvider from './userProvider';

interface SequelizeConfig {
  development: {
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    host: string | undefined;
    dialect: string;
    use_env_variable?: string;
  };
}

type Models = {
  User: ReturnType<typeof User>;
  UserRole: ReturnType<typeof UserRole>;
  RefreshToken: ReturnType<typeof RefreshToken>;
  UserProvider: ReturnType<typeof UserProvider>;
  dataTypes: typeof DataTypes;
  Sequelize: Sequelize;
};

let sequelizeObj: Sequelize;
const config: SequelizeConfig['development'] = sequelizeConfig.development;
if (config.use_env_variable) {
  sequelizeObj = new Sequelize(
    process.env[config.use_env_variable] as string,
    config as any
  );
} else {
  sequelizeObj = new Sequelize(
    config.database as string,
    config.username as string,
    config.password as string,
    config as any
  );
}

sequelizeObj
  .authenticate()
  .then(() => {
    sequelizeObj.sync();
    console.log('Connected to mysql.');
  })
  .catch((error: Error) => {
    console.error('Unable to connect to the database', error);
  });

const models: Models = {
  User: User(sequelizeObj, DataTypes),
  UserRole: UserRole(sequelizeObj, DataTypes),
  RefreshToken: RefreshToken(sequelizeObj, DataTypes),
  UserProvider: UserProvider(sequelizeObj, DataTypes),
  dataTypes: DataTypes,
  Sequelize: sequelizeObj
};

Object.values(models).forEach((model) => {
  if ('associate' in model) {
    model.associate(models);
  }
});

export default models;
