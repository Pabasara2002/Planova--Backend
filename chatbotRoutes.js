const express = require('express')
const router = express.Router()

// Simple mock AI response (replace with OpenAI or other integration as needed)
router.post('/', async (req, res) => {
  const { message } = req.body
  // Example: respond based on keywords
  let reply = 'Sorry, I did not understand your question.'
  if (message) {
    if (/cater/i.test(message)) {
      reply = 'Yes, all our packages include customizable catering options.'
    } else if (/price|cost/i.test(message)) {
      reply =
        'Our pricing depends on the package and services you select. Would you like details?'
    } else if (/hello|hi/i.test(message)) {
      reply = 'Hello! How can I assist you today?'
    } else {
      reply = 'Thank you for your question. We will get back to you soon.'
    }
  }
  res.json({ reply })
})

module.exports = router
