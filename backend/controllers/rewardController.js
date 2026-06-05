const rewardService = require('../services/rewardService');
const User = require('../models/User');
const Reward = require('../models/Reward');

exports.claimDailyReward = async (req, res) => {
  try {
    const result = await rewardService.claimDailyReward(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRewardStatus = async (req, res) => {
  try {
    const status = await rewardService.getRewardStatus(req.user._id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('achievements');
    res.json({ achievements: user.achievements || [], badges: user.badges || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const Challenge = require('../models/Challenge');
    const challenges = await Challenge.find({ isActive: true });
    res.json({ challenges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserLevel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { LEVELS } = require('../config/constants');

    const levels = Object.entries(LEVELS).map(([key, val]) => ({
      name: val.name,
      minXP: val.minXP,
      unlocked: user.xp >= val.minXP,
      current: user.level === val.name,
    }));

    res.json({
      xp: user.xp,
      level: user.level,
      levels,
      nextLevel: Object.entries(LEVELS).find(([key, val]) => val.name === user.level),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const { page = 1, limit = 20 } = req.query;
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Transaction.countDocuments({ user: req.user._id });
    res.json({ transactions, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.claimReferralReward = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const referralCode = req.body.code;
    const referrer = await User.findOne({ referralCode });

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }
    if (referrer._id.equals(user._id)) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }
    if (user.referredBy) {
      return res.status(400).json({ error: 'Already referred by someone' });
    }

    const rewardAmount = 50000;
    user.demoBalance += rewardAmount;
    user.referredBy = referrer._id;

    referrer.demoBalance += rewardAmount;
    referrer.referralCount += 1;

    const Transaction = require('../models/Transaction');
    const userTx = new Transaction({
      user: user._id, type: 'referral', amount: rewardAmount,
      balanceBefore: user.demoBalance - rewardAmount, balanceAfter: user.demoBalance,
      description: 'Referral bonus from joining',
    });

    const referrerTx = new Transaction({
      user: referrer._id, type: 'referral', amount: rewardAmount,
      balanceBefore: referrer.demoBalance - rewardAmount, balanceAfter: referrer.demoBalance,
      description: `Referral bonus for user ${user.username}`,
    });

    await Promise.all([user.save(), referrer.save(), userTx.save(), referrerTx.save()]);

    res.json({ message: 'Referral reward claimed!', amount: rewardAmount, balance: user.demoBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
