'use strict';
import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Models } from '.';

interface UserRoleModel {
  id: number;
  role: string;
}

interface UserRole extends Model<UserRoleModel>, UserRoleModel {}

export type UserRoleStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserRole;
  associate: (models: Models) => void;
};

const UserRole = (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const userRole = sequelize.define<UserRole>(
    'UserRole',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: dataTypes.TINYINT
      },
      role: {
        allowNull: false,
        type: dataTypes.STRING
      }
    },
    { tableName: 'user_roles', underscored: true }
  ) as UserRoleStatic;

  userRole.associate = (models: Models) => {
    if (models.user) {
      userRole.hasMany(models.user, { foreignKey: 'role_id' });
    }
  };

  return userRole;
};

export default UserRole;
