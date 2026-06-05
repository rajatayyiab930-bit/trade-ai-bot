const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  assetName: { type: String, required: true },
  assetType: { type: String, enum: ['crypto', 'stock', 'forex', 'commodity'], required: true },
  orderType: { type: String, enum: ['market', 'limit', 'stop_loss', 'take_profit'], default: 'market' },
  tradeType: { type: String, enum: ['buy', 'sell'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'executed', 'cancelled', 'failed'], default: 'pending' },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  executedAt: { type: Date },
  pnl: { type: Number, default: 0 },
  pnlPercent: { type: Number, default: 0 },
  closedAt: { type: Date },
}, { timestamps: true });

tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, status: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
