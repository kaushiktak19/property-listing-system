// models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  type: {
    type: String,
    enum: ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse']
  },
  price: Number,
  location: {
    state: String,
    city: String
  },
  areaSqFt: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  furnished: {
    type: String,
    enum: ['Furnished', 'Unfurnished', 'Semi']
  },
  availableFrom: {
    type: Date,
    default: null
  },
  listedBy: {
    type: String,
    enum: ['Builder', 'Owner', 'Agent']
  },
  tags: [String],
  colorTheme: String,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  isVerified: Boolean,
  listingType: {
    type: String,
    enum: ['rent', 'sale']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
