const router = require('express').Router();
const aiController = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

router.get('/market-analysis', auth, aiController.getMarketAnalysis);
router.get('/asset-analysis/:symbol', auth, aiController.getAssetAnalysis);
router.get('/portfolio-advice', auth, aiController.getPortfolioAdvice);
router.post('/chat', auth, aiController.chatWithAI);
router.get('/recommendations', auth, aiController.getRecommendations);

module.exports = router;
