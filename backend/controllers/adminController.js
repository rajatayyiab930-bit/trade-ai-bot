const User = require('../models/User');
const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');
const News = require('../models/News');
const SupportTicket = require('../models/SupportTicket');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true, lastLoginDate: { $gte: new Date(Date.now() - 24*60*60*1000) } });
    const tradesToday = await Trade.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } });
    const totalTrades = await Trade.countDocuments();
    const totalDeposits = await User.aggregate([{ $group: { _id: null, total: { $sum: '$totalDeposited' } } }]);
    const totalProfit = await User.aggregate([{ $group: { _id: null, total: { $sum: '$totalProfit' } } }]);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } });
    const openTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } });

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('fullName email createdAt isVerified');
    const recentTrades = await Trade.find().populate('user', 'fullName username').sort({ createdAt: -1 }).limit(10);

    res.json({
      stats: {
        totalUsers, activeUsers, tradesToday, totalTrades,
        totalDeposits: totalDeposits[0]?.total || 0,
        totalProfit: totalProfit[0]?.total || 0,
        newUsersToday, openTickets,
      },
      recentUsers,
      recentTrades,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;

    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);

    res.json({ users: users.map(u => u.toJSON()), total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User updated', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manageAssets = async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json({ assets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const updates = req.body;
    const asset = await Asset.findByIdAndUpdate(assetId, updates, { new: true });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json({ message: 'Asset updated', asset });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 });
    res.json({ news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createNews = async (req, res) => {
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json({ message: 'News created', news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    const news = await News.findByIdAndUpdate(newsId, req.body, { new: true });
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json({ message: 'News updated', news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    await News.findByIdAndDelete(newsId);
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const tickets = await SupportTicket.find(query)
      .populate('user', 'fullName email username')
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.respondTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    ticket.responses.push({ admin: req.user._id, message });
    ticket.status = 'in_progress';
    await ticket.save();
    res.json({ message: 'Response added', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { status: 'resolved', resolvedAt: new Date() }, { new: true });
    res.json({ message: 'Ticket closed', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const dailyTrades = await Trade.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, volume: { $sum: '$totalValue' } } },
      { $sort: { _id: 1 } },
    ]);

    const topAssets = await Trade.aggregate([
      { $group: { _id: '$symbol', count: { $sum: 1 }, volume: { $sum: '$totalValue' } } },
      { $sort: { volume: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      dailyUsers,
      dailyTrades,
      topAssets,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
