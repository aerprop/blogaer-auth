'use strict';
import { DataTypes, Dialect, Sequelize } from 'sequelize';
import sequelizeConfig from '../config/sequelizeConfig';
import User from './User';
import UserRole from './UserRole';
import RefreshToken from './RefreshToken';
import UserOauth from './UserOauth';
import UserSocial from './UserSocial';
import UserPasskey from './UserPasskey';
import UserSetting from './UserSetting';
import UserTotpSecret from './UserTotpSecret';
import SavedAccount from './SavedAccount';
import UserRequest from './UserRequest';

export type MainModel = {
  refreshToken: ReturnType<typeof RefreshToken>;
  savedAccount: ReturnType<typeof SavedAccount>;
  user: ReturnType<typeof User>;
  userRole: ReturnType<typeof UserRole>;
  userOauth: ReturnType<typeof UserOauth>;
  userSocial: ReturnType<typeof UserSocial>;
  userPasskey: ReturnType<typeof UserPasskey>;
  userTotpSecret: ReturnType<typeof UserTotpSecret>;
  userSetting: ReturnType<typeof UserSetting>;
  userRequest: ReturnType<typeof UserRequest>;
  dataTypes: typeof DataTypes;
  sequelize: Sequelize;
};

async function dbConnect(sequelize: Sequelize, retries = 0) {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connected to Sqlite database ✔✔✔');
  } catch (error) {
    console.error(
      'Failed to connect to Sqlite database:',
      retries < 5 ? 'Retrying in 60 seconds.' : 'Max retries have been reached.'
    );
    if (retries >= 5) {
      console.error('Failed to connect to MySQL after 5 attempts ✖✖✖');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 60000));

    return dbConnect(sequelize, retries + 1);
  }
}

let MainModel: MainModel | null = null;

async function initMainModel() {
  if (MainModel != null) return MainModel;

  const config = sequelizeConfig.development;
  const sequelize = new Sequelize({
    username: config.username,
    password: config.password,
    database: config.database,
    dialect: config.dialect as Dialect,
    host: config.host,
    storage: config.storage,
    logging: false
  });

  await dbConnect(sequelize);

  MainModel = {
    refreshToken: RefreshToken(sequelize, DataTypes),
    savedAccount: SavedAccount(sequelize, DataTypes),
    user: User(sequelize, DataTypes),
    userRole: UserRole(sequelize, DataTypes),
    userOauth: UserOauth(sequelize, DataTypes),
    userSocial: UserSocial(sequelize, DataTypes),
    userPasskey: UserPasskey(sequelize, DataTypes),
    userTotpSecret: UserTotpSecret(sequelize, DataTypes),
    userSetting: UserSetting(sequelize, DataTypes),
    userRequest: UserRequest(sequelize, DataTypes),
    dataTypes: DataTypes,
    sequelize
  };
  Object.values(MainModel).forEach((model) => {
    if ('associate' in model && MainModel) {
      model.associate(MainModel);
    }
  });

  return MainModel;
}

export default initMainModel();
