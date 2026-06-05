const router = require('express').Router();
const tradingController = require('../controllers/tradingController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, tradingController.getDashboard);
router.get('/assets', auth, tradingController.getAssets);
router.post('/orders', auth, tradingController.placeOrder);
router.get('/trades', auth, tradingController.getTradeHistory);
router.get('/portfolio', auth, tradingController.getPortfolio);

module.exports = router;
