const express = require('express')
const router = express.Router()
const { getServices, addService } = require('../controllers/ServiceController')

// GET all services
router.get('/', getServices)

// POST a new service
router.post('/', addService)

module.exports = router
