'use strict';
import { DataTypes, Dialect, Sequelize } from 'sequelize';
import sequelizeConfig from '../config/sequelizeConfig';
import User from './user';
import UserRole from './userRole';
import RefreshToken from './refreshToken';
import UserProvider from './userProvider';

export type Models = {
  user: ReturnType<typeof User>;
  userRole: ReturnType<typeof UserRole>;
  refreshToken: ReturnType<typeof RefreshToken>;
  userProvider: ReturnType<typeof UserProvider>;
  dataTypes: typeof DataTypes;
  sequelize: Sequelize;
};

async function mysqlConnect(sequelize: Sequelize, retries = 0) {
  try {
    const connection = await sequelize.authenticate();
    console.log('Connected to mysql ✔✔✔');

    return connection;
  } catch (error) {
    console.log(
      'Failed to connect to MySQL:',
      retries < 5
        ? 'Retrying in 60 seconds.'
        : 'Max retries have been reached.'
    );
    if (retries >= 5) {
      throw new Error('Failed to connect to MySQL after 5 attempts ✖✖✖');
    }
    await new Promise((resolve) => setTimeout(resolve, 60000));

    return mysqlConnect(sequelize, retries + 1);
  }
}

async function init() {
  const config = sequelizeConfig.development;
  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      dialect: config.dialect as Dialect,
      host: config.host,
      logging: false
    }
  );

  mysqlConnect(sequelize)
    .then(() => sequelize.sync())
    .catch((err) => console.log('Sequelize sync failed ✖✖✖', err));

  const models: Models = {
    user: User(sequelize, DataTypes),
    userRole: UserRole(sequelize, DataTypes),
    refreshToken: RefreshToken(sequelize, DataTypes),
    userProvider: UserProvider(sequelize, DataTypes),
    dataTypes: DataTypes,
    sequelize: sequelize
  };
  Object.values(models).forEach((model) => {
    if ('associate' in model) {
      model.associate(models);
    }
  });

  return models;
}

export default init();
