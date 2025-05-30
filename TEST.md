# API Testing Documentation

## Base URL
```
https://property-listing-system-f6zs.onrender.com/
```

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Property APIs](#property-apis) 
3. [Favorites APIs](#favorites-apis)
4. [Recommendation APIs](#recommendation-apis)
5. [Advanced Property Search Tests](#advanced-property-search-tests)
6. [Redis Caching Implementation](#redis-caching-implementation)

---

## Authentication APIs

### 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Expected Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68399fd685bc9dd14f252ded",
    "email": "john.doe@example.com",
    "name": "John Doe"
  }
}
```

**Test Cases:**
- ✅ Valid registration
- ❌ Duplicate email (400) 
- ❌ Missing required fields (500)

---

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68399fd685bc9dd14f252ded",
    "email": "john.doe@example.com",
    "name": "John Doe"
  }
}
```

**Test Cases:**
- ✅ Valid login
- ❌ Invalid credentials (401)
- ❌ Non-existent user (401)

---

### 3. Get User Profile
**GET** `/api/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "user": {
    "_id": "68399fd685bc9dd14f252ded",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "createdAt": "2025-05-30T12:08:54.129Z",
    "updatedAt": "2025-05-30T12:08:54.129Z",
    "__v": 0
  }
}
```

---

## Property APIs

### 1. Get All Properties (Basic)
**GET** `/api/properties`

**Expected Response (200):**
```json
{
    "total": 1000,
    "page": 1,
    "pageSize": 10,
    "properties": [
        {
            "location": {
                "state": "Tamil Nadu",
                "city": "Coimbatore"
            },
            "_id": "6838cdb343d42b1fc5c0c159",
            "id": "PROP1000",
            "title": "Green sea.",
            "type": "Bungalow",
            "price": 23825834,
            "areaSqFt": 4102,
            "bedrooms": 5,
            "bathrooms": 2,
            "amenities": [
                "lift",
                "clubhouse",
                "security",
                "gym",
                "garden",
                "pool"
            ],
            "furnished": "Unfurnished",
            "availableFrom": "2025-10-13T18:30:00.000Z",
            "listedBy": "Builder",
            "tags": [
                "gated-community",
                "corner-plot"
            ],
            "colorTheme": "#6ab45e",
            "rating": 4.7,
            "isVerified": true,
            "listingType": "rent",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.430Z",
            "updatedAt": "2025-05-29T21:12:19.430Z"
        },
        .
        .
        .
    ]
}
```

---

### 2. Get Property by ID
**GET** `/api/properties/6838cdb343d42b1fc5c0c15b`

**Expected Response (200):**
```json
{
    "location": {
        "state": "West Bengal",
        "city": "Kolkata"
    },
    "_id": "6838cdb343d42b1fc5c0c15b",
    "id": "PROP1002",
    "title": "Billion somebody research perform, Yayy!",
    "type": "Apartment",
    "price": 17965682,
    "areaSqFt": 3401,
    "bedrooms": 5,
    "bathrooms": 4,
    "amenities": [
        "garden",
        "security",
        "pool",
        "power-backup",
        "parking"
    ],
    "furnished": "Semi",
    "availableFrom": "2025-10-07T18:30:00.000Z",
    "listedBy": "Owner",
    "tags": [
        "corner-plot",
        "family-friendly",
        "near-metro"
    ],
    "colorTheme": "#b48903",
    "rating": 4.3,
    "isVerified": false,
    "listingType": "sale",
    "createdBy": {
        "_id": "68389b2abaa4a600eadc4d15",
        "email": "admin@gmail.com",
        "name": "ADMIN"
    },
    "__v": 0,
    "createdAt": "2025-05-29T21:12:19.431Z",
    "updatedAt": "2025-05-30T07:24:17.140Z"
}
```

**Test Cases:**
- ✅ Valid property ID
- ❌ Invalid property ID (404)

---

### 3. Create New Property
**POST** `/api/properties`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "PROP2000",
  "title": "Spacious 3BHK Villa",
  "type": "Villa",
  "price": 25000000,
  "location": {
    "state": "Mumbai",
    "city": "Maharashtra"
  },
  "areaSqFt": 4000,
  "bedrooms": 5,
  "bathrooms": 5,
  "amenities": ["Lift", "Gym", "Wifi", "Pool", "Garden", "Clubhouse"],
  "furnished": "Semi",
  "availableFrom": "2025-07-01",
  "listedBy": "Owner",
  "tags": ["luxury", "family"],
  "colorTheme": "beige",
  "rating": 4.8,
  "isVerified": true,
  "listingType": "sale"
}
```

**Expected Response (201):**
```json
{
    "id": "PROP2000",
    "title": "Spacious 3BHK Villa",
    "type": "Villa",
    "price": 25000000,
    "location": {
        "state": "Mumbai",
        "city": "Maharashtra"
    },
    "areaSqFt": 4000,
    "bedrooms": 5,
    "bathrooms": 5,
    "amenities": [
        "Lift",
        "Gym",
        "Wifi",
        "Pool",
        "Garden",
        "Clubhouse"
    ],
    "furnished": "Semi",
    "availableFrom": "2025-07-01T00:00:00.000Z",
    "listedBy": "Owner",
    "tags": [
        "luxury",
        "family"
    ],
    "colorTheme": "beige",
    "rating": 4.8,
    "isVerified": true,
    "listingType": "sale",
    "createdBy": "68399fd685bc9dd14f252ded",
    "_id": "6839a21885bc9dd14f252df5",
    "createdAt": "2025-05-30T12:18:32.667Z",
    "updatedAt": "2025-05-30T12:18:32.667Z",
    "__v": 0
}
```

---

### 4. Update Property
**PUT** `/api/properties/6839a21885bc9dd14f252df5`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "price": 30000000,
  "isVerified": false,
  "bedrooms": 6,
  "amenities": ["Lift", "Gym", "Wifi", "Pool"]
}
```

**Expected Response (200):**
```json
{
    "location": {
        "state": "Mumbai",
        "city": "Maharashtra"
    },
    "_id": "6839a21885bc9dd14f252df5",
    "id": "PROP2000",
    "title": "Spacious 3BHK Villa",
    "type": "Villa",
    "price": 30000000,
    "areaSqFt": 4000,
    "bedrooms": 6,
    "bathrooms": 5,
    "amenities": [
        "Lift",
        "Gym",
        "Wifi",
        "Pool"
    ],
    "furnished": "Semi",
    "availableFrom": "2025-07-01T00:00:00.000Z",
    "listedBy": "Owner",
    "tags": [
        "luxury",
        "family"
    ],
    "colorTheme": "beige",
    "rating": 4.8,
    "isVerified": false,
    "listingType": "sale",
    "createdBy": "68399fd685bc9dd14f252ded",
    "createdAt": "2025-05-30T12:18:32.667Z",
    "updatedAt": "2025-05-30T12:22:11.761Z",
    "__v": 1
}
```

**Test Cases:**
- ✅ Valid update by owner
- ❌ Unauthorized update (403)
- ❌ Property not found (404)

---

### 5. Delete Property
**DELETE** `/api/properties/6839a21885bc9dd14f252df5`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "message": "Property deleted"
}
```

**Test Cases:**
- ✅ Valid deletion by owner
- ❌ Unauthorized deletion (403)
- ❌ Property not found (404)

---

## Favorites APIs

### 1. Add Property to Favorites
**POST** `/api/favorites/6838cdb343d42b1fc5c0c2fd`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (201):**
```json
{
  "message": "Property added to favorites"
}
```

**Test Cases:**
- ✅ Valid addition
- ❌ Duplicate favorite (400)
- ❌ Property not found (500)

---

### 2. Get User Favorites
**GET** `/api/favorites/`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
    "total": 1,
    "page": 1,
    "pageSize": 1,
    "favorites": [
        {
            "_id": "6839a3b585bc9dd14f252e12",
            "user": "68399fd685bc9dd14f252ded",
            "property": {
                "location": {
                    "state": "Gujarat",
                    "city": "Ahmedabad"
                },
                "_id": "6838cdb343d42b1fc5c0c2fd",
                "id": "PROP1420",
                "title": "Lead open TV result result.",
                "type": "Apartment",
                "price": 13846098,
                "areaSqFt": 457,
                "bedrooms": 5,
                "bathrooms": 5,
                "amenities": [
                    "lift",
                    "wifi",
                    "gym",
                    "parking",
                    "power-backup",
                    "pool"
                ],
                "furnished": "Unfurnished",
                "availableFrom": "2025-09-02T18:30:00.000Z",
                "listedBy": "Owner",
                "tags": [
                    "family-friendly",
                    "sea-view",
                    "corner-plot",
                    "luxury"
                ],
                "colorTheme": "#d8d285",
                "rating": 2.8,
                "isVerified": true,
                "listingType": "rent",
                "createdBy": "68389b2abaa4a600eadc4d15",
                "__v": 0,
                "createdAt": "2025-05-29T21:12:19.446Z",
                "updatedAt": "2025-05-29T21:12:19.446Z"
            },
            "createdAt": "2025-05-30T12:25:25.627Z",
            "updatedAt": "2025-05-30T12:25:25.627Z",
            "__v": 0
        }
    ]
}
```

---

### 3. Remove Property from Favorites
**DELETE** `/api/favorites/60d5ec49f1b2c8001f647892`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "message": "Favorite removed"
}
```

**Test Cases:**
- ✅ Valid removal
- ❌ Favorite not found (404)

---

## Recommendation APIs

### 1. Search User by Email
**GET** `/api/users/search?email=jane.doe@example.com`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
    "_id": "6839a46785bc9dd14f252e1c",
    "email": "jane.doe@example.com",
    "name": "Jane Doe"
}
```

