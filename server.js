const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);

const { protect } = require('./middleware/auth');
app.get('/api/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
