const crypto = require('crypto');

const generateReferralCode = (length = 8) => {
  return crypto.randomBytes(length).toString('hex').toUpperCase().substring(0, length);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const calculatePnl = (entryPrice, exitPrice, quantity, side) => {
  if (side === 'buy') {
    return (exitPrice - entryPrice) * quantity;
  }
  return (entryPrice - exitPrice) * quantity;
};

const calculatePnlPercent = (entryPrice, exitPrice) => {
  return ((exitPrice - entryPrice) / entryPrice) * 100;
};

const paginate = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit), page: parseInt(page) };
};

module.exports = {
  generateReferralCode,
  formatCurrency,
  calculatePnl,
  calculatePnlPercent,
  paginate,
};
