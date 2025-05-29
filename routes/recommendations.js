const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Your user model
const Property = require('../models/Property');
const Recommendation = require('../models/Recommendation'); // New model for recommendations
const { protect } = require('../middleware/auth');

router.get('/users/search', protect, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email query is required' });

  try {
    const user = await User.findOne({ email }).select('_id email name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/recommend', protect, async (req, res) => {
  const { propertyId, toUserId, message } = req.body;
  if (!propertyId || !toUserId) {
    return res.status(400).json({ message: 'Property ID and recipient User ID are required' });
  }

  try {
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const recipient = await User.findById(toUserId);
    if (!recipient) return res.status(404).json({ message: 'Recipient user not found' });

    const recommendation = new Recommendation({
      property: propertyId,
      fromUser: req.user._id,
      toUser: toUserId,
      message: message || ''
    });

    await recommendation.save();

    res.status(201).json({ message: 'Property recommended successfully', recommendation });
  } catch (err) {
    res.status(500).json({ message: 'Error recommending property', error: err.message });
  }
});

router.get('/recommendations', protect, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ toUser: req.user._id })
      .populate('property')
      .populate('fromUser', 'name email')
      .sort({ createdAt: -1 });

    res.json({ total: recommendations.length, recommendations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recommendations', error: err.message });
  }
});

module.exports = router;
