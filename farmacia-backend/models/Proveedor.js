module.exports = (sequelize, DataTypes) => {
  const Proveedor = sequelize.define(
    'Proveedor',
    {
      id_proveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_casa_medica: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nombre_proveedor: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      estado_proveedor: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      telefono_proveedor: {
        type: DataTypes.STRING(20),
      },
      direccion_proveedor: {
        type: DataTypes.STRING(255),
      },
      correo_proveedor: {
        type: DataTypes.STRING(150),
      },
      total_adquirido_proveedor: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      cantidad_adquirido_proveedor: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'proveedor',
    }
  );

  Proveedor.associate = (models) => {
    // M:1 -> CasaMedica
    Proveedor.belongsTo(models.CasaMedica, {
      foreignKey: 'id_casa_medica',
      as: 'casaMedica',
    });
    // 1:M -> Compras
    Proveedor.hasMany(models.Compras, {
      foreignKey: 'id_proveedor',
      as: 'compras',
    });
    // 1:M -> DetalleCompra
    Proveedor.hasMany(models.DetalleCompra, {
      foreignKey: 'id_proveedor',
      as: 'detalleCompras',
    });
  };

  return Proveedor;
};
