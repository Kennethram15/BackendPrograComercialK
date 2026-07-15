module.exports = (sequelize, DataTypes) => {
  const Compras = sequelize.define(
    'Compras',
    {
      id_compra: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_proveedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_compra: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado_compra: {
        type: DataTypes.STRING(30),
        defaultValue: 'pendiente',
      },
      total_compra: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: 'compras',
    }
  );

  Compras.associate = (models) => {
    // M:1 -> Proveedor
    Compras.belongsTo(models.Proveedor, {
      foreignKey: 'id_proveedor',
      as: 'proveedor',
    });
    // 1:M -> DetalleCompra
    Compras.hasMany(models.DetalleCompra, {
      foreignKey: 'id_compra',
      as: 'detalles',
    });
  };

  return Compras;
};
