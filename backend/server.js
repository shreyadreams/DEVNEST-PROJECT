const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// =============================================
// MIDDLEWARE
// cors  → allows frontend (port 3000) to talk to backend (port 5000)
// json  → parses incoming request body as JSON
// =============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// =============================================
// ROUTES
// Each feature has its own route file
// =============================================
app.use('/api/auth',   require('./routes/auth.routes'));
app.use('/api/user',   require('./routes/user.routes'));
app.use('/api/dsa',    require('./routes/dsa.routes'));
app.use('/api/github', require('./routes/github.routes'));
app.use('/api/ai',     require('./routes/ai.routes'));

// Health check — hit this to confirm server is running
app.get('/', (req, res) => {
  res.json({ message: '🦉 DevNest API is alive!', status: 'ok' });
});

// =============================================
// START: Connect MongoDB first, then start server
// =============================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
