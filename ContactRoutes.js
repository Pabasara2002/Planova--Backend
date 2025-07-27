const express = require('express')
const router = express.Router()
const { submitFeedback } = require('../controllers/ContactController')

router.post('/', submitFeedback)

module.exports = router
