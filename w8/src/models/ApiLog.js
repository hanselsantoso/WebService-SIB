/**
 * MODEL API LOG — MINGGU 8
 * ========================
 * Satu baris per request yang diterima melewati rate limit.
 */
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ApiLog extends Model {
    static associate(models) {
      ApiLog.belongsTo(models.Pengguna, {
        foreignKey: "pengguna_id",
        as: "pengguna",
      });
    }
  }

  ApiLog.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      pengguna_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      endpoint: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ApiLog",
      tableName: "api_log",
      timestamps: true,
      updatedAt: false,
      defaultScope: {
        attributes: { exclude: ["createdAt"] },
      },
    }
  );

  return ApiLog;
};
