const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' })
  }
}
