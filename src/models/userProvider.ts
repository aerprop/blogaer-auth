'use strict';

import sequelize, { Model, Sequelize } from 'sequelize';
import Models from '.';

interface UserProviderModel {
  provider: string;
  userId: string;
}

interface UserProvider extends Model<UserProviderModel>, UserProviderModel {}

export type UserProviderStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserProvider;
  associate: (models: typeof Models) => void;
};

const DataTypes = sequelize;
const UserProvider = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const userProvider = sequelize.define<UserProvider>(
    'UserProvider',
    {
      provider: {
        allowNull: false,
        type: dataTypes.STRING
      },
      userId: {
        allowNull: false,
        type: dataTypes.UUID
      }
    },
    {
      tableName: 'user_providers',
      underscored: true
    }
  ) as UserProviderStatic;

  userProvider.associate = (models: typeof Models) => {
    if (models.User) {
      userProvider.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return userProvider;
};

export default UserProvider;
