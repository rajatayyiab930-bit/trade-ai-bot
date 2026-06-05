const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { DEMO_BALANCE } = require('../config/constants');

exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password, country } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const user = new User({
      fullName, username, email, password, country,
      demoBalance: DEMO_BALANCE,
      referralCode: username + Math.random().toString(36).substr(2, 4).toUpperCase(),
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ip = req.ip;
    user.loginHistory.push({ ip, device: req.headers['user-agent'] || 'unknown', success: true });
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, fullName, googleId } = req.body;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    if (!user) {
      user = new User({
        fullName,
        email,
        googleId,
        username: email.split('@')[0] + Math.random().toString(36).substr(2, 3),
        isVerified: true,
        demoBalance: DEMO_BALANCE,
        referralCode: email.split('@')[0] + Math.random().toString(36).substr(2, 4).toUpperCase(),
      });
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, username, country, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (country) user.country = country;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json({ message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    console.log(`OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP sent to email', otp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otp, otpExpiry: { $gt: new Date() } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLoginHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ loginHistory: user.loginHistory.slice(-20).reverse() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
