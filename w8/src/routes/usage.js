/**
 * API KEY ROUTES — MINGGU 8
 * ========================
 * Middleware order matters:
 *   checkApiKey -> rateLimitApi -> logApi -> controller
 *
 * Existing /api/v1/buku stays untouched. Only /api/v1/usage/buku is metered.
 */
const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const methodNotAllowed = require("../middlewares/methodNotAllowed");
const checkApiKey = require("../middlewares/checkApiKey");
const rateLimitApi = require("../middlewares/rateLimitApi");
const logApi = require("../middlewares/logApi");
const { billableBooks, myUsage } = require("../controllers/usage");

// Usage inspection requires identity, but is deliberately not metered.
router
  .route("/me")
  .get(asyncHandler(checkApiKey), asyncHandler(myUsage))
  .all(methodNotAllowed("GET"));

// Billable endpoint. Rejected 429s do not reach logApi and do not count.
router
  .route("/buku")
  .get(
    asyncHandler(checkApiKey),
    asyncHandler(rateLimitApi),
    asyncHandler(logApi),
    asyncHandler(billableBooks)
  )
  .all(methodNotAllowed("GET"));

module.exports = router;
