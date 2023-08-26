'use strict';

const UserRole = (sequelize, DataTypes) => {
  const userRole = sequelize.define('UserRole', {
    role: {
      allowNull: false,
      type: DataTypes.STRING
    }
  });

  userRole.associate = (models) => {
    userRole.hasMany(models.User, { foreignKey: 'role_id', targetKey: 'id' });
  };
  return userRole;
};

export default UserRole;
