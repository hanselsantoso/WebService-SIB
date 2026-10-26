/**
 * LOG API CALL — MINGGU 8
 * =======================
 * Runs after key validation and rate limiting, before the controller.
 * Billing policy for this teaching service: every accepted request counts,
 * including a later 404/500. Missing/invalid keys and 429 rejections do not.
 */
const { ApiLog } = require("../models");

const logApi = async (req, res, next) => {
  await ApiLog.create({
    pengguna_id: req.pengguna.id,
    endpoint: req.originalUrl,
    method: req.method,
  });
  return next();
};

module.exports = logApi;
