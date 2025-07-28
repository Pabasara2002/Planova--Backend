// Logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.originalUrl
  const ip = req.ip || req.connection.remoteAddress

  console.log(`📝 ${timestamp} - ${method} ${url} - IP: ${ip}`)

  // Log response time
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const statusEmoji = status >= 400 ? '❌' : '✅'
    console.log(`${statusEmoji} ${method} ${url} - ${status} - ${duration}ms`)
  })

  next()
}

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key])
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key])
        }
      }
    }
  }

  if (req.body) {
    sanitizeObject(req.body)
  }

  next()
}

// Validate content type middleware
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type')
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json',
      })
    }
  }
  next()
}

module.exports = {
  requestLogger,
  sanitizeInput,
  validateContentType,
}
