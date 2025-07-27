const mongoose = require('mongoose');

const customPackageSchema = new mongoose.Schema({
  colorPalette: String,
  flowers: String,
  archEntrance: String,
  lighting: String,
  tableCenterpieces: String,
  backdropDesign: String,
  fabricDraping: String,
  photoBooth: String,
  specialInstructions: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CustomPackage', customPackageSchema);

