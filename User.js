const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // 2FA
  twoFAEnabled: {
    type: Boolean,
    default: false
  },
  twoFASecret: String
});

module.exports = mongoose.model('User', userSchema);

