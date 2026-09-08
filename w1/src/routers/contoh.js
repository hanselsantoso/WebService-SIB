const express = require('express');
const { welcome } = require('../controllers/contoh');
const router = express.Router();

router.get('/halo', welcome)

module.exports = router;