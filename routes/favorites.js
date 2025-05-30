const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { protect } = require('../middleware/auth');
const redis = require('../config/redis');

router.post('/:propertyId', protect, async (req, res) => {
  try {
    // Invalidate cache
    const keys = await redis.keys(`favorites:${req.user._id}:*`);
    if (keys.length) {
      await redis.del(...keys); // Spread the array instead of passing it directly
      //console.log('Favorites cache invalidated:', keys.length, 'keys');
    }

    const favorite = new Favorite({
      user: req.user._id,
      property: req.params.propertyId,
    });
    await favorite.save();

    res.status(201).json({ message: 'Property added to favorites' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `favorites:${req.user._id}:${page}:${limit}`;

    //console.log('GET /favorites cache check:', cacheKey, new Date());
    const cached = await redis.get(cacheKey);
    if (cached) {
      //console.log('Favorites cache hit:', cacheKey, new Date());
      return res.json(cached);
    }

    //console.log('Favorites cache miss, querying MongoDB:', cacheKey, new Date());
    const total = await Favorite.countDocuments({ user: req.user._id });

    const favorites = await Favorite.find({ user: req.user._id })
      .populate('property')
      .skip(skip)
      .limit(limit);

    const result = {
      total,
      page,
      pageSize: favorites.length,
      favorites,
    };

    //console.log('Setting favorites cache:', cacheKey, new Date());
    await redis.set(cacheKey, result, { ex: 300 });

    res.json(result);
  } catch (err) {
    //console.error('Favorites GET error:', err.message, new Date());
    res.status(500).json({ message: 'Failed to fetch favorites', error: err.message });
  }
});

router.delete('/:propertyId', protect, async (req, res) => {
  try {
    // Invalidate cache
    const keys = await redis.keys(`favorites:${req.user._id}:*`);
    if (keys.length) {
      await redis.del(...keys); 
      //console.log('Favorites cache invalidated:', keys.length, 'keys');
    }

    const result = await Favorite.findOneAndDelete({
      user: req.user._id,
      property: req.params.propertyId,
    });
    if (!result) return res.status(404).json({ message: 'Favorite not found' });

    res.json({ message: 'Favorite removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;