**Test Cases:**
- ✅ Valid email search
- ❌ User not found (404)
- ❌ Missing email query (400)

---

### 2. Recommend Property to User
**POST** `/api/recommend`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "propertyId": "6838cdb343d42b1fc5c0c301",
  "toUserId": "6839a46785bc9dd14f252e1c",
  "message": "This property looks perfect for your requirements in Mumbai"
}
```

**Expected Response (201):**
```json
{
    "message": "Property recommended successfully",
    "recommendation": {
        "property": "6838cdb343d42b1fc5c0c301",
        "fromUser": "68399fd685bc9dd14f252ded",
        "toUser": "6839a46785bc9dd14f252e1c",
        "message": "This property looks perfect for your requirements in Mumbai",
        "_id": "6839a54685bc9dd14f252e26",
        "createdAt": "2025-05-30T12:32:06.062Z",
        "__v": 0
    }
}
```

---

### 3. Get Received Recommendations
**GET** `/api/recommendations-received`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
    "total": 1,
    "recommendations": [
        {
            "_id": "6839a54685bc9dd14f252e26",
            "property": {
                "location": {
                    "state": "Maharashtra",
                    "city": "Mumbai"
                },
                "_id": "6838cdb343d42b1fc5c0c301",
                "id": "PROP1424",
                "title": "Certain policy change both.",
                "type": "Apartment",
                "price": 39426711,
                "areaSqFt": 4004,
                "bedrooms": 4,
                "bathrooms": 5,
                "amenities": [
                    "parking",
                    "lift",
                    "gym",
                    "wifi",
                    "pool",
                    "clubhouse"
                ],
                "furnished": "Semi",
                "availableFrom": "2025-07-13T18:30:00.000Z",
                "listedBy": "Owner",
                "tags": [
                    "lake-view",
                    "near-metro",
                    "family-friendly",
                    "sea-view"
                ],
                "colorTheme": "#56f2dd",
                "rating": 1.9,
                "isVerified": true,
                "listingType": "rent",
                "createdBy": "68389b2abaa4a600eadc4d15",
                "__v": 0,
                "createdAt": "2025-05-29T21:12:19.446Z",
                "updatedAt": "2025-05-29T21:12:19.446Z"
            },
            "fromUser": {
                "_id": "68399fd685bc9dd14f252ded",
                "email": "john.doe@example.com",
                "name": "John Doe"
            },
            "toUser": "6839a46785bc9dd14f252e1c",
            "message": "This property looks perfect for your requirements in Mumbai",
            "createdAt": "2025-05-30T12:32:06.062Z",
            "__v": 0
        }
    ]
}
```

