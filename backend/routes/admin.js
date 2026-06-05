const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/dashboard', auth, adminAuth, adminController.getDashboard);
router.get('/users', auth, adminAuth, adminController.getUsers);
router.put('/users/:userId', auth, adminAuth, adminController.updateUser);
router.get('/assets', auth, adminAuth, adminController.manageAssets);
router.put('/assets/:assetId', auth, adminAuth, adminController.updateAsset);
router.get('/news', auth, adminAuth, adminController.getNews);
router.post('/news', auth, adminAuth, adminController.createNews);
router.put('/news/:newsId', auth, adminAuth, adminController.updateNews);
router.delete('/news/:newsId', auth, adminAuth, adminController.deleteNews);
router.get('/tickets', auth, adminAuth, adminController.getTickets);
router.post('/tickets/:ticketId/respond', auth, adminAuth, adminController.respondTicket);
router.post('/tickets/:ticketId/close', auth, adminAuth, adminController.closeTicket);
router.get('/analytics', auth, adminAuth, adminController.getAnalytics);

module.exports = router;
