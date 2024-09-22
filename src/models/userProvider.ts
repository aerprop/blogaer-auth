'use strict';
import type { Models } from '.';
import { DataTypes, Sequelize, Model } from 'sequelize';

interface UserProviderModel {
  provider: string;
  userId: string;
}

interface UserProvider extends Model<UserProviderModel>, UserProviderModel {}

export type UserProviderStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserProvider;
  associate: (models: Models) => void;
};

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

  userProvider.associate = (models: Models) => {
    if (models.user) {
      userProvider.belongsTo(models.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return userProvider;
};

export default UserProvider;
