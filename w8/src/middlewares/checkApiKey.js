/**
 * CHECK API KEY — MINGGU 8
 * ========================
 * API key identifies the calling APPLICATION/developer, not a logged-in
 * person. Keep it distinct from Week 7's Authorization: Bearer JWT.
 */
const { Pengguna } = require("../models");

const checkApiKey = async (req, res, next) => {
  const apiKey = req.get("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ msg: "Header x-api-key tidak ada" });
  }

  const pengguna = await Pengguna.findOne({ where: { api_key: apiKey } });
  if (!pengguna) {
    return res.status(401).json({ msg: "API key tidak valid" });
  }

  // Later metering middleware needs application owner and tier.
  req.pengguna = pengguna;
  return next();
};

module.exports = checkApiKey;