---

## Advanced Property Search Tests

### 1. Price Range Filter
**GET** `/api/properties?price[gte]=4000000&price[lte]=8000000&page=1&limit=5`

**Expected Response (200):**
```json
{
    "total": 60,
    "page": 1,
    "pageSize": 5,
    "properties": [
        {
            "location": {
                "state": "Delhi",
                "city": "New Delhi"
            },
            "_id": "6838cdb343d42b1fc5c0c161",
            "id": "PROP1008",
            "title": "Someone will seven onto behavior.",
            "type": "Penthouse",
            "price": 4790155,
            "areaSqFt": 3312,
            "bedrooms": 4,
            "bathrooms": 5,
            "amenities": [
                "wifi",
                "gym",
                "security",
                "clubhouse",
                "lift",
                "power-backup"
            ],
            "furnished": "Unfurnished",
            "availableFrom": "2025-07-05T18:30:00.000Z",
            "listedBy": "Agent",
            "tags": [
                "sea-view",
                "luxury",
                "family-friendly"
            ],
            "colorTheme": "#72af38",
            "rating": 1.3,
            "isVerified": true,
            "listingType": "rent",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.432Z",
            "updatedAt": "2025-05-29T21:12:19.432Z"
        },
        {
            "location": {
                "state": "Karnataka",
                "city": "Mysore"
            },
            "_id": "6838cdb343d42b1fc5c0c164",
            "id": "PROP1011",
            "title": "Defense sister series.",
            "type": "Bungalow",
            "price": 6617775,
            "areaSqFt": 4352,
            "bedrooms": 3,
            "bathrooms": 3,
            "amenities": [
                "lift",
                "wifi",
                "security",
                "clubhouse",
                "power-backup",
                "parking"
            ],
            "furnished": "Unfurnished",
            "availableFrom": "2025-07-27T18:30:00.000Z",
            "listedBy": "Builder",
            "tags": [
                "lake-view",
                "near-metro",
                "family-friendly"
            ],
            "colorTheme": "#472cbb",
            "rating": 3.2,
            "isVerified": true,
            "listingType": "sale",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.432Z",
            "updatedAt": "2025-05-29T21:12:19.432Z"
        },
        .
        .
        .
    ]
}
```

