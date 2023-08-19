'use strict';
module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
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

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });
  };

  return RefreshToken;
};
