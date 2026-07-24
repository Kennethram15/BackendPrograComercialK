const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuarios = sequelize.define(
    'Usuarios',
    {
      id_usuarios: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      usuario: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nombre_usuario: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      telefono_usuario: {
        type: DataTypes.STRING(20),
      },
      correo_usuario: {
        type: DataTypes.STRING(150),
      },
      dpi_usuario: {
        type: DataTypes.STRING(20),
      },
      estado_usuario: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'usuarios',
      hooks: {
        beforeCreate: async (usuario) => {
          usuario.password = await bcrypt.hash(usuario.password, 10);
        },
        beforeUpdate: async (usuario) => {
          if (usuario.changed('password')) {
            usuario.password = await bcrypt.hash(usuario.password, 10);
          }
        },
      },
    }
  );

  Usuarios.associate = (models) => {
    Usuarios.belongsTo(models.Roles, {
      foreignKey: 'id_rol',
      as: 'rol',
    });
    Usuarios.hasMany(models.Venta, {
      foreignKey: 'id_usuario',
      as: 'ventas',
    });
  };

  return Usuarios;
};