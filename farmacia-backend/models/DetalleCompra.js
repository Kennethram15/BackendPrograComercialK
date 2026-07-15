module.exports = (sequelize, DataTypes) => {
  const DetalleCompra = sequelize.define(
    'DetalleCompra',
    {
      id_detalle_compra: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_compra: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_proveedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_medicamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad_detalle_compra: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subtotal_detalle_compra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      estado_detalle_compra: {
        type: DataTypes.STRING(30),
        defaultValue: 'activo',
      },
    },
    {
      tableName: 'detalle_compra',
    }
  );

  DetalleCompra.associate = (models) => {
    // M:1 -> Compras
    DetalleCompra.belongsTo(models.Compras, {
      foreignKey: 'id_compra',
      as: 'compra',
    });
    // M:1 -> Proveedor
    DetalleCompra.belongsTo(models.Proveedor, {
      foreignKey: 'id_proveedor',
      as: 'proveedor',
    });
    // M:1 -> Medicamento
    DetalleCompra.belongsTo(models.Medicamento, {
      foreignKey: 'id_medicamento',
      as: 'medicamento',
    });
  };

  return DetalleCompra;
};
