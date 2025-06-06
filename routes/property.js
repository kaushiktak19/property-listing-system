const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Favorite = require('../models/Favorite')
const { protect } = require('../middleware/auth');
const redis = require('../config/redis');

const parseNumericFilters = (query, field) => {
  const filter = {};

  const gte = query[`${field}[gte]`];
  if (gte !== undefined && gte !== '') {
    const n = Number(gte);
    if (!isNaN(n)) filter.$gte = n;
  }

  const lte = query[`${field}[lte]`];
  if (lte !== undefined && lte !== '') {
    const n = Number(lte);
    if (!isNaN(n)) filter.$lte = n;
  }

  const gt = query[`${field}[gt]`];
  if (gt !== undefined && gt !== '') {
    const n = Number(gt);
    if (!isNaN(n)) filter.$gt = n;
  }

  const lt = query[`${field}[lt]`];
  if (lt !== undefined && lt !== '') {
    const n = Number(lt);
    if (!isNaN(n)) filter.$lt = n;
  }

  return Object.keys(filter).length ? filter : null;
};

router.get('/', async (req, res) => {
  try {
    const query = req.query;
    const cacheKey = `properties:${JSON.stringify(query)}`;

    // Check Redis cache
    //console.log('GET /properties cache check:', cacheKey, new Date());
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Properties cache hit:', cacheKey, new Date());
      return res.json(cached);
    }

    //console.log('Properties cache miss, querying MongoDB:', cacheKey, new Date());
    const filters = {};

    if (query.type) filters.type = query.type;
    if (query.furnished) filters.furnished = query.furnished;
    if (query.listedBy) filters.listedBy = query.listedBy;
    if (query.listingType) filters.listingType = query.listingType;
    if (query.colorTheme) filters.colorTheme = query.colorTheme;

    if (query.state) filters['location.state'] = query.state;
    if (query.city) filters['location.city'] = query.city;

    const numericFields = ['price', 'areaSqFt', 'bedrooms', 'bathrooms', 'rating'];
    numericFields.forEach(field => {
      const filter = parseNumericFilters(query, field);
      if (filter) filters[field] = filter;
      else if (query[field]) {
        const n = Number(query[field]);
        if (!isNaN(n)) filters[field] = n;
      }
    });

    if (query.isVerified !== undefined) {
      if (query.isVerified === 'true') filters.isVerified = true;
      else if (query.isVerified === 'false') filters.isVerified = false;
    }

    if (query.amenities) {
      const amenitiesArray = query.amenities.split(',').map(a => a.trim());
      filters.amenities = { $all: amenitiesArray };
    }

    if (query.tags) {
      const tagsArray = query.tags.split(',').map(t => t.trim());
      filters.tags = { $in: tagsArray };
    }

    const availableFromGte = query['availableFrom[gte]'];
    const availableFromLte = query['availableFrom[lte]'];
    if (availableFromGte || availableFromLte) {
      filters.availableFrom = {};
      if (availableFromGte) {
        const gteDate = new Date(availableFromGte);
        if (!isNaN(gteDate.getTime())) filters.availableFrom.$gte = gteDate;
      }
      if (availableFromLte) {
        const lteDate = new Date(availableFromLte);
        if (!isNaN(lteDate.getTime())) filters.availableFrom.$lte = lteDate;
      }
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    let sort = query.sort || 'id';
    if (sort.startsWith('-')) {
      sort = { [sort.slice(1)]: -1 };
    } else {
      sort = { [sort]: 1 };
    }

    const properties = await Property.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'email name');

    const total = await Property.countDocuments(filters);

    const result = {
      total,
      page,
      pageSize: properties.length,
      properties,
    };

    //console.log('Setting properties cache:', cacheKey, new Date());
    await redis.set(cacheKey, result, { ex: 300 });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching properties', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('createdBy', 'email name');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    // Invalidate cache for all property queries
    const keys = await redis.keys('properties:*');
    if (keys.length) {
      await redis.del(...keys); // Spread the array instead of passing it as a single argument
      //console.log('Properties cache invalidated:', keys.length, 'keys');
    }

    const newProperty = new Property({
      ...req.body,
      createdBy: req.user._id,
    });
    const saved = await newProperty.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Creation failed', error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (!property.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Invalidate cache
    let keys = await redis.keys('properties:*');
    if (keys.length) {
      await redis.del(...keys); 
      //console.log('Properties cache invalidated:', keys.length, 'keys');
    }

    // Invalidate favorites cache 
    const favorites = await Favorite.find({ property: req.params.id }).select('user');
    const userIds = [...new Set(favorites.map(f => f.user.toString()))];
    for (const userId of userIds) {
      keys = await redis.keys(`favorites:${userId}:*`);
      if (keys.length) {
        await redis.del(...keys);
        //console.log(`Favorites cache invalidated for user ${userId}:`, keys.length, 'keys');
      }
    }

    Object.assign(property, req.body);
    const updated = await property.save();

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (!property.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Invalidate cache
    let keys = await redis.keys('properties:*');
    if (keys.length) {
      await redis.del(...keys);
      //console.log('Properties cache invalidated:', keys.length, 'keys');
    }

    // Find users with this property in favorites and invalidate their caches
    const favorites = await Favorite.find({ property: req.params.id }).select('user');
    const userIds = [...new Set(favorites.map(f => f.user.toString()))]; // Unique user IDs
    for (const userId of userIds) {
      keys = await redis.keys(`favorites:${userId}:*`);
      if (keys.length) {
        await redis.del(...keys);
        //console.log(`Favorites cache invalidated for user ${userId}:`, keys.length, 'keys');
      }
    }

    await Favorite.deleteMany({ property: req.params.id });
    //console.log('Deleted favorites for property:', req.params.id);

    await property.deleteOne();

    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;