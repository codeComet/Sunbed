const express = require('express');
const router = express.Router();
const { addSunbed } = require('../controllers/sunbedController');

router.post('/add', addSunbed);

module.exports = router;