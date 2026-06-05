const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['crypto', 'stock', 'forex', 'commodity'], required: true },
  currentPrice: { type: Number, required: true },
  previousPrice: { type: Number },
  change24h: { type: Number, default: 0 },
  changePercent24h: { type: Number, default: 0 },
  high24h: { type: Number },
  low24h: { type: Number },
  volume24h: { type: Number },
  marketCap: { type: Number },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  priceHistory: [{
    price: Number,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
