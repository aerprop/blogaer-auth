'use strict';
import UserRole from './userRole';
import RefreshToken from './refreshToken';
import UserProvider from './userProvider';
import type { Models } from '.';
import { BelongsTo, DataTypes, HasMany, Model, Sequelize } from 'sequelize';

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
  associate: (models: Models) => void;
  UserRole: BelongsTo<User, UserRole>;
  RefreshToken: HasMany<User, RefreshToken>;
  UserProvider: HasMany<User, UserProvider>;
};

const User = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const user = sequelize.define<User>(
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
        defaultValue: 2
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

  user.associate = (models: Models) => {
    if (models.userRole && models.refreshToken && models.userProvider) {
      user.UserRole = user.belongsTo(models.userRole, {
        foreignKey: 'role_id',
        targetKey: 'id'
      });

      user.RefreshToken = user.hasMany(models.refreshToken, {
        foreignKey: 'user_id'
      });

      user.UserProvider = user.hasMany(models.userProvider, {
        foreignKey: 'user_id'
      });
    }
  };

  return user;
};

export default User;
