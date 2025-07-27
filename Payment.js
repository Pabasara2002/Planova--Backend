const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  stripeSessionId: { type: String, required: true },
  status: { type: String, required: true }, // e.g., 'paid', 'cancelled'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
