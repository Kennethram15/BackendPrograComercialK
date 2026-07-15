module.exports = (sequelize, DataTypes) => {
  const DetalleMetodosPago = sequelize.define(
    'DetalleMetodosPago',
    {
      id_detalle_metodos_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_venta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_metodo_pago: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad_detalle_metodos_pago: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      estado_detalle_metodos_pago: {
        type: DataTypes.STRING(30),
        defaultValue: 'activo',
      },
    },
    {
      tableName: 'detalle_metodos_pago',
    }
  );

  DetalleMetodosPago.associate = (models) => {
    // M:1 -> Venta
    DetalleMetodosPago.belongsTo(models.Venta, {
      foreignKey: 'id_venta',
      as: 'venta',
    });
    // M:1 -> MetodosPago
    DetalleMetodosPago.belongsTo(models.MetodosPago, {
      foreignKey: 'id_metodo_pago',
      as: 'metodoPago',
    });
  };

  return DetalleMetodosPago;
};
