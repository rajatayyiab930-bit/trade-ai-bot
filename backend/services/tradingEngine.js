const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

class TradingEngine {
  async executeBuyOrder(userId, { symbol, assetName, assetType, quantity, price, orderType = 'market', stopLoss, takeProfit }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const totalValue = quantity * price;
    const fee = totalValue * 0.001;
    const totalCost = totalValue + fee;

    if (user.demoBalance < totalCost) {
      throw new Error('Insufficient balance');
    }

    let portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      portfolio = new Portfolio({ user: userId, holdings: [] });
    }

    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
    if (existingHolding) {
      const totalQty = existingHolding.quantity + quantity;
      const totalCostBasis = existingHolding.investedAmount + totalValue;
      existingHolding.quantity = totalQty;
      existingHolding.avgPrice = totalCostBasis / totalQty;
      existingHolding.investedAmount = totalCostBasis;
      existingHolding.currentValue = existingHolding.quantity * price;
      existingHolding.currentPrice = price;
      existingHolding.pnl = existingHolding.currentValue - existingHolding.investedAmount;
      existingHolding.pnlPercent = (existingHolding.pnl / existingHolding.investedAmount) * 100;
    } else {
      portfolio.holdings.push({
        symbol, assetName, assetType, quantity,
        avgPrice: price, investedAmount: totalValue,
        currentPrice: price, currentValue: totalValue,
        pnl: 0, pnlPercent: 0,
      });
    }

    const trade = new Trade({
      user: userId, symbol, assetName, assetType,
      orderType, tradeType: 'buy',
      quantity, price, totalValue: totalCost,
      fee, status: 'executed', executedAt: new Date(),
      stopLoss, takeProfit,
    });

    user.demoBalance -= totalCost;
    user.totalTrades += 1;

    const transaction = new Transaction({
      user: userId, type: 'trade',
      amount: totalCost, balanceBefore: user.demoBalance + totalCost,
      balanceAfter: user.demoBalance,
      description: `Buy ${quantity} ${symbol} @ $${price}`,
      status: 'completed',
    });

    await Promise.all([
      trade.save(),
      portfolio.save(),
      user.save(),
      transaction.save(),
    ]);

    return { trade, portfolio, balance: user.demoBalance };
  }

  async executeSellOrder(userId, { symbol, quantity, price, orderType = 'market' }) {
    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) throw new Error('Portfolio not found');

    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    if (!holding || holding.quantity < quantity) {
      throw new Error('Insufficient holdings');
    }

    const totalValue = quantity * price;
    const fee = totalValue * 0.001;
    const netValue = totalValue - fee;

    const costBasis = holding.avgPrice * quantity;
    const pnl = totalValue - costBasis;
    const pnlPercent = (pnl / costBasis) * 100;

    holding.quantity -= quantity;
    holding.currentValue = holding.quantity * price;
    holding.pnl = holding.currentValue - holding.investedAmount;
    holding.pnlPercent = (holding.pnl / holding.investedAmount) * 100;

    if (holding.quantity <= 0) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
    }

    const user = await User.findById(userId);
    user.demoBalance += netValue;
    user.totalTrades += 1;
    if (pnl > 0) {
      user.winningTrades += 1;
      user.totalProfit += pnl;
    } else {
      user.losingTrades += 1;
    }

    const trade = new Trade({
      user: userId, symbol, assetName: holding.assetName,
      assetType: holding.assetType, orderType, tradeType: 'sell',
      quantity, price, totalValue: netValue, fee,
      status: 'executed', executedAt: new Date(),
      pnl, pnlPercent,
    });

    const transaction = new Transaction({
      user: userId, type: 'trade',
      amount: netValue, balanceBefore: user.demoBalance - netValue,
      balanceAfter: user.demoBalance,
      description: `Sell ${quantity} ${symbol} @ $${price}`,
      status: 'completed',
    });

    portfolio.totalValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
    portfolio.totalInvested = portfolio.holdings.reduce((sum, h) => sum + h.investedAmount, 0);
    portfolio.totalPnl = portfolio.holdings.reduce((sum, h) => sum + h.pnl, 0);
    portfolio.roi = portfolio.totalInvested > 0 ? (portfolio.totalPnl / portfolio.totalInvested) * 100 : 0;

    await Promise.all([
      trade.save(), portfolio.save(), user.save(), transaction.save(),
    ]);

    return { trade, portfolio, balance: user.demoBalance, pnl, pnlPercent };
  }
}

module.exports = new TradingEngine();
