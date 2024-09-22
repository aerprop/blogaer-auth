'use strict';
import type { Models } from '.';
import { DataTypes, Sequelize, Model } from 'sequelize';

interface RefreshTokenModel {
  token: string;
  userId: string;
  clientId: string;
  createdAt?: typeof DataTypes.DATE;
  updatedAt?: typeof DataTypes.DATE;
}

interface RefreshToken extends Model<RefreshTokenModel>, RefreshTokenModel {}

export type RefreshTokenStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): RefreshToken;
  associate: (models: Models) => void;
};

const RefreshToken = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const refreshToken = sequelize.define<RefreshToken>(
    'RefreshToken',
    {
      token: {
        allowNull: false,
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
        async beforeUpdate(instance, _) {
          if (!instance.updatedAt) return;
          const updatedAt = new Date(instance.updatedAt.toString()).getTime();
          const sessionTimeLimit = new Date(updatedAt + 24 * 60 * 60 * 1000).getTime();
          const now = Date.now();

          if (sessionTimeLimit < now) await instance.destroy();
        }
      }
    }
  ) as RefreshTokenStatic;

  refreshToken.associate = (models: Models) => {
    if (models.user) {
      refreshToken.belongsTo(models.user, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return refreshToken;
};

export default RefreshToken;
