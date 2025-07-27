const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// GET featured services for home page
router.get('/', async (req, res) => {
  try {
    const featuredServices = await Service.find({ featured: true });
    res.json(featuredServices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured services' });
  }
});

module.exports = router;
