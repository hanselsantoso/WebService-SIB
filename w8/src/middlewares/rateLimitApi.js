/**
 * RATE LIMIT API — MINGGU 8
 * =========================
 * Limits accepted calls in a rolling time window per API-key owner.
 * 429 calls are not logged/billed: route order runs this before logApi.
 */
const { Op } = require("sequelize");
const { ApiLog, ApiTierlist } = require("../models");

const rateLimitApi = async (req, res, next) => {
  const tier = await ApiTierlist.findByPk(req.pengguna.api_level);
  if (!tier) {
    return res.status(403).json({ msg: "Tier API pengguna tidak aktif" });
  }

  const windowMs = Number(tier.window_seconds) * 1000;
  const mulaiWindow = new Date(Date.now() - windowMs);
  const where = {
    pengguna_id: req.pengguna.id,
    createdAt: { [Op.gte]: mulaiWindow },
  };
  const count = await ApiLog.count({ where });
  const limit = Number(tier.api_limit);

  res.set("X-RateLimit-Limit", String(limit));
  // Include the request currently being admitted: logApi runs next.
  res.set("X-RateLimit-Remaining", String(Math.max(0, limit - count - 1)));
  res.set("X-RateLimit-Window", String(tier.window_seconds));

  if (count >= limit) {
    const oldest = await ApiLog.findOne({
      where,
      order: [["createdAt", "ASC"]],
      attributes: ["createdAt"],
    });
    const retryAfter = oldest
      ? Math.max(
          1,
          Math.ceil(
            (new Date(oldest.createdAt).getTime() + windowMs - Date.now()) / 1000
          )
        )
      : Number(tier.window_seconds);

    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      msg: "Batas pemakaian API tercapai",
      tier: tier.api_level,
      limit,
      window_seconds: Number(tier.window_seconds),
      retry_after_seconds: retryAfter,
    });
  }

  return next();
};

module.exports = rateLimitApi;
