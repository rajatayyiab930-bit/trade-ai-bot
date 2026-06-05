const aiService = require('../services/aiService');
const Portfolio = require('../models/Portfolio');

exports.getMarketAnalysis = async (req, res) => {
  try {
    const analysis = aiService.getMarketAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssetAnalysis = async (req, res) => {
  try {
    const { symbol } = req.params;
    const analysis = aiService.getAssetAnalysis(symbol.toUpperCase());
    if (!analysis) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPortfolioAdvice = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    const advice = aiService.getPortfolioAdvice(portfolio);
    res.json(advice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const user = req.user;
    const response = aiService.generateChatResponse(message, {
      name: user.fullName,
      level: user.level,
      trades: user.totalTrades,
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const analysis = aiService.getMarketAnalysis();
    res.json({ recommendations: analysis.recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
