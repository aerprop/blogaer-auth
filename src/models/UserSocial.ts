'use strict';
import type { MainModel } from './MainModel';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface UserSocialModel {
  id?: string;
  userId: string;
  social: string;
  link: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserSocial extends Model<UserSocialModel>, UserSocialModel {}

type UserSocialStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserSocial;
  associate: (model: MainModel) => void;
};

const UserSocial = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const userSocial = sequelize.define<UserSocial>(
    'UserSocial',
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
      social: {
        allowNull: false,
        type: dataTypes.UUID
      },
      link: {
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
      tableName: 'user_socials',
      underscored: true,
      hooks: {
        afterCreate: (userSocial) => {
          console.log(
            `(userId: ${userSocial.userId} | social: ${userSocial.social} | link: ${userSocial.link}) has been ADDED.`
          );
        }
      }
    }
  ) as UserSocialStatic;

  userSocial.associate = (model: MainModel) => {
    if (model.user) {
      userSocial.belongsTo(model.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return userSocial;
};

export default UserSocial;
