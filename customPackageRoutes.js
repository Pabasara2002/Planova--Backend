const express = require('express')
const router = express.Router()
const CustomPackage = require('../models/CustomPackage')

// POST: Submit custom package request
router.post('/', async (req, res) => {
  try {
    const packageData = req.body

    // Basic validation
    if (!packageData || Object.keys(packageData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Package data is required',
      })
    }

    const customPackage = new CustomPackage(packageData)
    await customPackage.save()

    // TODO: Add email notification logic here
    // const sendEmail = require('../utils/mailer');
    // await sendEmail(userEmail, 'Package Request Received', ...);

    res.status(201).json({
      success: true,
      message:
        'Your custom package request has been submitted successfully! We will contact you soon.',
      packageId: customPackage._id,
    })
  } catch (error) {
    console.error('Custom package submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit package request. Please try again later.',
    })
  }
})

// GET: Retrieve custom packages (Admin only - could add auth middleware later)
router.get('/', async (req, res) => {
  try {
    const packages = await CustomPackage.find().sort({ createdAt: -1 })
    res.json({
      success: true,
      data: packages,
      count: packages.length,
    })
  } catch (error) {
    console.error('Get custom packages error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve packages',
    })
  }
})

module.exports = router
