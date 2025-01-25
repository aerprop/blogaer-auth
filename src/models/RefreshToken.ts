'use strict';
import { Op } from 'sequelize';
import type { MainModel } from './MainModel';
import { DataTypes, Sequelize, Model } from 'sequelize';
import { getMainModel } from '../utils/helper';
import User from './User';

interface RefreshTokenModel {
  token: string;
  userId: string;
  clientId: string;
  loginWith?: string;
  createdAt?: typeof DataTypes.DATE;
  updatedAt?: typeof DataTypes.DATE;
}

interface RefreshToken extends Model<RefreshTokenModel>, RefreshTokenModel {}

type RefreshTokenStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): RefreshToken;
  associate: (model: MainModel) => void;
};

const RefreshToken = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const refreshToken = sequelize.define<RefreshToken>(
    'RefreshToken',
    {
      token: {
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
      loginWith: {
        allowNull: false,
        defaultValue: 'credentials',
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
      tableName: 'refresh_tokens',
      underscored: true,
      hooks: {
        async afterCreate(attributes, _) {
          console.log(
            `(userId: ${attributes.userId} | clientId: ${attributes.clientId}) has Logged in.`
          );

          const model = await getMainModel();
          if (!model) {
            console.log('Database connection failed!');
            return;
          }

          type UserJoin = User & {
            UserSetting?: { twoFaMethod: string };
          };
          const user = (await model.user.findByPk(attributes.userId, {
            include: { model: model.userSetting, attributes: ['twoFaMethod'] }
          })) as UserJoin;
          if (user.UserSetting?.twoFaMethod) {
            const [savedAccount, isCreated] =
              await model.savedAccount.findOrCreate({
                where: { clientId: attributes.clientId },
                defaults: { clientId: attributes.clientId },
                include: {
                  model: model.user,
                  attributes: ['id']
                }
              });
            if (isCreated) {
              await savedAccount.addUser(user, {
                through: {
                  savedAccountClientId: attributes.clientId,
                  userId: attributes.userId
                }
              });
              console.log(
                `(userId: ${attributes.userId} | clientId: ${attributes.clientId}) Account has been saved.`
              );
            }
          } else {
            await model.userSetting.findOrCreate({
              where: { userId: attributes.userId },
              defaults: { userId: attributes.userId }
            });
          }
        },
        afterDestroy(instance, _) {
          console.log(
            `(userId: ${instance.userId} | clientId: ${instance.clientId}) has Logged out.`
          );
        }
      }
    }
  ) as RefreshTokenStatic;

  refreshToken.associate = (model: MainModel) => {
    if (model.user) {
      refreshToken.belongsTo(model.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  const aDayAgo = new Date();
  aDayAgo.setDate(aDayAgo.getDate() - 1);

  refreshToken.destroy({
    where: {
      updatedAt: {
        [Op.lt]: aDayAgo
      }
    }
  });

  return refreshToken;
};

export default RefreshToken;
