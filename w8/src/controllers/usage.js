/**
 * BILLABLE API CONTROLLERS — MINGGU 8
 * ===================================
 * This is a metered copy of the book read API. Existing Week 2-7 routes
 * stay public and unchanged so their Postman collections remain stable.
 */
const { Op } = require("sequelize");
const { Buku, ApiLog, ApiTierlist } = require("../models");

const billableBooks = async (req, res) => {
  const books = await Buku.findAll({
    attributes: ["id", "judul", "penulis", "harga", "stok"],
    order: [["id", "ASC"]],
  });

  return res.status(200).json({
    consumer: req.pengguna.pengguna_nama,
    total: books.length,
    data: books,
  });
};

// Usage endpoint is intentionally not metered; otherwise reading usage
// would itself change the usage figure. It still requires a valid key.
const myUsage = async (req, res) => {
  const tier = await ApiTierlist.findByPk(req.pengguna.api_level);
  const windowMs = Number(tier.window_seconds) * 1000;
  const requests = await ApiLog.count({
    where: {
      pengguna_id: req.pengguna.id,
      createdAt: { [Op.gte]: new Date(Date.now() - windowMs) },
    },
  });

  return res.status(200).json({
    pengguna: req.pengguna.pengguna_nama,
    tier: tier.api_level,
    limit: Number(tier.api_limit),
    window_seconds: Number(tier.window_seconds),
    requests_in_window: requests,
    remaining: Math.max(0, Number(tier.api_limit) - requests),
  });
};

module.exports = { billableBooks, myUsage };
