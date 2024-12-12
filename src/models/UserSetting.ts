'use strict';
import type { MainModel } from './MainModel';
import { TwoFAMethod } from '../utils/enums';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface UserSettingModel {
  id?: number;
  userId: string;
  twoFaEnabled?: boolean;
  twoFaMethod?: TwoFAMethod;
  preference?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserSetting extends Model<UserSettingModel>, UserSettingModel {}

type UserSettingStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserSetting;
  associate: (model: MainModel) => void;
};

const UserSetting = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const userSetting = sequelize.define<UserSetting>(
    'UserSetting',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        type: dataTypes.INTEGER
      },
      userId: {
        allowNull: false,
        type: dataTypes.UUID
      },
      twoFaEnabled: {
        type: dataTypes.BOOLEAN,
        defaultValue: false
      },
      twoFaMethod: {
        type: dataTypes.STRING,
        defaultValue: TwoFAMethod.Passkey
      },
      preference: {
        type: dataTypes.JSON
      },
      createdAt: {
        type: dataTypes.DATE
      },
      updatedAt: {
        type: dataTypes.DATE
      }
    },
    {
      tableName: 'user_settings',
      underscored: true,
      hooks: {
        afterCreate: (userSetting) => {
          console.log(
            `(userId: ${userSetting.userId}) Setting has been ADDED.`
          );
        }
      }
    }
  ) as UserSettingStatic;

  userSetting.associate = (model: MainModel) => {
    if (model.user) {
      userSetting.belongsTo(model.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return userSetting;
};

export default UserSetting;