---

### 2. Multiple Filters + Location
**GET** `/api/properties?type=Apartment&city=Mumbai&bedrooms=3&furnished=Semi&isVerified=true`

**Expected Response (200):**
```json
{
    "total": 1,
    "page": 1,
    "pageSize": 1,
    "properties": [
        {
            "location": {
                "state": "Maharashtra",
                "city": "Mumbai"
            },
            "_id": "6838cdb343d42b1fc5c0c341",
            "id": "PROP1488",
            "title": "Unit hope vote candidate.",
            "type": "Apartment",
            "price": 40142688,
            "areaSqFt": 3316,
            "bedrooms": 3,
            "bathrooms": 2,
            "amenities": [
                "power-backup",
                "parking",
                "security",
                "pool",
                "garden"
            ],
            "furnished": "Semi",
            "availableFrom": "2025-08-22T18:30:00.000Z",
            "listedBy": "Owner",
            "tags": [
                "lake-view",
                "luxury",
                "sea-view",
                "corner-plot"
            ],
            "colorTheme": "#81e45f",
            "rating": 2.7,
            "isVerified": true,
            "listingType": "rent",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.448Z",
            "updatedAt": "2025-05-29T21:12:19.448Z"
        }
    ]
}
```

---

### 3. Amenities and Tags Filter
**GET** `/api/properties?amenities=pool,gym&tags=luxury&rating[gte]=4.0`

