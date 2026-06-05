const router = require('express').Router();
const News = require('../models/News');
const SupportTicket = require('../models/SupportTicket');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const news = await News.find({ isPublished: true }).sort({ publishedAt: -1 }).limit(20);
    res.json({ news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tickets', auth, async (req, res) => {
  try {
    const ticket = new SupportTicket({ user: req.user._id, ...req.body });
    await ticket.save();
    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tickets', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
