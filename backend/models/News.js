const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  source: { type: String },
  category: { type: String, enum: ['market', 'crypto', 'stock', 'forex', 'economic', 'general'], default: 'general' },
  image: { type: String },
  url: { type: String },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  impact: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
