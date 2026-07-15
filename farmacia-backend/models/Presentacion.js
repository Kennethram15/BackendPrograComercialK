module.exports = (sequelize, DataTypes) => {
  const Presentacion = sequelize.define(
    'Presentacion',
    {
      id_presentacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_presentacion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      estado_presentacion: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'presentacion',
    }
  );

  Presentacion.associate = (models) => {
    // 1:M -> Medicamento
    Presentacion.hasMany(models.Medicamento, {
      foreignKey: 'id_presentacion',
      as: 'medicamentos',
    });
  };

  return Presentacion;
};
