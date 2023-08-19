'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    role: {
      allowNull: false,
      type: DataTypes.STRING
    }
  });

  UserRole.associate = (models) => {
    UserRole.hasMany(models.User, { foreignKey: 'role_id', targetKey: 'id' });
  };
  return UserRole;
};
