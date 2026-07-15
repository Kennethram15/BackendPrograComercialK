module.exports = (sequelize, DataTypes) => {
  const CasaMedica = sequelize.define(
    'CasaMedica',
    {
      id_casa_medica: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_casa_medica: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      estado_casa_medica: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'casa_medica',
    }
  );

  CasaMedica.associate = (models) => {
    // 1:M -> Proveedor
    CasaMedica.hasMany(models.Proveedor, {
      foreignKey: 'id_casa_medica',
      as: 'proveedores',
    });
  };

  return CasaMedica;
};
