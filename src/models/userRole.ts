'use strict';

import sequelize, { Model, ModelStatic, Sequelize } from 'sequelize';
import Models from '.';

interface UserRoleModel {
  id: number,
  role: string
}

interface UserRole extends Model<UserRoleModel>, UserRoleModel {};

export type UserRoleStatic = typeof Model & {
  new (values?: Record<string, unknown>, options?: any): UserRole;
  associate: (models: typeof Models) => void;
}

const DataTypes = sequelize;
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
      },
    },
    { tableName: 'user_roles' }
  ) as UserRoleStatic;
    
  userRole.associate = (models: typeof Models) => {
    if ( models.User) {
      userRole.hasMany(models.User, { foreignKey: 'role_id'});
    }
  }

  return userRole;
};

export default UserRole;
