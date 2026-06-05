const router = require('express').Router();
const rewardController = require('../controllers/rewardController');
const { auth } = require('../middleware/auth');

router.get('/status', auth, rewardController.getRewardStatus);
router.post('/daily-claim', auth, rewardController.claimDailyReward);
router.get('/achievements', auth, rewardController.getAchievements);
router.get('/challenges', auth, rewardController.getChallenges);
router.get('/level', auth, rewardController.getUserLevel);
router.get('/transactions', auth, rewardController.getTransactionHistory);
router.post('/referral', auth, rewardController.claimReferralReward);

module.exports = router;
