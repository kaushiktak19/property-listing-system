# Property Listing System

A robust, backend for real estate listings, crafted with Node.js, Express, MongoDB Atlas, and Upstash Redis. It delivers secure user authentication, seamless property CRUD operations, advanced search and filtering, favoriting, and property recommendations, all optimized with Redis caching for high performance. Deployed on Render, this project meets the Property Listing System assignment's demands, showcasing efficient backend development.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [CSV Data Import](#csv-data-import)
- [Database Schema](#database-schema)
- [Caching Strategy](#caching-strategy)
- [Deployment](#deployment)
- [Usage](#usage)
- [Project Structure](#project-structure)

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Property Management**: Create, read, update, and delete properties with ownership checks
- **Advanced Search**: Filter properties by type, price, location, amenities, and more, with sorting and pagination
- **Favorites**: Add, view, and remove favorite properties, cached in Redis
- **Recommendations**: Recommend properties to other users and view received recommendations
- **Caching**: Redis caching for property and favorite queries, with invalidation on data changes
- **CSV Import**: Import property listings from a CSV file into MongoDB
- **Deployment**: Hosted on Render for production access

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas (Mongoose)
- **Caching**: Upstash Redis
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **Other**: dotenv, csv-parser
- **Hosting**: Render

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/kaushiktak19/property-listing-system.git
   cd property-listing-system
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory (see Environment Variables section).

4. **Start the Server:**
   ```bash
   npm start
   ```
   The server runs on `http://localhost:8080` by default.

5. **Import CSV Data:**
   ```bash
   node scripts/importCSV.js
   ```

## Environment Variables

Create a `.env` file with the following:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/propertyDB
JWT_SECRET=<your-secret-key>
PORT=8080
UPSTASH_REDIS_REST_URL=https://<your-upstash-redis-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-redis-token>
```

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication

**POST /auth/register**: Register a new user
- **Body**: `{ "email": "user@example.com", "password": "pass123", "name": "John Doe" }`
- **Response**: `{ "token": "...", "user": { "id": "...", "email": "...", "name": "..." } }`

**POST /auth/login**: Login and get JWT
- **Body**: `{ "email": "user@example.com", "password": "pass123" }`
- **Response**: `{ "token": "...", "user": { "id": "...", "email": "...", "name": "..." } }`

### Properties

**GET /properties**: Fetch properties with filters, sorting, and pagination
- **Query**: `?type=Apartment&price[gte]=1000000&state=Tamil Nadu&page=1&limit=10&sort=price`
- **Response**: `{ "total": 100, "page": 1, "pageSize": 10, "properties": [...] }`

**Available Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Property type (Apartment, Villa, Bungalow, Studio, Penthouse)
- `price[gte]`, `price[lte]` - Price range filters
- `areaSqFt[gte]`, `areaSqFt[lte]` - Area range filters
- `bedrooms`, `bathrooms` - Exact number matches
- `state`, `city` - Location filters
- `amenities` - Comma-separated amenities (must have all)
- `tags` - Comma-separated tags (must have any)
- `furnished` - Furnished, Unfurnished, Semi
- `availableFrom[gte]`, `availableFrom[lte]` - Date range filters
- `listedBy` - Builder, Owner, Agent
- `isVerified` - true/false
- `listingType` - rent/sale
- `sort` - Sort field (prefix with `-` for descending)

**GET /properties/:id**: Get a single property by MongoDB _id

**POST /properties**: Create a property (requires JWT)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "id": "PROP1234",
    "title": "Cozy Apartment",
    "type": "Apartment",
    "price": 75000,
    "location": {
      "state": "Maharashtra",
      "city": "Mumbai"
    },
    "areaSqFt": 1200,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Gym", "Pool"],
    "furnished": "Furnished",
    "availableFrom": "2024-01-01",
    "listedBy": "Owner",
    "tags": ["Modern"],
    "colorTheme": "Blue",
    "rating": 4.5,
    "isVerified": true,
    "listingType": "rent"
  }
  ```

**PUT /properties/:id**: Update a property (requires JWT, ownership)
- **Headers**: `Authorization: Bearer <token>`

**DELETE /properties/:id**: Delete a property (requires JWT, ownership)
- **Headers**: `Authorization: Bearer <token>`

### Favorites

**POST /favorites/:propertyId**: Add a property to favorites (requires JWT)
- **Headers**: `Authorization: Bearer <token>`

**GET /favorites**: Get paginated favorites (requires JWT)
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `?page=1&limit=10`

**DELETE /favorites/:propertyId**: Remove a favorite (requires JWT)
- **Headers**: `Authorization: Bearer <token>`

### Recommendations

**GET /users/search**: Find a user by email
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `?email=user@example.com`

**POST /recommend**: Recommend a property (requires JWT)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "propertyId": "...", "toUserId": "...", "message": "Check this out!" }`

**GET /recommendations-received**: View received recommendations (requires JWT)
- **Headers**: `Authorization: Bearer <token>`

### Profile

**GET /profile**: Get authenticated user's details (requires JWT)
- **Headers**: `Authorization: Bearer <token>`

## CSV Data Import

- **File**: `scripts/importCSV.js`
- **Purpose**: Imports `listings.csv` into the Properties collection
- **Format**: Columns like id, title, type, price, state, city, amenities (pipe-separated), etc.
- **Default User**: Assigns `createdBy` to a default user
[Admin] (68389b2abaa4a600eadc4d15)
- **Run**: `node scripts/importCSV.js`

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Property Model
```javascript
{
  id: String (unique, required),
  title: String,
  type: Enum ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse'],
  price: Number,
  location: {
    state: String,
    city: String
  },
  areaSqFt: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: [String],
  furnished: Enum ['Furnished', 'Unfurnished', 'Semi'],
  availableFrom: Date,
  listedBy: Enum ['Builder', 'Owner', 'Agent'],
  tags: [String],
  colorTheme: String,
  rating: Number (0-5),
  isVerified: Boolean,
  listingType: Enum ['rent', 'sale'],
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Favorite Model
```javascript
{
  user: ObjectId (ref: User),
  property: ObjectId (ref: Property),
  createdAt: Date,
  updatedAt: Date
}
```

### Recommendation Model
```javascript
{
  property: ObjectId (ref: Property),
  fromUser: ObjectId (ref: User),
  toUser: ObjectId (ref: User),
  message: String,
  createdAt: Date
}
```

## Caching Strategy

### Redis Implementation
- **Cache Duration**: 5 minutes (300 seconds)
- **Cache Keys**: 
  - Properties: `properties:${queryString}`
  - Favorites: `favorites:${userId}:${page}:${limit}`

### Cache Invalidation
- **Property Updates**: Clears all property caches + affected user favorite caches
- **Favorite Updates**: Clears user-specific favorite caches
- **Property Deletion**: Clears property caches + all related favorite caches

### Performance Benefits
- Frequent property searches served from cache
- Reduced MongoDB queries
- Average response time improved from 600ms to 150ms

## Deployment

Deployed on Render - [https://property-listing-system-f6zs.onrender.com/](https://property-listing-system-f6zs.onrender.com/)

## Usage

1. **Register/Login**: Obtain a JWT via `/api/auth/register` or `/api/auth/login`
2. **Create a Property**: Use `POST /api/properties` with JWT in the `Authorization: Bearer <token>` header
3. **Search Properties**: Query `GET /api/properties` with filters (e.g., `?bedrooms=3&listingType=sale`)
4. **Favorite Properties**: Add via `POST /api/favorites/:propertyId`, view with `GET /api/favorites`
5. **Recommend Properties**: Search users, send recommendations, and view them
6. **Test Deployed App**: Access the API at your deployment URL

## Project Structure

```
property-listing-system/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── redis.js              # Redis configuration
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── User.js               # User schema
│   ├── Property.js           # Property schema
│   ├── Favorite.js           # Favorite schema
│   └── Recommendation.js     # Recommendation schema
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── property.js           # Property CRUD routes
│   ├── favorites.js          # Favorites routes
│   └── recommendations.js    # Recommendation routes
├── scripts/
│   └── importCSV.js          # CSV import utility
├── data/
│   └── listings.csv          # Property dataset
├── .env                      # Environment variables
├── .gitignore
├── package.json
├── server.js                 # Main server file
├── README.md                 # Readme and doc
└── TEST.md                   # API testing doc 
```

---