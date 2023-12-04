'use strict';

import sequelize, { BelongsTo, Model, Sequelize } from 'sequelize';
import Models from '.';

interface RefreshTokenModel {
  token: string,
  user_id: string,
}

interface RefreshToken extends Model<RefreshTokenModel>, RefreshTokenModel {};

export type RefreshTokenStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): RefreshToken;
  associate: (models: typeof Models) => void;
}

const DataTypes = sequelize;
const RefreshToken = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const refreshToken = sequelize.define<RefreshToken>(
    'RefreshToken',
    {
      token: {
        allowNull: false,
        type: dataTypes.STRING
      },
      user_id: {
        allowNull: false,
        type: dataTypes.UUID
      }
    },
    {
      tableName: 'refresh_tokens',
      underscored: true
    }
  ) as RefreshTokenStatic;

  refreshToken.associate = (models: typeof Models) => {
    if (models.User) {
      refreshToken.belongsTo(models.User, {
        foreignKey: 'user_id',
        targetKey: 'id'
      });
    }
  };

  return refreshToken;
};

export default RefreshToken;
