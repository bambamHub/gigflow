const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const gigRoutes = require('./routes/gigs');
const bidRoutes = require('./routes/bids');
const { initSocket } = require('./socket');

const app = express();

// Middleware
app.use(cors({
  origin: [
      "http://localhost:5173",
      "https://gigflow-bambam.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      initSocket(server);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
