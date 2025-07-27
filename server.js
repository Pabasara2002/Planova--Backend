require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const {
  requestLogger,
  sanitizeInput,
  validateContentType,
} = require('./middleware/security')

// Import all route files
const eventRoutes = require('./routes/events')
const authRoutes = require('./routes/authRoutes')
const contactRoutes = require('./routes/ContactRoutes')
const serviceRoutes = require('./routes/ServiceRoutes')
const customPackageRoutes = require('./routes/customPackageRoutes')
const chatbotRoutes = require('./routes/chatbot')
const galleryRoutes = require('./routes/galleryRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const homeRoutes = require('./routes/homeRoutes')
const aboutRoutes = require('./routes/aboutRoutes')
const cartRoutes = require('./routes/cartRoutes')

const PORT = 5000

const app = express()

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.openai.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
)

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 chatbot requests per minute
  message: {
    success: false,
    message:
      'Too many chat requests, please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply general rate limiting to all routes
app.use(generalLimiter)

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Security middleware
app.use(requestLogger)
app.use(sanitizeInput)
app.use(validateContentType)

require('dotenv').config()
const mongoose = require('mongoose')

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is required')
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required')
  process.exit(1)
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err)
    process.exit(1)
  })

// API Routes with specific rate limiting
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/chatbot', chatbotLimiter, chatbotRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/custom-package', customPackageRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/home', homeRoutes)
app.use('/api/about', aboutRoutes)
app.use('/api/cart', cartRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Planova API is running',
    timestamp: new Date().toISOString(),
    security: {
      helmet: 'enabled',
      cors: 'configured',
      rateLimit: 'active',
      requestLogging: 'enabled',
    },
  })
})

// Security status endpoint
app.get('/api/security-status', (req, res) => {
  res.json({
    success: true,
    message: 'Security features active',
    features: {
      helmet: 'Security headers enabled',
      cors: 'Cross-origin requests configured',
      rateLimit: 'Request rate limiting active',
      inputSanitization: 'XSS protection enabled',
      contentTypeValidation: 'JSON validation active',
      requestLogging: 'Request logging enabled',
    },
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 API available at http://localhost:${PORT}/api`)
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.')
      process.exit(0)
    })
  })
})
