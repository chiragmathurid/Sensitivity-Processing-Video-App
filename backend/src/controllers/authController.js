const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// Helper: create and return a signed JWT
const signToken = (user) => jwt.sign(
  { id: user._id, role: user.role },   // payload — what you embed in the token
  process.env.JWT_SECRET,              // secret key — keep this private!
  { expiresIn: '7d' }                  // token expires after 7 days
);

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password }); // pre('save') hashes pw
    const token = signToken(user);

    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
      // ⚠️ Always give the SAME error for wrong email vs wrong password
      //    — don't hint which one is wrong (security best practice)
    }

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};