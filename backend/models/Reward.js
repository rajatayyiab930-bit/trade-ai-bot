const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['daily_login', 'achievement', 'challenge', 'referral', 'welcome'], required: true },
  day: { type: Number },
  amount: { type: Number, required: true },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
