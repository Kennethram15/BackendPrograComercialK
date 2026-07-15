module.exports = (sequelize, DataTypes) => {
  const Venta = sequelize.define(
    'Venta',
    {
      id_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_venta: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      estado_venta: {
        type: DataTypes.STRING(30),
        defaultValue: 'completada',
      },
      total_venta: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: 'venta',
    }
  );

  Venta.associate = (models) => {
    // M:1 -> Cliente
    Venta.belongsTo(models.Cliente, {
      foreignKey: 'id_cliente',
      as: 'cliente',
    });
    // M:1 -> Usuarios
    Venta.belongsTo(models.Usuarios, {
      foreignKey: 'id_usuario',
      as: 'usuario',
    });
    // 1:M -> DetalleVenta
    Venta.hasMany(models.DetalleVenta, {
      foreignKey: 'id_venta',
      as: 'detalles',
    });
    // 1:M -> DetalleMetodosPago
    Venta.hasMany(models.DetalleMetodosPago, {
      foreignKey: 'id_venta',
      as: 'detalleMetodosPago',
    });
  };

  return Venta;
};
