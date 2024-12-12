'use strict';
import {
  AuthenticatorTransportFuture,
  Base64URLString,
  CredentialDeviceType
} from '@simplewebauthn/server/script/deps';
import type { MainModel } from './MainModel';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface UserPasskeyModel {
  id: Base64URLString;
  userId: string;
  clientId: string;
  clientBrowser: string;
  clientOs: string;
  isMobile: boolean;
  publicKey: Uint8Array;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
  createdAt?: string;
  updatedAt?: string;
}

interface UserPasskey extends Model<UserPasskeyModel>, UserPasskeyModel {}

type UserPasskeyStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserPasskey;
  associate: (model: MainModel) => void;
};

const UserPasskey = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const userPasskey = sequelize.define<UserPasskey>(
    'UserPasskey',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: dataTypes.STRING
      },
      userId: {
        allowNull: false,
        type: dataTypes.UUID
      },
      clientId: {
        allowNull: false,
        type: dataTypes.STRING
      },
      clientBrowser: {
        allowNull: false,
        type: dataTypes.STRING
      },
      clientOs: {
        allowNull: false,
        type: dataTypes.STRING
      },
      isMobile: {
        allowNull: false,
        type: dataTypes.BOOLEAN
      },
      publicKey: {
        allowNull: false,
        type: dataTypes.BLOB
      },
      counter: {
        allowNull: false,
        type: dataTypes.INTEGER
      },
      deviceType: {
        allowNull: false,
        type: dataTypes.STRING
      },
      backedUp: {
        allowNull: false,
        type: dataTypes.BOOLEAN
      },
      transports: {
        allowNull: false,
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
      tableName: 'user_passkeys',
      underscored: true,
      hooks: {
        afterCreate: (userPasskey) => {
          console.log(
            `(userId: ${userPasskey.userId} | device: ${userPasskey.deviceType}) passkey has been ADDED.`
          );
        }
      }
    }
  ) as UserPasskeyStatic;

  userPasskey.associate = (model: MainModel) => {
    if (model.user) {
      userPasskey.belongsTo(model.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return userPasskey;
};

export default UserPasskey;
