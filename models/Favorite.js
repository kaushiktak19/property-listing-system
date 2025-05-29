const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
}, { timestamps: true });

FavoriteSchema.index({ user: 1, property: 1 }, { unique: true }); // prevent duplicates

module.exports = mongoose.model('Favorite', FavoriteSchema);
