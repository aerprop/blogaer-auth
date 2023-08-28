'use strict';

const RefreshToken = (sequelize, DataTypes) => {
  const refreshToken = sequelize.define(
    'RefreshToken',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      token: {
        allowNull: false,
        type: DataTypes.STRING
      },
      user_id: {
        allowNull: false,
        type: DataTypes.UUID
      }
    },
    {
      tableName: 'refresh_tokens',
      underscored: true
    }
  );

  refreshToken.associate = (models) => {
    refreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });
  };

  return refreshToken;
};

export default RefreshToken;
