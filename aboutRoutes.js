const express = require('express');
const router = express.Router();

// GET /api/about
router.get('/', (req, res) => {
  res.json({
    companyName: "Your Event Planner",
    description: "We provide the best event planning services tailored to your needs.",
    mission: "To make your events unforgettable and hassle-free.",
    contactEmail: "contact@youreventplanner.com",
    phone: "+1 234 567 890",
    address: "123 Event Street, City, Country"
  });
});

module.exports = router;
