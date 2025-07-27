const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const User = require('../models/User') // Make sure path is correct
const authMiddleware = require('../middleware/auth')

// 🔐 Register new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'All fields (firstName, lastName, email, password) are required',
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      })
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() })
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    })
  }
})

// 🔓 Login with optional 2FA
router.post('/login', async (req, res) => {
  try {
    const { email, password, token } = req.body

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Check 2FA if enabled
    if (user.twoFAEnabled) {
      if (!token) {
        return res.status(401).json({
          success: false,
          message: '2FA token required',
          requires2FA: true,
        })
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token,
        window: 1,
      })

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid 2FA token',
        })
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        twoFAEnabled: user.twoFAEnabled,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    })
  }
})

// 🔐 Enable 2FA - Generates secret and QR
router.post('/enable-2fa', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).send('User not found')

    const secret = speakeasy.generateSecret({
      name: `EventManager (${user.email})`,
    })

    user.twoFASecret = secret.base32
    await user.save()

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).send('Error generating QR')

      res.json({
        message: 'Scan QR with Authenticator app',
        qrCode: data_url,
        secret: secret.base32,
      })
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})

// ✅ Verify 2FA token and enable 2FA
router.post('/verify-2fa', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body

    const user = await User.findById(req.user.id)
    if (!user || !user.twoFASecret) return res.status(400).send('2FA not setup')

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
    })

    if (verified) {
      user.twoFAEnabled = true
      await user.save()
      res.send('2FA enabled successfully')
    } else {
      res.status(400).send('Invalid 2FA token')
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})

module.exports = router
