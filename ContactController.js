const Contact = require('../models/Contact')

const submitFeedback = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body

    // Handle both old and new field names for backwards compatibility
    const name =
      firstName && lastName ? `${firstName} ${lastName}` : req.body.name

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, message) are required.',
      })
    }

    const newFeedback = new Contact({ name, email, message })
    await newFeedback.save()

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully! We'll get back to you soon.",
    })
  } catch (err) {
    console.error('Contact submission error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    })
  }
}

module.exports = { submitFeedback }
