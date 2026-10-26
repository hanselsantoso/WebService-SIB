/**
 * MODEL API TIER — MINGGU 8
 * =========================
 * Batas pemakaian per paket. Data referensi diisi melalui sql/seed.sql.
 */
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ApiTierlist extends Model {
    static associate(models) {
      ApiTierlist.hasMany(models.Pengguna, {
        foreignKey: "api_level",
        sourceKey: "api_level",
        as: "pengguna",
      });
    }
  }

  ApiTierlist.init(
    {
      api_level: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
      api_limit: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { min: 1 },
      },
      window_seconds: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { min: 1 },
      },
    },
    {
      sequelize,
      modelName: "ApiTierlist",
      tableName: "api_tierlist",
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    }
  );

  return ApiTierlist;
};
