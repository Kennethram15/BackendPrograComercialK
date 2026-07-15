module.exports = (sequelize, DataTypes) => {
  const DetalleVenta = sequelize.define(
    'DetalleVenta',
    {
      id_detalle_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_medicamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_venta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad_detalle_venta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subtotal_detalle_venta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      estado_detalle_venta: {
        type: DataTypes.STRING(30),
        defaultValue: 'activo',
      },
    },
    {
      tableName: 'detalle_venta',
    }
  );

  DetalleVenta.associate = (models) => {
    // M:1 -> Medicamento
    DetalleVenta.belongsTo(models.Medicamento, {
      foreignKey: 'id_medicamento',
      as: 'medicamento',
    });
    // M:1 -> Venta
    DetalleVenta.belongsTo(models.Venta, {
      foreignKey: 'id_venta',
      as: 'venta',
    });
  };

  return DetalleVenta;
};
