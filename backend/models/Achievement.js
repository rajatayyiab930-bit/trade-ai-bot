const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  xpReward: { type: Number, default: 50 },
  criteria: { type: String, required: true },
  users: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    unlockedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
