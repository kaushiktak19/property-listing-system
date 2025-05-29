const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Property = require('../models/Property');

dotenv.config();

const DEFAULT_USER_ID = '68389b2abaa4a600eadc4d15'; //admin user_id, default for existing listings

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const normalized = dateStr.replace(/-/g, '/');

  const parsedDate = new Date(normalized);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

const importCSV = async () => {
  await connectDB();

  const properties = [];

  fs.createReadStream(path.join(__dirname, '../data/listings.csv'))
    .pipe(csv())
    .on('data', (row) => {
      properties.push({
        id: row.id,
        title: row.title,
        type: row.type,
        price: Number(row.price),
        location: {
          state: row.state,
          city: row.city
        },
        areaSqFt: Number(row.areaSqFt),
        bedrooms: Number(row.bedrooms),
        bathrooms: Number(row.bathrooms),
        amenities: row.amenities ? row.amenities.split('|') : [],
        furnished: row.furnished,
        availableFrom: parseDate(row.availableFrom),
        listedBy: row.listedBy,
        tags: row.tags ? row.tags.split('|') : [],
        colorTheme: row.colorTheme,
        rating: parseFloat(row.rating),
        isVerified: String(row.isVerified).toUpperCase() === 'TRUE',
        listingType: row.listingType,
        createdBy: DEFAULT_USER_ID
      });
    })
    .on('end', async () => {
      try {
        await Property.insertMany(properties);
        console.log('Properties imported successfully.');
      } catch (err) {
        console.error('Import failed:', err);
      } finally {
        mongoose.connection.close();
      }
    });
};

importCSV();
