const mongoose = require('mongoose');

const serviceSelectionSchema = new mongoose.Schema({
  selectedServices: [String],
  selectedAddons: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceSelection', serviceSelectionSchema);
