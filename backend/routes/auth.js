const router = require('express').Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/google', authController.googleLogin);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', auth, authController.verifyEmail);
router.get('/login-history', auth, authController.getLoginHistory);

module.exports = router;
