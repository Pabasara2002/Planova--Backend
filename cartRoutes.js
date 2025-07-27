const express = require('express')
const router = express.Router()

// Temporary in-memory cart storage (in production, use database/session storage)
let cartItems = []

// POST: Add items to cart
router.post('/', async (req, res) => {
  try {
    const { selectedServices = [], selectedAddons = [] } = req.body

    if (selectedServices.length === 0 && selectedAddons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one service or addon',
      })
    }

    // Create cart item
    const cartItem = {
      id: Date.now().toString(),
      services: selectedServices,
      addons: selectedAddons,
      createdAt: new Date().toISOString(),
    }

    cartItems.push(cartItem)

    res.status(201).json({
      success: true,
      message: 'Items added to cart successfully!',
      cart: cartItem,
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add items to cart',
    })
  }
})

// GET: Get cart items
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: cartItems,
    count: cartItems.length,
  })
})

// DELETE: Clear cart
router.delete('/', (req, res) => {
  cartItems = []
  res.json({
    success: true,
    message: 'Cart cleared successfully',
  })
})

module.exports = router
