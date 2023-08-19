'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING
      },
      picture: {
        type: DataTypes.STRING
      },
      role_id: {
        allowNull: false,
        type: DataTypes.TINYINT
      },
      verified: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      tableName: 'users',
      underscored: true,
      paranoid: true,
      hooks: {
        afterCreate: (user, options) => {
          console.log(
            `(user: ${user.username} | email: ${user.email}) has REGISTERED`
          );
        }
      }
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.UserRole, { foreignKey: 'role_id', targetKey: 'id' });

    User.hasMany(models.RefreshToken, {
      foreignKey: 'user_id',
      targetKey: 'id'
    });
  };

  return User;
};
