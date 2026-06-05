const { ASSETS } = require('../config/constants');

class AIService {
  getMarketAnalysis() {
    const trends = ['bullish', 'bearish', 'neutral', 'volatile'];
    const strengths = ['strong', 'moderate', 'weak'];
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
      overall: r(trends),
      confidence: Math.floor(Math.random() * 40) + 60,
      recommendations: ASSETS.slice(0, 6).map(a => ({
        symbol: a.symbol,
        name: a.name,
        action: r(['buy', 'sell', 'hold']),
        confidence: Math.floor(Math.random() * 30) + 60,
        reason: this._getReason(a.symbol),
        targetPrice: (a.price * (1 + (Math.random() * 0.2 - 0.1))).toFixed(2),
        stopLoss: (a.price * (1 - (Math.random() * 0.1 + 0.02))).toFixed(2),
      })),
      marketSentiment: r(['positive', 'negative', 'mixed']),
      riskLevel: r(['low', 'medium', 'high']),
      keyLevels: {
        support: (ASSETS[0].price * 0.95).toFixed(2),
        resistance: (ASSETS[0].price * 1.05).toFixed(2),
      },
      news: [
        { title: 'Market shows strong momentum in Q2', impact: 'positive' },
        { title: 'Regulatory developments ahead', impact: 'neutral' },
      ],
    };
  }

  getAssetAnalysis(symbol) {
    const asset = ASSETS.find(a => a.symbol === symbol);
    if (!asset) return null;

    return {
      symbol: asset.symbol,
      name: asset.name,
      currentPrice: asset.price,
      change24h: asset.change,
      rsi: Math.floor(Math.random() * 40) + 30,
      macd: (Math.random() * 10 - 5).toFixed(2),
      ema20: (asset.price * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2),
      ema50: (asset.price * (1 + (Math.random() * 0.06 - 0.03))).toFixed(2),
      bollingerUpper: (asset.price * 1.08).toFixed(2),
      bollingerLower: (asset.price * 0.92).toFixed(2),
      support: (asset.price * 0.93).toFixed(2),
      resistance: (asset.price * 1.07).toFixed(2),
      volume24h: Math.floor(Math.random() * 1000000000),
      signal: Math.random() > 0.5 ? 'buy' : 'sell',
      confidence: Math.floor(Math.random() * 30) + 60,
    };
  }

  getPortfolioAdvice(portfolio) {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
      return { advice: 'Start building your portfolio with diversified assets', riskLevel: 'low' };
    }

    const totalValue = portfolio.holdings.reduce((s, h) => s + h.currentValue, 0);
    const diversification = portfolio.holdings.length;
    const topHolding = portfolio.holdings.reduce((max, h) => h.currentValue > max.currentValue ? h : max, portfolio.holdings[0]);

    let advice = '';
    let riskLevel = 'medium';

    if (diversification < 3) {
      advice = 'Consider diversifying across more assets to reduce risk';
      riskLevel = 'high';
    } else if (topHolding.currentValue / totalValue > 0.5) {
      advice = `Your portfolio is heavily weighted in ${topHolding.symbol}. Consider rebalancing`;
      riskLevel = 'medium';
    } else {
      advice = 'Your portfolio is well diversified. Monitor market conditions for opportunities';
      riskLevel = 'low';
    }

    return { advice, riskLevel, diversification, totalValue, topHolding: topHolding.symbol };
  }

  generateChatResponse(message, userContext = {}) {
    const msg = message.toLowerCase();
    const responses = [];

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      responses.push('Welcome to TradeX AI! I\'m your personal trading assistant. How can I help you today?');
    }

    if (msg.includes('trade') || msg.includes('trading')) {
      responses.push('Trading involves buying and selling assets to generate profit. As a beginner, start with demo trading using our $999,999,999 virtual balance. Focus on learning market trends and risk management.');
    }

    if (msg.includes('bitcoin') || msg.includes('btc') || msg.includes('crypto')) {
      responses.push('Bitcoin (BTC) is the largest cryptocurrency by market cap. Current market sentiment is mixed. Consider researching market trends before trading. Always use stop-loss orders to manage risk.');
    }

    if (msg.includes('risk') || msg.includes('lose') || msg.includes('loss')) {
      responses.push('Risk management is crucial in trading. Never invest more than you can afford to lose. Use stop-loss orders, diversify your portfolio, and start with small positions to learn.');
    }

    if (msg.includes('strategy') || msg.includes('strategies')) {
      responses.push('Popular trading strategies include: 1) Day Trading - short-term positions within a day, 2) Swing Trading - holding for days/weeks, 3) Trend Following - trading with market momentum, 4) Dollar Cost Averaging - regular fixed investments.');
    }

    if (msg.includes('indicator') || msg.includes('technical') || msg.includes('chart')) {
      responses.push('Key technical indicators: RSI (Relative Strength Index) measures momentum, MACD shows trend direction, EMA/SMA track moving averages, Bollinger Bands indicate volatility.');
    }

    if (msg.includes('beginner') || msg.includes('start') || msg.includes('new')) {
      responses.push('Great that you\'re starting! Here\'s my advice: 1) Complete your profile, 2) Explore the demo account, 3) Start with small trades, 4) Use stop-loss, 5) Learn from AI recommendations, 6) Join trading challenges!');
    }

    if (msg.includes('portfolio') || msg.includes('holdings')) {
      responses.push('Your portfolio shows your current asset holdings and performance. Monitor diversification, track P&L, and rebalance periodically. I can provide personalized portfolio advice upon request.');
    }

    if (responses.length === 0) {
      responses.push('Great question! As your AI trading assistant, I can help with: market analysis, trading strategies, risk management, portfolio advice, and learning resources. What specific topic interests you?');
    }

    return {
      responses,
      suggestions: [
        'How do I start trading?',
        'What is Bitcoin?',
        'Explain risk management',
        'Best trading strategies',
        'Analyze my portfolio',
      ],
    };
  }

  _getReason(symbol) {
    const reasons = [
      `${symbol} shows strong technical momentum with increasing volume`,
      `Favorable market conditions for ${symbol} based on recent developments`,
      `${symbol} is approaching a key support level with high probability of rebound`,
      `Analyst consensus suggests upside potential for ${symbol}`,
      `${symbol} demonstrates strong fundamentals in current market cycle`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}

module.exports = new AIService();
