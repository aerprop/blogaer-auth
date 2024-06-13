'use strict';

import sequelize, { BelongsTo, HasMany, Model, ModelStatic } from 'sequelize';
import { Sequelize } from 'sequelize';
import Models from '.';
import UserRole from './userRole';
import RefreshToken from './refreshToken';
import UserProvider from './userProvider';

interface UserModel {
  id?: string;
  username: string;
  email: string;
  password?: string;
  picture?: string;
  roleId?: number;
  verified?: boolean;
}

interface User extends Model<UserModel>, UserModel {}

export type UserStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): User;
  associate: (models: typeof Models) => void;
  UserRole: BelongsTo<User, UserRole>;
  RefreshToken: HasMany<User, RefreshToken>;
  UserProvider: HasMany<User, UserProvider>;
};

const User = (sequelizeObj: Sequelize, dataTypes: typeof sequelize) => {
  const user = sequelizeObj.define<User>(
    'User',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4
      },
      username: {
        allowNull: false,
        type: dataTypes.STRING
      },
      email: {
        allowNull: false,
        type: dataTypes.STRING
      },
      password: {
        allowNull: true,
        type: dataTypes.STRING
      },
      picture: {
        allowNull: true,
        type: dataTypes.STRING
      },
      roleId: {
        allowNull: false,
        type: dataTypes.TINYINT,
        defaultValue: 2,
      },
      verified: {
        type: dataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'users',
      underscored: true,
      paranoid: true,
      hooks: {
        afterCreate: (user) => {
          console.log(
            `(user: ${user.username} | email: ${user.email}) has REGISTERED`
          );
        }
      }
    }
  ) as UserStatic;

  user.associate = (models: typeof Models) => {
    if (models.UserRole && models.RefreshToken && models.UserProvider) {
      user.UserRole = user.belongsTo(models.UserRole, {
        foreignKey: 'role_id',
        targetKey: 'id'
      });

      user.RefreshToken = user.hasMany(models.RefreshToken, {
        foreignKey: 'user_id'
      });

      user.UserProvider = user.hasMany(models.UserProvider, {
        foreignKey: 'user_id'
      })
    }
  };

  return user;
};

export default User;
