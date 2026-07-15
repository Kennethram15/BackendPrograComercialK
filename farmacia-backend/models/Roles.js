module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define(
    'Roles',
    {
      id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_rol: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      estado_rol: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'roles',
    }
  );

  Roles.associate = (models) => {
    // 1:M -> Usuarios
    Roles.hasMany(models.Usuarios, {
      foreignKey: 'id_rol',
      as: 'usuarios',
    });
  };

  return Roles;
};
