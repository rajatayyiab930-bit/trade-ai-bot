const User = require('../models/User');
const Reward = require('../models/Reward');
const Transaction = require('../models/Transaction');
const { DAILY_REWARDS } = require('../config/constants');

class RewardService {
  async claimDailyReward(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        if (user.dailyRewardClaimed) {
          throw new Error('Daily reward already claimed today');
        }
      } else if (diffDays === 1) {
        user.loginStreak += 1;
      } else {
        user.loginStreak = 1;
      }
    } else {
      user.loginStreak = 1;
    }

    if (user.loginStreak > 7) user.loginStreak = 1;
    const streak = user.loginStreak;
    const rewardAmount = DAILY_REWARDS.find(r => r.day === streak)?.amount || 1000;

    user.demoBalance += rewardAmount;
    user.dailyRewardClaimed = true;
    user.lastLoginDate = today;

    const reward = new Reward({
      user: userId,
      type: 'daily_login',
      day: streak,
      amount: rewardAmount,
      claimed: true,
      claimedAt: new Date(),
    });

    const transaction = new Transaction({
      user: userId,
      type: 'reward',
      amount: rewardAmount,
      balanceBefore: user.demoBalance - rewardAmount,
      balanceAfter: user.demoBalance,
      description: `Daily Login Reward - Day ${streak}`,
      status: 'completed',
    });

    await Promise.all([user.save(), reward.save(), transaction.save()]);

    return { streak, rewardAmount, balance: user.demoBalance };
  }

  async claimWelcomeReward(userId) {
    const existing = await Reward.findOne({ user: userId, type: 'welcome' });
    if (existing) throw new Error('Welcome reward already claimed');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const amount = 999999999;

    const reward = new Reward({
      user: userId,
      type: 'welcome',
      amount,
      claimed: true,
      claimedAt: new Date(),
    });

    const transaction = new Transaction({
      user: userId,
      type: 'reward',
      amount,
      balanceBefore: 0,
      balanceAfter: user.demoBalance,
      description: 'Welcome Reward - Demo Balance',
      status: 'completed',
    });

    await Promise.all([reward.save(), transaction.save()]);
    return { amount, balance: user.demoBalance };
  }

  async addXP(userId, xpAmount) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.xp += xpAmount;
    const { LEVELS } = require('../config/constants');
    let newLevel = user.level;

    for (const [key, level] of Object.entries(LEVELS)) {
      if (user.xp >= level.minXP) {
        newLevel = level.name;
      }
    }

    user.level = newLevel;
    await user.save();
    return { xp: user.xp, level: user.level };
  }

  async getRewardStatus(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let canClaim = false;
    let streak = user.loginStreak || 0;

    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        canClaim = !user.dailyRewardClaimed;
      } else if (diffDays >= 1) {
        canClaim = true;
        if (diffDays === 1) streak += 1;
        else streak = 1;
      }
    } else {
      canClaim = true;
      streak = 1;
    }

    if (streak > 7) streak = 1;

    const rewards = DAILY_REWARDS.map(r => ({
      day: r.day,
      amount: r.amount,
      claimed: r.day <= streak || (r.day === streak && user.dailyRewardClaimed),
      canClaim: r.day === streak && canClaim,
    }));

    return {
      streak,
      canClaim,
      nextReward: DAILY_REWARDS.find(r => r.day === streak),
      rewards,
      xp: user.xp,
      level: user.level,
    };
  }
}

module.exports = new RewardService();
