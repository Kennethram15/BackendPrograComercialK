module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define(
    'Cliente',
    {
      id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_cliente: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      nit_cliente: {
        type: DataTypes.STRING(20),
        defaultValue: 'C/F',
      },
      estado_cliente: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'cliente',
    }
  );

  Cliente.associate = (models) => {
    // 1:M -> Venta
    Cliente.hasMany(models.Venta, {
      foreignKey: 'id_cliente',
      as: 'ventas',
    });
  };

  return Cliente;
};