**Expected Response (200):**
```json
{
    "total": 19,
    "page": 1,
    "pageSize": 10,
    "properties": [
        {
            "location": {
                "state": "Karnataka",
                "city": "Mangalore"
            },
            "_id": "6838cdb343d42b1fc5c0c16d",
            "id": "PROP1020",
            "title": "Forward past.",
            "type": "Penthouse",
            "price": 16513327,
            "areaSqFt": 4970,
            "bedrooms": 1,
            "bathrooms": 5,
            "amenities": [
                "gym",
                "parking",
                "pool"
            ],
            "furnished": "Unfurnished",
            "availableFrom": "2025-06-20T18:30:00.000Z",
            "listedBy": "Agent",
            "tags": [
                "sea-view",
                "family-friendly",
                "luxury",
                "gated-community"
            ],
            "colorTheme": "#fb3701",
            "rating": 4,
            "isVerified": false,
            "listingType": "sale",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.432Z",
            "updatedAt": "2025-05-29T21:12:19.432Z"
        },
        {
            "location": {
                "state": "Delhi",
                "city": "New Delhi"
            },
            "_id": "6838cdb343d42b1fc5c0c172",
            "id": "PROP1025",
            "title": "Manage head pretty.",
            "type": "Villa",
            "price": 39369496,
            "areaSqFt": 4876,
            "bedrooms": 4,
            "bathrooms": 4,
            "amenities": [
                "security",
                "pool",
                "clubhouse",
                "gym",
                "wifi",
                "lift"
            ],
            "furnished": "Semi",
            "availableFrom": "2025-09-24T18:30:00.000Z",
            "listedBy": "Builder",
            "tags": [
                "affordable",
                "corner-plot",
                "luxury"
            ],
            "colorTheme": "#1f1cfc",
            "rating": 4.9,
            "isVerified": true,
            "listingType": "sale",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.432Z",
            "updatedAt": "2025-05-29T21:12:19.432Z"
        },
        .
        .
        .
    ]
}
```

---

### 4. Date Range and Area Filter
**GET** `/api/properties?availableFrom[gte]=2025-01-01&availableFrom[lte]=2025-06-30&areaSqFt[gte]=1000&sort=-price`

**Expected Response (200):**
```json
{
    "total": 128,
    "page": 1,
    "pageSize": 10,
    "properties": [
        {
            "location": {
                "state": "Tamil Nadu",
                "city": "Madurai"
            },
            "_id": "6838cdb343d42b1fc5c0c40f",
            "id": "PROP1694",
            "title": "Live leg their.",
            "type": "Studio",
            "price": 49351538,
            "areaSqFt": 3977,
            "bedrooms": 5,
            "bathrooms": 5,
            "amenities": [
                "power-backup",
                "parking",
                "gym",
                "pool",
                "garden"
            ],
            "furnished": "Semi",
            "availableFrom": "2025-06-29T18:30:00.000Z",
            "listedBy": "Agent",
            "tags": [
                "corner-plot",
                "luxury",
                "near-metro"
            ],
            "colorTheme": "#e0c6db",
            "rating": 4.6,
            "isVerified": false,
            "listingType": "rent",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.454Z",
            "updatedAt": "2025-05-29T21:12:19.454Z"
        },
        {
            "location": {
                "state": "Karnataka",
                "city": "Mysore"
            },
            "_id": "6838cdb343d42b1fc5c0c3ef",
            "id": "PROP1662",
            "title": "Memory alone sure contain.",
            "type": "Studio",
            "price": 48954552,
            "areaSqFt": 2029,
            "bedrooms": 2,
            "bathrooms": 1,
            "amenities": [
                "pool",
                "gym",
                "wifi",
                "clubhouse",
                "lift"
            ],
            "furnished": "Furnished",
            "availableFrom": "2025-06-06T18:30:00.000Z",
            "listedBy": "Owner",
            "tags": [
                "lake-view",
                "gated-community",
                "corner-plot"
            ],
            "colorTheme": "#16848a",
            "rating": 1.9,
            "isVerified": true,
            "listingType": "rent",
            "createdBy": {
                "_id": "68389b2abaa4a600eadc4d15",
                "email": "admin@gmail.com",
                "name": "ADMIN"
            },
            "__v": 0,
            "createdAt": "2025-05-29T21:12:19.453Z",
            "updatedAt": "2025-05-29T21:12:19.453Z"
        },
        .
        .
        .
  ]
}
```

