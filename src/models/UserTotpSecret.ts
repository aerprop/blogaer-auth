'use strict';
import type { MainModel } from './MainModel';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface UserTotpSecretModel {
  id?: string;
  userId: string;
  secret: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserTotpSecret extends Model<UserTotpSecretModel>, UserTotpSecretModel {}

type UserTotpSecretStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserTotpSecret;
  associate: (model: MainModel) => void;
};

const UserTotpSecret = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const userTotpSecret = sequelize.define<UserTotpSecret>(
    'UserTotpSecret',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        type: dataTypes.SMALLINT
      },
      userId: {
        allowNull: false,
        type: dataTypes.UUID
      },
      secret: {
        allowNull: false,
        type: dataTypes.STRING
      },
      createdAt: {
        type: dataTypes.DATE
      },
      updatedAt: {
        type: dataTypes.DATE
      }
    },
    {
      tableName: 'user_totp_secrets',
      underscored: true,
      hooks: {
        afterCreate: (userTotpSecret) => {
          console.log(
            `(userId: ${userTotpSecret.userId}) TOTP secret has been ADDED.`
          );
        }
      }
    }
  ) as UserTotpSecretStatic;

  userTotpSecret.associate = (model: MainModel) => {
    if (model.user) {
      userTotpSecret.belongsTo(model.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return userTotpSecret;
};

export default UserTotpSecret;
