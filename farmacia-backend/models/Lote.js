module.exports = (sequelize, DataTypes) => {
  const Lote = sequelize.define(
    'Lote',
    {
      id_lote: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_medicamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_produccion: {
        type: DataTypes.DATEONLY,
      },
      precio_lote: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      estado_lote: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      existencia_lote: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'lote',
    }
  );

  Lote.associate = (models) => {
    // M:1 -> Medicamento
    Lote.belongsTo(models.Medicamento, {
      foreignKey: 'id_medicamento',
      as: 'medicamento',
    });
  };

  return Lote;
};