---

## Redis Caching Implementation

### Overview
The application implements **strategic Redis caching** to optimize performance for frequently accessed data. Here's how caching works in the system:

### 1. **Properties Caching**
- **Cache Key Pattern**: `properties:${JSON.stringify(query)}`
- **TTL**: 300 seconds (5 minutes)
- **Strategy**: Cache complete query results including filters, pagination, and sorting

**Example Cache Keys:**
```
properties:{"page":"1","limit":"10"}
properties:{"type":"Apartment","city":"Mumbai","page":"1","limit":"5"}
properties:{"price[gte]":"40000","price[lte]":"80000","isVerified":"true"}
```

**Cache Invalidation:**
- ✅ When new property is created (`POST /api/properties`)
- ✅ When property is updated (`PUT /api/properties/:id`)
- ✅ When property is deleted (`DELETE /api/properties/:id`)

---

### 2. **Favorites Caching**
- **Cache Key Pattern**: `favorites:${userId}:${page}:${limit}`
- **TTL**: 300 seconds (5 minutes)
- **Strategy**: Cache paginated user favorites

**Example Cache Keys:**
```
favorites:60d5ec49f1b2c8001f647891:1:10
favorites:60d5ec49f1b2c8001f647891:2:10
```

**Cache Invalidation:**
- ✅ When user adds favorite (`POST /api/favorites/:propertyId`)
- ✅ When user removes favorite (`DELETE /api/favorites/:propertyId`)
- ✅ When property is updated (affects favorite data)
- ✅ When property is deleted (removes from all user favorites)

---

### 3. **Cache Performance Metrics**

**Cache Hit Scenarios:**
- ✅ Repeated property searches with same filters
- ✅ User accessing their favorites multiple times
- ✅ Popular property listings being accessed frequently

**Cache Miss Scenarios:**
- ❌ First-time queries
- ❌ Queries after cache expiration (5 minutes)
- ❌ Queries after data modifications

---

### 4. **Caching Benefits Observed**

1. **Response Time Improvement**: 
   - Cache Hit: ~100-250ms
   - Cache Miss: ~600-900ms (MongoDB query)

2. **Database Load Reduction**:
   - Reduces MongoDB queries for frequent operations
   - Pagination queries are heavily cached

---

### 5. **Testing Cache Behavior**

To test caching in Postman:

1. **First Request** (Cache Miss):
   ```
   GET /api/properties?availableFrom[gte]=2025-01-01&availableFrom[lte]=2025-06-30&areaSqFt[gte]=1000&sort=-price
   Response Time: ~1.25s
   ```

2. **Second Request** (Cache Hit):
   ```
   GET /api/properties?type=Apartment&city=Mumbai
   Response Time: ~650ms
   ```

3. **After Property Update** (Cache Invalidated):
   ```
   PUT /api/properties/6838cdb343d42b1fc5c0c40f
   Next GET request will be cache miss again
   ```

---