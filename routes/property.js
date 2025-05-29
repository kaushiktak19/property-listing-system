const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().populate('createdBy', 'email name');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    const newProperty = new Property({
      ...req.body,
      createdBy: req.user._id
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

    await property.deleteOne();
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;
