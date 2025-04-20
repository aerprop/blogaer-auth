'use strict';
import { CommonStatus } from '../utils/enums';
import type { MainModel } from './MainModel';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface UserRequestModel {
  id?: number;
  userId: string;
  clientId: string;
  request: string;
  limit: Date;
  status: CommonStatus;
  otp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserRequest extends Model<UserRequestModel>, UserRequestModel {}

type UserRequestStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserRequest;
  associate: (model: MainModel) => void;
};

const UserRequest = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const userRequest = sequelize.define<UserRequest>(
    'UserRequest',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        type: dataTypes.INTEGER
      },
      userId: {
        allowNull: false,
        type: dataTypes.UUID
      },
      clientId: {
        allowNull: false,
        type: dataTypes.STRING
      },
      request: {
        allowNull: false,
        type: dataTypes.STRING
      },
      limit: {
        allowNull: false,
        type: dataTypes.DATE
      },
      status: {
        allowNull: false,
        type: dataTypes.STRING
      },
      otp: {
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
      tableName: 'user_requests',
      underscored: true
    }
  ) as UserRequestStatic;

  userRequest.associate = (model: MainModel) => {
    if (model.user) {
      userRequest.belongsTo(model.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return userRequest;
};

export default UserRequest;
