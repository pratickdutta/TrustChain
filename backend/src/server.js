require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const circleRoutes = require('./routes/circles');
const loanRoutes = require('./routes/loans');
const scoreRoutes = require('./routes/score');
const stellarRoutes = require('./routes/stellar');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please slow down.' }
});
app.use(limiter);

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    network: process.env.STELLAR_NETWORK || 'TESTNET',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/stellar', stellarRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 TrustChain API running on port ${PORT}`);
  console.log(`🌐 Network: ${process.env.STELLAR_NETWORK || 'TESTNET'}`);
});

module.exports = app;
