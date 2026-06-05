const tradingEngine = require('../services/tradingEngine');
const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

exports.placeOrder = async (req, res) => {
  try {
    const { symbol, assetName, assetType, tradeType, quantity, price, orderType, stopLoss, takeProfit } = req.body;

    let result;
    if (tradeType === 'buy') {
      result = await tradingEngine.executeBuyOrder(req.user._id, {
        symbol, assetName, assetType, quantity, price: price || (await getMarketPrice(symbol)),
        orderType, stopLoss, takeProfit,
      });
    } else {
      result = await tradingEngine.executeSellOrder(req.user._id, {
        symbol, quantity, price: price || (await getMarketPrice(symbol)),
        orderType,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTradeHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, symbol, type } = req.query;
    const query = { user: req.user._id };
    if (symbol) query.symbol = symbol.toUpperCase();
    if (type) query.tradeType = type;

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Trade.countDocuments(query);

    res.json({
      trades,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user._id, holdings: [] });
      await portfolio.save();
    }

    const user = req.user;
    res.json({
      portfolio,
      balance: user.demoBalance,
      totalValue: portfolio.totalValue + user.demoBalance,
      totalInvested: portfolio.totalInvested,
      totalPnl: portfolio.totalPnl,
      roi: portfolio.roi,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const portfolio = await Portfolio.findOne({ user: user._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayTrades = await Trade.countDocuments({
      user: user._id,
      createdAt: { $gte: today },
    });

    const weekTrades = await Trade.countDocuments({
      user: user._id,
      createdAt: { $gte: weekAgo },
    });

    const recentTrades = await Trade.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      balance: user.demoBalance,
      portfolioValue: portfolio?.totalValue || 0,
      totalValue: (portfolio?.totalValue || 0) + user.demoBalance,
      dailyProfit: user.dailyProfit,
      weeklyProfit: user.weeklyProfit,
      monthlyProfit: user.monthlyProfit,
      totalProfit: user.totalProfit,
      totalTrades: user.totalTrades,
      winningTrades: user.winningTrades,
      losingTrades: user.losingTrades,
      winRate: user.totalTrades > 0 ? ((user.winningTrades / user.totalTrades) * 100).toFixed(1) : 0,
      todayTrades,
      weekTrades,
      portfolio: portfolio?.holdings || [],
      recentTrades,
      level: user.level,
      xp: user.xp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssets = async (req, res) => {
  const { ASSETS } = require('../config/constants');
  res.json({ assets: ASSETS });
};

async function getMarketPrice(symbol) {
  const { ASSETS } = require('../config/constants');
  const asset = ASSETS.find(a => a.symbol === symbol);
  if (!asset) throw new Error('Asset not found');
  return asset.price * (1 + (Math.random() * 0.02 - 0.01));
}
