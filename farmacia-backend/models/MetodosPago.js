module.exports = (sequelize, DataTypes) => {
  const MetodosPago = sequelize.define(
    'MetodosPago',
    {
      id_metodo_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_metodo_pago: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      cuenta_metodo_pago: {
        type: DataTypes.STRING(50),
      },
      estado_metodo_pago: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'metodos_pago',
    }
  );

  MetodosPago.associate = (models) => {
    // 1:M -> DetalleMetodosPago
    MetodosPago.hasMany(models.DetalleMetodosPago, {
      foreignKey: 'id_metodo_pago',
      as: 'detalles',
    });
  };

  return MetodosPago;
};
