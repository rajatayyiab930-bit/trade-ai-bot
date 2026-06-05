const DEMO_BALANCE = 999999999;
const LEVELS = {
  BEGINNER: { name: 'Beginner', minXP: 0, color: '#808080' },
  INTERMEDIATE: { name: 'Intermediate', minXP: 1000, color: '#4CAF50' },
  ADVANCED: { name: 'Advanced', minXP: 5000, color: '#2196F3' },
  EXPERT: { name: 'Expert', minXP: 15000, color: '#9C27B0' },
  PROFESSIONAL: { name: 'Professional', minXP: 50000, color: '#FF9800' },
};

const DAILY_REWARDS = [
  { day: 1, amount: 1000 },
  { day: 2, amount: 2000 },
  { day: 3, amount: 5000 },
  { day: 4, amount: 10000 },
  { day: 5, amount: 25000 },
  { day: 6, amount: 50000 },
  { day: 7, amount: 100000 },
];

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: 67500, change: 2.4 },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: 3450, change: 1.8 },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', price: 142, change: 5.2 },
  { symbol: 'BNB', name: 'Binance Coin', type: 'crypto', price: 580, change: -0.5 },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto', price: 0.62, change: 3.1 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', price: 178, change: 0.8 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', price: 141, change: -1.2 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', price: 245, change: 3.5 },
  { symbol: 'EUR/USD', name: 'Euro/US Dollar', type: 'forex', price: 1.08, change: 0.1 },
  { symbol: 'XAU/USD', name: 'Gold/US Dollar', type: 'commodity', price: 2330, change: 0.6 },
  { symbol: 'XAG/USD', name: 'Silver/US Dollar', type: 'commodity', price: 27.5, change: -0.3 },
];

const TRADING_FEE = 0.001;

module.exports = { DEMO_BALANCE, LEVELS, DAILY_REWARDS, ASSETS, TRADING_FEE };
