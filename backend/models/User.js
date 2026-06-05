const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  country: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Demo Balance
  demoBalance: { type: Number, default: 999999999 },
  totalDeposited: { type: Number, default: 999999999 },
  
  // Portfolio
  portfolioValue: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  dailyProfit: { type: Number, default: 0 },
  weeklyProfit: { type: Number, default: 0 },
  monthlyProfit: { type: Number, default: 0 },
  
  // Rewards & Gamification
  xp: { type: Number, default: 0 },
  level: { type: String, default: 'Beginner' },
  badges: [{ type: String }],
  achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  
  // Daily Login Rewards
  loginStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  dailyRewardClaimed: { type: Boolean, default: false },
  
  // Stats
  totalTrades: { type: Number, default: 0 },
  winningTrades: { type: Number, default: 0 },
  losingTrades: { type: Number, default: 0 },
  
  // Auth
  otp: { type: String },
  otpExpiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  googleId: { type: String },
  
  // Devices
  devices: [{
    deviceId: String,
    deviceName: String,
    ip: String,
    lastLogin: Date,
  }],
  
  loginHistory: [{
    ip: String,
    device: String,
    timestamp: { type: Date, default: Date.now },
    success: Boolean,
  }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
