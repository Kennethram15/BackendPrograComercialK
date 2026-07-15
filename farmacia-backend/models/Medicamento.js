module.exports = (sequelize, DataTypes) => {
  const Medicamento = sequelize.define(
    'Medicamento',
    {
      id_medicamento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_presentacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      codigo_barras: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      nombre_medicamento: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      cantidad_por_paquete: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      precio_mayorista: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      precio_minimo: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      precio_venta: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      componente_activo: {
        type: DataTypes.STRING(150),
      },
      estado_medicamento: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      venta_libre: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      existencia_total_medicamento: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'medicamento',
    }
  );

  Medicamento.associate = (models) => {
    // M:1 -> Presentacion
    Medicamento.belongsTo(models.Presentacion, {
      foreignKey: 'id_presentacion',
      as: 'presentacion',
    });
    // 1:M -> Lote
    Medicamento.hasMany(models.Lote, {
      foreignKey: 'id_medicamento',
      as: 'lotes',
    });
    // 1:M -> DetalleCompra
    Medicamento.hasMany(models.DetalleCompra, {
      foreignKey: 'id_medicamento',
      as: 'detalleCompras',
    });
    // 1:M -> DetalleVenta
    Medicamento.hasMany(models.DetalleVenta, {
      foreignKey: 'id_medicamento',
      as: 'detalleVentas',
    });
  };

  return Medicamento;
};
