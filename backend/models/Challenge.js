const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['trade_volume', 'profit_target', 'streak', 'referral', 'custom'], required: true },
  requirement: { type: Number, required: true },
  reward: { type: Number, required: true },
  xpReward: { type: Number, default: 100 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], default: 'medium' },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
