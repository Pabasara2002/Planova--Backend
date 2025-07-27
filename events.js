const express = require('express');
const router = express.Router();
const events = require('../data/events');

// GET /api/events
router.get('/', (req, res) => {
  res.json(events);
});

module.exports = router;
