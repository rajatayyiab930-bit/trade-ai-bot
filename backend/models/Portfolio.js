const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  holdings: [{
    symbol: { type: String, required: true },
    assetName: { type: String, required: true },
    assetType: { type: String, enum: ['crypto', 'stock', 'forex', 'commodity'], required: true },
    quantity: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 },
    investedAmount: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    pnl: { type: Number, default: 0 },
    pnlPercent: { type: Number, default: 0 },
  }],
  totalValue: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },
  totalPnl: { type: Number, default: 0 },
  dailyPnl: { type: Number, default: 0 },
  weeklyPnl: { type: Number, default: 0 },
  monthlyPnl: { type: Number, default: 0 },
  roi: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
