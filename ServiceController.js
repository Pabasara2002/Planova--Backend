const Service = require('../models/Service')

// GET: List all services
const getServices = async (req, res) => {
  try {
    const services = await Service.find()
    res.json({
      success: true,
      data: services,
      count: services.length,
    })
  } catch (err) {
    console.error('Get services error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve services',
    })
  }
}

// POST: Add a new service (Admin only)
const addService = async (req, res) => {
  try {
    const { name, description, price, featured, category } = req.body

    if (!name || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and price are required',
      })
    }

    const newService = new Service({
      name,
      description,
      price: Number(price),
      featured: featured || false,
      category: category || 'general',
    })

    await newService.save()

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService,
    })
  } catch (err) {
    console.error('Add service error:', err)
    res.status(400).json({
      success: false,
      message: 'Failed to create service',
    })
  }
}

module.exports = { getServices, addService }
