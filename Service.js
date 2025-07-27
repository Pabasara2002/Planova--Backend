const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  featured: { type: Boolean, default: false },
  // ... other fields
});

module.exports = mongoose.model('Service', serviceSchema);

